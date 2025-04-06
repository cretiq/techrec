import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CandidateProfileLoading() {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-6xl p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[150px] mt-2" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[120px]" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[300px]" />
                        <Skeleton className="h-4 w-[250px]" />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20" />
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array(2)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 