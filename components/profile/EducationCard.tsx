"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { InternalProfile, InternalEducation } from "@/types/types"
import { formatDateSafe } from "@/lib/utils"

interface EducationCardProps {
  profile: InternalProfile | null;
  onDeleteEducation: (id: string) => void;
}

export function EducationCard({ profile, onDeleteEducation }: EducationCardProps) {
  return (
    <Card className="border shadow-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Education</CardTitle>
        <Button variant="outline" size="sm" className="gap-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-0 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30">
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {(profile?.education || []).map((edu: InternalEducation) => (
            <div key={edu.id} className="border rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{edu.institution}</h4>
                  <p className="text-sm text-muted-foreground">
                    {edu.degree ? `${edu.degree}, ${edu.year}` : `Year: ${edu.year}`}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateSafe(edu.startDate)} - {edu.endDate ? formatDateSafe(edu.endDate) : 'Present'}
                  </p>
                  {edu.location && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {edu.location}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10"
                  onClick={() => onDeleteEducation(edu.id)}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              {/* Display honors */}
              {edu.honors && edu.honors.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Honors & Awards:</h4>
                  <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                    {edu.honors.map((honor, index) => (
                      <li key={index}>{honor}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Display activities */}
              {edu.activities && edu.activities.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Activities:</h4>
                  <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                    {edu.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          
          {(profile?.education || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No education added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 