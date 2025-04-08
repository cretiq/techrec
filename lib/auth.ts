import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import { ObjectId } from 'mongodb'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string // This will be a MongoDB ObjectID string
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
            // Create new developer with a proper MongoDB ObjectID
            const newDeveloper = await prisma.developer.create({
              data: {
                id: new ObjectId().toHexString(), // Generate a new MongoDB ObjectID
                email: user.email!,
                profileEmail: user.email!,
                name: user.name!,
                title: 'Developer',
                // Initialize empty arrays for related records
                developerSkills: {
                  create: []
                },
                experience: {
                  create: []
                },
                education: {
                  create: []
                },
                achievements: {
                  create: []
                },
                projects: {
                  create: []
                },
                assessments: {
                  create: []
                },
                applications: {
                  create: []
                },
                savedRoles: {
                  create: []
                },
                customRoles: {
                  create: []
                }
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
        session.user.id = token.id as string
        
        try {
          // Get developer info using Prisma
          const developer = await prisma.developer.findUnique({
            where: { id: session.user.id }
          })
          if (developer) {
            session.user.title = developer.title
          }
        } catch (error) {
          console.error('Error fetching developer info:', error)
        }
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
} 