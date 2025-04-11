import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string
      title?: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        try {
          // Find the developer by email
          const developer = await prisma.developer.findUnique({
            where: { email: session.user.email! }
          })
          
          if (developer) {
            // Set the session user ID and title from the developer record
            session.user.id = developer.id
            session.user.title = developer.title
          }
        } catch (error) {
          console.error('Error fetching developer info:', error)
        }
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