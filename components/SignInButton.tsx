"use client"

import {  Button  } from '@/components/ui-daisy/button'
import { signIn } from "next-auth/react"

export function SignInButton() {
  return (
    <Button
      onClick={() => signIn("google", { callbackUrl: "/developer/dashboard" })}
      className="w-full"
    >
      Sign in with Google
    </Button>
  )
} 