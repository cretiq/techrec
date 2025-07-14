"use client"

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui-daisy/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui-daisy/card'
import { Badge } from '@/components/ui-daisy/badge'
import { 
  Bookmark, 
  BookmarkCheck, 
  MapPin, 
  Briefcase, 
  Building, 
  Clock, 
  PenTool, 
  Search,
  Filter,
  Check,
  Calendar,
  TrendingUp
} from 'lucide-react'
import SavedRoleMarkAsAppliedButton from '@/components/roles/SavedRoleMarkAsAppliedButton'
import ApplicationBadge from '@/components/roles/ApplicationBadge'
import ApplicationActionButton from '@/components/roles/ApplicationActionButton'
import { formatJobType } from '@/utils/mappers'
import { 
  fetchSavedRoles, 
  selectSavedRoles, 
  selectSavedRolesStatus, 
  selectSavedRolesError,
  selectSavedRolesCounts
} from '@/lib/features/savedRolesSlice'
import { useSavedRoles } from '@/hooks/useSavedRoles'
import type { RootState, AppDispatch } from '@/lib/store'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'saved' | 'applied'

export default function SavedRolesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  
  // Local state for filtering
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [detailedRoles, setDetailedRoles] = useState<any[]>([])
  const [localAppliedStates, setLocalAppliedStates] = useState<Record<string, boolean>>({})
  
  // Redux state using our custom hook
  const { savedRoles, isLoading, error } = useSavedRoles()
  const counts = useSelector(selectSavedRolesCounts)
  
  // Function to fetch detailed role data from the me endpoint
  const fetchDetailedSavedRoles = async () => {
    try {
      const response = await fetch('/api/developer/me/saved-roles')
      if (response.ok) {
        const data = await response.json()
        setDetailedRoles(data)
      }
    } catch (error) {
      console.error('Error fetching detailed saved roles:', error)
    }
  }

  // Handler to refresh data when roles are marked as applied
  const handleRoleMarkedAsApplied = useCallback(() => {
    // Refetch detailed roles when a role is marked as applied
    fetchDetailedSavedRoles()
    // Also refetch Redux state to keep everything in sync  
    dispatch(fetchSavedRoles({ includeRoleDetails: true }))
  }, [dispatch])
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/developer/saved-roles')
      return
    }
    
    if (status === 'authenticated') {
      // Fetch saved roles with full details from both endpoints to get rich data
      dispatch(fetchSavedRoles({ includeRoleDetails: true }))
      // Also fetch from the me endpoint to get the rich role data structure
      fetchDetailedSavedRoles()
    }
  }, [status, dispatch, router])
  
  // Filter and search logic - use detailed roles when available
  const filteredRoles = useMemo(() => {
    // Use detailed roles if available, otherwise fall back to redux savedRoles
    const rolesToFilter = detailedRoles.length > 0 ? detailedRoles : savedRoles
    
    if (!rolesToFilter.length) return []
    
    let filtered = rolesToFilter
    
    // Apply filter
    if (filter === 'applied') {
      filtered = filtered.filter(savedRole => savedRole.appliedFor)
    } else if (filter === 'saved') {
      filtered = filtered.filter(savedRole => !savedRole.appliedFor)
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(savedRole => {
        // Handle both data structures
        const title = savedRole.role?.title || savedRole.roleTitle || ''
        const companyName = savedRole.role?.company?.name || savedRole.companyName || ''
        
        return title.toLowerCase().includes(query) ||
               companyName.toLowerCase().includes(query)
      })
    }
    
    return filtered
  }, [detailedRoles, savedRoles, filter, searchQuery])
  
  const handleWriteTo = (savedRole: any) => {
    if (!session?.user) return
    
    // Navigate to writing help with the role data
    const roleData = savedRole.role ? {
      id: savedRole.role.id,
      title: savedRole.role.title,
      company: savedRole.role.company,
      location: savedRole.role.location,
      description: savedRole.role.description,
      url: savedRole.jobPostingUrl
    } : {
      id: savedRole.roleId,
      title: savedRole.roleTitle,
      company: { name: savedRole.companyName }
    }
    
    const encodedRoleData = encodeURIComponent(JSON.stringify(roleData))
    router.push(`/developer/writing-help?roleData=${encodedRoleData}`)
  }
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="sparkle-loader pulse-ring animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" data-testid="saved-roles-page-container">
      {/* Page Header */}
      <div className="mb-8" data-testid="saved-roles-page-header">
        <h1 className="text-3xl font-bold mb-2">Saved Roles</h1>
        <p className="text-muted-foreground">
          Manage your saved job opportunities and track your applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" data-testid="saved-roles-stats-container">
        <Card className="bg-base-100/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Saved</p>
                <p className="text-2xl font-bold">{counts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-base-100/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Applied</p>
                <p className="text-2xl font-bold">{counts.applied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-base-100/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{counts.total - counts.applied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6" data-testid="saved-roles-filters-container">
        {/* Filter Buttons */}
        <div className="flex gap-2" data-testid="saved-roles-filter-buttons">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            data-testid="saved-roles-filter-all"
          >
            All ({counts.total})
          </Button>
          <Button
            variant={filter === 'saved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('saved')}
            data-testid="saved-roles-filter-saved"
          >
            Saved Only ({counts.total - counts.applied})
          </Button>
          <Button
            variant={filter === 'applied' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('applied')}
            data-testid="saved-roles-filter-applied"
          >
            Applied ({counts.applied})
          </Button>
        </div>
        
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search roles or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10"
              data-testid="saved-roles-search-input"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12" data-testid="saved-roles-loading">
          <div className="flex flex-col items-center space-y-4">
            <div className="sparkle-loader pulse-ring animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading your saved roles...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12" data-testid="saved-roles-error">
          <p className="text-error mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchSavedRoles({ includeRoleDetails: true }))}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredRoles.length === 0 && savedRoles.length === 0 && (
        <Card className="text-center p-12 bg-base-100/60 backdrop-blur-sm" data-testid="saved-roles-empty-state">
          <CardHeader>
            <CardTitle>No Saved Roles Yet</CardTitle>
            <CardDescription>
              Start saving roles you're interested in to keep track of opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/developer/roles/search')}
              variant="default"
              size="lg"
              leftIcon={<Search className="h-4 w-4" />}
            >
              Search for Roles
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {!isLoading && !error && filteredRoles.length === 0 && savedRoles.length > 0 && (
        <Card className="text-center p-8 bg-base-100/60 backdrop-blur-sm" data-testid="saved-roles-no-results">
          <CardContent>
            <p className="text-muted-foreground mb-4">No roles match your current filters</p>
            <Button variant="outline" onClick={() => { setFilter('all'); setSearchQuery('') }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Saved Roles Grid */}
      {!isLoading && !error && filteredRoles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="saved-roles-grid">
          {filteredRoles.map((savedRole) => (
            <SavedRoleCard
              key={savedRole.id}
              savedRole={savedRole}
              onWriteTo={() => handleWriteTo(savedRole)}
              onRoleMarkedAsApplied={handleRoleMarkedAsApplied}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SavedRoleCardProps {
  savedRole: any
  onWriteTo: () => void
  onRoleMarkedAsApplied: () => void
}

function SavedRoleCard({ savedRole, onWriteTo, onRoleMarkedAsApplied }: SavedRoleCardProps) {
  // Track local applied state for immediate UI feedback
  const [localAppliedState, setLocalAppliedState] = useState(false)
  
  // Initialize local state from saved role data
  useEffect(() => {
    setLocalAppliedState(Boolean(savedRole.appliedFor))
  }, [savedRole.appliedFor])

  // Custom applied status handler
  const handleMarkAsAppliedSuccess = useCallback(() => {
    setLocalAppliedState(true) // Immediately update local state
    onRoleMarkedAsApplied() // Then trigger parent refresh
  }, [onRoleMarkedAsApplied])

  // Create a role object for MarkAsAppliedButton - handle both data structures
  const role = useMemo(() => {
    // Extract external role ID from notes if available
    const extractExternalId = (notes: string | null) => {
      if (!notes) return null;
      const match = notes.match(/External ID: (.+)/);
      return match ? match[1] : null;
    };

    // If we have the full role data structure (from /api/developer/me/saved-roles)
    if (savedRole.role) {
      const externalId = extractExternalId(savedRole.notes);
      return {
        id: externalId || savedRole.role.id, // Use external ID for mark-as-applied functionality
        title: savedRole.role.title,
        company: savedRole.role.company,
        url: savedRole.jobPostingUrl,
        location: savedRole.role.location,
        salary: savedRole.role.salary,
        type: savedRole.role.type,
        remote: savedRole.role.remote,
        description: savedRole.role.description,
        requirements: savedRole.role.requirements,
        applicationInfo: savedRole.jobPostingUrl ? { applicationUrl: savedRole.jobPostingUrl } : null
      }
    }
    
    // Fallback for simplified data structure
    return {
      id: savedRole.roleId,
      title: savedRole.roleTitle || 'Unknown Role',
      company: { name: savedRole.companyName || 'Unknown Company' },
      url: savedRole.jobPostingUrl,
      applicationInfo: null
    }
  }, [savedRole])

  return (
    <Card 
      className="bg-base-100/60 backdrop-blur-sm border border-base-200 hover:shadow-lg transition-all duration-200 hover:transform hover:scale-[1.02]"
      data-testid={`saved-role-card-${savedRole.id}`}
    >
      <CardHeader className="pb-4 relative">
        {/* Bookmark icon in top right corner */}
        <div className="absolute top-2 right-2">
          <BookmarkCheck className="h-5 w-5 text-primary" />
        </div>
        
        <div className="space-y-2 pr-16">
          <CardTitle className="text-lg line-clamp-2">{role.title}</CardTitle>
          <div className="space-y-1 text-base-content/70 text-sm">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span className="line-clamp-1 text-xs font-medium">{role.company?.name}</span>
            </div>
            {role.company?.industry && Array.isArray(role.company.industry) && (
              <div className="text-xs text-muted-foreground line-clamp-1">
                {role.company.industry.join(', ')}
              </div>
            )}
            {role.company?.size && (
              <div className="text-xs text-muted-foreground">
                {role.company.size.replace('_', ' ').toLowerCase()} employees
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location, Type, Remote badges - similar to search page */}
        <div className="flex flex-wrap gap-2">
          {role.location && (
            <Badge variant="secondary">
              <MapPin className="mr-1 h-3 w-3" />
              <span className="line-clamp-1">{role.location}</span>
            </Badge>
          )}
          {role.type && (
            <Badge variant="secondary">
              <Briefcase className="mr-1 h-3 w-3" />
              {formatJobType(role.type)}
            </Badge>
          )}
          {role.remote && (
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Remote
            </Badge>
          )}
        </div>
        
        {/* Description */}
        {role.description && (
          <p className="text-muted-foreground text-sm line-clamp-3">{role.description}</p>
        )}
        
        {/* Requirements/Skills */}
        {role.requirements && role.requirements.length > 0 && role.requirements[0] !== "" && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {role.requirements.slice(0, 5).map((req, idx) => (
                <Badge key={`${savedRole.id}-req-${idx}`} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
            </div>
            {role.requirements.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{role.requirements.length - 5} more requirements
              </p>
            )}
          </div>
        )}
        
        {/* Saved/Applied Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Saved {new Date(savedRole.createdAt || savedRole.savedAt).toLocaleDateString()}</span>
          {savedRole.appliedAt && (
            <>
              <span>•</span>
              <span>Applied {new Date(savedRole.appliedAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
        
        {/* Application Notes (only show if not the generic External ID note) */}
        {savedRole.applicationNotes && (
          <div className="text-sm">
            <strong>Application Notes:</strong> {savedRole.applicationNotes}
          </div>
        )}
        
        {/* Salary Section */}
        <div className="w-full text-center">
          <div className="text-md font-semibold">{role.salary || 'Salary not specified'}</div>
        </div>
        
        {/* Action Buttons Section - similar to search page */}
        <div className="space-y-3 w-full">
          {/* Top Row: Application and Write to Buttons */}
          <div className="flex justify-between items-center w-full px-2">
            {/* Left: View Job Button */}
            <div className="flex-shrink-0">
              {savedRole.jobPostingUrl ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(savedRole.jobPostingUrl, '_blank')}
                  data-testid={`saved-role-view-job-${savedRole.id}`}
                >
                  View Job
                </Button>
              ) : (
                <Button size="sm" disabled className="text-xs px-3">
                  View Job
                </Button>
              )}
            </div>

            {/* Right: Write to Button */}
            <div className="flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={onWriteTo}
                leftIcon={<PenTool className="h-3 w-3" />}
                title="Get writing assistance"
                data-testid={`saved-role-write-button-${savedRole.id}`}
              >
                Write to
              </Button>
            </div>
          </div>

          {/* Bottom Row: Mark as Applied Button (Full Width) */}
          <div className="w-full px-2">
            <SavedRoleMarkAsAppliedButton
              role={role}
              isApplied={localAppliedState}
              onSuccess={handleMarkAsAppliedSuccess}
              className="w-full"
              data-testid={`saved-role-mark-applied-${savedRole.id}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}