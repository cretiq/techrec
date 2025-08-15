'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { ArrowRight, AlertCircle, RefreshCw, Coins, BookOpen, Search, Sparkles, Info, Upload, CheckCircle, FileText, Zap, Send, ExternalLink } from 'lucide-react';
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

  // CV Upload Status State
  const [cvUploadStatus, setCvUploadStatus] = useState<{
    hasCV: boolean;
    cvCount: number;
    loading: boolean;
  }>({
    hasCV: false,
    cvCount: 0,
    loading: true
  });

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

  // Function to fetch CV upload status
  const fetchCvUploadStatus = useCallback(async () => {
    setCvUploadStatus(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch('/api/developer/me/profile');
      if (response.ok) {
        const data = await response.json();
        const cvCount = data.cvCount || 0;
        setCvUploadStatus({
          hasCV: cvCount > 0,
          cvCount,
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch CV upload status:', error);
      setCvUploadStatus(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (!dashboardData) {
      dispatch(fetchDashboardData());
    }
    
    // Fetch points balance for MVP Beta
    if (isMvpBetaEnabled) {
      fetchPointsBalance();
    }
    
    // Fetch CV upload status
    fetchCvUploadStatus();
  }, [dispatch, dashboardData, fetchPointsBalance, fetchCvUploadStatus, isMvpBetaEnabled]);

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
        <Card variant="elevated-interactive" animated className="mb-8 max-w-6xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-3xl font-light font-bold text-base-content/60">
                    Dashboard
                  </CardTitle>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Points Balance */}
              <div className="flex-1 flex items-center justify-center">
                <div className="stats bg-base-200/50 shadow">
                  <div className="stat place-items-center">
                    <div className="stat-figure text-secondary">
                      <Coins className={`h-8 w-8 ${pointsBalance < 50 ? 'text-warning' : 'text-success'}`} />
                    </div>
                    <div className="stat-title text-lg">Points Balance</div>
                    <div className={`stat-value text-4xl ${
                      pointsBalance < 50 ? 'text-warning' : 
                      pointsBalance < 10 ? 'text-error' : 'text-success'
                    }`}>
                      {pointsLoading ? '...' : pointsBalance}
                    </div>
                    <div className="stat-desc">
                      {!pointsLoading && pointsBalance < 50 && (
                        <span className={pointsBalance < 10 ? 'text-error' : 'text-warning'}>
                          {pointsBalance < 10 ? 'Low balance' : 'Running low'}
                        </span>
                      )}
                      {!pointsLoading && pointsBalance >= 50 && (
                        <span className="text-success">Good balance</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="divider lg:divider-horizontal"></div>
              
              {/* Timeline Section */}
              <div className="flex-1 space-y-4">
                <div className="bg-base-200/50 p-4 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary/60" />
                    <span className="text-base font-semibold text-base-content/50">Follow the steps below to get started</span>
                  </div>
                  
                  {/* DaisyUI Vertical Timeline */}
                  <ul className="timeline timeline-vertical">
                    
                    {/* Step 1: Upload CV (Top) */}
                    <li>
                      <div className="timeline-start timeline-box p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Upload className={`h-6 w-6 ${cvUploadStatus.hasCV ? 'text-success' : 'text-accent'}`} />
                          <span className="font-medium text-lg">Upload CV</span>
                          {cvUploadStatus.hasCV && <CheckCircle className="h-5 w-5 text-success" />}
                        </div>
                        <p className="text-base text-base-content/70 mb-3">Upload your resume to get started</p>
                        {!cvUploadStatus.hasCV && (
                          <Link href="/developer/cv-management">
                            <Button size="default" variant="accent" className="w-full">
                              Upload Now
                            </Button>
                          </Link>
                        )}
                      </div>
                      <div className="timeline-middle">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg ${cvUploadStatus.hasCV ? 'bg-success' : 'bg-accent'}`}>
                          1
                        </div>
                      </div>
                      <hr className={cvUploadStatus.hasCV ? 'bg-success' : 'bg-accent'} />
                    </li>

                    {/* Step 2: Improve CV (Bottom) */}
                    <li>
                      <hr className="bg-warning" />
                      <div className="timeline-middle">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg bg-warning">
                          2
                        </div>
                      </div>
                      <div className="timeline-end timeline-box p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Zap className="h-6 w-6 text-warning" />
                          <span className="font-medium text-lg">Improve CV</span>
                        </div>
                        <p className="text-base text-base-content/70 mb-3">Follow feedback to optimize your resume</p>
                        {cvUploadStatus.hasCV && (
                          <Link href="/developer/cv-management">
                            <Button size="default" variant="outline" className="w-full">
                              View Feedback
                            </Button>
                          </Link>
                        )}
                      </div>
                      <hr className="bg-warning" />
                    </li>

                    {/* Step 3: Reupload (Top) */}
                    <li>
                      <hr className="bg-info" />
                      <div className="timeline-start timeline-box p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <RefreshCw className="h-6 w-6 text-info" />
                          <span className="font-medium text-lg">Reupload</span>
                        </div>
                        <p className="text-base text-base-content/70">Upload your improved CV version</p>
                      </div>
                      <div className="timeline-middle">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg bg-info">
                          3
                        </div>
                      </div>
                      <hr className="bg-info" />
                    </li>

                    {/* Step 4: Search Jobs (Bottom) */}
                    <li>
                      <hr className="bg-primary" />
                      <div className="timeline-middle">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg bg-primary">
                          4
                        </div>
                      </div>
                      <div className="timeline-end timeline-box p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Search className="h-6 w-6 text-primary" />
                          <span className="font-medium text-lg">Search Jobs</span>
                        </div>
                        <p className="text-base text-base-content/70 mb-2">Find roles using your {pointsLoading ? '...' : pointsBalance} points</p>
                        <div className="text-sm text-base-content/60 mb-3">1 search result = 1 point</div>
                        <Link href="/developer/roles/search">
                          <Button size="default" variant="primary" className="w-full">
                            Search Now
                          </Button>
                        </Link>
                      </div>
                      <hr className="bg-primary" />
                    </li>

                    {/* Step 5: Cover Letters (Top) */}
                    <li>
                      <hr className="bg-secondary" />
                      <div className="timeline-start timeline-box p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="h-6 w-6 text-secondary" />
                          <span className="font-medium text-lg">Cover Letters</span>
                        </div>
                        <p className="text-base text-base-content/70 mb-3">AI writes personalized cover letters</p>
                        <Link href="/developer/writing-help">
                          <Button size="default" variant="secondary" className="w-full">
                            Create Letters
                          </Button>
                        </Link>
                      </div>
                      <div className="timeline-middle">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg bg-secondary">
                          5
                        </div>
                      </div>
                      <hr className="bg-secondary" />
                    </li>

                    {/* Step 6: Apply (Bottom) */}
                    <li>
                      <hr className="bg-success" />
                      <div className="timeline-middle">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg bg-success">
                          6
                        </div>
                      </div>
                      <div className="timeline-end timeline-box p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <ExternalLink className="h-6 w-6 text-success" />
                          <span className="font-medium text-lg">Apply</span>
                        </div>
                        <p className="text-base text-base-content/70">Apply on company websites with your materials</p>
                      </div>
                    </li>
                    
                  </ul>
                </div>
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
            variant="elevated-interactive" 
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
                  variant={cvUploadStatus.hasCV ? "default" : "gradient"} 
                  size="lg"
                  className={`w-full justify-between ${!cvUploadStatus.hasCV ? 'ring-2 ring-primary/50 shadow-lg' : ''}`}
                  data-testid="dashboard-action-cv-management"
                  leftIcon={cvUploadStatus.hasCV ? <CheckCircle className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                >
                  <div className="flex items-center gap-2">
                    <span>{cvUploadStatus.hasCV ? 'Manage CV' : 'Upload CV'}</span>
                    {cvUploadStatus.hasCV && cvUploadStatus.cvCount > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {cvUploadStatus.cvCount}
                      </Badge>
                    )}
                    {!cvUploadStatus.hasCV && (
                      <Badge variant="warning" className="text-xs animate-pulse">
                        Required
                      </Badge>
                    )}
                  </div>
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