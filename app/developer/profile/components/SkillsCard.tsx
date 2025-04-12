"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Profile } from "./types"

interface SkillsCardProps {
  profile: Profile | null;
  onDeleteSkill: (id: string) => void;
}

export function SkillsCard({ profile, onDeleteSkill }: SkillsCardProps) {
  const groupSkillsByCategory = (skills: Profile['developerSkills']) => {
    return skills.reduce((acc, skill) => {
      const categoryName = skill.skill.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(skill);
      return acc;
    }, {} as Record<string, Profile['developerSkills']>);
  };

  return (
    <Card className="border-0 shadow-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl">Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(groupSkillsByCategory(profile?.developerSkills || [])).map(([category, skills]) => (
            <div key={category} className="space-y-0 border-b border-gray-200 pb-2 flex flex-col md:flex-row items-center justify-between">
              <h4 className="text-sm font-medium w-full md:w-1/2 text-muted-foreground basis-1/2">{category}</h4>
              <div className="flex flex-wrap gap-1 w-full md:w-1/2">
                {skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="flex items-center gap-1 border-gray-300 bg-white dark:bg-gray-800"
                  >
                    {skill.skill.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => onDeleteSkill(skill.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          {(profile?.developerSkills || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 