"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, Clock, Building, ArrowRight, Code, BarChart } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { formatJobType } from "@/app/utils/format"
import { Role } from "@/types/role"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface RoleContextCardProps {
  role: Role
  activeDocument: "cv" | "cover-letter" | "outreach"
}

export function RoleContextCard({ role, activeDocument }: RoleContextCardProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-6 h-fit"
    >
      <Card className="w-full max-w-sm bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-xl line-clamp-2">{role.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span className="line-clamp-1">{role.company.name}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <MapPin className="mr-1 h-3 w-3" />
              <span className="line-clamp-1">{role.location}</span>
            </Badge>
            <Badge variant="secondary">
              <Briefcase className="mr-1 h-3 w-3" />
              {formatJobType(role.type)}
            </Badge>
            {role.remote && (
              <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                Remote
              </Badge>
            )}
            {role.visaSponsorship && (
              <Badge variant="secondary">
                <Code className="mr-1 h-3 w-3" />
                Visa Sponsorship
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground line-clamp-3">{role.description}</p>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Required Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {role.skills.map((skill) => (
                <Badge key={skill.id} variant="outline" className="text-xs">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4 mt-auto">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              <div className="flex flex-col gap-2 w-full">
                <div className="text-md font-semibold">{role.salary}</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/developer/writing-help?roleId=${role.id}`)}
                    className="gap-1"
                  >
                    <BarChart className="h-4 w-4" /> Progress
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
} 