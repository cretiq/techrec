"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Profile } from "./types"

interface ProfileInfoCardProps {
  profile: Profile | null;
  modifiedFields: Set<string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function ProfileInfoCard({ profile, modifiedFields, onInputChange }: ProfileInfoCardProps) {
  return (
    <Card className="border shadow-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Full Name</Label>
            <Input
              id="name"
              value={profile?.name || ''}
              onChange={onInputChange}
              className={cn(
                "text-sm md:text-base bg-white dark:bg-gray-800 border",
                modifiedFields.has('name') && "ring-2 ring-blue-500/50"
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">Professional Title</Label>
            <Input
              id="title"
              value={profile?.title || ''}
              onChange={onInputChange}
              className={cn(
                "text-sm md:text-base bg-white dark:bg-gray-800 border",
                modifiedFields.has('title') && "ring-2 ring-blue-500/50"
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile-email" className="text-sm">CV Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={profile?.profileEmail || ''}
              onChange={onInputChange}
              className={cn(
                "text-sm md:text-base bg-white dark:bg-gray-800 border",
                modifiedFields.has('profile-email') && "ring-2 ring-blue-500/50"
              )}
              placeholder="Email shown on your CV"
            />
            <p className="text-xs text-muted-foreground">This email will be visible on your CV</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">Phone</Label>
            <Input
              id="phone"
              value={profile?.contactInfo?.phone || ''}
              onChange={onInputChange}
              className={cn(
                "text-sm md:text-base bg-white dark:bg-gray-800 border",
                modifiedFields.has('phone') && "ring-2 ring-blue-500/50"
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm">Location</Label>
            <Input
              id="location"
              value={`${profile?.contactInfo?.city || ''}, ${profile?.contactInfo?.country || ''}`}
              onChange={onInputChange}
              className={cn(
                "text-sm md:text-base bg-white dark:bg-gray-800 border",
                modifiedFields.has('location') && "ring-2 ring-blue-500/50"
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="about" className="text-sm">About</Label>
          <Textarea
            id="about"
            rows={5}
            value={profile?.about || ''}
            onChange={onInputChange}
            className={cn(
              "text-xs md:text-sm bg-white dark:bg-gray-800 border scrollbar-hide",
              modifiedFields.has('about') && "ring-2 ring-blue-500/50"
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
} 

