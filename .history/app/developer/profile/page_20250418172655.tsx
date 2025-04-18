"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { DeveloperProfile } from "@/types/developer"
import { ProfileHeader } from "./components/ProfileHeader"
import { CVUploadCard } from "./components/CVUploadCard"
import { ProfileTabs } from "./components/ProfileTabs"
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'; // Import lodash for deep comparison

export default function DeveloperProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentProfile, setCurrentProfile] = useState<DeveloperProfile | null>(null)
  const [initialProfile, setInitialProfile] = useState<DeveloperProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    const controller = new AbortController();
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/developer/me', { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setInitialProfile(_.cloneDeep(data));
        setCurrentProfile(data);
        setHasUnsavedChanges(false);
        setModifiedFields(new Set());
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
      } finally {
         if (!controller.signal.aborted) {
            setLoading(false);
         }
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
    
    setModifiedFields(prev => new Set(prev).add(id));

    setCurrentProfile(prev => {
      if (!prev) return prev;

      const updatedProfile = {
        ...prev,
        [id]: value || null
      };

      return updatedProfile;
    });
  };

  useEffect(() => {
    if (initialProfile && currentProfile) {
      setHasUnsavedChanges(!_.isEqual(currentProfile, initialProfile));
    }
  }, [currentProfile, initialProfile]);

  const handleSaveProfile = async () => {
    if (!currentProfile || !hasUnsavedChanges) return;

    try {
      setIsSaving(true);

      const body = JSON.stringify(currentProfile);

      const response = await fetch('/api/developer/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save profile');
      }

      const updatedProfile = await response.json();
      
      setInitialProfile(_.cloneDeep(updatedProfile));
      setCurrentProfile(updatedProfile);
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
        description: error instanceof Error ? error.message : 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement> | File) => {
    const file = event instanceof File ? event : event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload a file smaller than 5MB', variant: 'destructive' });
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/developer/me/cv', { method: 'POST', body: formData })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to upload CV')
      }
      const { data: uploadData } = await response.json()

      setUploadState('analyzing')
      setUploadProgress(50)

      const analyzeResponse = await fetch('/api/developer/me/cv/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: uploadData.text }),
      });
      if (!analyzeResponse.ok) {
        const error = await analyzeResponse.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to analyze CV');
      }
      const { analysis } = await analyzeResponse.json();

      setCurrentProfile((prev) => {
        if (!prev) return null;
        
        const analysisData = analysis as any;
        const newFields = new Set<string>();

        const updateField = (fieldPath: keyof DeveloperProfile | string, newValue: any, currentData: DeveloperProfile) => {
          const existingValue = _.get(currentData, fieldPath);
          if (!_.isEqual(newValue, existingValue)) {
            _.set(currentData, fieldPath, newValue);
            newFields.add(fieldPath.toString());
          }
        }

        const updatedData = _.cloneDeep(prev);

        updateField('name', analysisData.name || prev.name, updatedData);
        updateField('email', analysisData.email || prev.email, updatedData);
        updateField('phone', analysisData.phone || prev.phone || null, updatedData);
        updateField('location', analysisData.location || prev.location || null, updatedData);
        updateField('linkedin', analysisData.linkedin || prev.linkedin || null, updatedData);
        updateField('github', analysisData.github || prev.github || null, updatedData);
        updateField('portfolio', analysisData.website || prev.portfolio || null, updatedData);

        if (analysisData.skills?.length) {
          const mappedSkills = analysisData.skills.map((skillItem: any) => ({
            id: `temp_skill_${Date.now()}_${skillItem.name}`,
            name: skillItem.name,
            category: skillItem.category,
            level: skillItem.level?.toUpperCase() || "INTERMEDIATE"
          }));
          updateField('skills', mappedSkills, updatedData);
        }
        if (analysisData.experience?.length) {
          const mappedExperience = analysisData.experience.map((expItem: any) => ({
            id: `temp_exp_${Date.now()}_${expItem.company}`,
            title: expItem.title,
            company: expItem.company,
            description: expItem.description,
            location: expItem.location || null,
            startDate: expItem.startDate ? new Date(expItem.startDate).toISOString() : new Date().toISOString(),
            endDate: expItem.endDate ? new Date(expItem.endDate).toISOString() : null,
            current: !expItem.endDate,
            responsibilities: expItem.responsibilities || [],
            achievements: expItem.achievements || [],
            teamSize: expItem.teamSize || null,
            techStack: expItem.techStack || []
          }));
          updateField('experience', mappedExperience, updatedData);
        }
         if (analysisData.education?.length) {
          const mappedEducation = analysisData.education.map((eduItem: any) => ({
            id: `temp_edu_${Date.now()}_${eduItem.institution}`,
            degree: eduItem.degree || null,
            institution: eduItem.institution,
            year: eduItem.year?.toString() || (eduItem.startDate ? new Date(eduItem.startDate).getFullYear().toString() : null),
            location: eduItem.location || null,
            startDate: eduItem.startDate ? new Date(eduItem.startDate).toISOString() : new Date().toISOString(),
            endDate: eduItem.endDate ? new Date(eduItem.endDate).toISOString() : null,
            gpa: eduItem.gpa || null,
            honors: eduItem.honors || [],
            activities: eduItem.activities || []
          }));
          updateField('education', mappedEducation, updatedData);
        }
         if (analysisData.achievements?.length) {
          const mappedAchievements = analysisData.achievements.map((achItem: any) => ({
            id: `temp_ach_${Date.now()}_${achItem.title}`,
            title: achItem.title,
            description: achItem.description,
            date: achItem.date ? new Date(achItem.date).toISOString() : new Date().toISOString(),
            url: achItem.url || null,
            issuer: achItem.issuer || null
          }));
          updateField('achievements', mappedAchievements, updatedData);
        }

        setModifiedFields(prevFields => new Set([...prevFields, ...newFields]));

        return updatedData;
      });
      
      setUploadState('success')
      setUploadProgress(100)

      toast({
        title: 'Success',
        description: 'CV analyzed. Review and save changes.',
      })

      setTimeout(() => {
        setUploadState('idle')
        setUploadProgress(0)
      }, 3000)

    } catch (error) {
      console.error('CV processing error:', error)
      setUploadState('error')
      toast({
        title: 'Error Processing CV',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false);
      if ('target' in event) {
        event.target.value = '';
      }
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image smaller than 2MB', variant: 'destructive' })
      return
    }

    console.log("Avatar file selected:", file.name);
    toast({
      title: "Avatar Updated (Placeholder)",
      description: "Avatar upload logic needs implementation.",
    })

    if (e.target) e.target.value = '';
  }

  const handleDeleteAchievement = (id: string) => {
    setCurrentProfile(prev => {
      if (!prev) return null;
      const updatedAchievements = prev.achievements.filter(item => item.id !== id);
       if (updatedAchievements.length !== prev.achievements.length) {
           setModifiedFields(prevFields => new Set(prevFields).add('achievements'));
       }
      return { ...prev, achievements: updatedAchievements };
    });
  }

  const handleDeleteSkill = (id: string) => {
     setCurrentProfile(prev => {
        if (!prev) return null;
        const updatedSkills = prev.skills.filter((skill: any) => skill.id !== id);
         if (updatedSkills.length !== prev.skills.length) {
           setModifiedFields(prevFields => new Set(prevFields).add('skills'));
         }
        return { ...prev, skills: updatedSkills };
     });
  };

  const handleDeleteEducation = (id: string) => {
    setCurrentProfile(prev => {
      if (!prev) return null;
       const updatedEducation = prev.education.filter(item => item.id !== id);
       if (updatedEducation.length !== prev.education.length) {
            setModifiedFields(prevFields => new Set(prevFields).add('education'));
       }
      return { ...prev, education: updatedEducation };
    });
  };

  const handleDeleteExperience = (id: string) => {
    setCurrentProfile(prev => {
      if (!prev) return null;
       const updatedExperience = prev.experience.filter(item => item.id !== id);
       if (updatedExperience.length !== prev.experience.length) {
            setModifiedFields(prevFields => new Set(prevFields).add('experience'));
       }
      return { ...prev, experience: updatedExperience };
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">We couldn't find your profile or an error occurred.</p>
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
                "w-full md:w-auto gap-1 transition-all duration-300",
                hasUnsavedChanges
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
                profile={currentProfile}
                onAvatarChange={handleAvatarChange}
              />
              <CVUploadCard
                onUpload={handleCVUpload}
                uploadState={uploadState}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
              />
            </div>

            <div className="md:col-span-2 space-y-6">
              <ProfileTabs
                currentProfile={currentProfile}
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


