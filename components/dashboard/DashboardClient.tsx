'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
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

  console.log('🏠 [DashboardClient] Component mounted');

  const handleRetry = () => {
    dispatch(clearDashboardError());
    dispatch(fetchDashboardData());
  };

  useEffect(() => {
    if (!dashboardData) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, dashboardData]);

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
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${className}`} data-testid="dashboard-client">
      
      {/* Left Column - Onboarding Roadmap (50%) */}
      <div className="space-y-6">
        <Card 
          variant="transparent" 
          className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
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
          className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
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
          className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
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
            className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
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