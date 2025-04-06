import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="w-full flex justify-center">
        <main className="container max-w-6xl py-6 md:py-10 px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Profile Overview</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <Skeleton className="h-24 w-24 rounded-full mb-4" />
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-4 w-24 mb-6" />
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Upload CV</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
                    <Skeleton className="h-10 w-10 mb-2" />
                    <Skeleton className="h-4 w-64 mb-2" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 