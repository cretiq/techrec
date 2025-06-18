"use client"

import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import {  Button  } from '@/components/ui-daisy/button'
import {  Badge  } from '@/components/ui-daisy/badge'
import { Plus, Trash2 } from "lucide-react"
import { InternalProfile, InternalExperience } from "@/types/types"
import { formatDateSafe } from "@/lib/utils"

interface ExperienceCardProps {
  profile: InternalProfile | null;
  onDeleteExperience: (id: string) => void;
}

export function ExperienceCard({ profile, onDeleteExperience }: ExperienceCardProps) {
  return (
    <Card 
      variant="transparent" 
      className="animate-fade-in-up" 
      data-testid="profile-experience-card"
    >
      <CardHeader className="flex flex-row items-center justify-between" data-testid="profile-experience-header">
        <CardTitle data-testid="profile-experience-title">Work Experience</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 bg-base-100/50 backdrop-blur-sm border border-base-300/50 hover:bg-base-200/50"
          data-testid="profile-experience-add-button"
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-6" data-testid="profile-experience-content">
        {(profile?.experience || []).map((exp: InternalExperience) => (
          <div 
            key={exp.id} 
            className="border border-base-300/50 rounded-lg p-4 space-y-4 bg-base-100/30 backdrop-blur-sm shadow-sm"
            data-testid={`profile-experience-item-${exp.id}`}
          >
            <div className="flex justify-between items-start">
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10" 
                  onClick={() => onDeleteExperience(exp.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            
            {/* Display responsibilities */}
            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Responsibilities:</h4>
                <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                  {exp.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Display achievements */}
            {exp.achievements && exp.achievements.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Achievements:</h4>
                <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                  {exp.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Display tech stack */}
            {exp.techStack && exp.techStack.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Technologies:</h4>
                <div className="flex flex-wrap gap-1">
                  {exp.techStack.map((tech, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-primary/10 text-primary border-primary/20 backdrop-blur-sm px-1.5 py-0.5 text-xs"
                      data-testid={`profile-experience-tech-${exp.id}-${index}`}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {(profile?.experience || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No work experience added yet</p>
        )}
      </CardContent>
    </Card>
  )
} 