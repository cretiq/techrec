"use client"

import {  Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui-daisy/tabs'
import { User, Briefcase, GraduationCap, Award, Sparkles, Settings } from "lucide-react"
import { InternalProfile } from "@/types/types"
import { ProfileInfoCard } from "./ProfileInfoCard"
import { SkillsCard } from "./SkillsCard"
import { ExperienceCard } from "./ExperienceCard"
import { EducationCard } from "./EducationCard"
import { AchievementsCard } from "./AchievementsCard"

interface ProfileTabsProps {
  currentProfile: InternalProfile | null;
  modifiedFields: Set<string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDeleteSkill: (id: string) => void;
  onDeleteExperience: (id: string) => void;
  onDeleteEducation: (id: string) => void;
  onDeleteAchievement: (id: string) => void;
  errors: Record<string, string>;
  activeTab: string;
}

export function ProfileTabs({
  currentProfile,
  modifiedFields,
  onInputChange,
  onDeleteSkill,
  onDeleteExperience,
  onDeleteEducation,
  onDeleteAchievement,
  errors,
  activeTab
}: ProfileTabsProps) {
  // Render content based on activeTab instead of using TabsContent
  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="space-y-6">
            <ProfileInfoCard
              currentProfile={currentProfile}
              modifiedFields={modifiedFields}
              onInputChange={onInputChange}
              errors={errors}
            />
          </div>
        )
      case "skills":
        return (
          <div className="space-y-6">
            <SkillsCard
              profile={currentProfile}
              onDeleteSkill={onDeleteSkill}
            />
          </div>
        )
      case "experience":
        return (
          <div className="space-y-6">
            <ExperienceCard
              profile={currentProfile}
              onDeleteExperience={onDeleteExperience}
            />
          </div>
        )
      case "education":
        return (
          <div className="space-y-6">
            <EducationCard
              profile={currentProfile}
              onDeleteEducation={onDeleteEducation}
            />
          </div>
        )
      case "achievements":
        return (
          <div className="space-y-6">
            <AchievementsCard
              profile={currentProfile}
              onDeleteAchievement={onDeleteAchievement}
            />
          </div>
        )
      case "settings":
        return (
          <div className="space-y-6">
            <div className="p-8 text-center text-base-content/70">
              <Settings className="h-12 w-12 mx-auto mb-4 text-base-content/40" />
              <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
              <p className="text-sm">Profile settings and preferences will be available here.</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full" data-testid="profile-tabs-container">
      {renderTabContent()}
    </div>
  )
} 