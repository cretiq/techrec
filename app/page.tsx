import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Users, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-950 dark:to-purple-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="container relative z-10 px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Find Your Next Tech Job
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with top tech companies and discover opportunities that match your skills and ambitions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/developer/signup">
                <Button size="lg" className="flex items-center">
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/company/signup">
                <Button size="lg" variant="outline" className="flex items-center">
                  <span>Post a Job</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose TechRec?</h2>
            <p className="text-muted-foreground">
              We're building the future of tech recruitment, one connection at a time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-100 dark:border-blue-800/50">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Developer-First</h3>
              <p className="text-muted-foreground">
                Built by developers, for developers. We understand what matters most in your job search.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-100 dark:border-purple-800/50">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Matches</h3>
              <p className="text-muted-foreground">
                Connect with companies that value your skills and offer the right opportunities.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-pink-50 to-blue-50 dark:from-pink-900/30 dark:to-blue-900/30 border border-pink-100 dark:border-pink-800/50">
              <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Efficient</h3>
              <p className="text-muted-foreground">
                Streamlined application process and quick responses from potential employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
        <div className="container px-4 flex items-center justify-center">
          <div className="max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4 text-center">Ready to Start Your Journey?</h2>
            <p className="text-muted-foreground mb-8 text-center">
              Join thousands of developers and companies who have found their perfect match through TechRec.
            </p>
            <div className="flex justify-center items-center">
              <Link href="/developer/signup" className="inline-flex justify-center">
                <Button size="lg" className="flex items-center justify-center">
                  <span>Get Started Now</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

