import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ApplicationsLoading() {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-6xl p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-4 w-[300px] mt-2" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-10 w-[300px]" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-6 w-[180px]" />
                      <Skeleton className="h-4 w-[150px] mt-2" />
                    </CardHeader>
                    <CardContent className="pb-3 space-y-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-5 w-[100px]" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[120px]" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                      <Skeleton className="h-20 w-full mt-2" />
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Skeleton className="h-4 w-[120px]" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

