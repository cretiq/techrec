"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Briefcase, GraduationCap, Award } from "lucide-react"
import { Profile } from "./types"
import { ProfileInfoCard } from "./ProfileInfoCard"
import { SkillsCard } from "./SkillsCard"
import { ExperienceCard } from "./ExperienceCard"
import { EducationCard } from "./EducationCard"
import { AchievementsCard } from "./AchievementsCard"

interface ProfileTabsProps {
  profile: Profile | null;
  tempProfile: Profile | null;
  modifiedFields: Set<string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDeleteSkill: (id: string) => void;
  onDeleteExperience: (id: string) => void;
  onDeleteEducation: (id: string) => void;
  onDeleteAchievement: (id: string) => void;
}

export function ProfileTabs({
  profile,
  tempProfile,
  modifiedFields,
  onInputChange,
  onDeleteSkill,
  onDeleteExperience,
  onDeleteEducation,
  onDeleteAchievement
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-0">
        <TabsTrigger value="profile" className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
          <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="experience" className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
          <Briefcase className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Experience
        </TabsTrigger>
        <TabsTrigger value="education" className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
          <GraduationCap className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Education
        </TabsTrigger>
        <TabsTrigger value="achievements" className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
          <Award className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Achievements
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6 mt-6">
        <ProfileInfoCard
          profile={tempProfile}
          modifiedFields={modifiedFields}
          onInputChange={onInputChange}
        />
        <SkillsCard
          profile={tempProfile}
          onDeleteSkill={onDeleteSkill}
        />
      </TabsContent>

      <TabsContent value="experience" className="space-y-6 mt-6">
        <ExperienceCard
          profile={tempProfile}
          onDeleteExperience={onDeleteExperience}
        />
      </TabsContent>

      <TabsContent value="education" className="space-y-6 mt-6">
        <EducationCard
          profile={tempProfile}
          onDeleteEducation={onDeleteEducation}
        />
      </TabsContent>

      <TabsContent value="achievements" className="space-y-6">
        <AchievementsCard
          profile={tempProfile}
          onDeleteAchievement={onDeleteAchievement}
        />
      </TabsContent>
    </Tabs>
  )
} 