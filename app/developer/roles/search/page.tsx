"use client"

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter  } from '@/components/ui-daisy/card'
import {  Badge  } from '@/components/ui-daisy/badge'
import { Search, MapPin, Briefcase, Clock, Building, ArrowRight, PenTool, Check, Bookmark, BookmarkCheck } from "lucide-react"
import ApplicationBadge from '@/components/roles/ApplicationBadge'
import ApplicationActionButton from '@/components/roles/ApplicationActionButton'
import RecruiterCard from '@/components/roles/RecruiterCard'
import MatchScoreCircle from '@/components/roles/MatchScoreCircle'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from 'next-auth/react'
import { Role } from "@/types/role"
import { formatJobType } from "@/utils/mappers"
import { useSelector, useDispatch } from 'react-redux'
import { toggleRoleSelection, selectIsRoleSelected, selectSelectedRolesCount, setSelectedRoles, clearRoleSelection, selectSelectedRoles } from '@/lib/features/selectedRolesSlice'
import { fetchSavedRoles as fetchSavedRolesRedux, selectSavedRoles } from '@/lib/features/savedRolesSlice'
import MarkAsAppliedButton from '@/components/roles/MarkAsAppliedButton'
import { 
  searchRoles, 
  selectRoles, 
  selectRolesLoading, 
  selectRolesError,
  selectCanMakeRequest,
  selectNextRequestTime,
  selectLastSearchParams,
  clearError
} from '@/lib/features/rolesSlice'
import {
  selectRoleScore,
  selectUserHasSkills,
  selectMatchingLoading,
  calculateBatchMatchScores,
  fetchUserSkillProfile
} from '@/lib/features/matchingSlice'
import { extractRoleSkills } from '@/utils/matching/skillMatchingService'
import { RootState, AppDispatch } from '@/lib/store'
import { cn } from "@/lib/utils"
import SelectedRolesList from '@/components/roles/SelectedRolesList'
import AdvancedFilters from '@/components/roles/AdvancedFilters'
import ApiUsageDashboard from '@/components/roles/ApiUsageDashboard'
import type { SearchParameters } from '@/lib/api/rapidapi-cache'

interface SavedRole {
  roleId: string
  savedAt: Date
  role?: Role
}

