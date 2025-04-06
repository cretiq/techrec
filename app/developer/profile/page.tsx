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
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { SkillsInput } from '@/components/skills-input'

interface Profile {
  name: string
  title: string
  email: string
  profileEmail: string
  location?: string
  about?: string
  phone?: string
  skills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }>
  experience: Array<{
    title: string
    company: string
    description: string
    location?: string
    startDate?: string
    endDate?: string
    current?: boolean
  }>
  education?: Array<{
    degree: string
    institution: string
    location: string
    year: string
  }>
  achievements?: string[]
  applications: Array<{
    role: string
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
    appliedAt: string
    coverLetter?: string
  }>
  cvUrl?: string
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
  const [newApplication, setNewApplication] = useState({
    role: "",
    status: "pending" as const,
    appliedAt: new Date().toISOString(),
    coverLetter: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/developers/me/profile')
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.email) {
      fetchProfile()
    }
  }, [session, toast])

  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      setIsSaving(true)
      const response = await fetch('/api/developers/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

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

      // Start upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch('/api/developer/cv', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Failed to upload CV')
      }

      setUploadProgress(100)
      setUploadState('success')
      
      const data = await response.json()
      
      // Update profile with new data
      setProfile(prev => ({
        ...prev!,
        ...data.data,
      }))

      toast({
        title: 'Success',
        description: 'CV uploaded and analyzed successfully',
      })

      // Reset state after showing success animation
      setTimeout(() => {
        setUploadState('idle')
        setUploadProgress(0)
      }, 2000)
    } catch (error) {
      console.error('Error uploading CV:', error)
      setUploadState('error')
      toast({
        title: 'Error',
        description: 'Failed to upload CV',
        variant: 'destructive',
      })
    }
  }

  const handleAddApplication = () => {
    if (!profile) return

    setProfile((prev) => {
      if (!prev) return null
      return {
        ...prev,
        applications: [...prev.applications, newApplication],
      }
    })
    setNewApplication({
      role: "",
      status: "pending" as const,
      appliedAt: new Date().toISOString(),
      coverLetter: "",
    })
  }

  const handleDeleteApplication = (index: number) => {
    if (!profile) return

    setProfile((prev) => {
      if (!prev) return null
      return {
        ...prev,
        applications: prev.applications.filter((_, i) => i !== index),
      }
    })
  }

  const handleInputChange = (field: keyof Profile, value: string) => {
    if (!profile) return
    setProfile((prev) => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })
  }

  const handleExperienceChange = (index: number, field: keyof Profile['experience'][0], value: string | boolean) => {
    if (!profile) return
    setProfile((prev) => {
      if (!prev) return null
      const newExperience = [...prev.experience]
      newExperience[index] = { ...newExperience[index], [field]: value }
      return { ...prev, experience: newExperience }
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }

  const handleNewApplicationChange = (field: keyof typeof newApplication, value: string) => {
    setNewApplication((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddSkill = async (skill: string) => {
    try {
      const response = await fetch('/api/developer/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: skill,
          level: 'intermediate', // Default level, can be changed later
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add skill')
      }

      const updatedSkills = await response.json()
      setProfile(prev => prev ? { ...prev, skills: updatedSkills } : null)
      toast({
        title: "Success",
        description: "Skill added successfully",
      })
    } catch (error) {
      console.error('Error adding skill:', error)
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      })
    }
  }

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
    <div className="flex min-h-screen flex-col">
      <div className="w-full flex justify-center">
        <main className="container max-w-6xl py-6 md:py-10 px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Developer Profile</h1>
              <p className="text-muted-foreground text-sm md:text-base">Manage your profile and CV to match with the best opportunities</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full md:w-auto gap-1">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Profile Overview</CardTitle>
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
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
                  <Button variant="outline" className="w-full gap-1">
                    <User className="h-4 w-4" />
                    View Public Profile
                  </Button>
                </CardFooter>
              </Card>

              <Card>
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
                              : "bg-indigo-600 hover:bg-indigo-700"
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
                                : "bg-indigo-600",
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
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                  <TabsTrigger value="profile" className="text-xs md:text-sm">
                    <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs md:text-sm">
                    <Briefcase className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Experience
                  </TabsTrigger>
                  <TabsTrigger value="education" className="text-xs md:text-sm">
                    <GraduationCap className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Education
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="text-xs md:text-sm">
                    <Award className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Achievements
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="text-xs md:text-sm">
                    <Building className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Applications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 mt-6">
                  <Card>
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
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="text-sm md:text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm">Professional Title</Label>
                          <Input
                            id="title"
                            value={profile?.title || ''}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="text-sm md:text-base"
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
                            onChange={(e) => handleInputChange('profileEmail', e.target.value)}
                            className="text-sm md:text-base"
                            placeholder="Email shown on your CV"
                          />
                          <p className="text-xs text-muted-foreground">This email will be visible on your CV</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm">Phone</Label>
                          <Input
                            id="phone"
                            value={profile?.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="text-sm md:text-base"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-sm">Location</Label>
                          <Input
                            id="location"
                            value={profile?.location || ''}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="text-sm md:text-base"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about" className="text-sm">About</Label>
                        <Textarea
                          id="about"
                          rows={5}
                          value={profile?.about || ''}
                          onChange={(e) => handleInputChange('about', e.target.value)}
                          className="text-sm md:text-base"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg md:text-xl">Skills</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1 text-xs md:text-sm">
                        <Plus className="h-3 w-3 md:h-4 md:w-4" />
                        Add Skill
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile?.skills.map((skill, index) => (
                          <div key={index} className="group relative">
                            <SkillBadge skill={skill.name} level={skill.level} className="text-xs md:text-sm" />
                            <button className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-2 w-2 md:h-3 md:w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <SkillsInput onAddSkill={handleAddSkill} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="experience" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Work Experience</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Add Experience
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {profile?.experience.map((exp, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">{exp.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {exp.company} • {exp.location}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(exp.startDate)} -
                                {exp.endDate === "Present"
                                  ? " Present"
                                  : ` ${formatDate(exp.endDate)}`}
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
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Education</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Add Education
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {profile?.education?.map((edu, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-semibold">{edu.degree}</h4>
                              <p className="text-sm text-muted-foreground">{edu.institution}</p>
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

                <TabsContent value="achievements" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Achievements</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Add Achievement
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile?.achievements?.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 border rounded-md group">
                          <Award className="h-5 w-5 text-primary mt-0.5" />
                          <p className="text-sm">{achievement}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="applications" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Job Applications</CardTitle>
                      <div className="text-sm text-muted-foreground">Track jobs you've applied for</div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="border rounded-lg p-4 space-y-4">
                        <h3 className="font-medium">Add New Application</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="company">Company Name*</Label>
                            <Input
                              id="company"
                              placeholder="Company name"
                              value={newApplication.role}
                              onChange={(e) => handleNewApplicationChange('role', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="position">Position*</Label>
                            <Input
                              id="position"
                              placeholder="Position"
                              value={newApplication.role}
                              onChange={(e) => handleNewApplicationChange('role', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              placeholder="Location"
                              value={newApplication.role}
                              onChange={(e) => handleNewApplicationChange('role', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="appliedDate">Date Applied</Label>
                            <Input
                              id="appliedDate"
                              type="date"
                              value={newApplication.appliedAt.split('T')[0]}
                              onChange={(e) => handleNewApplicationChange('appliedAt', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={newApplication.status}
                              onChange={(e) => handleNewApplicationChange('status', e.target.value as typeof newApplication.status)}
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="url">Job URL</Label>
                            <Input
                              id="url"
                              type="url"
                              value={newApplication.coverLetter}
                              onChange={(e) => handleNewApplicationChange('coverLetter', e.target.value)}
                              placeholder="Cover letter URL"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            rows={3}
                            value={newApplication.coverLetter}
                            onChange={(e) => handleNewApplicationChange('coverLetter', e.target.value)}
                            placeholder="Add any notes about the application, interviews, or follow-ups"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleAddApplication} className="gap-1">
                            <Plus className="h-4 w-4" />
                            Add Application
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Your Applications ({profile?.applications?.length || 0})</h3>
                        {(!profile?.applications || profile.applications.length === 0) ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Building className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>No job applications added yet</p>
                            <p className="text-sm">Track your job search by adding applications above</p>
                          </div>
                        ) : (
                          profile.applications.map((app, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{app.role}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={app.status === 'accepted' ? 'default' : 'secondary'}>
                                    {app.status}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleDeleteApplication(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {app.coverLetter && (
                                <div className="text-sm mt-2 bg-muted/50 p-2 rounded-md">
                                  <a
                                    href={app.coverLetter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    View Cover Letter
                                  </a>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


