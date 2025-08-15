'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { ArrowRight, AlertCircle, RefreshCw, Coins, BookOpen, Search, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';
import { OnboardingRoadmap } from './OnboardingRoadmap';
import { DashboardStats } from './DashboardStats';
import { RecentBadges } from './RecentBadges';
// import { DailyStreak } from './DailyStreak'; // Commented out for UI simplification
import { PointsBalance } from './PointsBalance';
import { LevelProgressBar } from '@/components/gamification/LevelProgressBar';
import { 
  fetchDashboardData, 
  selectDashboardData, 
  selectDashboardLoading, 
  selectDashboardError,
  selectProfileData,
  selectRoadmapProgress,
  selectActivityStats,
  selectStreakData,
  selectPointsData,
  selectRecentBadges,
  selectProfileCompleteness,
  clearDashboardError
} from '@/lib/features/dashboardSlice';
import { AppDispatch } from '@/lib/store';

interface DashboardData {
  profile: UserGamificationProfile;
  profileCompleteness: {
    score: number;
    sections: Array<{ name: string; score: number }>;
  };
  roadmapProgress: {
    milestones: Array<{
      id: string;
      title: string;
      isCompleted: boolean;
      completedAt: Date | null;
    }>;
    completedCount: number;
    progress: number;
  };
  activityStats: {
    cvsAnalyzed: number;
    rolesSearched: number;
    applicationsSubmitted: number;
    coverLettersGenerated: number;
    weeklyActivity: Array<{ day: string; activities: number }>;
    monthlyGoal: {
      target: number;
      current: number;
      label: string;
    };
  };
  streakData: {
    currentStreak: number;
    bestStreak: number;
    lastActivityDate: Date | null;
    isStreakActive: boolean;
    nextMilestone: {
      target: number;
      reward: string;
      daysLeft: number;
    } | null;
  };
  pointsData: {
    available: number;
    monthly: number;
    used: number;
    earned: number;
    resetDate: Date | null;
    subscriptionTier: string;
    efficiency: number;
    transactions: any[];
  };
  recentBadges: any[];
  dashboardMetadata: {
    lastUpdated: string;
    dataVersion: string;
  };
}

interface DashboardClientProps {
  className?: string;
}

