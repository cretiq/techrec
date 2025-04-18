"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Briefcase, Clock, Building, ArrowRight, X, Code, BarChart, Bookmark, BookmarkCheck, Send, Plus, PenTool } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from 'next-auth/react'
import { Role } from "@/types/role"
import { formatJobType, mapRapidApiJobToRole } from "@/utils/mappers"
import { RapidApiResponse, RapidApiJob } from "@/types/rapidapi"

interface SavedRole {
  roleId: string
  savedAt: Date
  role?: Role
}

export default function RolesSearch2Page() {
  const { data: session, status } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
  const [savedRoles, setSavedRoles] = useState<SavedRole[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedJobType, setSelectedJobType] = useState<string>("all")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState(0)
  const [searchLimit, setSearchLimit] = useState([10]) // Default limit of 10 results

  useEffect(() => {
    console.log("[RolesSearch2Page] useEffect triggered")
    console.log("[RolesSearch2Page] Session status:", status)

    if (status === 'unauthenticated') {
      console.log("[RolesSearch2Page] User not authenticated, redirecting to signin")
      router.push('/auth/signin?callbackUrl=/developer/roles/search2')
      return
    }

    if (status === 'authenticated') {
      console.log("[RolesSearch2Page] User authenticated, fetching initial data")
      fetchSavedRoles()
      fetchRoles() // Trigger initial search
    }
  }, [status])

  const fetchRoles = async () => {
    console.log("[RolesSearch2Page] Starting to fetch roles from RapidAPI")
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        title: searchTerm || 'Software Engineer',
        location: selectedLocation === 'all' ? 'United States' : selectedLocation,
        limit: searchLimit[0].toString(),
      });
      
      const apiUrl = `/api/rapidapi/search?${queryParams.toString()}`;

      const response = await fetch(apiUrl)
    
        if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `Failed to fetch roles: ${response.status}`)
        }

        const data: RapidApiResponse = await response.json()
        console.log("[RolesSearch2Page] Fetched RapidAPI roles data:", data)

        console.log(data[0])


        // console.log("[RolesSearch2Page] Mapped roles:", mappedRoles)

        // console.log("[RolesSearch2Page] Setting valid mapped roles:", mappedRoles)
        // setRoles(mappedRoles)
    } catch (error: any) {
        console.error('[RolesSearch2Page] Error fetching roles:', error)
        toast({
        title: 'Error Loading Roles',
        description: error.message || 'Failed to load roles data.',
        variant: 'destructive',
        })
        setRoles([]) // Clear roles on error
    } finally {
        console.log("[RolesSearch2Page] Finished fetching roles")
        setLoading(false)
    }
    }

  const fetchSavedRoles = async () => {
    console.log("[RolesSearch2Page] Starting to fetch saved roles")
    try {
      console.log("[RolesSearch2Page] Fetching from /api/developers/me/saved-roles")
      const response = await fetch('/api/developers/me/saved-roles')
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log("[RolesSearch2Page] Saved roles endpoint not found or no saved roles")
          setSavedRoles([])
        } else {
          throw new Error(`Failed to fetch saved roles: ${response.status}`)
        }
      } else {
        const data = await response.json()
        console.log("[RolesSearch2Page] Fetched saved roles data:", data)
        
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
        
        console.log("[RolesSearch2Page] Setting saved roles:", savedRolesData)
        setSavedRoles(savedRolesData)
      }
    } catch (error: any) {
      console.error('[RolesSearch2Page] Error fetching saved roles:', error)
    } finally {
      console.log("[RolesSearch2Page] Finished fetching saved roles")
    }
  }

  const filteredRoles = roles.filter((role) => {
    if (!role) {
      console.warn("[RolesSearch2Page] Found undefined role in filter")
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

  if (status === 'loading') {
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
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg shadow p-6 sticky top-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters (RapidAPI)</h2>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-primary hover:bg-primary/10 h-auto p-1"
                >
                  Clear ({activeFilters})
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles (e.g., Engineer)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50"
                />
              </div>

              {/* Location Filter */}
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <Label>Location</Label>
                <Input
                  placeholder="Location (e.g., United States)"
                  value={selectedLocation === 'all' ? '' : selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value || 'all')}
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>

              {/* Results Limit Slider */}
              <div className="space-y-2">
                <Label>Results Limit: {searchLimit[0]}</Label>
                <Slider
                  value={searchLimit}
                  onValueChange={setSearchLimit}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Search Button */}
              <Button 
                className="w-full" 
                onClick={fetchRoles}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search Roles
              </Button>

              {/* Job Type Filter - May not be directly filterable via this API */}
              {/* <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>...</div> */}

              {/* Skills Filter - May not be directly filterable via this API */}
              {/* <Accordion type="single" collapsible ...>...</Accordion> */}

              {/* Add Custom Role Button - Keep? Or remove for this page? */}
              {/* <Button ...> Add Custom Role </Button> */}
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="w-full lg:w-3/4">
          {loading && (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          {!loading && filteredRoles.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3 text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 animate-fade-in-up">
              <CardHeader>
                <CardTitle>No Roles Found</CardTitle>
                <CardDescription>Try adjusting your search terms or filters.</CardDescription>
              </CardHeader>
            </Card>
          )}
          {!loading && filteredRoles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRoles.map((role, index) => (
                <Card 
                  key={role.id} 
                  className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 animate-fade-in-up flex flex-col h-full"
                  style={{ animationDelay: `${(index) * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl line-clamp-2">{role.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span className="line-clamp-1">{role.company?.name || 'Unknown Company'} (ID: {role.id})</span>
                        </CardDescription>
                      </div>
                      {session && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveToggleRole(role.id)}
                          className="text-muted-foreground hover:text-primary shrink-0 ml-1"
                          title={savedRoles.some(r => r.roleId === role.id) ? "Unsave Role" : "Save Role"}
                        >
                          {savedRoles.some(r => r.roleId === role.id) ? (
                            <BookmarkCheck className="h-5 w-5" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="line-clamp-1">{role.location || 'N/A'}</span>
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
                    </div>
                    <p className="text-muted-foreground line-clamp-3">{role.description || 'No description available.'}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Skills/Requirements:</h4>
                      <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                        {(role.requirements && role.requirements.length > 0) ? (
                          role.requirements.map((req, idx) => (
                            <Badge key={`${role.id}-req-${idx}`} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))
                        ) : (role.skills && role.skills.length > 0) ? (
                          role.skills.map((skill) => (
                            <Badge key={`${role.id}-${skill.id}`} variant="outline" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 mt-auto">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex gap-2">
                        <div className="flex flex-col gap-2 w-full">
                          <div className="text-md font-semibold">{role.salary || 'Salary not specified'}</div>
                          <div className="flex gap-2">
                            {role.url ? (
                              <Button size="sm" asChild>
                                <a href={role.url} target="_blank" rel="noopener noreferrer">
                                  Apply Externally <ArrowRight className="h-4 w-4 ml-1" />
                                </a>
                              </Button>
                            ) : (
                              <Button size="sm" disabled>Apply Now</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
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