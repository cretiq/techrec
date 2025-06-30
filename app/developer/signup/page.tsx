import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import { ArrowRight, Code } from "lucide-react"
import { SignUpForm } from "@/components/auth/SignUpForm"

export const metadata: Metadata = {
  title: "Developer Sign Up",
  description: "Create your developer account and start your journey",
}

export default async function DeveloperSignUp() {
  const session = await getServerSession(authOptions)

  // If user is already signed in, redirect to dashboard
  if (session) {
    redirect("/developer/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Code className="h-6 w-6" />
            <h1 className="text-2xl font-semibold tracking-tight">
              TechRec
            </h1>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Create your developer account
          </h2>
          <p className="text-sm text-muted-foreground">
            Sign up to start your journey with TechRec
          </p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>
              Enter your email and password to create an account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SignUpForm />
            
            <div className="divider">OR</div>
            
            <a 
              href="/api/auth/signin/google" 
              className="btn btn-outline flex items-center justify-center w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </a>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <a href="/auth/signin" className="text-primary hover:underline">
                Sign in
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 