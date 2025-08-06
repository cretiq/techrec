"use client"

import {  Card, CardContent, CardFooter  } from '@/components/ui-daisy/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui-daisy/avatar"
import {  Badge  } from '@/components/ui-daisy/badge'
import { Progress } from "@/components/ui-daisy/progress"
import { Upload, User } from "lucide-react"
import {  Input  } from '@/components/ui-daisy/input'
import { InternalProfile } from "@/types/types"

interface ProfileHeaderProps {
  profile: InternalProfile | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({ profile, onAvatarChange }: ProfileHeaderProps) {

  const calculateCompleteness = (p: InternalProfile | null): number => {
    if (!p) return 0;
    let score = 0;
    const totalFields = 10;

    if (p.name) score++;
    if (p.title) score++;
    if (p.about) score++;
    if (p.profileEmail) score++;
    if (p.contactInfo?.phone) score++;
    if (p.contactInfo?.city && p.contactInfo?.country) score++;
    if (p.skills?.length > 0) score++;
    if (p.experience?.length > 0) score++;
    if (p.education?.length > 0) score++;
    
    return Math.round((score / totalFields) * 100);
  }

  const completeness = calculateCompleteness(profile);
  const fallbackInitials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

  return (
    <Card variant="transparent" className="animate-fade-in-up" data-testid="profile-header-card">
      <CardContent className="flex flex-col items-center text-center pt-6" data-testid="profile-header-content">
        <div
          className="relative group cursor-pointer"
          onClick={() => document.getElementById("profile-upload")?.click()}
          data-testid="profile-header-avatar-container"
        >
          <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-transparent group-hover:border-primary transition-colors" data-testid="profile-header-avatar">
            <AvatarImage src={profile?.contactInfo?.website || "/placeholder.svg?height=96&width=96"} data-testid="profile-header-avatar-image" />
            <AvatarFallback data-testid="profile-header-avatar-fallback">{fallbackInitials}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden w-20 h-20 md:w-24 md:h-24" data-testid="profile-header-avatar-overlay">
            <Upload className="h-6 w-6 text-white" data-testid="profile-header-upload-icon" />
          </div>
          <Input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarChange}
            data-testid="profile-header-avatar-input"
          />
        </div>
        <h3 className="text-lg md:text-xl font-bold mt-3" data-testid="profile-header-name">{profile?.name || 'Your Name'}</h3>
        <p className="text-muted-foreground text-sm md:text-base" data-testid="profile-header-title">{profile?.title || 'Your Title'}</p>
        {(profile?.contactInfo?.city || profile?.contactInfo?.country) && (
          <div className="flex items-center gap-1 mt-1 text-xs md:text-sm" data-testid="profile-header-location">
            <Badge variant="outline" data-testid="profile-header-location-badge">
              {profile?.contactInfo?.city}{profile?.contactInfo?.city && profile?.contactInfo?.country ? ', ' : ''}{profile?.contactInfo?.country}
            </Badge>
          </div>
        )}
        <div className="w-full mt-4 md:mt-6" data-testid="profile-header-completeness">
          <div className="flex justify-between text-xs md:text-sm mb-1" data-testid="profile-header-completeness-header">
            <span>Profile Completeness</span>
            <span data-testid="profile-header-completeness-percentage">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" data-testid="profile-header-completeness-progress" />
        </div>
      </CardContent>
    </Card>
  )
} 