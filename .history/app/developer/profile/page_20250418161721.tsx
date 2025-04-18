"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Profile } from "./components/types"
import { ProfileHeader } from "./components/ProfileHeader"
import { CVUploadCard } from "./components/CVUploadCard"
import { ProfileTabs } from "./components/ProfileTabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { v4 as uuidv4 } from 'uuid'

export default function DeveloperProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [tempProfile, setTempProfile] = useState<Profile | null>(null)
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    const controller = new AbortController();
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/developer/me', { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setTempProfile(data);
        setHasUnsavedChanges(false);
        setModifiedFields(new Set());
      } catch (error: any) {
        if (error.name === 'AbortError') {
          setLoading(false);
          return;
        }
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    // setModifiedFields(prev => new Set([...prev, id]));

    // if (['phone', 'city', 'country'].includes(id)) {
    //   setProfile(prev => {
    //     if (!prev) return prev;
    //     console.log('prev', prev);

        
    //     const contactInfo = prev.contactInfo || {
    //       id: uuidv4(),
    //       phone: null,
    //       address: null,
    //       city: null,
    //       state: null,
    //       country: null,
    //       linkedin: null,
    //       github: null,
    //       website: null
    //     };
        
    //     return {
    //       ...prev,
    //       contactInfo: {
    //         ...contactInfo,
    //         [id]: value || null
    //       }
    //     };
    //   });
    // } else if (id === 'profileEmail') {
    //   setProfile(prev => {
    //     if (!prev) return prev;
    //     return {
    //       ...prev,
    //       profileEmail: value
    //     };
    //   });
    // } else {
    //   setProfile(prev => {
    //     if (!prev) return prev;
    //     return {
    //       ...prev,
    //       [id]: value
    //     };
    //   });
    // }
  };

  const handleSaveProfile = async () => {
    if (!tempProfile) return;

    try {
      setIsSaving(true);

      const response = await fetch('/api/developer/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const updatedProfileResponse = await fetch('/api/developer/me');
      if (!updatedProfileResponse.ok) {
        throw new Error('Failed to fetch updated profile');
      }
      const updatedProfile = await updatedProfileResponse.json();
      
      setProfile(updatedProfile);
      setTempProfile(updatedProfile);
      setHasUnsavedChanges(false);
      setModifiedFields(new Set());
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('pdf')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    setUploadState('uploading')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/developer/me/cv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload CV')
      }

      const { data } = await response.json()
      console.log('Extracted text:', data.text)

      setUploadState('analyzing')
      setUploadProgress(50)

      const analyzeResponse = await fetch('/api/developer/me/cv/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: data.text }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze CV');
      }

      const { analysis } = await analyzeResponse.json();
      console.log('Analysis results:', analysis);
      
      setTempProfile((prev) => {
        if (!prev) return null;
        
        const analysisData = analysis as unknown as any;
        console.log('Mapping analysis data:', {
          experience: analysisData.experience,
          education: analysisData.education,
          achievements: analysisData.achievements
        });
        
        return {
          ...prev,
          name: analysisData.name || prev.name,
          title: analysisData.title || prev.title,
          about: analysisData.about || prev.about,
          email: prev.email,
          profileEmail: analysisData.email || prev.profileEmail,
          isDeleted: prev.isDeleted,
          deletedAt: prev.deletedAt,
          contactInfo: {
            ...prev.contactInfo!,
            id: prev.contactInfo?.id || `temp_${Date.now()}`,
            phone: analysisData.phone || prev.contactInfo?.phone || null,
            city: analysisData.location?.split(',')[0]?.trim() || prev.contactInfo?.city || null,
            country: analysisData.location?.split(',')[1]?.trim() || prev.contactInfo?.country || null,
          },
          developerSkills: analysisData.skills?.length 
            ? analysisData.skills.map((skillItem: any) => ({
                id: `temp_${Date.now()}_${skillItem.name}`,
                level: skillItem.level,
                skill: {
                  id: `temp_${Date.now()}_${skillItem.name}`,
                  name: skillItem.name,
                  category: {
                    id: `temp_${Date.now()}_${skillItem.category}`,
                    name: skillItem.category,
                    description: null
                  },
                  description: null
                },
                developerId: prev.id
              })) 
            : prev.developerSkills,
          experience: analysisData.experience?.length
            ? analysisData.experience.map((expItem: any) => ({
                id: `temp_${Date.now()}_${expItem.company}`,
                title: expItem.title,
                company: expItem.company,
                description: expItem.description,
                location: expItem.location || null,
                startDate: expItem.startDate ? new Date(expItem.startDate) : new Date(),
                endDate: expItem.endDate ? new Date(expItem.endDate) : null,
                current: !expItem.endDate,
                responsibilities: expItem.responsibilities || [],
                achievements: expItem.achievements || [],
                teamSize: expItem.teamSize || null,
                techStack: expItem.techStack || []
              }))
            : prev.experience,
          education: analysisData.education?.length
            ? analysisData.education.map((eduItem: any) => ({
                id: `temp_${Date.now()}_${eduItem.institution}`,
                degree: eduItem.degree || null,
                institution: eduItem.institution,
                year: eduItem.year || (eduItem.startDate ? new Date(eduItem.startDate).getFullYear().toString() : null),
                location: eduItem.location || null,
                startDate: eduItem.startDate ? new Date(eduItem.startDate) : new Date(),
                endDate: eduItem.endDate ? new Date(eduItem.endDate) : null,
                gpa: eduItem.gpa || null,
                honors: eduItem.honors || [],
                activities: eduItem.activities || []
              }))
            : prev.education,
          achievements: analysisData.achievements?.length
            ? analysisData.achievements.map((achievementItem: any) => ({
                id: `temp_${Date.now()}_${achievementItem.title}`,
                title: achievementItem.title,
                description: achievementItem.description,
                date: achievementItem.date ? new Date(achievementItem.date) : new Date(),
                url: achievementItem.url || null,
                issuer: achievementItem.issuer || null
              }))
            : prev.achievements,
          projects: prev.projects,
          assessments: prev.assessments,
          applications: prev.applications,
          savedRoles: prev.savedRoles,
          customRoles: prev.customRoles
        };
      });
      
      setHasUnsavedChanges(true);
      setUploadState('success')
      setUploadProgress(100)

      toast({
        title: 'Success',
        description: 'CV analyzed successfully. Review and save your changes.',
      })

      setTimeout(() => {
        setUploadState('idle')
        setUploadProgress(0)
      }, 2000)
    } catch (error) {
      console.error('CV processing error:', error)
      setUploadState('error')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process CV',
        variant: 'destructive',
      })
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('image')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: "Profile picture updated",
      description: "Your profile picture has been updated successfully",
    })
  }

  const handleDeleteAchievement = (id: string) => {
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        achievements: prev.achievements.filter(achievement => achievement.id !== id)
      };
    });
  }

  const handleDeleteSkill = (id: string) => {
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        developerSkills: prev.developerSkills.filter(skill => skill.id !== id)
      };
    });
  };

  const handleDeleteEducation = (id: string) => {
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        education: prev.education.filter(edu => edu.id !== id)
      };
    });
  };

  const handleDeleteExperience = (id: string) => {
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        experience: prev.experience.filter(exp => exp.id !== id)
      };
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">We couldn't find your profile. Please try again later.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col animate-fade-in-up">
      <div className="w-full flex justify-center">
        <main className="container max-w-6xl py-6 md:py-10 px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Developer Profile
              </h1>
              <p className="text-muted-foreground">Manage your profile and CV to match with the best opportunities</p>
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={isSaving || !hasUnsavedChanges}
              className={cn(
                "w-full md:w-auto gap-1",
                hasUnsavedChanges 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "bg-gray-400 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <ProfileHeader
                profile={profile}
                onAvatarChange={handleAvatarChange}
              />
              <CVUploadCard
                onUpload={handleCVUpload}
                uploadState={uploadState}
                uploadProgress={uploadProgress}
              />
            </div>

            <div className="md:col-span-2 space-y-6">
              <ProfileTabs
                profile={profile}
                tempProfile={tempProfile}
                modifiedFields={modifiedFields}
                onInputChange={handleInputChange}
                onDeleteSkill={handleDeleteSkill}
                onDeleteExperience={handleDeleteExperience}
                onDeleteEducation={handleDeleteEducation}
                onDeleteAchievement={handleDeleteAchievement}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


