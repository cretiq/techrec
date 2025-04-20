import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import { prisma } from '../prisma/prisma'

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