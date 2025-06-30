import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '../prisma/prisma'
import { getUserByEmail } from './dal/users'
import bcrypt from 'bcrypt'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string
      title?: string
      githubAccessToken?: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);

        if (!user || !user.hashedPassword) {
          // User not found or is an OAuth user without a password
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (isPasswordValid) {
          // Any object returned will be saved in `user` property of the JWT
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: null, // Credentials users don't have an image from a provider
          };
        } else {
          // Password incorrect
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Check if developer exists
          const existingDeveloper = await prisma.developer.findUnique({
            where: { email: user.email! }
          })
          
          if (!existingDeveloper) {
            // Create new developer with minimum required fields
            const newDeveloper = await prisma.developer.create({
              data: {
                email: user.email!,
                profileEmail: user.email!, // Set profileEmail same as email initially
                name: user.name!,
                title: 'Software Developer', // Default title
              }
            })
            user.id = newDeveloper.id
          } else {
            // Update existing developer's basic info
            await prisma.developer.update({
              where: { email: user.email! },
              data: {
                name: user.name!
              }
            })
            user.id = existingDeveloper.id
          }
          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      } else if (account?.provider === 'github') {
        try {
          // Store GitHub access token in the session
          user.githubAccessToken = account.access_token
          return true
        } catch (error) {
          console.error('Error storing GitHub token:', error)
          return false
        }
      } else if (account?.provider === 'credentials') {
        // For credentials, the user object already has the correct ID from authorize()
        return true
      }
      return false
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        if (account?.provider === 'github') {
          token.githubAccessToken = account.access_token
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.githubAccessToken = token.githubAccessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',  // Custom sign-in page
    error: '/auth/error',    // Error page
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
} 