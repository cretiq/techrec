"use client"

import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import {  Button  } from '@/components/ui-daisy/button'
import { ExternalLink, Trash2, Plus } from "lucide-react"
import { InternalProfile, InternalAchievement } from "@/types/types"

interface AchievementsCardProps {
  profile: InternalProfile | null;
  onDeleteAchievement: (id: string) => void;
}

export function AchievementsCard({ profile, onDeleteAchievement }: AchievementsCardProps) {
  return (
    <Card 
      variant="transparent" 
      className="animate-fade-in-up" 
      data-testid="profile-achievements-card"
    >
      <CardHeader className="flex flex-row items-center justify-between" data-testid="profile-achievements-header">
        <CardTitle data-testid="profile-achievements-title">Achievements</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 bg-base-100/50 backdrop-blur-sm border border-base-300/50 hover:bg-base-200/50"
          data-testid="profile-achievements-add-button"
        >
          <Plus className="h-4 w-4" />
          Add Achievement
        </Button>
      </CardHeader>
      <CardContent data-testid="profile-achievements-content">
        <div className="space-y-4">
          {(profile?.achievements || []).map((achievement: InternalAchievement) => (
            <Card 
              key={achievement.id} 
              variant="transparent" 
              className="p-4 bg-base-100/30 backdrop-blur-sm shadow-sm"
              data-testid={`profile-achievement-item-${achievement.id}`}
            >
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