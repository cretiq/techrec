"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { InternalProfile, InternalSkill, InternalExperience, InternalEducation, InternalAchievement, ProfileUpdateSchema } from "@/types/types"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { CVUploadCard } from "@/components/profile/CVUploadCard"
import { ProfileTabs } from "@/components/profile/ProfileTabs"
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'; // Import lodash for deep comparison

export default function DeveloperProfilePage() {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentProfile, setCurrentProfile] = useState<InternalProfile | null>(null)
  const [initialProfile, setInitialProfile] = useState<InternalProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/developer/me/profile', { signal: controller.signal });
        if (!response.ok) {
            if (response.status === 404) {
                 console.log("Profile not found, potentially new user.");
                 const defaultProfile: InternalProfile = {
                     id: '',
                     name: '',
                     email: '',
                     profileEmail: null,
                     title: null,
                     about: null,
                     contactInfo: null,
                     skills: [],
                     experience: [],
                     education: [],
                     achievements: [],
                     applications: [],
                     savedRoles: [],
                     customRoles: []
                 };
                 setInitialProfile(_.cloneDeep(defaultProfile));
                 setCurrentProfile(defaultProfile);
            } else {
                throw new Error(`Failed to fetch profile (status: ${response.status})`);
            }
        } else {
             const data: InternalProfile = await response.json();
             // Ensure all arrays are initialized
             const normalizedData = {
                 ...data,
                 skills: data.skills || [],
                 experience: data.experience || [],
                 education: data.education || [],
                 achievements: data.achievements || [],
                 applications: data.applications || [],
                 savedRoles: data.savedRoles || [],
                 customRoles: data.customRoles || []
             };
             setInitialProfile(_.cloneDeep(normalizedData));
             setCurrentProfile(normalizedData);
        }
        setHasUnsavedChanges(false);
        setModifiedFields(new Set());
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log("Fetch aborted");
          return;
        }
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive"
        });
        setCurrentProfile(null);
        setInitialProfile(null);
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

  useEffect(() => {
    if (initialProfile && currentProfile) {
      setHasUnsavedChanges(!_.isEqual(currentProfile, initialProfile));
    } else if (!initialProfile && currentProfile) {
      setHasUnsavedChanges(true); 
    }
  }, [currentProfile, initialProfile]);

  // Add debug effect
  useEffect(() => {
    console.debug('Profile State Debug:', {
      hasUnsavedChanges,
      isSaving,
      isProfilesEqual: initialProfile && currentProfile ? _.isEqual(currentProfile, initialProfile) : false,
      modifiedFieldsCount: modifiedFields.size,
      currentProfileId: currentProfile?.id,
      initialProfileId: initialProfile?.id
    });
  }, [hasUnsavedChanges, isSaving, currentProfile, initialProfile, modifiedFields]);

  const validateProfile = (profile: InternalProfile | null): Record<string, string> => {
    if (!profile) return {};
    
    const result = ProfileUpdateSchema.safeParse({
      name: profile.name,
      title: profile.title,
      profileEmail: profile.profileEmail,
      about: profile.about,
      contactInfo: profile.contactInfo,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      achievements: profile.achievements,
      customRoles: profile.customRoles,
    });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        // For email validation specifically, make the message more user-friendly
        if (field === 'profileEmail' && issue.code === 'invalid_string') {
          formattedErrors[field] = 'Please enter a valid email address';
        } else {
          formattedErrors[field] = issue.message;
        }
      });
      return formattedErrors;
    }

    return {};
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    
    setModifiedFields(prev => new Set(prev).add(id));

    setCurrentProfile((prev: InternalProfile | null) => {
      if (!prev) return prev;

      const updatedProfile = _.cloneDeep(prev);

      if (id === 'name') {
          updatedProfile.name = value;
      } else if (id === 'title' || id === 'about' || id === 'profileEmail') {
          updatedProfile[id] = value || null;
      } 
      else if (['phone', 'city', 'country', 'linkedin', 'github', 'portfolio'].includes(id)) {
         if (!updatedProfile.contactInfo) {
             updatedProfile.contactInfo = { 
                 id: undefined, phone: null, address: null, city: null, country: null, 
                 linkedin: null, github: null, website: null 
             };
         }
         const keyToUpdate = id === 'portfolio' ? 'website' : id as keyof Exclude<InternalProfile['contactInfo'], null>;
         if (updatedProfile.contactInfo && keyToUpdate in updatedProfile.contactInfo) {
             (updatedProfile.contactInfo as any)[keyToUpdate] = value || null;
         } else {
             console.warn(`Attempted to update non-existent key '${keyToUpdate}' in contactInfo`);
         }
      } else {
           console.warn(`Unhandled input change for ID: ${id}`);
      }
      
      return updatedProfile;
    });
  };

  const handleSaveProfile = async () => {
    console.log("Save button clicked");
    console.log("Current state:", {
      hasProfile: !!currentProfile,
      hasUnsavedChanges,
      isSaving,
      currentProfileData: currentProfile,
      initialProfileData: initialProfile
    });

    if (!currentProfile || !hasUnsavedChanges) {
      console.log("Early return condition met:", {
        noCurrentProfile: !currentProfile,
        noUnsavedChanges: !hasUnsavedChanges
      });
      return;
    }

    console.log("Proceeding with save...");

    // Validate using Zod schema
    const validationErrors = validateProfile(currentProfile);
    console.log("Validation result:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      console.error("Validation Errors found:", validationErrors);
      setErrors(validationErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    console.log("Validation passed. Attempting save...");

    try {
      setIsSaving(true);
      console.log("setIsSaving(true) called.");

      // Create a payload that matches our schema
      const payload = {
        name: currentProfile.name,
        title: currentProfile.title,
        profileEmail: currentProfile.profileEmail,
        about: currentProfile.about,
        contactInfo: currentProfile.contactInfo,
        skills: (currentProfile.skills || []).map((s: InternalSkill) => ({
          ...(!s.id.startsWith('temp_') && { id: s.id }),
          name: s.name,
          category: s.category,
          level: s.level
        })),
        experience: (currentProfile.experience || []).map((e: InternalExperience) => ({
          ...(!e.id.startsWith('temp_') && { id: e.id }),
          title: e.title,
          company: e.company,
          description: e.description,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          responsibilities: e.responsibilities,
          achievements: e.achievements,
          teamSize: e.teamSize,
          techStack: e.techStack
        })),
        education: (currentProfile.education || []).map((edu: InternalEducation) => ({
          ...(!edu.id.startsWith('temp_') && { id: edu.id }),
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          location: edu.location,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          honors: edu.honors,
          activities: edu.activities
        })),
        achievements: (currentProfile.achievements || []).map((a: InternalAchievement) => ({
          ...(!a.id.startsWith('temp_') && { id: a.id }),
          title: a.title,
          description: a.description,
          date: a.date,
          url: a.url,
          issuer: a.issuer
        })),
        customRoles: (currentProfile.customRoles || []).map((role) => ({
          ...(role.id && !role.id.startsWith('temp_') && { id: role.id }),
          title: role.title,
          description: role.description,
          requirements: role.requirements,
          skills: role.skills,
          location: role.location,
          salary: role.salary,
          type: role.type,
          remote: role.remote,
          visaSponsorship: role.visaSponsorship,
          companyName: role.companyName,
          url: role.url,
          originalRoleId: role.originalRoleId
        }))
      };
      console.log("Payload created:", payload);

      // Validate one more time before sending (type-safe)
      const validatedPayload = ProfileUpdateSchema.parse(payload);
      console.log("Payload validated by Zod:", validatedPayload);

      console.log("Sending fetch request...");
      const response = await fetch('/api/developer/me/profile', { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedPayload),
      });
      console.log("Fetch response received:", { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        console.error("Save error response (in !response.ok block):", errorData);
        throw new Error(errorData.error?.message || errorData.error || 'Failed to save profile');
      }

      const updatedProfile: InternalProfile = await response.json();
      console.log("Profile data received from server:", updatedProfile);
      
      const clonedProfile = _.cloneDeep(updatedProfile);
      console.log("Cloned profile created:", { 
        clonedId: clonedProfile.id,
        originalId: updatedProfile.id,
        areEqual: _.isEqual(clonedProfile, updatedProfile)
      });
      
      setCurrentProfile(clonedProfile);
      setInitialProfile(() => _.cloneDeep(clonedProfile));
      
      setTimeout(() => {
        console.log("Resetting hasUnsavedChanges and modifiedFields.");
        setHasUnsavedChanges(false);
        setModifiedFields(new Set());
      }, 0);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Save operation failed in catch block:', error);
      toast({
        title: 'Error Saving Profile',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      console.log("Setting setIsSaving(false) in finally block.");
      setIsSaving(false);
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement> | File) => {
    const file = event instanceof File ? event : event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF or DOCX file', variant: 'destructive' });
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

      const response = await fetch('/api/developer/me/cv', { method: 'POST', body: formData });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to upload CV');
      }
      const { data: uploadData } = await response.json();

      setUploadState('analyzing');
      setUploadProgress(50);

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

      setCurrentProfile((prev: InternalProfile | null) => {
        if (!prev) return null;
        
        const analysisData = analysis as any;
        const newFields = new Set<string>();
        const updatedData = _.cloneDeep(prev);

        const updateField = (fieldPath: string, newValue: any) => {
          const existingValue = _.get(updatedData, fieldPath);
          const topLevelField = fieldPath.includes('.') ? fieldPath.split('.')[0] : fieldPath;
          if (!_.isEqual(newValue, existingValue)) {
            _.set(updatedData, fieldPath, newValue);
            newFields.add(String(topLevelField));
          }
        };

        updateField('name', analysisData.name || updatedData.name);
        updateField('profileEmail', analysisData.email || updatedData.profileEmail);
        updateField('about', analysisData.about || updatedData.about);
        
        const contactUpdates: Partial<Exclude<InternalProfile['contactInfo'], null>> = {};
        if (analysisData.phone) contactUpdates.phone = analysisData.phone;
        if (analysisData.location) contactUpdates.address = analysisData.location;
        if (analysisData.linkedin) contactUpdates.linkedin = analysisData.linkedin;
        if (analysisData.github) contactUpdates.github = analysisData.github;
        if (analysisData.website) contactUpdates.website = analysisData.website;
        
        if (Object.keys(contactUpdates).length > 0) {
             if (!updatedData.contactInfo) updatedData.contactInfo = { id: undefined, phone: null, address: null, city: null, country: null, linkedin: null, github: null, website: null };
             updatedData.contactInfo = { ...updatedData.contactInfo, ...contactUpdates };
             newFields.add('contactInfo');
        }

        if (analysisData.skills?.length) {
          const mappedSkills: InternalSkill[] = analysisData.skills.map((skillItem: any) => ({
            id: `temp_skill_${uuidv4()}`,
            name: skillItem.name,
            category: skillItem.category || 'Uncategorized',
            level: skillItem.level?.toUpperCase() || "INTERMEDIATE"
          }));
          updateField('skills', mappedSkills);
        }

        if (analysisData.experience?.length) {
          const mappedExperience: InternalExperience[] = analysisData.experience.map((expItem: any) => ({
            id: `temp_exp_${uuidv4()}`,
            title: expItem.title || 'Untitled Experience',
            company: expItem.company || 'Unknown Company',
            description: expItem.description || '',
            location: expItem.location || null,
            startDate: expItem.startDate ? new Date(expItem.startDate).toISOString() : new Date().toISOString(),
            endDate: expItem.endDate ? new Date(expItem.endDate).toISOString() : null,
            current: !expItem.endDate,
            responsibilities: expItem.responsibilities || [],
            achievements: expItem.achievements || [],
            teamSize: expItem.teamSize || null,
            techStack: expItem.techStack || []
          }));
          updateField('experience', mappedExperience);
        }

         if (analysisData.education?.length) {
          const mappedEducation: InternalEducation[] = analysisData.education.map((eduItem: any) => ({
            id: `temp_edu_${uuidv4()}`,
            degree: eduItem.degree || null,
            institution: eduItem.institution || 'Unknown Institution',
            year: eduItem.year?.toString() || (eduItem.startDate ? new Date(eduItem.startDate).getFullYear().toString() : ''),
            location: eduItem.location || null,
            startDate: eduItem.startDate ? new Date(eduItem.startDate).toISOString() : new Date().toISOString(),
            endDate: eduItem.endDate ? new Date(eduItem.endDate).toISOString() : null,
            gpa: eduItem.gpa || null,
            honors: eduItem.honors || [],
            activities: eduItem.activities || []
          }));
          updateField('education', mappedEducation);
        }

         if (analysisData.achievements?.length) {
          const mappedAchievements: InternalAchievement[] = analysisData.achievements.map((achItem: any) => ({
            id: `temp_ach_${uuidv4()}`,
            title: achItem.title || 'Untitled Achievement',
            description: achItem.description || '',
            date: achItem.date ? new Date(achItem.date).toISOString() : new Date().toISOString(),
            url: achItem.url || null,
            issuer: achItem.issuer || null
          }));
          updateField('achievements', mappedAchievements);
        }

        setModifiedFields(prevFields => new Set([...prevFields, ...newFields]));
        return updatedData;
      });
      
      setUploadState('success');
      setUploadProgress(100);
      toast({ title: 'Success', description: 'CV analyzed. Review and save changes.' });
      setTimeout(() => { setUploadState('idle'); setUploadProgress(0); }, 3000);

    } catch (error) {
      console.error('CV processing error:', error);
      setUploadState('error');
      toast({ title: 'Error Processing CV', description: error instanceof Error ? error.message : 'An unknown error occurred', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if ('target' in event && event.target instanceof HTMLInputElement) {
        event.target.value = '';
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' }); return; }
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'File too large', description: 'Please upload an image smaller than 2MB', variant: 'destructive' }); return; }

    console.log("Avatar file selected:", file.name);
    toast({ title: "Avatar Updated (Placeholder)", description: "Avatar upload logic needs implementation." });
    if (e.target) e.target.value = '';
  };

  const handleDeleteSkill = (id: string) => {
    setCurrentProfile((prev: InternalProfile | null) => {
      if (!prev) return null;
      const updatedSkills = prev.skills.filter((skill: InternalSkill) => skill.id !== id);
      if (updatedSkills.length !== prev.skills.length) {
        setModifiedFields((prevFields) => new Set(prevFields).add('skills'));
      }
      return { ...prev, skills: updatedSkills };
    });
  };

  const handleDeleteExperience = (id: string) => {
    setCurrentProfile((prev: InternalProfile | null) => {
      if (!prev) return null;
      const updatedExperience = prev.experience.filter((exp: InternalExperience) => exp.id !== id);
      if (updatedExperience.length !== prev.experience.length) {
        setModifiedFields((prevFields) => new Set(prevFields).add('experience'));
      }
      return { ...prev, experience: updatedExperience };
    });
  };

  const handleDeleteEducation = (id: string) => {
    setCurrentProfile((prev: InternalProfile | null) => {
      if (!prev) return null;
      const updatedEducation = prev.education.filter((edu: InternalEducation) => edu.id !== id);
      if (updatedEducation.length !== prev.education.length) {
        setModifiedFields((prevFields) => new Set(prevFields).add('education'));
      }
      return { ...prev, education: updatedEducation };
    });
  };

  const handleDeleteAchievement = (id: string) => {
    setCurrentProfile((prev: InternalProfile | null) => {
      if (!prev) return null;
      const updatedAchievements = prev.achievements.filter((ach: InternalAchievement) => ach.id !== id);
      if (updatedAchievements.length !== prev.achievements.length) {
        setModifiedFields((prevFields) => new Set(prevFields).add('achievements'));
      }
      return { ...prev, achievements: updatedAchievements };
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
        <p className="text-muted-foreground mb-4">Could not load your profile data. Please try refreshing the page or contact support.</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col animate-fade-in-up">
      <div className="w-full flex justify-center">
        <main className="container max-w-5xl py-4 md:py-6 px-3 md:px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Developer Profile
              </h1>
              <p className="text-sm text-muted-foreground">Manage your profile and CV to match with the best opportunities</p>
            </div>
            <Button
              onClick={() => {
                console.log("Button clicked - State:", {
                  isSaving,
                  hasUnsavedChanges,
                  disabled: isSaving || !hasUnsavedChanges
                });
                handleSaveProfile();
              }}
              disabled={isSaving || !hasUnsavedChanges}
              className={cn(
                "w-full md:w-auto gap-1 transition-all duration-300 text-sm py-2 h-9",
                hasUnsavedChanges
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <><Loader2 className="h-3 w-3 animate-spin mr-1" />Saving...</>
              ) : (
                <><Save className="h-3 w-3 mr-1" />{hasUnsavedChanges ? 'Save Changes' : 'No Changes'}</>
              )}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="rounded-lg hover:shadow transition-all duration-300">
                <ProfileHeader
                  profile={currentProfile}
                  onAvatarChange={handleAvatarChange}
                />
              </div>
              <div className="rounded-lg hover:shadow transition-all duration-300">
                <CVUploadCard
                  onUpload={handleCVUpload}
                  uploadState={uploadState}
                  uploadProgress={uploadProgress}
                  isUploading={isUploading}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="rounded-lg hover:shadow transition-all duration-300">
                <ProfileTabs
                  currentProfile={currentProfile}
                  modifiedFields={modifiedFields}
                  onInputChange={handleInputChange}
                  onDeleteSkill={handleDeleteSkill}
                  onDeleteExperience={handleDeleteExperience}
                  onDeleteEducation={handleDeleteEducation}
                  onDeleteAchievement={handleDeleteAchievement}
                  errors={errors}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.25s ease-out forwards;
    opacity: 0;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
} 