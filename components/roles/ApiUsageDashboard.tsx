// components/roles/ApiUsageDashboard.tsx
"use client"

import React from 'react'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card'
import { Badge } from '@/components/ui-daisy/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui-daisy/button'
import { 
  Activity, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  RefreshCw,
  History
} from 'lucide-react'
import { 
  selectApiUsage, 
  selectUsageWarningLevel, 
  selectSearchHistory,
  clearCache
} from '@/lib/features/rolesSlice'
import type { RootState } from '@/lib/store'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/lib/store'

interface ApiUsageDashboardProps {
  className?: string
}

const ApiUsageDashboard: React.FC<ApiUsageDashboardProps> = ({ className = '' }) => {
  const dispatch = useDispatch<AppDispatch>()
  const apiUsage = useSelector(selectApiUsage)
  const usageWarningLevel = useSelector(selectUsageWarningLevel)
  const searchHistory = useSelector(selectSearchHistory)

  // Calculate usage percentages
  const jobsUsagePercentage = apiUsage ? 
    ((apiUsage.jobsLimit - apiUsage.jobsRemaining) / apiUsage.jobsLimit) * 100 : 0
  
  const requestsUsagePercentage = apiUsage ? 
    ((apiUsage.requestsLimit - apiUsage.requestsRemaining) / apiUsage.requestsLimit) * 100 : 0

  // Calculate time until reset
  const timeUntilReset = apiUsage ? Math.round(apiUsage.jobsReset / 3600) : 0

  // Calculate recent search statistics
  const recentSearches = searchHistory.slice(0, 10)
  const cachedSearches = recentSearches.filter(search => search.cached).length
  const totalResults = recentSearches.reduce((sum, search) => sum + search.resultCount, 0)
  const averageResults = recentSearches.length > 0 ? Math.round(totalResults / recentSearches.length) : 0

  const handleClearCache = () => {
    dispatch(clearCache())
  }

  if (!apiUsage) {
    return (
      <Card className={`bg-base-100/60 backdrop-blur-sm border border-base-200 ${className}`} data-testid="api-usage-dashboard-no-data">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No API usage data available</p>
            <p className="text-sm">Make a search to see usage statistics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-base-100/60 backdrop-blur-sm border border-base-200 ${className}`} data-testid="api-usage-dashboard-container">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Usage Monitor
          </CardTitle>
          <Badge 
            variant={
              usageWarningLevel === 'critical' ? 'destructive' : 
              usageWarningLevel === 'low' ? 'secondary' : 
              'outline'
            }
            data-testid="api-usage-dashboard-status-badge"
          >
            {usageWarningLevel === 'critical' ? 'Critical' :
             usageWarningLevel === 'low' ? 'Low' : 'Healthy'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Credit Usage Overview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Credit Usage
          </h3>
          
          {/* Jobs Credits */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Job Credits</span>
              <span className="text-sm font-mono" data-testid="api-usage-dashboard-jobs-remaining">
                {apiUsage.jobsRemaining.toLocaleString()} / {apiUsage.jobsLimit.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={jobsUsagePercentage} 
              className="h-2"
              data-testid="api-usage-dashboard-jobs-progress"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(jobsUsagePercentage)}% used</span>
              <span>{apiUsage.jobsRemaining.toLocaleString()} remaining</span>
            </div>
          </div>

          {/* Request Credits */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Request Credits</span>
              <span className="text-sm font-mono" data-testid="api-usage-dashboard-requests-remaining">
                {apiUsage.requestsRemaining.toLocaleString()} / {apiUsage.requestsLimit.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={requestsUsagePercentage} 
              className="h-2"
              data-testid="api-usage-dashboard-requests-progress"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(requestsUsagePercentage)}% used</span>
              <span>{apiUsage.requestsRemaining.toLocaleString()} remaining</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Reset Information */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reset Schedule
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Credits reset in:</span>
            <Badge variant="outline" data-testid="api-usage-dashboard-reset-time">
              ~{timeUntilReset} hours
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Search Statistics */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Search Statistics
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold" data-testid="api-usage-dashboard-recent-searches">
                {recentSearches.length}
              </div>
              <div className="text-xs text-muted-foreground">Recent Searches</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" data-testid="api-usage-dashboard-cached-searches">
                {cachedSearches}
              </div>
              <div className="text-xs text-muted-foreground">Cached Results</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold" data-testid="api-usage-dashboard-average-results">
                {averageResults}
              </div>
              <div className="text-xs text-muted-foreground">Avg Results</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600" data-testid="api-usage-dashboard-cache-hit-rate">
                {recentSearches.length > 0 ? Math.round((cachedSearches / recentSearches.length) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">Cache Hit Rate</div>
            </div>
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Searches
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {recentSearches.map((search, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 rounded bg-base-200/50 text-xs"
                    data-testid={`api-usage-dashboard-search-history-${index}`}
                  >
                    <div className="flex items-center gap-2">
                      {search.cached ? (
                        <CheckCircle className="h-3 w-3 text-green-500" title="Cached result" />
                      ) : (
                        <Zap className="h-3 w-3 text-blue-500" title="API call" />
                      )}
                      <span className="truncate max-w-[120px]">
                        {search.params.title_filter || search.params.location_filter || 'Search'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {search.resultCount} results
                      </Badge>
                      <span className="text-muted-foreground">
                        {new Date(search.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Cache Management */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cache Management
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Cached responses save API credits and improve performance
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="flex items-center gap-2"
              data-testid="api-usage-dashboard-button-clear-cache"
            >
              <RefreshCw className="h-3 w-3" />
              Clear Cache
            </Button>
          </div>
        </div>

        {/* Warning Messages */}
        {usageWarningLevel === 'critical' && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Critical Usage Level</span>
            </div>
            <p className="text-xs text-destructive/80 mt-1">
              API credits are critically low. Consider relying on cached results or reducing search frequency.
            </p>
          </div>
        )}
        
        {usageWarningLevel === 'low' && (
          <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="flex items-center gap-2 text-secondary-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Low Usage Level</span>
            </div>
            <p className="text-xs text-secondary-foreground/80 mt-1">
              API credits are running low. Cached results will be prioritized.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ApiUsageDashboard