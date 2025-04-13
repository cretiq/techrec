"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { Profile } from "./types"
import { formatDateSafe } from "./utils"

interface ExperienceCardProps {
  profile: Profile | null;
  onDeleteExperience: (id: string) => void;
}

export function ExperienceCard({ profile, onDeleteExperience }: ExperienceCardProps) {
  return (
    <Card className="border shadow-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Work Experience</CardTitle>
        <Button variant="outline" size="sm" className="gap-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-0 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30">
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {profile?.experience.map((exp) => (
          <div key={exp.id} className="border rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{exp.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {exp.company}
                  {exp.location && ` • ${exp.location}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateSafe(exp.startDate)} -
                  {exp.current
                    ? " Present"
                    : ` ${formatDateSafe(exp.endDate)}`}
                </p>
                {exp.teamSize && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Team size: {exp.teamSize} members
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm">{exp.description}</p>
            
            {/* Display responsibilities */}
            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Responsibilities:</h4>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {exp.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Display achievements */}
            {exp.achievements && exp.achievements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Achievements:</h4>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {exp.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Display tech stack */}
            {exp.techStack && exp.techStack.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Technologies:</h4>
                <div className="flex flex-wrap gap-1">
                  {exp.techStack.map((tech, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 