"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter  } from '@/components/ui-daisy/card'
import {  Input  } from '@/components/ui-daisy/input'
import {  Badge  } from '@/components/ui-daisy/badge'
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Briefcase, Clock, Building, ArrowRight, X, Code, BarChart, Bookmark, BookmarkCheck, Send, Plus, PenTool, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from 'next-auth/react'
import { Role } from "@/types/role"
import { formatJobType, mapRapidApiJobToRole } from "@/utils/mappers"
import { useSelector, useDispatch } from 'react-redux'
import { toggleRoleSelection, selectIsRoleSelected, selectSelectedRolesCount, setSelectedRoles, clearRoleSelection, selectSelectedRoles } from '@/lib/features/selectedRolesSlice'
import { RootState, AppDispatch } from '@/lib/store'
import { cn } from "@/lib/utils"

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
  const dispatch = useDispatch<AppDispatch>()
  const selectedRoles = useSelector(selectSelectedRoles)
  const selectedCount = useSelector(selectSelectedRolesCount)

  useEffect(() => {
    console.log("[RolesSearch2Page] useEffect triggered")
    console.log("[RolesSearch2Page] Session status:", status)

    if (status === 'unauthenticated') {
      console.log("[RolesSearch2Page] User not authenticated, redirecting to signin")
      router.push('/auth/signin?callbackUrl=/developer/roles/search')
      return
    }

    if (status === 'authenticated') {
      console.log("[RolesSearch2Page] User authenticated, fetching initial data")
      fetchSavedRoles()
      fetchRoles() // Trigger initial search
    }
  }, [status])

  const fetchRoles = async () => {
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

        const jobs = await response.json()

        const mappedRoles = jobs.map(mapRapidApiJobToRole)


        setRoles(mappedRoles)

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

  const handleWriteTo = (role: Role) => {
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/developer/roles/search')
      return
    }
    const roleData = encodeURIComponent(JSON.stringify(role))
    router.push(`/developer/writing-help?roleData=${roleData}`)
  }

  const handleWriteToSelected = () => {
    if (selectedCount > 0) {
      router.push('/developer/writing-help?tab=cover-letter')
    }
  }

  const allVisibleSelected = useMemo(() => {
    const visibleRoleIds = filteredRoles.map(role => role.id).filter(Boolean);
    const currentSelectedIds = new Set(selectedRoles.map(r => r.id));
    return visibleRoleIds.length > 0 && visibleRoleIds.every(id => currentSelectedIds.has(id));
  }, [filteredRoles, selectedRoles]);

  const handleSelectAllVisible = () => {
    const currentSelectedMap = new Map(selectedRoles.map(r => [r.id, r]));
    filteredRoles.forEach(role => {
        if (role && role.id) {
            currentSelectedMap.set(role.id, role);
        }
    });
    dispatch(setSelectedRoles(Array.from(currentSelectedMap.values())));
  };

  const handleDeselectAll = () => {
    dispatch(clearRoleSelection())
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="role-search-container-auth-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-testid="role-search-spinner-auth-loading"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="role-search-container-main">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-1/4 space-y-6 animate-fade-in-up" data-testid="role-search-container-filters">
          <div className="bg-base-100/60 backdrop-blur-sm rounded-lg shadow-lg p-6 sticky top-8 border border-base-200" data-testid="role-search-card-filters">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters (RapidAPI)</h2>
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
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles (e.g., Engineer)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-base-100/80 backdrop-blur-sm"
                  data-testid="role-search-input-keyword"
                />
              </div>

              {/* Location Filter */}
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <Label>Location</Label>
                <Input
                  placeholder="Location (e.g., United States)"
                  value={selectedLocation === 'all' ? '' : selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value || 'all')}
                  className="bg-base-100/80 backdrop-blur-sm"
                  data-testid="role-search-input-location"
                />
              </div>

              {/* Results Limit Slider */}
              <div className="space-y-3 p-4 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20" data-testid="role-search-container-limit-slider">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-primary">Results Limit</Label>
                  <div className="px-2 py-1 bg-primary/20 rounded-full text-xs font-bold text-primary" data-testid="role-search-display-limit-value">
                    {searchLimit[0]}
                  </div>
                </div>
                <Slider
                  value={searchLimit}
                  onValueChange={setSearchLimit}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full slider-enhanced"
                  data-testid="role-search-input-limit-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>

              {/* Search Button */}
              <Button 
                className="w-full magical-glow" 
                onClick={fetchRoles}
                disabled={loading}
                variant="gradient"
                data-testid="role-search-button-search-trigger"
              >
                {loading ? (
                  <div className="sparkle-loader pulse-ring animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2" />
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
        <div className="w-full lg:w-3/4" data-testid="role-search-container-results">
          {/* Action Buttons Bar */}
          <div className="mb-4 flex flex-wrap justify-between items-center gap-2" data-testid="role-search-container-actions">
            {/* Bulk Selection Buttons */}
            {!loading && filteredRoles.length > 0 && (
              <div className="flex gap-2" data-testid="role-search-container-bulk-actions">
                <Button
                  onClick={handleSelectAllVisible}
                  disabled={allVisibleSelected || filteredRoles.length === 0}
                  variant="outline"
                  size="sm"
                  title={allVisibleSelected ? "All visible roles already selected" : "Select all roles currently visible"}
                  data-testid="role-search-button-select-visible-trigger"
                >
                  Select Visible ({filteredRoles.length})
                </Button>
                <Button
                  onClick={handleDeselectAll}
                  disabled={selectedCount === 0}
                  variant="outline"
                  size="sm"
                  title="Deselect all roles"
                  data-testid="role-search-button-deselect-all-trigger"
                >
                  Deselect All ({selectedCount})
                </Button>
              </div>
            )}
            {/* Write Button */}
            {!loading && filteredRoles.length > 0 && (
              <Button
                onClick={handleWriteToSelected}
                disabled={selectedCount === 0}
                size="sm"
                variant="gradient"
                className="relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="role-search-button-write-selected-trigger"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-pink-500 opacity-0 transition-opacity hover:opacity-100"></div>
                <div className="relative flex items-center">
                  <PenTool className="mr-2 h-4 w-4" />
                  Write to {selectedCount} role{selectedCount !== 1 ? 's' : ''}
                </div>
              </Button>
            )}
          </div>
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4" data-testid="role-search-container-loading">
              <div className="sparkle-loader pulse-ring animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-testid="role-search-spinner-search-loading"></div>
              <div className="text-sm text-muted-foreground animate-pulse" data-testid="role-search-text-loading-message">Searching for amazing opportunities...</div>
            </div>
          )}
          {!loading && filteredRoles.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3 text-center p-8 bg-base-100/60 backdrop-blur-sm animate-fade-in-up" data-testid="role-search-card-no-results">
              <CardHeader>
                <CardTitle>No Roles Found</CardTitle>
                <CardDescription>Try adjusting your search terms or filters.</CardDescription>
              </CardHeader>
            </Card>
          )}
          {!loading && filteredRoles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="role-search-container-roles-grid">
              {filteredRoles.map((role, index) => (
                <RoleCardWrapper
                  key={role.id}
                  role={role}
                  index={index}
                  savedRoles={savedRoles}
                  session={session}
                  handleSaveToggleRole={handleSaveToggleRole}
                  handleWriteTo={handleWriteTo}
                  data-testid={`role-search-card-role-item-${role.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface RoleCardWrapperProps {
  role: Role;
  index: number;
  savedRoles: SavedRole[];
  session: ReturnType<typeof useSession>['data'];
  handleSaveToggleRole: (roleId: string) => void;
  handleWriteTo: (role: Role) => void;
  'data-testid'?: string;
}

const RoleCardWrapper: React.FC<RoleCardWrapperProps> = ({
  role,
  index,
  savedRoles,
  session,
  handleSaveToggleRole,
  handleWriteTo,
  'data-testid': testId,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const isSelected = useSelector((state: RootState) => selectIsRoleSelected(state, role.id))
  const isRoleSaved = savedRoles.some(r => r.roleId === role.id)

  const handleCardClick = () => {
    if (role) {
        dispatch(toggleRoleSelection(role))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleSaveToggleRole(role.id)
  }

  const handleWriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleWriteTo(role)
  }

  if (!role) return null

  return (
                <Card 
      tabIndex={0}
      role="checkbox"
      aria-checked={isSelected}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "hover:shadow-lg transition-all hover:transform hover:scale-[1.02] bg-base-100/60 backdrop-blur-sm animate-fade-in-up flex flex-col h-full relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border border-base-200",
        isSelected && "border-2 border-primary bg-primary/20 shadow-primary/20 shadow-md"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      data-testid={testId || `role-search-card-role-item-${role.id}`}
                >
      {session && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSaveClick}
          className="absolute top-2 right-10 text-muted-foreground hover:text-primary shrink-0 z-10"
          aria-label={isRoleSaved ? "Unsave role" : "Save role"}
          title={isRoleSaved ? "Unsave Role" : "Save Role"}
          data-testid={`role-search-button-save-trigger-${role.id}`}
        >
          {isRoleSaved ? (
            <BookmarkCheck className="h-5 w-5 text-primary" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </Button>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2 text-primary z-10 p-1 bg-base-100/80 backdrop-blur-sm rounded-full" data-testid={`role-search-indicator-selected-${role.id}`}>
          <Check className="h-4 w-4" />
        </div>
      )}
      <CardHeader className="pb-4 pr-16" data-testid={`role-search-header-role-${role.id}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-lg line-clamp-2">{role.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span className="line-clamp-1 text-xs">{role.company?.name || 'Unknown Company'}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4" data-testid={`role-search-content-role-${role.id}`}>
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
                    <p className="text-muted-foreground text-sm line-clamp-3">{role.description || 'No description available.'}</p>
                    <div className="space-y-2">
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
                  <CardFooter className="card-body pt-2 mt-auto space-y-3" data-testid={`role-search-footer-role-${role.id}`}>
                    {/* Salary Section */}
                    <div className="w-full text-center">
                      <div className="text-md font-semibold">{role.salary || 'Salary not specified'}</div>
                    </div>
                    
                    {/* Action Buttons Section */}
                    <div className="flex justify-between items-center w-full px-2">
                      {/* Left: Apply Externally Button */}
                      <div className="flex-shrink-0">
                        {role.url ? (
                          <a 
                            href={role.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button size="sm" className="text-xs px-3" data-testid={`role-search-button-apply-external-trigger-${role.id}`}>
                              Apply Externally
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </a>
                        ) : (
                          <Button size="sm" disabled className="text-xs px-3" data-testid={`role-search-button-apply-disabled-${role.id}`}>
                            Apply Now
                          </Button>
                        )}
                      </div>

                      {/* Right: Write to Button */}
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleWriteClick}
                          disabled={!session?.user}
                          className="gap-1 text-xs px-3"
                          title={!session?.user ? "Login to use Writing Help" : "Get writing assistance"}
                          data-testid={`role-search-button-write-trigger-${role.id}`}
                        >
                          <PenTool className="h-3 w-3" />
                          Write to
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
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