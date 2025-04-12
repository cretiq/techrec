"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2 } from "lucide-react"
import { Profile } from "./types"

interface AchievementsCardProps {
  profile: Profile | null;
  onDeleteAchievement: (id: string) => void;
}

export function AchievementsCard({ profile, onDeleteAchievement }: AchievementsCardProps) {
  return (
    <Card className="border-0 shadow-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(profile?.achievements || []).map((achievement) => (
            <Card key={achievement.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{new Date(achievement.date).toLocaleDateString()}</p>
                    {achievement.issuer && <p>Issued by: {achievement.issuer}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {achievement.url && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(achievement.url as string, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onDeleteAchievement(achievement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm">{achievement.description}</p>
            </Card>
          ))}
          
          {(profile?.achievements || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No achievements added yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 