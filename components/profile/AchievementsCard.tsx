"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2, Plus } from "lucide-react"
import { InternalProfile, InternalAchievement } from "@/types/types"

interface AchievementsCardProps {
  profile: InternalProfile | null;
  onDeleteAchievement: (id: string) => void;
}

export function AchievementsCard({ profile, onDeleteAchievement }: AchievementsCardProps) {
  return (
    <Card className="border shadow-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Achievements</CardTitle>
        <Button variant="outline" size="sm" className="gap-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-0 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30">
          <Plus className="h-4 w-4" />
          Add Achievement
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(profile?.achievements || []).map((achievement: InternalAchievement) => (
            <Card key={achievement.id} className="p-4 bg-white dark:bg-gray-800 shadow-sm">
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
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => window.open(achievement.url as string, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10"
                    onClick={() => onDeleteAchievement(achievement.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap">{achievement.description}</p>
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