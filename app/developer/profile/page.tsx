"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SkillBadge } from "@/components/ui-components"
import { useToast } from "@/components/ui/use-toast"
import {
  Upload,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle,
  Calendar,
  Building,
  ExternalLink,
  FileText,
  X,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { SkillsInput } from '@/components/skills-input'
import Image from "next/image"
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Toast } from "@/components/ui/use-toast"

interface Profile {
  id: string;
  name: string;
  title: string;
  location: string;
  about: string;
  phone?: string;
  profileEmail?: string;
  cvUrl?: string | null;
  developerSkills: Array<{
    id: string;
    level: string;
    skill: {
      id: string;
      name: string;
    };
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string | null;
    description: string;
    location?: string;
    year?: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    description: string;
  }>;
  applications: Array<{
    id: string;
    company: string;
    position: string;
    status: string;
    appliedDate: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
}

type Skill = {
  id: string;
  level: string;
  yearsOfExperience: number;
  lastUsed: string;
  skill: {
    id: string;
    name: string;
  };
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

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

export default function DeveloperProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadSuccess, setShowUploadSuccess] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [tempProfile, setTempProfile] = useState<Profile | null>(null)
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set())
  const [newApplication, setNewApplication] = useState<{
    role: string
    status: 'pending'
    appliedAt: string
    coverLetter: string
  }>({
    role: '',
    status: 'pending',
    appliedAt: new Date().toISOString(),
    coverLetter: ''
  })
  const [newSkill, setNewSkill] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [extractedText, setExtractedText] = useState<string>('')
  const [isSkillInputVisible, setIsSkillInputVisible] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/developer/me');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setTempProfile(data);
        setHasUnsavedChanges(false);
        setModifiedFields(new Set());
      } catch (error) {
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
  }, []);

  // Handle page refresh warning
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
    if (!tempProfile) return;

    setTempProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [id]: value
      };
    });

    setModifiedFields(prev => new Set(prev).add(id));
    setHasUnsavedChanges(true);
  };

  const handleAddSkill = async (skillName: string) => {
    if (!tempProfile) return;
    
    setTempProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        developerSkills: [...prev.developerSkills, {
          id: `temp_${Date.now()}`,
          level: 'BEGINNER',
          skill: {
            id: `temp_${Date.now()}`,
            name: skillName
          }
        }],
      };
    });
    
    setHasUnsavedChanges(true);
    setModifiedFields(prev => new Set(prev).add('skills'));
    
    toast({
      title: 'Success',
      description: `Added skill: ${skillName}`,
    });
  };

  const handleAddApplication = (application: Omit<Profile['applications'][0], 'id'>) => {
    if (!profile) return;
    
    setProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        applications: [...prev.applications, { ...application, id: uuidv4() }],
      };
    });
  };

  const handleRemoveApplication = (id: string) => {
    if (!profile) return;
    
    setProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        applications: prev.applications.filter(app => app.id !== id),
      };
    });
  };

  const handleAddExperience = (experience: Omit<Profile['experience'][0], 'id'>) => {
    if (!profile) return;
    
    setProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        experience: [...prev.experience, { ...experience, id: uuidv4() }],
      };
    });
  };

  const handleRemoveExperience = (id: string) => {
    if (!profile) return;
    
    setProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        experience: prev.experience.filter(exp => exp.id !== id),
      };
    });
  };

  const handleSaveProfile = async () => {
    if (!tempProfile) return;

    try {
      setIsSaving(true);

      // First save the profile
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

      // Then save any new skills
      const newSkills = tempProfile.developerSkills.filter(skill => skill.id.startsWith('temp_'));
      
      for (const skill of newSkills) {
        const skillResponse = await fetch('/api/developer/me/skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: skill.skill.name,
            level: skill.level
          }),
        });

        if (!skillResponse.ok) {
          throw new Error('Failed to save skills');
        }
      }

      // Fetch the complete updated profile with all relations
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

    // Validate file type
    if (!file.type.includes('pdf')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (5MB max)
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
        // Don't set Content-Type header - let the browser set it with the boundary
        headers: {
          // Remove any Content-Type header to let the browser set it automatically
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload CV')
      }

      const { data } = await response.json()
      setExtractedText(data.text)
      setIsPreviewOpen(true)
      setUploadState('idle')
    } catch (error) {
      setUploadState('error')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload CV',
        variant: 'destructive',
      })
    }
  }

  const handlePreviewConfirm = async () => {
    setIsPreviewOpen(false)
    setUploadState('analyzing')
    setUploadProgress(0)

    try {
      const response = await fetch('/api/developer/me/cv/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: extractedText }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze CV')
      }

      const { data } = await response.json()
      setTempProfile(prev => ({
        ...prev!,
        ...data,
      }))
      setHasUnsavedChanges(true);

      setUploadState('success')
      setUploadProgress(100)

      toast({
        title: 'Success',
        description: 'CV analyzed successfully. Remember to save your changes.',
      })

      // Reset state after showing success animation
      setTimeout(() => {
        setUploadState('idle')
        setUploadProgress(0)
      }, 2000)
    } catch (error) {
      console.error('Analysis error:', error)
      setUploadState('error')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze CV',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveSkill = async (skillId: string) => {
    if (!tempProfile) return;
    
    try {
      // Remove skill from temporary state
      setTempProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          developerSkills: prev.developerSkills.filter(s => s.id !== skillId)
        };
      });
      
      // Only make API call if it's not a temporary skill
      if (!skillId.startsWith('temp_')) {
        const response = await fetch(`/api/developer/me/skills/${skillId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove skill');
        }
      }
      
      setHasUnsavedChanges(true);
      setModifiedFields(prev => new Set(prev).add('skills'));
      
      toast({
        title: 'Success',
        description: 'Skill removed successfully',
      });
    } catch (error) {
      console.error('Error removing skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove skill',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.includes('image')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    // Handle avatar change
    // This is a placeholder implementation. You might want to implement the actual logic to update the avatar
    toast({
      title: "Profile picture updated",
      description: "Your profile picture has been updated successfully",
    })
  }

  const handleDeleteAchievement = (id: string) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement.id !== id)
    }));
  }

  const formatEducationDate = (dateString: string | null): string => {
    if (!dateString) return 'Present';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatEducationLocation = (education: Profile['education'][0]): string => {
    return education.location || 'Location not specified';
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
      <Toaster position="top-right" />
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
              <Card className="border-0 shadow-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <CardHeader className="pb-3">
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => document.getElementById("profile-upload")?.click()}
                  >
                    <Avatar className="h-20 w-20 md:h-24 md:w-24 mb-4 border-2 border-transparent group-hover:border-primary transition-colors">
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
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          toast({
                            title: "Profile picture updated",
                            description: "Your profile picture has been updated successfully",
                          })
                        }
                      }}
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold">{profile?.name}</h3>
                  <p className="text-muted-foreground text-sm md:text-base">{profile?.title}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs md:text-sm">
                    <Badge variant="outline">{profile?.location}</Badge>
                  </div>
                  <div className="w-full mt-4 md:mt-6">
                    <div className="flex justify-between text-xs md:text-sm mb-1">
                      <span>Profile Completeness</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full gap-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-0 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30">
                    <User className="h-4 w-4" />
                    View Public Profile
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-0 shadow-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <CardHeader className="pb-3">
                  <CardTitle>Upload CV</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Upload your CV to automatically update your profile with your skills and experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">CV</h3>
                      <label className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleCVUpload}
                          className="hidden"
                          disabled={uploadState === 'uploading' || uploadState === 'analyzing'}
                        />
                        <span 
                          className={cn(
                            "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200",
                            uploadState === 'uploading' || uploadState === 'analyzing' 
                              ? "bg-indigo-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          )}
                        >
                          {uploadState === 'uploading' && (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          )}
                          {uploadState === 'analyzing' && (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          )}
                          {uploadState === 'idle' && 'Upload CV'}
                          {uploadState === 'success' && (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2 animate-bounce" />
                              Success!
                            </>
                          )}
                          {uploadState === 'error' && 'Try Again'}
                        </span>
                      </label>
                    </div>
                    
                    {(uploadState === 'uploading' || uploadState === 'analyzing' || uploadState === 'success') && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {uploadState === 'uploading' && 'Uploading CV...'}
                            {uploadState === 'analyzing' && 'Analyzing CV...'}
                            {uploadState === 'success' && 'CV Processed Successfully!'}
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300 ease-out",
                              uploadState === 'success' 
                                ? "bg-green-500" 
                                : "bg-gradient-to-r from-blue-600 to-purple-600",
                              uploadState === 'success' && "animate-pulse"
                            )}
                            style={{ 
                              width: `${uploadProgress}%`,
                              transition: 'width 0.5s ease-out'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {uploadState === 'success' && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md animate-fade-in">
                        <CheckCircle className="h-5 w-5" />
                        <div>
                          <p className="font-medium">CV analyzed successfully!</p>
                          <p className="text-sm">Your profile has been updated with the extracted information.</p>
                        </div>
                      </div>
                    )}
                    
                    {profile?.cvUrl && (
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <a
                          href={profile.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          View CV
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX. Max size: 5MB
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
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
                  <Card className="border-0 shadow-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm">Full Name</Label>
                          <Input
                            id="name"
                            value={tempProfile?.name || ''}
                            onChange={(e) => handleInputChange(e)}
                            className={cn(
                              "text-sm md:text-base bg-white dark:bg-gray-800 border-0",
                              modifiedFields.has('name') && "ring-2 ring-blue-500/50"
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm">Professional Title</Label>
                          <Input
                            id="title"
                            value={tempProfile?.title || ''}
                            onChange={(e) => handleInputChange(e)}
                            className={cn(
                              "text-sm md:text-base bg-white dark:bg-gray-800 border-0",
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
                            value={tempProfile?.profileEmail || ''}
                            onChange={(e) => handleInputChange(e)}
                            className={cn(
                              "text-sm md:text-base bg-white dark:bg-gray-800 border-0",
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
                            value={tempProfile?.phone || ''}
                            onChange={(e) => handleInputChange(e)}
                            className={cn(
                              "text-sm md:text-base bg-white dark:bg-gray-800 border-0",
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
                            value={tempProfile?.location || ''}
                            onChange={(e) => handleInputChange(e)}
                            className={cn(
                              "text-sm md:text-base bg-white dark:bg-gray-800 border-0",
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
                          value={tempProfile?.about || ''}
                          onChange={(e) => handleInputChange(e)}
                          className={cn(
                            "text-sm md:text-base bg-white dark:bg-gray-800 border-0",
                            modifiedFields.has('about') && "ring-2 ring-blue-500/50"
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg md:text-xl">Skills</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsSkillInputVisible(true)}
                        className="gap-1 text-xs md:text-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-0 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30"
                      >
                        <Plus className="h-3 w-3 md:h-4 md:w-4" />
                        Add Skill
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {tempProfile?.developerSkills?.map((developerSkill) => (
                            <Badge
                              key={developerSkill.id}
                              variant="secondary"
                              className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/30 dark:to-purple-800/30 border-0"
                            >
                              {developerSkill.skill.name}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                onClick={() => handleRemoveSkill(developerSkill.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <SkillsInput 
                          onAddSkill={(skill) => {
                            handleAddSkill(skill);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="experience" className="space-y-6 mt-6">
                  <Card className="border-0 shadow-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Work Experience</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-0 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30">
                        <Plus className="h-4 w-4" />
                        Add Experience
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {profile?.experience.map((exp) => (
                        <div key={exp.id} className="border rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">{exp.position}</h3>
                              <p className="text-sm text-muted-foreground">
                                {exp.company}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(new Date(exp.startDate))} -
                                {exp.endDate === "Present"
                                  ? " Present"
                                  : ` ${formatDate(new Date(exp.endDate))}`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm">{exp.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education" className="space-y-6 mt-6">
                  <Card className="border-0 shadow-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Education</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-0 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30">
                        <Plus className="h-4 w-4" />
                        Add Education
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {profile?.education?.map((edu) => (
                        <div key={edu.id} className="border rounded-lg p-4 space-y-2 bg-white dark:bg-gray-800">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-semibold">{edu.degree}</h4>
                              <p className="text-sm text-muted-foreground">{edu.school}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{edu.year}</p>
                              <p className="text-sm text-muted-foreground">{edu.location}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  <Card className="border-0 shadow-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <CardHeader>
                      <CardTitle>Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(profile.achievements || []).map((achievement) => (
                          <Card key={achievement.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{achievement.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(achievement.date).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteAchievement(achievement.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="mt-2 text-sm">{achievement.description}</p>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Extracted Text</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePreviewConfirm} disabled={uploadState === 'analyzing'}>
              {uploadState === 'analyzing' ? 'Analyzing...' : 'Continue to Analysis'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


