import Link from "next/link"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import { Code, Briefcase, GraduationCap, ArrowRight } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col" data-testid="auth-login-page-container">
      <header className="border-b" data-testid="auth-login-header">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6" data-testid="auth-login-header-content">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" data-testid="auth-login-logo-trigger">
            <Code className="h-6 w-6" />
            <span>DevAssess</span>
          </Link>
          <nav className="flex items-center gap-4" data-testid="auth-login-nav">
            <Link href="/signup" data-testid="auth-login-signup-link-trigger">
              <Button variant="outline" data-testid="auth-login-signup-button-trigger">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8" data-testid="auth-login-main">
        <div className="w-full max-w-3xl" data-testid="auth-login-content">
          <div className="text-center mb-8" data-testid="auth-login-header-section">
            <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="auth-login-title">Log in to DevAssess</h1>
            <p className="text-gray-500" data-testid="auth-login-subtitle">Choose your account type to continue</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2" data-testid="auth-login-cards-container">
            <Card className="hover:shadow-md transition-shadow" data-testid="auth-login-card-company">
              <CardHeader data-testid="auth-login-card-company-header">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle data-testid="auth-login-card-company-title">Company</CardTitle>
                </div>
                <CardDescription data-testid="auth-login-card-company-description">For employers, recruiters, and hiring managers</CardDescription>
              </CardHeader>
              <CardContent data-testid="auth-login-card-company-content">
                <p className="text-sm text-gray-500">
                  Access your company dashboard to create assessments, review candidate submissions, and track hiring
                  metrics.
                </p>
              </CardContent>
              <CardFooter data-testid="auth-login-card-company-footer">
                <Link href="/login/company" className="w-full" data-testid="auth-login-company-link-trigger">
                  <Button className="w-full gap-1" data-testid="auth-login-company-button-trigger">
                    Company Login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow" data-testid="auth-login-card-developer">
              <CardHeader data-testid="auth-login-card-developer-header">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle data-testid="auth-login-card-developer-title">Developer</CardTitle>
                </div>
                <CardDescription data-testid="auth-login-card-developer-description">For job seekers, developers, and candidates</CardDescription>
              </CardHeader>
              <CardContent data-testid="auth-login-card-developer-content">
                <p className="text-sm text-gray-500">
                  Access your developer dashboard to take technical assessments, view results, and connect with
                  potential employers.
                </p>
              </CardContent>
              <CardFooter data-testid="auth-login-card-developer-footer">
                <Link href="/login/developer" className="w-full" data-testid="auth-login-developer-link-trigger">
                  <Button className="w-full gap-1" variant="outline" data-testid="auth-login-developer-button-trigger">
                    Developer Login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="text-center mt-8" data-testid="auth-login-footer">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline" data-testid="auth-login-signup-footer-trigger">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

