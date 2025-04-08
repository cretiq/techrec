import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Briefcase, Users, FileText, BarChart } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default async function CompanyDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  // Get company
  const company = await prisma.company.findFirst({
    where: {
      name: session.user?.name
    }
  })

  if (!company) {
    return <div>Company not found</div>
  }

  // Get roles for company
  const roles = await prisma.role.findMany({
    where: {
      companyId: company.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  try {
    // Stats Grid
    const totalJobs = roles.length
    const activeJobs = roles.filter(role => role.type === 'ACTIVE').length

    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Company Dashboard</h1>
          <Button asChild>
            <Link href="/company/jobs/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeJobs}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs */}
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {roles.length > 0 ? (
                <div className="space-y-4">
                  {roles.slice(0, 5).map((job) => (
                    <div key={job.id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.location}
                          </p>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded ${
                          job.type === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Posted on {job.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent jobs</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to fetch stats',
      variant: 'destructive',
    })
    return <div>Error fetching stats</div>
  }
}

