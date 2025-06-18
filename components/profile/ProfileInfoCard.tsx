"use client"

import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card'
import {  Input  } from '@/components/ui-daisy/input'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui-daisy/textarea"
import { cn } from "@/lib/utils"
import { InternalProfile } from "@/types/types"

interface ProfileInfoCardProps {
  currentProfile: InternalProfile | null;
  modifiedFields: Set<string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: Record<string, string>;
}

export function ProfileInfoCard({ currentProfile, modifiedFields, onInputChange, errors }: ProfileInfoCardProps) {
  return (
    <Card 
      variant="transparent" 
      className="animate-fade-in-up" 
      data-testid="profile-personal-info-card"
    >
      <CardHeader data-testid="profile-personal-info-header">
        <CardTitle data-testid="profile-personal-info-title">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" data-testid="profile-personal-info-content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              Full Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={currentProfile?.name || ''}
              onChange={onInputChange}
              required
              className={cn(
                "text-sm bg-base-100/50 backdrop-blur-sm border border-base-300/50",
                modifiedFields.has('name') && "ring-2 ring-primary/50",
                errors.name && "border-red-500 focus:ring-red-500"
              )}
              data-testid="profile-input-name"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              Professional Title
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={currentProfile?.title || ''}
              onChange={onInputChange}
              required
              className={cn(
                "text-sm bg-base-100/50 backdrop-blur-sm border border-base-300/50",
                modifiedFields.has('title') && "ring-2 ring-primary/50",
                errors.title && "border-red-500 focus:ring-red-500"
              )}
              data-testid="profile-input-title"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profileEmail" className="flex items-center gap-1">Contact Email</Label>
            <Input
              id="profileEmail"
              type="email"
              value={currentProfile?.profileEmail || ''}
              onChange={onInputChange}
              className={cn(
                "text-sm bg-base-100/50 backdrop-blur-sm border border-base-300/50",
                modifiedFields.has('profileEmail') && "ring-2 ring-primary/50",
                errors.profileEmail && "border-red-500 focus:ring-red-500"
              )}
              placeholder="Email for contact purposes"
              data-testid="profile-input-email"
            />
            {errors.profileEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.profileEmail}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1">Phone</Label>
            <Input
              id="phone"
              value={currentProfile?.contactInfo?.phone || ''}
              onChange={onInputChange}
              className={cn(
                "text-sm bg-base-100/50 backdrop-blur-sm border border-base-300/50",
                modifiedFields.has('phone') && "ring-2 ring-primary/50"
              )}
              data-testid="profile-input-phone"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-1">City</Label>
            <Input
              id="city"
              value={currentProfile?.contactInfo?.city || ''}
              onChange={onInputChange}
              className={cn(
                "text-sm bg-base-100/50 backdrop-blur-sm border border-base-300/50",
                modifiedFields.has('city') && "ring-2 ring-primary/50"
              )}
              placeholder="Your city"
              data-testid="profile-input-city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-1">Country</Label>
            <Input
              id="country"
              value={currentProfile?.contactInfo?.country || ''}
              onChange={onInputChange}
              className={cn(
                "text-sm bg-base-100/50 backdrop-blur-sm border border-base-300/50",
                modifiedFields.has('country') && "ring-2 ring-primary/50"
              )}
              placeholder="Your country"
              data-testid="profile-input-country"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="about" className="flex items-center gap-1">About</Label>
          <Textarea
            id="about"
            rows={5}
            value={currentProfile?.about || ''}
            onChange={onInputChange}
            className={cn(
              "text-xs bg-base-100/50 backdrop-blur-sm border border-base-300/50 scrollbar-hide",
              modifiedFields.has('about') && "ring-2 ring-primary/50"
            )}
            data-testid="profile-textarea-about"
          />
        </div>
      </CardContent>
    </Card>
  )
} 