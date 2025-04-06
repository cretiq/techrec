import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { SignInButton } from "@/app/components/SignInButton"

export default async function SignIn() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/developer/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to TechRec</h1>
          <p className="mt-2 text-muted-foreground">Sign in to access your dashboard</p>
        </div>
        <SignInButton />
      </div>
    </div>
  )
} 