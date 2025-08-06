"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {  Button  } from '@/components/ui-daisy/button'
import {  Input  } from '@/components/ui-daisy/input'
import { Label } from "@/components/ui-daisy/label"
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import { Checkbox } from "@/components/ui-daisy/checkbox"
import { useToast } from "@/components/ui-daisy/use-toast"
import { Code, GraduationCap, ArrowRight, Loader2 } from "lucide-react"

export default function DeveloperLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: checked,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate form
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Simulate API call
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      toast({
        title: "Login successful",
        description: "Redirecting to your dashboard...",
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/developer/dashboard")
      }, 500)
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col" data-testid="auth-developer-login-page-container">
      <header className="border-b" data-testid="auth-developer-login-header">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6" data-testid="auth-developer-login-header-content">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" data-testid="auth-developer-login-logo-trigger">
            <Code className="h-6 w-6" />
            <span>DevAssess</span>
          </Link>
          <nav className="flex items-center gap-4" data-testid="auth-developer-login-nav">
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" data-testid="auth-developer-login-company-link-trigger">
              Company Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8" data-testid="auth-developer-login-main">
        <Card className="w-full max-w-md" data-testid="auth-developer-login-card">
          <CardHeader className="space-y-1" data-testid="auth-developer-login-card-header">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl" data-testid="auth-developer-login-title">Developer Login</CardTitle>
            </div>
            <CardDescription data-testid="auth-developer-login-description">Enter your credentials to access your developer dashboard</CardDescription>
          </CardHeader>
          <CardContent data-testid="auth-developer-login-card-content">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-developer-login-form">
              <div className="space-y-2" data-testid="auth-developer-login-email-field">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="auth-developer-login-input-email"
                />
              </div>
              <div className="space-y-2" data-testid="auth-developer-login-password-field">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline" data-testid="auth-developer-login-forgot-password-trigger">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="auth-developer-login-input-password"
                />
              </div>
              <div className="flex items-center space-x-2" data-testid="auth-developer-login-remember-field">
                <Checkbox id="remember" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} data-testid="auth-developer-login-checkbox-remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="auth-developer-login-button-submit-trigger">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="auth-developer-login-submit-loading-spinner" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4" data-testid="auth-developer-login-card-footer">
            <div className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup/developer" className="text-primary hover:underline" data-testid="auth-developer-login-signup-link-trigger">
                Sign up
              </Link>
            </div>
            <div className="text-xs text-center text-muted-foreground" data-testid="auth-developer-login-demo-note">
              <p>For demo purposes, any email and password will work</p>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

