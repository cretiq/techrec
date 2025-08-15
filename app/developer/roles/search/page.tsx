"use client"

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react"
import {  Button  } from '@/components/ui-daisy/button'
import {  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter  } from '@/components/ui-daisy/card'
import {  Badge  } from '@/components/ui-daisy/badge'
import { Search, MapPin, Briefcase, Clock, Building, ArrowRight, PenTool, Check, Bookmark, BookmarkCheck, Sparkles, Users, Target, Coins } from "lucide-react"
import ApplicationBadge from '@/components/roles/ApplicationBadge'
import ApplicationActionButton from '@/components/roles/ApplicationActionButton'
import RecruiterCard from '@/components/roles/RecruiterCard'
// import MatchScoreCircle from '@/components/roles/MatchScoreCircle' // DISABLED: Skill matching temporarily disabled
import { useToast } from "@/components/ui-daisy/use-toast"
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
// DISABLED: Skill matching temporarily disabled due to insufficient API data
/*
import {
  selectRoleScore,
  selectUserHasSkills,
  selectMatchingLoading,
  calculateBatchMatchScores,
  fetchUserSkillProfile
} from '@/lib/features/matchingSlice'
*/
import { RootState, AppDispatch } from '@/lib/store'
import { cn } from "@/lib/utils"
import SelectedRolesList from '@/components/roles/SelectedRolesList'
import AdvancedFilters from '@/components/roles/AdvancedFilters'
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
  
  // MVP Beta Points State
  const [pointsBalance, setPointsBalance] = useState<number>(0)
  const [pointsLoading, setPointsLoading] = useState<boolean>(true)
  const isMvpBetaEnabled = process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true'

  // Redux state
  const roles = useSelector(selectRoles)
  const loading = useSelector(selectRolesLoading)
  const error = useSelector(selectRolesError)
  const canMakeRequest = useSelector(selectCanMakeRequest)
  const nextRequestTime = useSelector(selectNextRequestTime)
  const lastSearchParams = useSelector(selectLastSearchParams)
  const selectedRoles = useSelector(selectSelectedRoles)
  const selectedCount = useSelector(selectSelectedRolesCount)

  // Minimal component lifecycle logging (reduced for performance)
  if (process.env.NODE_ENV === 'development' && performance.now() % 5000 < 100) {
    console.log('[RolesSearch] Render snapshot:', { status, rolesCount: roles.length, loading });
  }

  // Throttled Redux state logging (performance optimized)
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
    console.log('[RolesSearch] State:', { rolesCount: roles.length, loading, selectedCount });
  }
  
  // DISABLED: Skill matching temporarily disabled
  // const userHasSkills = useSelector(selectUserHasSkills)
  // const matchingLoading = useSelector(selectMatchingLoading)
  
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
      // DISABLED: Skill matching temporarily disabled
      // dispatch(fetchUserSkillProfile())
      
      // Fetch points balance for MVP Beta
      if (isMvpBetaEnabled) {
        fetchPointsBalance()
      }
    }
  }, [status, dispatch])
  
  // Function to fetch points balance
  const fetchPointsBalance = useCallback(async () => {
    setPointsLoading(true)
    try {
      const response = await fetch('/api/gamification/points')
      if (response.ok) {
        const data = await response.json()
        setPointsBalance(data.balance?.available || 0)
      }
    } catch (error) {
      console.error('Failed to fetch points balance:', error)
    } finally {
      setPointsLoading(false)
    }
  }, [])

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

  // DISABLED: Enhanced roles data only needed for skill matching
  /*
  // Memoize enhanced roles data to prevent recreation on every render
  const enhancedRolesData = useMemo(() => {
    return roles.filter(role => role != null).map(role => ({
      ...role,
      ai_key_skills: role.ai_key_skills || ['React', 'TypeScript', 'Node.js', 'JavaScript', 'Python'],
      linkedin_org_specialties: role.linkedin_org_specialties || ['Software Development', 'Web Development']
    }))
  }, [roles])
  */

  // TODO: SKILL MATCHING TEMPORARILY DISABLED
  // Calculate match scores when roles are available and user has skills
  // DISABLED: Current API response structure lacks sufficient technical skill data.
  // The API fields (requirements, skills, company.specialties, description) either don't exist
  // or contain generic business information instead of technical skills.
  // Will re-enable when we have an API with proper technical skill data structure.
  /*
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
  */

  const handleSearch = async () => {
    if (!canMakeRequest && nextRequestTime) {
      const timeRemaining = Math.ceil((nextRequestTime - Date.now()) / 1000 / 60)
      toast({
        title: 'Rate Limited',
        description: `Please wait ${timeRemaining} more minutes before searching again.`,
        variant: 'destructive',
      })
      return
    }
    
    // Check points before search in MVP Beta
    if (isMvpBetaEnabled && pointsBalance < 1) {
      toast({
        title: 'Insufficient Points',
        description: 'You need at least 1 point to perform a search. Please contact support for more points.',
        variant: 'destructive',
      })
      return
    }

    const result = await dispatch(searchRoles(currentFilters))
    
    // Refresh points balance after search in MVP Beta
    if (isMvpBetaEnabled && result.meta.requestStatus === 'fulfilled') {
      fetchPointsBalance()
      
      // Show points used notification
      const resultsCount = (result.payload as any)?.roles?.length || 0
      if (resultsCount > 0) {
        toast({
          title: 'Search Completed',
          description: `Found ${resultsCount} jobs. ${resultsCount} points used. ${Math.max(0, pointsBalance - resultsCount)} points remaining.`,
        })
      } else {
        toast({
          title: 'No Results Found',
          description: 'Your search returned no results. No points were deducted.',
        })
      }
    }
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Usage Dashboard (empty for now) */}
          {/* TODO: ApiUsageDashboard temporarily hidden for UI simplicity
        <div className="lg:col-span-1 space-y-6" data-testid="role-search-container-sidebar">
              Will be restored when we want to show API usage statistics to users */}
          {/* <ApiUsageDashboard />
        </div>
 */}

        {/* Center - Advanced Filters & Selected Roles */}
        <div className="lg:col-span-1 space-y-6" data-testid="role-search-container-filters">
          {/* MVP Beta Points Display */}
          {isMvpBetaEnabled && (
            <Card variant="elevated-interactive" animated>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className={cn(
                      "h-5 w-5",
                      pointsBalance < 50 ? "text-warning" : "text-success"
                    )} />
                    <div>
                      <p className="text-sm font-medium">Beta Points Balance</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        pointsBalance < 50 ? "text-warning" : pointsBalance < 10 ? "text-error" : "text-success"
                      )}>
                        {pointsLoading ? "..." : pointsBalance}
                      </p>
                    </div>
                  </div>
                  {!pointsLoading && pointsBalance < 50 && (
                    <Badge variant={pointsBalance < 10 ? "destructive" : "warning"}>
                      {pointsBalance < 10 ? "Low Balance" : "Running Low"}
                    </Badge>
                  )}
                </div>
                
                {/* Search Cost Preview */}
                <div className="pt-2 border-t border-base-300/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Search cost:</span>
                    <span className="font-medium">
                      1 point per result (max {currentFilters.limit || 10})
                    </span>
                  </div>
                  {pointsBalance < (currentFilters.limit || 10) && (
                    <p className="text-xs text-warning mt-1">
                      ⚠️ You may not have enough points for all results
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <AdvancedFilters 
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            loading={loading}
            disabled={!canMakeRequest}
          />
          
          {/* Action Buttons Bar */}
          {!loading && filteredRoles.length > 0 && (
            <div className="flex flex-wrap justify-between items-center gap-2" data-testid="role-search-container-actions">
              {/* Bulk Selection Buttons */}
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
              {/* Write Button */}
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
            </div>
          )}
          
          <SelectedRolesList />
        </div>

        {/* Right Side - Results Grid */}
        <div className="lg:col-span-2 space-y-6" data-testid="role-search-container-results">

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
            <Card variant="elevated-interactive" animated className="text-center" data-testid="role-search-card-no-results">
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
  
  // DISABLED: Skill matching temporarily disabled
  /*
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
  */

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
      variant={isSelected ? "selected-interactive" : "default-interactive"}
      animated
      clickable
      tabIndex={0}
      role="checkbox"
      aria-checked={isSelected}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      style={{ animationDelay: `${index * 100}ms` }}
      data-testid={testId || `role-search-card-role-item-${role.id}`}
                >
      {session && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSaveClick}
          className="absolute top-2 right-2 text-muted-foreground hover:text-primary shrink-0 z-10"
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
      {/* Match Score Circle - REMOVED: Skill matching temporarily disabled due to insufficient API data */}
      
      <CardHeader className="pb-4" data-testid={`role-search-header-role-${role.id}`}>
                    <div className="flex justify-between items-start">
                      {/* BLUEPRINT REQUIREMENT: Organization Logo */}
                      {(role as any).organization_logo && (
                        <div className="mr-3 flex-shrink-0">
                          <img 
                            src={(role as any).organization_logo} 
                            alt={`${role.company?.name} logo`}
                            className="w-12 h-12 rounded-lg object-contain border border-base-300/50"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg line-clamp-2 break-words flex-1">{role.title}</CardTitle>

                          {/* BLUEPRINT REQUIREMENT: Date Posted */}

                          {/* Commented out until further validation */}
                          {/* {(role as any).date_posted && (
                            <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                              {new Date((role as any).date_posted).toLocaleDateString()}
                            </div>
                          )} */}

                        </div>
                        <div className="space-y-1 text-base-content/70 text-sm">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span className="line-clamp-1 text-xs font-medium">{role.company?.name || 'Unknown Company'}</span>
                            {/* AI-enhanced org data indicator */}
                            {((role as any).linkedin_org_industry || (role as any).linkedin_org_type) && (
                              <Sparkles className="h-3 w-3 text-primary/60" title="AI-enhanced company data" />
                            )}
                          </div>
                          {/* Enhanced company context with LinkedIn org data */}
                          {(role as any).linkedin_org_type && (
                            <div className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {(role as any).linkedin_org_type}
                            </div>
                          )}
                          {((role as any).linkedin_org_industry || role.company?.industry) && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {(role as any).linkedin_org_industry || role.company.industry}
                            </div>
                          )}
                          {((role as any).linkedin_org_size || role.company?.size) && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {(role as any).linkedin_org_size || `${role.company.size} employees`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4" data-testid={`role-search-content-role-${role.id}`}>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" leftIcon={<MapPin className="h-3 w-3 flex-shrink-0" />} className={cn("whitespace-nowrap", "badge-outline")}>
                        {/* BLUEPRINT REQUIREMENT: Use locations_derived */}
                        {((role as any).locations_derived && (role as any).locations_derived.length > 0) 
                          ? (role as any).locations_derived[0] 
                          : role.location || 'N/A'}
                      </Badge>
                      <Badge variant="secondary" leftIcon={<Briefcase className="h-3 w-3 flex-shrink-0" />} className={cn("whitespace-nowrap", "badge-outline")}>
                        {formatJobType(role.type)}
                      </Badge>
                      {role.remote && (
                        <Badge variant="secondary" leftIcon={<Clock className="h-3 w-3 flex-shrink-0" />} className={cn("whitespace-nowrap", "badge-outline")}>
                          Remote
                        </Badge>
                      )}
                    </div>

                    {/* Enhanced Job Description */}

                    {/* <div className="space-y-2">
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {(role as any).description_text || role.description || 'No description available.'}
                      </p>
                      {(role as any).description_text && (
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary/60" />
                          <span className="text-xs text-primary/80">Enhanced job description</span>
                        </div>
                      )}
                    </div> */}

                    {/* Enhanced Skills & Requirements Section with AI prioritization */}
                    {(((role as any).ai_key_skills && (role as any).ai_key_skills.length > 0) || 
                      (role.requirements && role.requirements.length > 0) || 
                      (role.skills && role.skills.length > 0) || 
                      (role.company?.specialties && role.company.specialties.length > 0)) && (
                      <div className="space-y-3">
                        {/* AI-Extracted Key Skills (Highest Priority) */}
                        {(role as any).ai_key_skills && (role as any).ai_key_skills.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-base-content/70" />
                              <span className="font-medium text-base-content/70">Key Skills</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(role as any).ai_key_skills.map((skill: string, idx: number) => (
                                <Badge key={`${role.id}-ai-skill-${idx}`} variant="default-soft" className={cn("text-xs")}>
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Traditional Skills/Requirements */}

                        {/* Commented out until further validation */}
                        {/* <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
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
                          ) : null}
                        </div> */}

                        {/* Commented out until further validation */}
                        {/* {role.company?.specialties && role.company.specialties.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{role.company.specialties.length - 5} more company specialties
                          </p>
                        )} */}

                      </div>
                    )}
                    
                    {/* AI-Enhanced Job Details */}
                    {((role as any).ai_core_responsibilities || (role as any).ai_work_arrangement || 
                      ((role as any).ai_benefits && (role as any).ai_benefits.length > 0)) && (
                      <div className="space-y-3">
                        {/* AI Core Responsibilities */}
                        {(role as any).ai_core_responsibilities && (
                          <div className="space-y-2 bg-base-200 p-4 rounded-xl">
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-base-content/70" />
                              <span className="font-medium text-base-content/70">Core Responsibilities</span>
                            </div>
                            <p className="text-muted-foreground line-clamp-3">
                              {(role as any).ai_core_responsibilities}
                            </p>
                          </div>
                        )}
                        
                        {/* AI Work Arrangement */}
                        {(role as any).ai_work_arrangement && (
                          <div className="space-y-1">
                            {/* <div className="flex items-center gap-1">
                              <Target className="h-3 w-3 text-base-content/70" />
                              <span className="font-medium text-base-content/70">Work Arrangement</span>
                            </div> */}
                            <Badge variant="secondary">
                              {(role as any).ai_work_arrangement}
                            </Badge>
                          </div>
                        )}
                        
                        {/* AI Benefits */}
                        {(role as any).ai_benefits && (role as any).ai_benefits.length > 0 && (
                          <div className="space-y-2">
                            {/* <div className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-base-content/70" />
                              <span className="font-medium text-base-content/70">Benefits</span>
                            </div> */}
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                              {(role as any).ai_benefits.slice(0, 4).map((benefit: string, idx: number) => (
                                <Badge key={`${role.id}-benefit-${idx}`} variant="default" className={cn("text-xs", "badge-soft")}>
                                  {benefit}
                                </Badge>
                              ))}
                              {(role as any).ai_benefits.length > 4 && (
                                <span className="text-xs text-muted-foreground">
                                  +{(role as any).ai_benefits.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Recruiter/Hiring Manager Contact Information */}

                    {/* Commented out until further validation */}
                    {/* {role.applicationInfo && (role.applicationInfo.recruiter || role.applicationInfo.hiringManager) && (
                      <RecruiterCard 
                        applicationInfo={role.applicationInfo}
                        data-testid={`role-search-recruiter-card-${role.id}`}
                      />
                    )} */}

                  </CardContent>

                  <CardFooter className="card-body pt-2 mt-auto space-y-3" data-testid={`role-search-footer-role-${role.id}`}>
                    {/* Salary Section - BLUEPRINT REQUIREMENT */}
                    <div className="w-full text-center">
                      <div className="text-md font-semibold">
                        {/* BLUEPRINT REQUIREMENT: Display salary_raw if available */}
                        {(role as any).salary_raw ? (
                          <span>
                            {(role as any).salary_raw.currency || '$'}
                            {(role as any).salary_raw.value?.minValue && (role as any).salary_raw.value?.maxValue
                              ? `${(role as any).salary_raw.value.minValue.toLocaleString()} - ${(role as any).salary_raw.value.maxValue.toLocaleString()}`
                              : (role as any).salary_raw.value?.value
                              ? (role as any).salary_raw.value.value.toLocaleString()
                              : 'Salary Available'
                            }
                            {(role as any).salary_raw.value?.unitText && ` ${(role as any).salary_raw.value.unitText}`}
                          </span>
                        ) : (
                          role.salary || 'No Salary Specified'
                        )}
                      </div>
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
                            variant="default"
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