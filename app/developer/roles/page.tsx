"use client"

import React, { useEffect, useState } from "react"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter  } from '@/components/ui-daisy/card'
import {  Input  } from '@/components/ui-daisy/input'
import {  Badge  } from '@/components/ui-daisy/badge'
import { Label } from "@/components/ui/label"
import { Search, MapPin, Briefcase, Clock, Building, ArrowRight, Code, Bookmark, BookmarkCheck, Plus, PenTool } from "lucide-react"
import {  Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui-daisy/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from 'next-auth/react'
import { Role } from "@/types/role"
import { formatJobType } from "@/utils/mappers"

interface SavedRole {
  roleId: string
  savedAt: Date
  role?: Role
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
  const [selectedJobType, setSelectedJobType] = useState<string>("all")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState(0)

  const locations = Array.from(new Set(roles.map((role) => role?.location).filter(Boolean)))
  const jobTypes = Array.from(new Set(roles.map((role) => role?.type).filter(Boolean)))
  const allSkills = Array.from(new Set(roles.flatMap((role) => [
    ...(role?.requirements || []),
    ...(role?.skills?.map(s => s?.name) || [])
  ]).filter(Boolean))) as string[]

  useEffect(() => {
    console.log("[RolesPage] useEffect triggered")
    console.log("[RolesPage] Session status:", status)

    if (status === 'unauthenticated') {
      console.log("[RolesPage] User not authenticated, redirecting to signin")
      router.push('/auth/signin?callbackUrl=/developer/roles')
      return
    }

    const fetchRoles = async () => {
      console.log("[RolesPage] Starting to fetch roles")
      setLoading(true)
      try {
        console.log("[RolesPage] Fetching from /api/roles")
        const response = await fetch('/api/roles')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch roles: ${response.status}`)
        }

        const data = await response.json()
        console.log("[RolesPage] Fetched roles data:", data)
        
        if (!Array.isArray(data)) {
          console.error("[RolesPage] Received non-array data:", data)
          throw new Error("Invalid roles data format")
        }

        const validRoles = data.filter(role => {
          const isValid = role && typeof role === 'object' && role.id
          if (!isValid) {
            console.warn("[RolesPage] Invalid role found:", role)
          }
          return isValid
        })

        console.log("[RolesPage] Setting valid roles:", validRoles)
        setRoles(validRoles)
      } catch (error: any) {
        console.error('[RolesPage] Error fetching roles:', error)
        toast({
          title: 'Error Loading Roles',
          description: error.message || 'Failed to load roles data.',
          variant: 'destructive',
        })
      } finally {
        console.log("[RolesPage] Finished fetching roles")
        setLoading(false)
      }
    }

    const fetchSavedRoles = async () => {
      console.log("[RolesPage] Starting to fetch saved roles")
      setSavedRolesLoading(true)
      try {
        setSavedRolesError(null)
        console.log("[RolesPage] Fetching from /api/developers/me/saved-roles")
        const response = await fetch('/api/developers/me/saved-roles')
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log("[RolesPage] Saved roles endpoint not found or no saved roles")
            setSavedRoles([])
          } else {
            throw new Error(`Failed to fetch saved roles: ${response.status}`)
          }
        } else {
          const data = await response.json()
          console.log("[RolesPage] Fetched saved roles data:", data)
          
          let savedRolesData: SavedRole[]
          if (data.length > 0 && typeof data[0] === 'object' && data[0].roleId) {
            savedRolesData = data.map((item: any) => ({
              ...item,
              savedAt: new Date(item.savedAt)
            }))
          } else if (data.length > 0 && typeof data[0] === 'string') {
            savedRolesData = data.map((roleId: string) => ({
              roleId,
              savedAt: new Date()
            }))
          } else {
            savedRolesData = []
          }
          
          console.log("[RolesPage] Setting saved roles:", savedRolesData)
          setSavedRoles(savedRolesData)
        }
      } catch (error: any) {
        console.error('[RolesPage] Error fetching saved roles:', error)
        setSavedRolesError(error.message || 'Failed to load saved roles')
      } finally {
        console.log("[RolesPage] Finished fetching saved roles")
        setSavedRolesLoading(false)
      }
    }

    if (status === 'authenticated') {
      console.log("[RolesPage] User authenticated, fetching roles and saved roles")
      fetchRoles()
      fetchSavedRoles()
    }
  }, [status, router, toast])

  const filteredRoles = roles.filter((role) => {
    if (!role) {
      console.warn("[RolesPage] Found undefined role in filter")
      return false
    }

    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      role.title?.toLowerCase().includes(searchTermLower) ||
      role.company?.name?.toLowerCase().includes(searchTermLower) ||
      role.location?.toLowerCase().includes(searchTermLower) ||
      role.requirements?.some((req) => req?.toLowerCase().includes(searchTermLower)) ||
      role.skills?.some((skill) => skill?.name?.toLowerCase().includes(searchTermLower))

    const matchesLocation = selectedLocation === "all" || role.location === selectedLocation
    const matchesJobType = selectedJobType === "all" || String(role.type) === selectedJobType

    const roleSkillNames = role.skills?.map(s => s?.name).filter(Boolean) as string[] || []
    const combinedSkills = [...(role.requirements || []), ...roleSkillNames]
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.every((skill) => combinedSkills.some(rs => rs?.toLowerCase() === skill?.toLowerCase()))

    return matchesSearch && matchesLocation && matchesJobType && matchesSkills
  })

  React.useEffect(() => {
    let count = 0
    if (searchTerm) count++
    if (selectedLocation !== "all") count++
    if (selectedJobType !== "all") count++
    if (selectedSkills.length > 0) count++
    setActiveFilters(count)
  }, [searchTerm, selectedLocation, selectedJobType, selectedSkills])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedLocation("all")
    setSelectedJobType("all")
    setSelectedSkills([])
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const handleSaveToggleRole = async (roleId: string) => {
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/developer/roles')
      return
    }

    const isSaved = savedRoles.some(role => role.roleId === roleId)
    const optimisticSavedRoles = isSaved
      ? savedRoles.filter(role => role.roleId !== roleId)
      : [...savedRoles, { roleId, savedAt: new Date() }]

    setSavedRoles(optimisticSavedRoles)

    try {
      const response = await fetch(`/api/developers/me/saved-roles`, {
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
      <div className="flex items-center justify-center min-h-screen" data-testid="role-search-loading-container">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-testid="role-search-loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="role-search-page-container">
      <div className="flex flex-col lg:flex-row gap-8" data-testid="role-search-content">
        {/* Filters Section */}
        <div className="w-full lg:w-1/4 space-y-6 animate-fade-in-up" data-testid="role-search-filters-sidebar">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg shadow p-6 sticky top-8" data-testid="role-search-container-filters">
            <div className="flex justify-between items-center mb-4" data-testid="role-search-filters-header">
              <h2 className="text-lg font-semibold" data-testid="role-search-filters-title">Filters</h2>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-primary hover:bg-primary/10 h-auto p-1"
                  data-testid="role-search-button-clear-filters-trigger"
                >
                  Clear ({activeFilters})
                </Button>
              )}
            </div>
            <div className="space-y-4" data-testid="role-search-filters-content">
              {/* Search Input */}
              <div className="relative" data-testid="role-search-search-field">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" data-testid="role-search-search-icon" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50"
                  data-testid="role-search-input-keyword"
                />
              </div>

              {/* Location Filter */}
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }} data-testid="role-search-location-filter">
                <Label data-testid="role-search-location-label">Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation} data-testid="role-search-select-location">
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50" data-testid="role-search-location-trigger">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent data-testid="role-search-location-options">
                    <SelectItem value="all" data-testid="role-search-location-option-all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location} data-testid={`role-search-location-option-${location.toLowerCase().replace(/\s+/g, '-')}`}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Job Type Filter */}
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }} data-testid="role-search-jobtype-filter">
                <Label data-testid="role-search-jobtype-label">Job Type</Label>
                <Select value={selectedJobType} onValueChange={setSelectedJobType} data-testid="role-search-select-jobtype">
                  <SelectTrigger className="bg-white/50 dark:bg-gray-800/50" data-testid="role-search-jobtype-trigger">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent data-testid="role-search-jobtype-options">
                    <SelectItem value="all" data-testid="role-search-jobtype-option-all">All Types</SelectItem>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type} data-testid={`role-search-jobtype-option-${String(type).toLowerCase().replace(/\s+/g, '-')}`}>
                        {formatJobType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Filter */}
              <Accordion type="single" collapsible className="w-full animate-fade-in-up" style={{ animationDelay: '300ms' }} data-testid="role-search-skills-filter">
                <AccordionItem value="skills" data-testid="role-search-skills-accordion-item">
                  <AccordionTrigger className="text-sm font-medium" data-testid="role-search-skills-accordion-trigger">Skills ({selectedSkills.length})</AccordionTrigger>
                  <AccordionContent data-testid="role-search-skills-accordion-content">
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2" data-testid="role-search-skills-container">
                      {allSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer bg-white/50 dark:bg-gray-800/50 hover:bg-primary/10 dark:hover:bg-primary/30"
                          onClick={() => toggleSkill(skill)}
                          data-testid={`role-search-skill-badge-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Add Custom Role Button */}
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 hover:bg-primary/10 animate-fade-in-up mt-4"
                style={{ animationDelay: '600ms' }}
                onClick={() => router.push('/developer/roles/new')}
                data-testid="role-search-button-add-custom-trigger"
              >
                <Plus className="h-4 w-4" data-testid="role-search-icon-add-custom" />
                Add Custom Role
              </Button>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="w-full lg:w-3/4" data-testid="role-search-results-section">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="role-search-container-results">
            {/* Add Custom Role Card */}
            <Card 
              className="hover:shadow-lg transition-shadow border-dashed border-2 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 animate-fade-in-up" 
              style={{ animationDelay: '100ms' }}
              onClick={() => router.push('/developer/roles/new')}
              data-testid="role-search-card-add-custom"
            >
              <CardHeader data-testid="role-search-add-custom-header">
                <div className="flex flex-col items-center justify-center h-full py-8" data-testid="role-search-add-custom-content">
                  <Plus className="h-12 w-12 text-muted-foreground mb-2" data-testid="role-search-add-custom-icon" />
                  <CardTitle className="text-lg text-center" data-testid="role-search-add-custom-title">Add Custom Role</CardTitle>
                  <CardDescription className="text-center mt-2" data-testid="role-search-add-custom-description">Create your own role</CardDescription>
                </div>
              </CardHeader>
            </Card>

            {filteredRoles.map((role, index) => (
              <Card 
                key={role.id} 
                className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up flex flex-col h-full"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
                data-testid={`role-search-card-role-item-${role.id}`}
              >
                <CardHeader className="pb-4" data-testid={`role-search-card-header-${role.id}`}>
                  <div className="flex justify-between items-start" data-testid={`role-search-card-title-section-${role.id}`}>
                    <div className="space-y-1" data-testid={`role-search-card-title-content-${role.id}`}>
                      <CardTitle className="text-xl line-clamp-2" data-testid={`role-search-card-title-${role.id}`}>{role.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1" data-testid={`role-search-card-company-${role.id}`}>
                        <Building className="h-4 w-4" data-testid={`role-search-icon-building-${role.id}`} />
                        <span className="line-clamp-1">{role.company.name} (ID: {role.id})</span>
                      </CardDescription>
                    </div>
                    {session && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveToggleRole(role.id)}
                        className="text-muted-foreground hover:text-primary shrink-0 ml-1"
                        title={savedRoles.some(r => r.roleId === role.id) ? "Unsave Role" : "Save Role"}
                        data-testid={`role-search-button-save-trigger-${role.id}`}
                      >
                        {savedRoles.some(r => r.roleId === role.id) ? (
                          <BookmarkCheck className="h-5 w-5" data-testid={`role-search-icon-saved-${role.id}`} />
                        ) : (
                          <Bookmark className="h-5 w-5" data-testid={`role-search-icon-save-${role.id}`} />
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4" data-testid={`role-search-card-content-${role.id}`}>
                  <div className="flex flex-wrap gap-2" data-testid={`role-search-card-badges-${role.id}`}>
                    <Badge variant="secondary" data-testid={`role-search-badge-location-${role.id}`}>
                      <MapPin className="mr-1 h-3 w-3" />
                      <span className="line-clamp-1">{role.location}</span>
                    </Badge>
                    <Badge variant="secondary" data-testid={`role-search-badge-jobtype-${role.id}`}>
                      <Briefcase className="mr-1 h-3 w-3" />
                      {formatJobType(role.type)}
                    </Badge>
                    {role.remote && (
                      <Badge variant="secondary" data-testid={`role-search-badge-remote-${role.id}`}>
                        <Clock className="mr-1 h-3 w-3" />
                        Remote
                      </Badge>
                    )}
                    {role.visaSponsorship && (
                      <Badge variant="secondary" data-testid={`role-search-badge-visa-${role.id}`}>
                        <Code className="mr-1 h-3 w-3" />
                        Visa Sponsorship
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-3" data-testid={`role-search-card-description-${role.id}`}>{role.description}</p>
                  <div className="space-y-2" data-testid={`role-search-card-skills-section-${role.id}`}>
                    <h4 className="font-medium text-sm" data-testid={`role-search-card-skills-title-${role.id}`}>Required Skills:</h4>
                    <div className="flex flex-wrap gap-2" data-testid={`role-search-card-skills-container-${role.id}`}>
                      {role.skills.map((skill) => (
                        <Badge key={skill.id} variant="outline" className="text-xs" data-testid={`role-search-badge-skill-${skill.name.toLowerCase().replace(/\s+/g, '-')}-${role.id}`}>
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="card-body pt-2 mt-auto" data-testid={`role-search-card-footer-${role.id}`}>
                  <div className="flex justify-between items-center w-full" data-testid={`role-search-card-actions-${role.id}`}>
                    <div className="text-md font-semibold" data-testid={`role-search-card-salary-${role.id}`}>{role.salary}</div>
                    <div className="flex gap-2" data-testid={`role-search-card-buttons-${role.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/developer/writing-help?roleId=${role.id}`)}
                        className="gap-1"
                        data-testid={`role-search-button-write-trigger-${role.id}`}
                      >
                        <PenTool className="h-4 w-4" data-testid={`role-search-icon-write-${role.id}`} /> Write to
                      </Button>
                      <Button size="sm" onClick={() => handleApply(role.id)} data-testid={`role-search-button-apply-trigger-${role.id}`}>
                        Apply Now <ArrowRight className="h-4 w-4" data-testid={`role-search-icon-apply-${role.id}`} />
                      </Button>
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

