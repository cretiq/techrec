"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Briefcase, Clock, Building, ArrowRight, X, Code, BarChart, Bookmark, BookmarkCheck, Send, Plus, PenTool } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from 'next-auth/react'
import { formatJobType } from "@/app/utils/format"

interface Role {
  id: string
  title: string
  description: string
  requirements: string[]
  skills: {
    id: string
    name: string
    description: string
  }[]
  company: {
    id: string
    name: string
  }
  location: string
  salary: string
  type: string
  remote: boolean
  visaSponsorship: boolean
}

interface SavedRole {
  roleId: string
  savedAt: Date
}

export default function RolesPage() {
  const { data: session, status } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
  const [savedRoles, setSavedRoles] = useState<SavedRole[]>([])
  const [loading, setLoading] = useState(true)
  const [savedRolesLoading, setSavedRolesLoading] = useState(false)
  const [savedRolesError, setSavedRolesError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedJobType, setSelectedJobType] = useState("all")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [minMatchPercentage, setMinMatchPercentage] = useState(0)
  const [activeFilters, setActiveFilters] = useState(0)

  // Extract unique locations, job types, and skills for filters
  const locations = Array.from(new Set(roles.map((role) => role.location)))
  const jobTypes = Array.from(new Set(roles.map((role) => role.type)))
  const allSkills = Array.from(new Set(roles.flatMap((role) => role.requirements)))

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/roles')
        const data = await response.json()
        setRoles(data)
      } catch (error) {
        console.error('Error fetching roles:', error)
        toast({
          title: 'Error',
          description: 'Failed to load roles',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchSavedRoles = async () => {
      try {
        setSavedRolesLoading(true)
        setSavedRolesError(null)
        const response = await fetch('/api/developers/me/saved-roles')
        if (!response.ok) {
          throw new Error('Failed to fetch saved roles')
        }
        const data = await response.json()
        // Convert the array of role IDs to SavedRole objects
        const savedRolesData = data.map((roleId: string) => ({
          roleId,
          savedAt: new Date()
        }))
        setSavedRoles(savedRolesData)
      } catch (error) {
        console.error('Error fetching saved roles:', error)
        setSavedRolesError('Failed to load saved roles')
        toast({
          title: 'Error',
          description: 'Failed to load saved roles',
          variant: 'destructive',
        })
      } finally {
        setSavedRolesLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchRoles()
      fetchSavedRoles()
    }
  }, [status, router, toast])

  // Filter roles based on search and filters
  const filteredRoles = roles.filter((role) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.requirements.some((req) => req.toLowerCase().includes(searchTerm.toLowerCase()))

    // Location filter
    const matchesLocation = selectedLocation === "all" || role.location.includes(selectedLocation)

    // Job type filter
    const matchesJobType = selectedJobType === "all" || role.type === selectedJobType

    // Skills filter
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.every((skill) => role.requirements.includes(skill))

    // Match percentage filter
    const matchesPercentage = role.requirements.length >= minMatchPercentage

    return matchesSearch && matchesLocation && matchesJobType && matchesSkills && matchesPercentage
  })

  // Update active filters count
  React.useEffect(() => {
    let count = 0
    if (selectedLocation !== "all") count++
    if (selectedJobType !== "all") count++
    if (selectedSkills.length > 0) count++
    if (minMatchPercentage > 0) count++
    setActiveFilters(count)
  }, [selectedLocation, selectedJobType, selectedSkills, minMatchPercentage])

  // Clear all filters
  const clearFilters = () => {
    setSelectedLocation("all")
    setSelectedJobType("all")
    setSelectedSkills([])
    setMinMatchPercentage(0)
  }

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const handleSaveRole = async (roleId: string) => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    try {
      const isSaved = savedRoles.some(role => role.roleId === roleId)
      const response = await fetch(`/api/roles/${roleId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      })

      if (response.ok) {
        if (isSaved) {
          setSavedRoles(savedRoles.filter(role => role.roleId !== roleId))
          toast({
            title: 'Success',
            description: 'Role removed from saved roles',
          })
        } else {
          setSavedRoles([...savedRoles, { roleId, savedAt: new Date() }])
          toast({
            title: 'Success',
            description: 'Role saved successfully',
          })
        }
      }
    } catch (error) {
      console.error('Error saving role:', error)
      toast({
        title: 'Error',
        description: 'Failed to save role',
        variant: 'destructive',
      })
    }
  }

  const handleApply = (roleId: string) => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }
    router.push(`/developer/roles/${roleId}/apply`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-1/4 space-y-6 animate-fade-in-up">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50"
                />
              </div>

              {/* Location Filter */}
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <Label>Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Job Type Filter */}
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <Label>Job Type</Label>
                <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatJobType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Filter */}
              <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer bg-white/50 dark:bg-gray-800/50"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Match Percentage Slider */}
              <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <Label>Minimum Match Percentage</Label>
                <Slider
                  value={[minMatchPercentage]}
                  onValueChange={([value]) => setMinMatchPercentage(value)}
                  min={0}
                  max={100}
                  step={10}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {minMatchPercentage}% match
                </p>
              </div>

              {/* Clear Filters Button */}
              {activeFilters > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full hover:bg-primary/10 animate-fade-in-up"
                  style={{ animationDelay: '500ms' }}
                >
                  Clear Filters ({activeFilters})
                </Button>
              )}

              {/* Add Custom Role Button */}
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 hover:bg-primary/10 animate-fade-in-up"
                style={{ animationDelay: '600ms' }}
                onClick={() => router.push('/developer/roles/new')}
              >
                <Plus className="h-4 w-4" />
                Add Custom Role
              </Button>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Add Custom Role Card */}
            <Card 
              className="hover:shadow-lg transition-shadow border-dashed border-2 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 animate-fade-in-up" 
              style={{ animationDelay: '100ms' }}
              onClick={() => router.push('/developer/roles/new')}
            >
              <CardHeader>
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <Plus className="h-12 w-12 text-muted-foreground mb-2" />
                  <CardTitle className="text-lg text-center">Add Custom Role</CardTitle>
                  <CardDescription className="text-center mt-2">Create your own role</CardDescription>
                </div>
              </CardHeader>
            </Card>

            {filteredRoles.map((role, index) => (
              <Card 
                key={role.id} 
                className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up flex flex-col h-full"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl line-clamp-2">{role.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span className="line-clamp-1">{role.company.name} (ID: {role.id})</span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveRole(role.id)}
                      className="text-muted-foreground hover:text-primary shrink-0"
                    >
                      {savedRoles.some(r => r.roleId === role.id) ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <MapPin className="mr-1 h-3 w-3" />
                      <span className="line-clamp-1">{role.location}</span>
                    </Badge>
                    <Badge variant="secondary">
                      <Briefcase className="mr-1 h-3 w-3" />
                      {formatJobType(role.type)}
                    </Badge>
                    {role.remote && (
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Remote
                      </Badge>
                    )}
                    {role.visaSponsorship && (
                      <Badge variant="secondary">
                        <Code className="mr-1 h-3 w-3" />
                        Visa Sponsorship
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-3">{role.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {role.skills.map((skill) => (
                        <Badge key={skill.id} variant="outline" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 mt-auto">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="text-md font-semibold">{role.salary}</div>
                        <div className="flex gap-2">

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/developer/writing-help?roleId=${role.id}`)}
                            className="gap-1"
                          >
                            <PenTool className="h-4 w-4" /> Write to
                          </Button>

                          <Button size="sm" onClick={() => handleApply(role.id)}>
                            Apply Now <ArrowRight className="h-4 w-4" />
                          </Button>

                        </div>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
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

