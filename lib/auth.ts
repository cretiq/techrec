import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectToDatabase } from './db'
import Developer from './models/Developer'

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
          await connectToDatabase()
          
          // Check if developer exists
          const existingDeveloper = await Developer.findOne({ email: user.email })
          
          if (!existingDeveloper) {
            // Create new developer
            await Developer.create({
              name: user.name,
              email: user.email,
              image: user.image,
              title: 'Developer',
              skills: [],
              experience: [],
              education: [],
              achievements: [],
              applications: [],
              savedRoles: []
            })
          } else {
            // Update existing developer's basic info
            await Developer.findOneAndUpdate(
              { email: user.email },
              {
                $set: {
                  name: user.name,
                  image: user.image,
                }
              }
            )
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
        session.user.id = token.sub!
        
        try {
          await connectToDatabase()
          // Add developer info to session
          const developer = await Developer.findOne({ email: session.user.email })
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