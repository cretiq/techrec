import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { SignInButton } from "@/components/SignInButton"
import { SignInForm } from "@/components/auth/SignInForm"

export default async function SignIn() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/developer/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center" data-testid="auth-signin-page-container">
      <div className="w-full max-w-md space-y-8 p-8" data-testid="auth-signin-card">
        <div className="text-center" data-testid="auth-signin-header">
          <h1 className="text-3xl font-bold" data-testid="auth-signin-title">Welcome to TechRec</h1>
          <p className="mt-2 text-muted-foreground" data-testid="auth-signin-subtitle">Sign in to access your dashboard</p>
        </div>
        
        <SignInForm />

        <div className="divider">OR</div>
        
        <SignInButton />
      </div>
    </div>
  )
} 