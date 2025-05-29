import Link from "next/link"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import { Code, Briefcase, GraduationCap, ArrowRight } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Code className="h-6 w-6" />
            <span>DevAssess</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Log in to DevAssess</h1>
            <p className="text-gray-500">Choose your account type to continue</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Company</CardTitle>
                </div>
                <CardDescription>For employers, recruiters, and hiring managers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Access your company dashboard to create assessments, review candidate submissions, and track hiring
                  metrics.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/login/company" className="w-full">
                  <Button className="w-full gap-1">
                    Company Login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Developer</CardTitle>
                </div>
                <CardDescription>For job seekers, developers, and candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Access your developer dashboard to take technical assessments, view results, and connect with
                  potential employers.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/login/developer" className="w-full">
                  <Button className="w-full gap-1" variant="outline">
                    Developer Login
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

