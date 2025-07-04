"use client"

import {  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter  } from '@/components/ui-daisy/card'
import {  Badge  } from '@/components/ui-daisy/badge'
import {  Button  } from '@/components/ui-daisy/button'
import { MapPin, Briefcase, Clock, Building, Code, BarChart } from "lucide-react"
import { ApplicationActionButton } from "@/components/roles/ApplicationActionButton"
import { ApplicationBadge } from "@/components/roles/ApplicationBadge"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { formatJobType } from "@/utils/format"
import { Role } from "@/types/role"

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
          <div className="flex flex-col gap-3 w-full">
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
            
            {/* Application Routing Section */}
            {role.applicationInfo && role.applicationInfo.applicationUrl && (
              <div className="flex items-center justify-between gap-2 p-3 bg-base-100/60 backdrop-blur-sm rounded-lg border border-base-300/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-base-content">Apply Now</span>
                    <ApplicationBadge 
                      applicationInfo={role.applicationInfo}
                      className="text-xs"
                      data-testid="role-context-application-badge"
                    />
                  </div>
                  {role.applicationInfo.recruiter && (
                    <p className="text-xs text-base-content/70">
                      Contact: {role.applicationInfo.recruiter.name}
                    </p>
                  )}
                </div>
                <ApplicationActionButton
                  applicationInfo={role.applicationInfo}
                  className="flex-shrink-0"
                  data-testid="role-context-application-button"
                />
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
} 