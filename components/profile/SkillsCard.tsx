"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { InternalProfile, InternalSkill } from "@/types/types"

interface SkillsCardProps {
  profile: InternalProfile | null;
  onDeleteSkill: (id: string) => void;
}

export function SkillsCard({ profile, onDeleteSkill }: SkillsCardProps) {
  const groupSkillsByCategory = (skills: InternalSkill[]): Record<string, InternalSkill[]> => {
    return skills.reduce((acc: Record<string, InternalSkill[]>, skill: InternalSkill) => {
      const categoryName = skill.category;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(skill);
      return acc;
    }, {});
  };

  const groupedSkills = groupSkillsByCategory(profile?.skills || []);

  return (
    <Card className="border-0 shadow-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl">Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(groupedSkills).map(([category, skillsInCategory]) => (
            <div key={category} className="space-y-1 border-b border-gray-200 dark:border-gray-700 pb-3 mb-3 flex flex-col md:flex-row items-start md:items-center justify-between">
              <h4 className="text-sm font-medium w-full md:w-1/3 text-muted-foreground flex-shrink-0 mb-1 md:mb-0">{category}</h4>
              <div className="flex flex-wrap gap-1 w-full md:w-2/3">
                {skillsInCategory.map((skill: InternalSkill) => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="flex items-center gap-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm py-1 px-2"
                  >
                    <span>{skill.name} ({skill.level.substring(0,3)})</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 rounded-full hover:bg-destructive/10"
                      onClick={() => onDeleteSkill(skill.id)}
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          {(profile?.skills || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 