import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id?: string
    githubAccessToken?: string
  }

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

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }
} 