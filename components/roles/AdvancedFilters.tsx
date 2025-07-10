// components/roles/AdvancedFilters.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card'
import { Button } from '@/components/ui-daisy/button'
import { Input } from '@/components/ui-daisy/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui-daisy/badge'
import { Slider } from '@/components/ui/slider'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  Search, 
  MapPin, 
  Briefcase, 
  AlertTriangle, 
  Info, 
  Clock,
  DollarSign,
  Users,
  Building2,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import EndpointSelector from './EndpointSelector'
import type { SearchParameters } from '@/lib/api/rapidapi-cache'
import RapidApiValidator, { type ValidationResult } from '@/lib/api/rapidapi-validator'
import { 
  selectApiUsage, 
  selectUsageWarningLevel, 
  selectCanMakeRequest,
  selectValidationErrors,
  selectValidationWarnings,
  setValidationResults
} from '@/lib/features/rolesSlice'
import type { AppDispatch, RootState } from '@/lib/store'

interface AdvancedFiltersProps {
  onFiltersChange: (filters: SearchParameters) => void
  onSearch: () => void
  loading: boolean
  disabled?: boolean
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  onSearch,
  loading,
  disabled = false
}) => {
  const dispatch = useDispatch<AppDispatch>()
  
  // Redux state
  const apiUsage = useSelector(selectApiUsage)
  const usageWarningLevel = useSelector(selectUsageWarningLevel)
  const canMakeRequest = useSelector(selectCanMakeRequest)
  const validationErrors = useSelector(selectValidationErrors)
  const validationWarnings = useSelector(selectValidationWarnings)

  // Local filter state
  const [filters, setFilters] = useState<SearchParameters>({
    title_filter: '',
    location_filter: '',
    type_filter: '',
    seniority_filter: '',
    description_filter: '',
    remote: '',
    limit: 10,
    offset: 0,
    include_ai: 'false',
    description_type: 'text',
    endpoint: '7d' // Default to 7 days
  })

  // Validation state
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const validator = RapidApiValidator.getInstance()

  // Job type options from documentation
  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'CONTRACTOR', label: 'Contractor' },
    { value: 'INTERN', label: 'Internship' },
    { value: 'TEMPORARY', label: 'Temporary' },
    { value: 'VOLUNTEER', label: 'Volunteer' },
    { value: 'OTHER', label: 'Other' }
  ]

  // Seniority levels from documentation
  const seniorityLevels = [
    'Entry level',
    'Associate', 
    'Mid-Senior level',
    'Director',
    'Executive',
    'Internship',
    'Not Applicable'
  ]

  // AI work arrangement options
  const workArrangements = [
    'On-site',
    'Hybrid',
    'Remote OK',
    'Remote Solely'
  ]

  // Update filters and trigger validation
  const updateFilters = (newFilters: Partial<SearchParameters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Validate filters
    const validationResult = validator.validateSearchParameters(updatedFilters)
    setValidation(validationResult)
    dispatch(setValidationResults(validationResult))
    
    // Call parent callback with normalized filters
    onFiltersChange(validationResult.normalizedParams)
  }

  // Calculate estimated credit consumption
  const estimateCredits = () => {
    const jobs = Math.min(filters.limit || 10, 100)
    const requests = 1
    return { jobs, requests }
  }

  const credits = estimateCredits()

  return (
    <Card className="w-full bg-base-100/60 backdrop-blur-sm border border-base-200" data-testid="advanced-filters-container">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Search Filters</CardTitle>
          <div className="flex items-center gap-2">
            {/* API Usage Indicator */}
            {apiUsage && (
              <Badge 
                variant={usageWarningLevel === 'critical' ? 'destructive' : usageWarningLevel === 'low' ? 'secondary' : 'outline'}
                className="text-xs"
                data-testid="advanced-filters-usage-badge"
              >
                {apiUsage.jobsRemaining} jobs left
              </Badge>
            )}
            {/* Credit Estimate */}
            <Badge variant="outline" className="text-xs" data-testid="advanced-filters-credit-estimate">
              ~{credits.jobs} credits
            </Badge>
          </div>
        </div>
        
        {/* Usage Warning */}
        {usageWarningLevel === 'critical' && (
          <Alert variant="destructive" data-testid="advanced-filters-warning-critical">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              API credits critically low! Consider using cached results.
            </AlertDescription>
          </Alert>
        )}
        {usageWarningLevel === 'low' && (
          <Alert data-testid="advanced-filters-warning-low">
            <Info className="h-4 w-4" />
            <AlertDescription>
              API credits running low. Searches are cached for 1 hour.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Filters */}
        <div className="space-y-4">
          {/* Title Search */}
          <div className="space-y-2">
            <Label htmlFor="title-filter" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Job Title
            </Label>
            <Input
              id="title-filter"
              placeholder='e.g. "Software Engineer" OR "Data Scientist"'
              value={filters.title_filter || ''}
              onChange={(e) => updateFilters({ title_filter: e.target.value })}
              className="bg-base-100/80 backdrop-blur-sm"
              data-testid="advanced-filters-input-title"
            />
            <p className="text-xs text-muted-foreground">
              Use quotes for exact phrases, OR for alternatives, - for exclusion
            </p>
          </div>

          {/* Location Search */}
          <div className="space-y-2">
            <Label htmlFor="location-filter" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location-filter"
              placeholder='e.g. "United States" OR "United Kingdom"'
              value={filters.location_filter || ''}
              onChange={(e) => updateFilters({ location_filter: e.target.value })}
              className="bg-base-100/80 backdrop-blur-sm"
              data-testid="advanced-filters-input-location"
            />
            <p className="text-xs text-muted-foreground">
              Use full location names (no abbreviations). OR operator supported.
            </p>
          </div>

          {/* Job Type Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Type
            </Label>
            <div className="flex flex-wrap gap-2">
              {jobTypes.map((type) => (
                <Badge
                  key={type.value}
                  variant={filters.type_filter?.includes(type.value) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => {
                    const currentTypes = filters.type_filter?.split(',').filter(Boolean) || []
                    const isSelected = currentTypes.includes(type.value)
                    
                    let newTypes: string[]
                    if (isSelected) {
                      newTypes = currentTypes.filter(t => t !== type.value)
                    } else {
                      newTypes = [...currentTypes, type.value]
                    }
                    
                    updateFilters({ type_filter: newTypes.join(',') })
                  }}
                  data-testid={`advanced-filters-badge-job-type-${type.value}`}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Results Limit */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Results Limit
              </Label>
              <Badge variant="outline" className="text-xs" data-testid="advanced-filters-display-limit">
                {filters.limit}
              </Badge>
            </div>
            <Slider
              value={[filters.limit || 10]}
              onValueChange={([value]) => updateFilters({ limit: value })}
              min={1}
              max={25}
              step={1}
              className="w-full"
              data-testid="advanced-filters-slider-limit"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>25 (max for search)</span>
            </div>
          </div>

          {/* Job Freshness Selection - Refactored to use proper DaisyUI components */}
          <EndpointSelector
            value={filters.endpoint || '7d'}
            onValueChange={(endpoint) => updateFilters({ endpoint })}
            disabled={loading || disabled}
          />
        </div>

        <Separator />

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="show-advanced" className="text-sm font-medium">
            Advanced Filters
          </Label>
          <Switch
            id="show-advanced"
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
            data-testid="advanced-filters-toggle-advanced"
          />
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Accordion type="single" collapsible className="w-full">
            {/* Seniority Filter */}
            <AccordionItem value="seniority">
              <AccordionTrigger data-testid="advanced-filters-trigger-seniority">
                <Users className="h-4 w-4 mr-2" />
                Seniority Level
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pt-2">
                  {seniorityLevels.map((level) => (
                    <Badge
                      key={level}
                      variant={filters.seniority_filter?.includes(level) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => {
                        const currentLevels = filters.seniority_filter?.split(',').filter(Boolean) || []
                        const isSelected = currentLevels.includes(level)
                        
                        let newLevels: string[]
                        if (isSelected) {
                          newLevels = currentLevels.filter(l => l !== level)
                        } else {
                          newLevels = [...currentLevels, level]
                        }
                        
                        updateFilters({ seniority_filter: newLevels.join(',') })
                      }}
                      data-testid={`advanced-filters-badge-seniority-${level.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Remote Work */}
            <AccordionItem value="remote">
              <AccordionTrigger data-testid="advanced-filters-trigger-remote">
                <Clock className="h-4 w-4 mr-2" />
                Remote Work
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {/* Basic Remote Filter */}
                  <div className="space-y-2">
                    <Label>Remote Jobs Only</Label>
                    <div className="flex gap-2">
                      <Badge
                        variant={filters.remote === 'true' ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => updateFilters({ remote: filters.remote === 'true' ? '' : 'true' })}
                        data-testid="advanced-filters-badge-remote-true"
                      >
                        Remote Only
                      </Badge>
                      <Badge
                        variant={filters.remote === 'false' ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => updateFilters({ remote: filters.remote === 'false' ? '' : 'false' })}
                        data-testid="advanced-filters-badge-remote-false"
                      >
                        On-site Only
                      </Badge>
                    </div>
                  </div>

                  {/* AI Work Arrangement (Beta) */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Work Arrangement (AI Beta)
                      <Badge variant="secondary" className="text-xs">Beta</Badge>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {workArrangements.map((arrangement) => (
                        <Badge
                          key={arrangement}
                          variant={filters.ai_work_arrangement_filter?.includes(arrangement) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => {
                            const current = filters.ai_work_arrangement_filter?.split(',').filter(Boolean) || []
                            const isSelected = current.includes(arrangement)
                            
                            let newArrangements: string[]
                            if (isSelected) {
                              newArrangements = current.filter(a => a !== arrangement)
                            } else {
                              newArrangements = [...current, arrangement]
                            }
                            
                            updateFilters({ ai_work_arrangement_filter: newArrangements.join(',') })
                          }}
                          data-testid={`advanced-filters-badge-ai-work-${arrangement.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          {arrangement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Company Filters */}
            <AccordionItem value="company">
              <AccordionTrigger data-testid="advanced-filters-trigger-company">
                <Building2 className="h-4 w-4 mr-2" />
                Company Filters
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {/* Agency Filter */}
                  <div className="space-y-2">
                    <Label>Company Type</Label>
                    <div className="flex gap-2">
                      <Badge
                        variant={filters.agency === 'false' ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => updateFilters({ agency: filters.agency === 'false' ? '' : 'false' })}
                        data-testid="advanced-filters-badge-agency-false"
                      >
                        Direct Employers Only
                      </Badge>
                      <Badge
                        variant={filters.agency === 'true' ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => updateFilters({ agency: filters.agency === 'true' ? '' : 'true' })}
                        data-testid="advanced-filters-badge-agency-true"
                      >
                        Agencies Only
                      </Badge>
                    </div>
                  </div>

                  {/* Company Size */}
                  <div className="space-y-3">
                    <Label>Company Size (Employees)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="employees-gte" className="text-xs">Minimum</Label>
                        <Input
                          id="employees-gte"
                          type="number"
                          placeholder="e.g. 50"
                          value={filters.employees_gte || ''}
                          onChange={(e) => updateFilters({ employees_gte: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="bg-base-100/80 backdrop-blur-sm"
                          data-testid="advanced-filters-input-employees-gte"
                        />
                      </div>
                      <div>
                        <Label htmlFor="employees-lte" className="text-xs">Maximum</Label>
                        <Input
                          id="employees-lte"
                          type="number"
                          placeholder="e.g. 1000"
                          value={filters.employees_lte || ''}
                          onChange={(e) => updateFilters({ employees_lte: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="bg-base-100/80 backdrop-blur-sm"
                          data-testid="advanced-filters-input-employees-lte"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Easy Apply Filter */}
                  <div className="space-y-2">
                    <Label>Application Method</Label>
                    <div className="flex gap-2">
                      <Badge
                        variant={filters.directapply === 'true' ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => updateFilters({ directapply: filters.directapply === 'true' ? '' : 'true' })}
                        data-testid="advanced-filters-badge-easy-apply-true"
                      >
                        Easy Apply Only
                      </Badge>
                      <Badge
                        variant={filters.directapply === 'false' ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => updateFilters({ directapply: filters.directapply === 'false' ? '' : 'false' })}
                        data-testid="advanced-filters-badge-easy-apply-false"
                      >
                        External Only
                      </Badge>
                    </div>
                  </div>

                  {/* Company Description Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="company-description-filter">Company Description</Label>
                    <Input
                      id="company-description-filter"
                      placeholder='e.g. "artificial intelligence" OR "sustainable technology"'
                      value={filters.organization_description_filter || ''}
                      onChange={(e) => updateFilters({ organization_description_filter: e.target.value })}
                      className="bg-base-100/80 backdrop-blur-sm"
                      data-testid="advanced-filters-input-company-description"
                    />
                    <p className="text-xs text-muted-foreground">
                      Search company LinkedIn descriptions. Use quotes for exact phrases, OR for alternatives.
                    </p>
                  </div>

                  {/* Company Specialties Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="company-specialties-filter">Company Specialties</Label>
                    <Input
                      id="company-specialties-filter"
                      placeholder='e.g. "Machine Learning, Cloud Computing, Mobile Development"'
                      value={filters.organization_specialties_filter || ''}
                      onChange={(e) => updateFilters({ organization_specialties_filter: e.target.value })}
                      className="bg-base-100/80 backdrop-blur-sm"
                      data-testid="advanced-filters-input-company-specialties"
                    />
                    <p className="text-xs text-muted-foreground">
                      Search company specialties and keywords. Separate multiple terms with commas.
                    </p>
                  </div>

                  {/* Company Name Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="company-name-filter">Specific Companies</Label>
                    <Input
                      id="company-name-filter"
                      placeholder='e.g. "google, microsoft, apple"'
                      value={filters.organization_slug_filter || ''}
                      onChange={(e) => updateFilters({ organization_slug_filter: e.target.value })}
                      className="bg-base-100/80 backdrop-blur-sm"
                      data-testid="advanced-filters-input-company-name"
                    />
                    <p className="text-xs text-muted-foreground">
                      LinkedIn company names (lowercase, comma-separated). Examples: google, microsoft, tesla
                    </p>
                  </div>

                  {/* Industry Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="industry-filter">Industry</Label>
                    <Input
                      id="industry-filter"
                      placeholder='e.g. "Computer Software, Information Technology and Services"'
                      value={filters.industry_filter || ''}
                      onChange={(e) => updateFilters({ industry_filter: e.target.value })}
                      className="bg-base-100/80 backdrop-blur-sm"
                      data-testid="advanced-filters-input-industry"
                    />
                    <p className="text-xs text-muted-foreground">
                      LinkedIn industry categories. Use exact industry names, comma-separated.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* AI Features */}
            <AccordionItem value="ai-features">
              <AccordionTrigger data-testid="advanced-filters-trigger-ai">
                <Zap className="h-4 w-4 mr-2" />
                AI Features (Beta)
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {/* Include AI Data */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-ai" className="flex items-center gap-2">
                      Include AI Insights
                      <Badge variant="secondary" className="text-xs">Beta</Badge>
                    </Label>
                    <Switch
                      id="include-ai"
                      checked={filters.include_ai === 'true'}
                      onCheckedChange={(checked) => updateFilters({ include_ai: checked ? 'true' : 'false' })}
                      data-testid="advanced-filters-switch-include-ai"
                    />
                  </div>

                  {/* Salary Filter */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-salary" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Jobs with Salary Only
                    </Label>
                    <Switch
                      id="has-salary"
                      checked={filters.ai_has_salary === 'true'}
                      onCheckedChange={(checked) => updateFilters({ ai_has_salary: checked ? 'true' : undefined })}
                      data-testid="advanced-filters-switch-has-salary"
                    />
                  </div>

                  {/* Visa Sponsorship */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="visa-sponsorship">Visa Sponsorship Available</Label>
                    <Switch
                      id="visa-sponsorship"
                      checked={filters.ai_visa_sponsorship_filter === 'true'}
                      onCheckedChange={(checked) => updateFilters({ ai_visa_sponsorship_filter: checked ? 'true' : undefined })}
                      data-testid="advanced-filters-switch-visa-sponsorship"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <Separator />

        {/* Validation Results */}
        {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div className="space-y-2">
            {validation.errors.map((error, index) => (
              <Alert key={`error-${index}`} variant="destructive" data-testid={`advanced-filters-error-${index}`}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ))}
            {validation.warnings.map((warning, index) => (
              <Alert key={`warning-${index}`} data-testid={`advanced-filters-warning-${index}`}>
                <Info className="h-4 w-4" />
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Search Button */}
        <Button
          onClick={onSearch}
          disabled={!canMakeRequest || loading || disabled || (validation && !validation.valid)}
          className="w-full"
          size="lg"
          data-testid="advanced-filters-button-search"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search Jobs {!canMakeRequest && '(Rate Limited)'}
            </>
          )}
        </Button>

        {/* Search Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Results are cached for 1 hour to optimize API usage</p>
          {!canMakeRequest && (
            <p className="text-warning">Rate limited - please wait before next search</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AdvancedFilters