export function DashboardClient({ className = '' }: DashboardClientProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Use centralized Redux state
  const dashboardData = useSelector(selectDashboardData);
  const profileData = useSelector(selectProfileData);
  const roadmapProgress = useSelector(selectRoadmapProgress);
  const activityStats = useSelector(selectActivityStats);
  const streakData = useSelector(selectStreakData);
  const pointsData = useSelector(selectPointsData);
  const recentBadges = useSelector(selectRecentBadges);
  const profileCompleteness = useSelector(selectProfileCompleteness);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  // MVP Beta Points State
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [pointsLoading, setPointsLoading] = useState<boolean>(true);
  const isMvpBetaEnabled = process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true';

  console.log('🏠 [DashboardClient] Component mounted');

  const handleRetry = () => {
    dispatch(clearDashboardError());
    dispatch(fetchDashboardData());
  };

  // Function to fetch points balance for MVP Beta
  const fetchPointsBalance = useCallback(async () => {
    if (!isMvpBetaEnabled) return;
    
    setPointsLoading(true);
    try {
      const response = await fetch('/api/gamification/points');
      if (response.ok) {
        const data = await response.json();
        setPointsBalance(data.balance?.available || 0);
      }
    } catch (error) {
      console.error('Failed to fetch points balance:', error);
    } finally {
      setPointsLoading(false);
    }
  }, [isMvpBetaEnabled]);

  useEffect(() => {
    if (!dashboardData) {
      dispatch(fetchDashboardData());
    }
    
    // Fetch points balance for MVP Beta
    if (isMvpBetaEnabled) {
      fetchPointsBalance();
    }
  }, [dispatch, dashboardData, fetchPointsBalance, isMvpBetaEnabled]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12" data-testid="dashboard-error">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-base-content mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-base-content/70 mb-4">{error}</p>
        <Button 
          onClick={handleRetry} 
          variant="outline"
          data-testid="dashboard-retry-button"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12" data-testid="dashboard-no-data">
        <p className="text-base-content/70">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`} data-testid="dashboard-client">
      
      {/* MVP Beta Dashboard */}
      {isMvpBetaEnabled && (
        <Card variant="elevated-interactive" animated className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    TechRec Beta Dashboard
                    <Badge variant="secondary" className="text-xs">BETA</Badge>
                  </CardTitle>
                  <p className="text-base-content/70">
                    Welcome to the TechRec beta! Use your points to search for jobs and test our features.
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Points Balance */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Coins className={`h-5 w-5 ${pointsBalance < 50 ? 'text-warning' : 'text-success'}`} />
                  <div>
                    <p className="text-sm font-medium">Beta Points Balance</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-2xl font-bold ${
                        pointsBalance < 50 ? 'text-warning' : 
                        pointsBalance < 10 ? 'text-error' : 'text-success'
                      }`}>
                        {pointsLoading ? '...' : pointsBalance}
                      </p>
                      {!pointsLoading && pointsBalance < 50 && (
                        <Badge variant={pointsBalance < 10 ? 'destructive' : 'warning'} className="text-xs">
                          {pointsBalance < 10 ? 'Low' : 'Running Low'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-base-200/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-base-content/60" />
                    <span className="text-sm font-medium text-base-content/80">How it works</span>
                  </div>
                  <ul className="text-xs text-base-content/60 space-y-1">
                    <li>• 1 point per job search result</li>
                    <li>• No points used if no results found</li>
                    <li>• Contact support for more points</li>
                  </ul>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="font-medium text-base-content/80">Quick Actions</h3>
                
                <Link href="/developer/roles/search">
                  <Button 
                    variant="gradient" 
                    size="lg"
                    className="w-full justify-between"
                    leftIcon={<Search className="h-4 w-4" />}
                  >
                    <span>Search Jobs</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/developer/cv-management">
                  <Button 
                    variant="outline" 
                    size="md"
                    className="w-full justify-between"
                  >
                    <span>Upload CV</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              {/* How-to Guides */}
              <div className="space-y-3">
                <h3 className="font-medium text-base-content/80">Need Help?</h3>
                
                <Link href="/developer/how-to/app">
                  <Button 
                    variant="ghost" 
                    size="md"
                    className="w-full justify-between"
                    leftIcon={<BookOpen className="h-4 w-4" />}
                  >
                    <span>How to Use TechRec</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/developer/how-to/job-search">
                  <Button 
                    variant="ghost" 
                    size="md"
                    className="w-full justify-between"
                    leftIcon={<BookOpen className="h-4 w-4" />}
                  >
                    <span>How to Get a Job</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Dashboard - Hidden in MVP mode */}
      {!isMvpBetaEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Onboarding Roadmap (50%) */}
        <div className="space-y-6">
          <Card 
            variant="transparent" 
            data-testid="dashboard-roadmap-card"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🗺️</span>
                    Your Journey to Success
                  </CardTitle>
                  <p className="text-base-content/70">
                    Complete these milestones to unlock your full potential on TechRec
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <OnboardingRoadmap 
                roadmapData={roadmapProgress}
                profileScore={profileCompleteness?.score || 0}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Gamification Stats (50%) */}
        <div className="space-y-6">
          
          {/* Level Progress */}
          {profileData && (
            <LevelProgressBar 
              userProfile={profileData}
              showDetails={false}
              animated={true}
              className="w-full"
            />
          )}

          {/* Points Balance */}
          <PointsBalance pointsData={pointsData} />

          {/* Daily Streak - Commented out for UI simplification */}
          {/* <DailyStreak streakData={streakData} /> */}

          {/* Recent Badges */}
          <RecentBadges badges={recentBadges} />

          {/* Quick Actions */}
          <Card 
            variant="transparent" 
            data-testid="dashboard-quick-actions"
          >
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/developer/cv-management">
                <Button 
                  variant="default" 
                  size="lg"
                  className="w-full justify-between"
                  data-testid="dashboard-action-cv-management"
                >
                  <span>Manage CV</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/developer/roles/search">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full justify-between"
                  data-testid="dashboard-action-search-roles"
                >
                  <span>Search Roles</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/developer/writing-help">
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="w-full justify-between"
                  data-testid="dashboard-action-writing-help"
                >
                  <span>Writing Help</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dashboard Stats */}
          <DashboardStats activityStats={activityStats} />
        </div>
        
        </div>
      )}
    </div>
  );
}

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="dashboard-client-skeleton">
      {/* Left Column - Roadmap Skeleton */}
      <div className="space-y-6">
        <Card 
          variant="transparent" 
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-base-300/50 rounded animate-pulse" />
              <div className="h-6 bg-base-300/50 rounded animate-pulse w-48" />
            </div>
            <div className="h-4 bg-base-300/30 rounded animate-pulse w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-base-300/50 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-base-300/50 rounded animate-pulse" />
                    <div className="h-3 bg-base-300/30 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Stats Skeleton */}
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card 
            key={i}
            variant="transparent" 
            >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-base-300/50 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-base-300/50 rounded animate-pulse" />
                  <div className="h-3 bg-base-300/30 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}