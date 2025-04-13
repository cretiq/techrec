"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Profile } from "./types"

interface ProfileHeaderProps {
  profile: Profile | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({ profile, onAvatarChange }: ProfileHeaderProps) {
  const { toast } = useToast()

  return (
    <Card className="border shadow-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up">
      <CardContent className="flex flex-col items-center text-center">
        <div
          className="relative group cursor-pointer"
          onClick={() => document.getElementById("profile-upload")?.click()}
        >
          <Avatar className="h-20 w-20 md:h-24 md:w-24  mt-4 border-2 border-transparent group-hover:border-primary transition-colors">
            <AvatarImage src="/placeholder.svg?height=96&width=96" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden w-20 h-20 md:w-24 md:h-24">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <Input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarChange}
          />
        </div>
        <h3 className="text-lg md:text-xl font-bold">{profile?.name}</h3>
        <p className="text-muted-foreground text-sm md:text-base">{profile?.title}</p>
        <div className="flex items-center gap-1 mt-1 text-xs md:text-sm">
          <Badge variant="outline">{profile?.contactInfo?.city}, {profile?.contactInfo?.country}</Badge>
        </div>
        <div className="w-full mt-4 md:mt-6">
          <div className="flex justify-between text-xs md:text-sm mb-1">
            <span>Profile Completeness</span>
            <span>85%</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
} 