export default function RolesSearch2Page() {
  const { data: session, status } = useSession()
  const savedRoles = useSelector(selectSavedRoles)
  const [currentFilters, setCurrentFilters] = useState<SearchParameters>({
    limit: 10
  })
  const { toast } = useToast()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  // Minimal component lifecycle logging (reduced for performance)
  if (process.env.NODE_ENV === 'development' && performance.now() % 5000 < 100) {
    console.log('[RolesSearch] Render snapshot:', { status, rolesCount: roles.length, loading });
  }

  // Redux state
  const roles = useSelector(selectRoles)
  const loading = useSelector(selectRolesLoading)
  const error = useSelector(selectRolesError)
  const canMakeRequest = useSelector(selectCanMakeRequest)
  const nextRequestTime = useSelector(selectNextRequestTime)
  const lastSearchParams = useSelector(selectLastSearchParams)
  const selectedRoles = useSelector(selectSelectedRoles)
  const selectedCount = useSelector(selectSelectedRolesCount)

  // Throttled Redux state logging (performance optimized)
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
    console.log('[RolesSearch] State:', { rolesCount: roles.length, loading, selectedCount });
  }
  
  // Matching state
  const userHasSkills = useSelector(selectUserHasSkills)
  const matchingLoading = useSelector(selectMatchingLoading)
  
  // Ref to prevent infinite loop in match calculation
  const isCalculatingRef = useRef(false)
  const lastCalculatedRolesRef = useRef<string>('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/developer/roles/search')
      return
    }

    if (status === 'authenticated') {
      dispatch(fetchSavedRolesRedux({ includeRoleDetails: true }))
      // Fetch user skills profile for match scoring
      dispatch(fetchUserSkillProfile())
    }
  }, [status, dispatch])

  // Memoize the search trigger condition to prevent unnecessary effect runs
  const shouldAutoSearch = useMemo(() => {
    return status === 'authenticated' && 
           lastSearchParams && 
           roles.length === 0 && 
           !loading &&
           canMakeRequest;
  }, [status, lastSearchParams, roles.length, loading, canMakeRequest]);

  // Auto-search when persisted search params exist but no roles are loaded
  useEffect(() => {
    if (shouldAutoSearch) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auto-Search] Triggering auto-search with cached params');
      }
      
      // Set the current filters to the persisted params
      setCurrentFilters(lastSearchParams!)
      
      // Trigger search with persisted parameters (uses cache if available)
      dispatch(searchRoles(lastSearchParams!))
    }
  }, [shouldAutoSearch, lastSearchParams, dispatch])

  // Clear errors when component unmounts or when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: 'Search Error',
        description: error,
        variant: 'destructive',
      })
      dispatch(clearError())
    }
  }, [error, dispatch, toast])

  // Memoize enhanced roles data to prevent recreation on every render
  const enhancedRolesData = useMemo(() => {
    return roles.filter(role => role != null).map(role => ({
      ...role,
      ai_key_skills: role.ai_key_skills || ['React', 'TypeScript', 'Node.js', 'JavaScript', 'Python'],
      linkedin_org_specialties: role.linkedin_org_specialties || ['Software Development', 'Web Development']
    }))
  }, [roles])

  // Calculate match scores when roles are available and user has skills
  useEffect(() => {
    // Prevent infinite loop with ref guard
    if (isCalculatingRef.current) return
    
    const hasRoles = roles.length > 0
    const hasValidConditions = hasRoles && userHasSkills && !matchingLoading
    
    // Create a stable key to track if we need to recalculate
    const currentRolesKey = roles.map(r => r.id).join(',')
    const hasNewRoles = lastCalculatedRolesRef.current !== currentRolesKey
    
    if (hasValidConditions && hasNewRoles) {
      const roleIds = roles.map(role => role.id).filter(Boolean)
      
      if (roleIds.length > 0) {
        isCalculatingRef.current = true
        lastCalculatedRolesRef.current = currentRolesKey
        
        dispatch(calculateBatchMatchScores({
          roleIds,
          rolesData: enhancedRolesData
        })).finally(() => {
          isCalculatingRef.current = false
        })
      }
    }
  }, [roles.length, userHasSkills, matchingLoading, enhancedRolesData, dispatch])

  const handleSearch = () => {
    if (!canMakeRequest && nextRequestTime) {
      const timeRemaining = Math.ceil((nextRequestTime - Date.now()) / 1000 / 60)
      toast({
        title: 'Rate Limited',
        description: `Please wait ${timeRemaining} more minutes before searching again.`,
        variant: 'destructive',
      })
      return
    }

    dispatch(searchRoles(currentFilters))
  }

  const handleFiltersChange = (filters: SearchParameters) => {
    setCurrentFilters(filters)
  }


  // All roles are already filtered by the API based on search parameters
  const filteredRoles = roles.filter((role) => {
    if (!role) {
      return false
    }
    return true
  })

  const handleSaveToggleRole = useCallback(async (roleId: string) => {
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/developer/roles')
      return
    }

    // Find the role data from current roles
    const roleToSave = roles.find(role => role.id === roleId)
    if (!roleToSave) {
      toast({
        title: 'Error',
        description: 'Role data not found',
        variant: 'destructive',
      })
      return
    }

    const isSaved = savedRoles.some(role => role.roleId === roleId)

    try {
      const response = await fetch(`/api/developer/me/saved-roles`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isSaved ? { roleId } : { roleData: roleToSave }),
      })

      if (response.ok) {
        // Refresh Redux state to maintain consistency
        dispatch(fetchSavedRolesRedux({ includeRoleDetails: true }))
        
        if (isSaved) {
          toast({
            title: 'Success',
            description: 'Role removed from saved roles',
          })
        } else {
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
  }, [session?.user, savedRoles, roles, router, toast])

  const handleApply = (roleId: string) => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }
    router.push(`/developer/roles/${roleId}/apply`)
  }

  const handleWriteTo = useCallback((role: Role) => {
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/developer/roles/search')
      return
    }
    const roleData = encodeURIComponent(JSON.stringify(role))
    router.push(`/developer/writing-help?roleData=${roleData}`)
  }, [session?.user, router])

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

  // PersistGate handles rehydration loading - no manual session loading check needed

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" data-testid="role-search-container-main">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Selected Roles & Usage Dashboard */}
        <div className="lg:col-span-1 space-y-6" data-testid="role-search-container-sidebar">
          <SelectedRolesList />
          {/* TODO: ApiUsageDashboard temporarily hidden for UI simplicity
              Will be restored when we want to show API usage statistics to users */}
          {/* <ApiUsageDashboard /> */}
        </div>

        {/* Center - Advanced Filters */}
        <div className="lg:col-span-1 space-y-6" data-testid="role-search-container-filters">
          <AdvancedFilters 
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            loading={loading}
            disabled={!canMakeRequest}
          />
        </div>

        {/* Right Side - Results Grid */}
        <div className="lg:col-span-2 space-y-6" data-testid="role-search-container-results">
          {/* Action Buttons Bar */}
          <div className="flex flex-wrap justify-between items-center gap-2" data-testid="role-search-container-actions">
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
                leftIcon={<PenTool className="h-4 w-4" />}
                data-testid="role-search-button-write-selected-trigger"
              >
                Write to {selectedCount} role{selectedCount !== 1 ? 's' : ''}
              </Button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4" data-testid="role-search-container-loading">
              <div className="sparkle-loader pulse-ring animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-testid="role-search-spinner-search-loading"></div>
              <div className="text-sm text-muted-foreground animate-pulse" data-testid="role-search-text-loading-message">
                Searching for amazing opportunities...
              </div>
              <div className="text-xs text-muted-foreground" data-testid="role-search-text-loading-subtitle">
                Results are cached for improved performance
              </div>
            </div>
          )}

          {/* No Results State */}
          {!loading && filteredRoles.length === 0 && (
            <Card className="text-center p-8 bg-base-100/60 backdrop-blur-sm animate-fade-in-up" data-testid="role-search-card-no-results">
              <CardHeader>
                <CardTitle>Ready to Search for Roles</CardTitle>
                <CardDescription>
                  Use the advanced filters to search for job opportunities. Configure your search parameters and click the search button to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSearch}
                  disabled={!canMakeRequest}
                  variant="default"
                  size="lg"
                  leftIcon={<Search className="h-4 w-4" />}
                  data-testid="role-search-button-start-search"
                >
                  Start Searching
                </Button>
                {!canMakeRequest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Rate limited - please wait before searching
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results Grid */}
          {!loading && filteredRoles.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" data-testid="role-search-container-roles-grid">
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

const RoleCardWrapper = React.memo<RoleCardWrapperProps>(({
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
  const isRoleSaved = useMemo(() => savedRoles.some(r => r.roleId === role.id), [savedRoles, role.id])
  
  // Minimal debug logging for persistence verification
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
    console.log(`[RoleCard] ${role.id} selected: ${isSelected}`);
  }
  
  // Get match score and matching state for this role in a single selector
  const { matchScore, userHasSkills, matchingLoading } = useSelector((state: RootState) => ({
    matchScore: selectRoleScore(state, role.id),
    userHasSkills: selectUserHasSkills(state),
    matchingLoading: selectMatchingLoading(state)
  }))
  
  
  // Determine if role has skills listed
  const hasSkillsListed = useMemo(() => {
    if (matchScore) {
      return matchScore.hasSkillsListed
    }
    
    // Fallback detection - check if role has any skill-related data
    const hasSkills = Boolean(
      (role.ai_key_skills && role.ai_key_skills.length > 0) ||
      (role.skills && role.skills.length > 0) ||
      (role.linkedin_org_specialties && role.linkedin_org_specialties.length > 0) ||
      (role.requirements && role.requirements.length > 0)
    )
    
    return hasSkills
  }, [matchScore, role])
  
  // Get actual score or default
  const displayScore = matchScore?.overallScore || 0

  const handleCardClick = useCallback(() => {
    if (role) {
        dispatch(toggleRoleSelection(role))
    }
  }, [dispatch, role])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }, [handleCardClick])

  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    handleSaveToggleRole(role.id)
  }, [handleSaveToggleRole, role.id])

  const handleWriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    handleWriteTo(role)
  }, [handleWriteTo, role])


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
      {/* Match Score Circle - Top Left */}
      <div className="absolute top-2 left-2 z-10" data-testid={`role-search-match-score-${role.id}`}>
        <MatchScoreCircle
          score={displayScore || 75}
          hasSkillsListed={hasSkillsListed}
          loading={matchingLoading && !matchScore}
          size="md"
          animate={true}
          showTooltip={true}
        />
      </div>
      
      <CardHeader className="pb-4 pr-16 pl-10" data-testid={`role-search-header-role-${role.id}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-lg line-clamp-2">{role.title}</CardTitle>
                        <div className="space-y-1 text-base-content/70 text-sm">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span className="line-clamp-1 text-xs font-medium">{role.company?.name || 'Unknown Company'}</span>
                          </div>
                          {role.company?.industry && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {role.company.industry}
                            </div>
                          )}
                          {role.company?.size && (
                            <div className="text-xs text-muted-foreground">
                              {role.company.size} employees
                            </div>
                          )}
                        </div>
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
                      {role.applicationInfo && (
                        <ApplicationBadge 
                          applicationInfo={role.applicationInfo}
                          data-testid={`role-search-badge-application-${role.id}`}
                        />
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
                        ) : (role.company?.specialties && role.company.specialties.length > 0) ? (
                          role.company.specialties.slice(0, 5).map((specialty, idx) => (
                            <Badge key={`${role.id}-spec-${idx}`} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {specialty}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Not specified</span>
                        )}
                      </div>
                      {role.company?.specialties && role.company.specialties.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{role.company.specialties.length - 5} more company specialties
                        </p>
                      )}
                    </div>
                    
                    {/* Recruiter/Hiring Manager Contact Information */}
                    {role.applicationInfo && (role.applicationInfo.recruiter || role.applicationInfo.hiringManager) && (
                      <RecruiterCard 
                        applicationInfo={role.applicationInfo}
                        data-testid={`role-search-recruiter-card-${role.id}`}
                      />
                    )}
                  </CardContent>
                  <CardFooter className="card-body pt-2 mt-auto space-y-3" data-testid={`role-search-footer-role-${role.id}`}>
                    {/* Salary Section */}
                    <div className="w-full text-center">
                      <div className="text-md font-semibold">{role.salary || 'Salary not specified'}</div>
                    </div>
                    
                    {/* Action Buttons Section */}
                    <div className="space-y-3 w-full">
                      {/* Top Row: Application and Write to Buttons */}
                      <div className="flex justify-between items-center w-full px-2">
                        {/* Left: Application Button */}
                        <div className="flex-shrink-0">
                          {role.applicationInfo ? (
                            <ApplicationActionButton
                              applicationInfo={role.applicationInfo}
                              disabled={!session?.user}
                              data-testid={`role-search-button-apply-action-${role.id}`}
                            />
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
                            leftIcon={<PenTool className="h-3 w-3" />}
                            title={!session?.user ? "Login to use Writing Help" : "Get writing assistance"}
                            data-testid={`role-search-button-write-trigger-${role.id}`}
                          >
                            Write to
                          </Button>
                        </div>
                      </div>

                      {/* Bottom Row: Mark as Applied Button (Full Width) */}
                      <div className="w-full px-2">
                        <MarkAsAppliedButton
                          role={role}
                          className="w-full"
                          data-testid={`role-search-button-mark-applied-${role.id}`}
                        />
                      </div>
                    </div>
                  </CardFooter>
                </Card>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.role.id === nextProps.role.id &&
    prevProps.index === nextProps.index &&
    prevProps.savedRoles.length === nextProps.savedRoles.length &&
    prevProps.session?.user?.id === nextProps.session?.user?.id &&
    prevProps.savedRoles.some(r => r.roleId === prevProps.role.id) === 
    nextProps.savedRoles.some(r => r.roleId === nextProps.role.id)
  );
})

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