'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { 
  Activity,
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Database,
  Globe,
  Loader2,
  RefreshCw,
  TrendingUp,
  Zap,
  Settings
} from 'lucide-react';

interface UsageData {
  jobsLimit: number;
  jobsRemaining: number;
  jobsUsed: number;
  jobsUsedPercentage: number;
  requestsLimit: number;
  requestsRemaining: number;
  requestsUsed: number;
  requestsUsedPercentage: number;
  resetInSeconds: number;
  resetInHours: number;
  resetTime: string;
  warningLevel: 'none' | 'low' | 'critical';
  isLowUsage: boolean;
  isCriticalUsage: boolean;
  isHealthy: boolean;
}

interface CacheData {
  size: number;
  maxSize: number;
  utilizationPercentage: number;
  entries: Array<{
    hash: string;
    ageInMinutes: number;
    isExpired: boolean;
  }>;
}

interface EnvironmentConfig {
  isDevelopment: boolean;
  hasApiKey: boolean;
  apiKeyLength: number;
  debugMode: boolean;
  mvpBetaEnabled: boolean;
  pointsPerResult: number;
  defaultAgency: string;
  defaultIncludeAi: string;
  defaultDescriptionType: string;
}

interface RapidApiUsageData {
  usage: UsageData | null;
  cache: CacheData;
  environment: EnvironmentConfig;
  warningLevel: 'none' | 'low' | 'critical';
  status: {
    hasUsageData: boolean;
    cacheActive: boolean;
    apiConfigured: boolean;
    message: string;
    debugInfo?: string | null;
  };
}

export function RapidApiUsageTracker() {
  const [data, setData] = useState<RapidApiUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/rapidapi/usage');
      const result = await response.json();
      
      if (response.ok) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch usage data');
      }
    } catch (err) {
      setError('Error loading RapidAPI usage data');
      console.error('Error fetching RapidAPI usage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  const formatResetTime = (resetTime: string) => {
    return new Date(resetTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsageColor = (percentage: number, warningLevel: string) => {
    if (warningLevel === 'critical' || percentage >= 90) return 'text-red-600';
    if (warningLevel === 'low' || percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getUsageBadgeVariant = (warningLevel: string) => {
    switch (warningLevel) {
      case 'critical': return 'destructive';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
          <span className="text-base-content/70">Loading RapidAPI usage data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <div className="font-medium text-red-700">Error Loading Usage Data</div>
              <div className="text-sm text-red-600">{error}</div>
            </div>
          </div>
          <Button 
            onClick={fetchUsageData}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              RapidAPI Usage Tracking
            </div>
            <div className="flex items-center gap-2">
              {data.environment.debugMode && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-300">
                  <Settings className="w-3 h-3" />
                  DEBUG MODE
                </Badge>
              )}
              <Badge 
                variant={getUsageBadgeVariant(data.warningLevel)}
                className="flex items-center gap-1"
              >
                {data.status.hasUsageData ? (
                  data.warningLevel === 'critical' ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : data.warningLevel === 'low' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {data.warningLevel === 'critical' ? 'Critical' : 
                 data.warningLevel === 'low' ? 'Warning' : 
                 data.status.hasUsageData ? 'Healthy' : 'No Data'}
              </Badge>
              <Button 
                onClick={fetchUsageData}
                variant="outline" 
                size="sm"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <div className="text-sm text-base-content/70">
            {data.status.message}
            {data.status.debugInfo && (
              <div className="text-xs text-orange-600 mt-1 font-mono">
                {data.status.debugInfo}
              </div>
            )}
            {lastUpdated && (
              <span className="ml-2">• Last updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Usage Statistics */}
      {data.usage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jobs Usage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-4 h-4" />
                Job Results Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-2xl font-bold">
                      <span className={getUsageColor(data.usage.jobsUsedPercentage, data.warningLevel)}>
                        {data.usage.jobsRemaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-base-content/70">
                      Jobs remaining
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {data.usage.jobsUsedPercentage}%
                    </div>
                    <div className="text-xs text-base-content/60">
                      used
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-base-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      data.usage.jobsUsedPercentage >= 90 ? 'bg-red-500' :
                      data.usage.jobsUsedPercentage >= 75 ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${data.usage.jobsUsedPercentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-base-content/60">
                  {data.usage.jobsUsed.toLocaleString()} of {data.usage.jobsLimit.toLocaleString()} jobs used
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Usage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="w-4 h-4" />
                API Requests Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-2xl font-bold">
                      <span className={getUsageColor(data.usage.requestsUsedPercentage, data.warningLevel)}>
                        {data.usage.requestsRemaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-base-content/70">
                      Requests remaining
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {data.usage.requestsUsedPercentage}%
                    </div>
                    <div className="text-xs text-base-content/60">
                      used
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-base-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      data.usage.requestsUsedPercentage >= 90 ? 'bg-red-500' :
                      data.usage.requestsUsedPercentage >= 75 ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${data.usage.requestsUsedPercentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-base-content/60">
                  {data.usage.requestsUsed.toLocaleString()} of {data.usage.requestsLimit.toLocaleString()} requests used
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-orange-200 bg-orange-50/10">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto text-orange-500 mb-4" />
              <div className="font-medium text-orange-800">No Usage Data Available</div>
              <div className="text-sm text-orange-600 mt-1">
                Make a job search request to populate usage statistics
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cache Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="w-4 h-4" />
              Cache Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-base-content/70">Cache Size</span>
                <span className="font-medium">
                  {data.cache.size} / {data.cache.maxSize}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-base-content/70">Utilization</span>
                <span className="font-medium">{data.cache.utilizationPercentage}%</span>
              </div>
              <div className="w-full bg-base-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.cache.utilizationPercentage}%` }}
                />
              </div>
              <div className="text-xs text-base-content/60">
                {data.cache.entries.filter(e => !e.isExpired).length} active entries, {data.cache.entries.filter(e => e.isExpired).length} expired
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset Information & Environment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="w-4 h-4" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.usage && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-base-content/70">Limits Reset</span>
                    <span className="font-medium">
                      {data.usage.resetInHours}h
                    </span>
                  </div>
                  <div className="text-xs text-base-content/60">
                    Next reset: {formatResetTime(data.usage.resetTime)}
                  </div>
                  <div className="border-t pt-3" />
                </>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-base-content/70">Environment</span>
                <Badge variant={data.environment.isDevelopment ? 'secondary' : 'default'}>
                  {data.environment.isDevelopment ? 'Development' : 'Production'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-base-content/70">API Configured</span>
                <Badge variant={data.environment.hasApiKey ? 'default' : 'destructive'}>
                  {data.environment.hasApiKey ? 'Yes' : 'No'}
                </Badge>
              </div>
              {data.environment.debugMode && (
                <div className="flex justify-between">
                  <span className="text-sm text-base-content/70">Debug Mode</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
                    Active (No API calls)
                  </Badge>
                </div>
              )}
              {data.environment.mvpBetaEnabled && (
                <div className="flex justify-between">
                  <span className="text-sm text-base-content/70">MVP Beta Mode</span>
                  <Badge variant="secondary">
                    {data.environment.pointsPerResult}pt/result
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}