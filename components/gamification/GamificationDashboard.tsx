'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Flame, 
  Calendar,
  Users,
  Star,
  ChevronRight,
  Gift
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Button } from '@/components/ui-daisy/button';
import { Progress } from '@/components/ui/progress';

import { LevelProgressBar, CompactLevelProgress } from './LevelProgressBar';
import { AppDispatch } from '@/lib/store';
import {
  selectGamificationProfile,
  selectDailyChallenges,
  selectEarnedBadges,
  selectGamificationStats,
  selectUserStreak,
  selectUnreadNotifications,
  selectGamificationLoading,
  fetchGamificationProfile,
  fetchDailyChallenges
} from '@/lib/features/gamificationSlice';

interface GamificationDashboardProps {
  variant?: 'full' | 'sidebar' | 'compact';
  className?: string;
}

export function GamificationDashboard({ 
  variant = 'full', 
  className = '' 
}: GamificationDashboardProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux selectors
  const userProfile = useSelector(selectGamificationProfile);
  const dailyChallenges = useSelector(selectDailyChallenges);
  const earnedBadges = useSelector(selectEarnedBadges);
  const stats = useSelector(selectGamificationStats);
  const streak = useSelector(selectUserStreak);
  const unreadNotifications = useSelector(selectUnreadNotifications);
  const isLoading = useSelector(selectGamificationLoading);

  // Local state
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    if (!userProfile) {
      dispatch(fetchGamificationProfile());
    }
    if (dailyChallenges.length === 0) {
      dispatch(fetchDailyChallenges());
    }
  }, [dispatch, userProfile, dailyChallenges.length]);

  // Show loading state
  if (isLoading && !userProfile) {
    return <GamificationSkeleton variant={variant} />;
  }

  // Show empty state if no profile
  if (!userProfile) {
    return <GamificationEmptyState variant={variant} />;
  }

  // Render different variants
  switch (variant) {
    case 'compact':
      return <CompactGamificationView userProfile={userProfile} className={className} />;
    case 'sidebar':
      return <SidebarGamificationView userProfile={userProfile} stats={stats} className={className} />;
    default:
      return <FullGamificationDashboard 
        userProfile={userProfile}
        dailyChallenges={dailyChallenges}
        earnedBadges={earnedBadges}
        stats={stats}
        streak={streak}
        unreadNotifications={unreadNotifications}
        className={className}
      />;
  }
}

// Full dashboard view
function FullGamificationDashboard({
  userProfile,
  dailyChallenges,
  earnedBadges,
  stats,
  streak,
  unreadNotifications,
  className
}: any) {
  const completedChallenges = dailyChallenges.filter((c: any) => c.completedAt);
  const pendingChallenges = dailyChallenges.filter((c: any) => !c.completedAt);

  return (
    <div className={`space-y-6 ${className}`} data-testid="gamification-dashboard-full">
      {/* Main Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Level Progress */}
        <div className="lg:col-span-2">
          <LevelProgressBar userProfile={userProfile} />
        </div>
        
        {/* Quick Stats */}
        <Card variant="transparent" className="bg-base-100/60 backdrop-blur-sm border border-base-300/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatItem 
              icon={<Trophy className="w-4 h-4 text-yellow-500" />}
              label="Level"
              value={stats.currentLevel}
              testId="stat-level"
            />
            <StatItem 
              icon={<Star className="w-4 h-4 text-purple-500" />}
              label="Tier"
              value={stats.tier}
              testId="stat-tier"
            />
            <StatItem 
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              label="Streak"
              value={`${stats.streak} days`}
              testId="stat-streak"
            />
            <StatItem 
              icon={<Award className="w-4 h-4 text-blue-500" />}
              label="Badges"
              value={stats.badgesEarned}
              testId="stat-badges"
            />
          </CardContent>
        </Card>
      </div>

      {/* Challenges and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenges */}
        <Card variant="transparent" className="bg-base-100/60 backdrop-blur-sm border border-base-300/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Daily Challenges
              </div>
              <Badge variant="outline" className="text-xs">
                {completedChallenges.length}/{dailyChallenges.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingChallenges.length > 0 ? (
              pendingChallenges.slice(0, 3).map((challenge: any) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))
            ) : (
              <div className="text-center py-4">
                <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-base-content/70">All challenges completed!</p>
                <p className="text-xs text-green-600">Great work! New challenges tomorrow.</p>
              </div>
            )}
            
            {pendingChallenges.length > 3 && (
              <Button variant="ghost" size="sm" className="w-full">
                View All Challenges
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Badges */}
        <Card variant="transparent" className="bg-base-100/60 backdrop-blur-sm border border-base-300/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Recent Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earnedBadges.length > 0 ? (
              <div className="space-y-3">
                {earnedBadges.slice(0, 3).map((badgeData: any, index: number) => (
                  <motion.div
                    key={badgeData.badge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-2 bg-base-200/30 rounded-lg"
                  >
                    <div className="text-2xl">{badgeData.badge.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{badgeData.badge.name}</p>
                      <p className="text-xs text-base-content/60">{badgeData.badge.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      +{badgeData.badge.xpReward} XP
                    </Badge>
                  </motion.div>
                ))}
                
                {earnedBadges.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Badges
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                <p className="text-sm text-base-content/70">No badges earned yet</p>
                <p className="text-xs text-base-content/50">Complete challenges to earn your first badge!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sidebar variant for ProfileScoringSidebar integration
function SidebarGamificationView({ userProfile, stats, className }: any) {
  return (
    <div className={`space-y-4 ${className}`} data-testid="gamification-dashboard-sidebar">
      <CompactLevelProgress userProfile={userProfile} />
      
      {/* Quick achievements */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-base-100/40 backdrop-blur-sm border border-base-300/30 rounded-lg p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-sm font-medium">{stats.streak}</p>
          <p className="text-xs text-base-content/60">Day Streak</p>
        </div>
        <div className="bg-base-100/40 backdrop-blur-sm border border-base-300/30 rounded-lg p-3 text-center">
          <Award className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-sm font-medium">{stats.badgesEarned}</p>
          <p className="text-xs text-base-content/60">Badges</p>
        </div>
      </div>
    </div>
  );
}

// Compact variant for minimal space
function CompactGamificationView({ userProfile, className }: any) {
  return (
    <div className={`${className}`} data-testid="gamification-dashboard-compact">
      <div className="flex items-center gap-3 p-2 bg-base-100/40 backdrop-blur-sm border border-base-300/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">L{userProfile.currentLevel}</span>
        </div>
        <div className="flex-1 h-1 bg-base-300/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${userProfile.levelProgress * 100}%` }}
          />
        </div>
        <div className="text-xs text-base-content/60">
          {userProfile.totalXP.toLocaleString()} XP
        </div>
      </div>
    </div>
  );
}

// Challenge card component
function ChallengeCard({ challenge }: { challenge: any }) {
  const progress = Math.min((challenge.currentProgress / challenge.targetValue) * 100, 100);
  
  return (
    <div className="p-3 bg-base-200/30 rounded-lg border border-base-300/20" data-testid={`challenge-${challenge.id}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-sm">{challenge.title}</p>
          <p className="text-xs text-base-content/60">{challenge.description}</p>
        </div>
        <Badge variant={challenge.difficulty === 'Easy' ? 'default' : challenge.difficulty === 'Medium' ? 'secondary' : 'destructive'} className="text-xs">
          {challenge.difficulty}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>{challenge.currentProgress} / {challenge.targetValue}</span>
          <span className="text-primary">+{challenge.xpReward} XP</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    </div>
  );
}

// Stat item component
function StatItem({ icon, label, value, testId }: any) {
  return (
    <div className="flex items-center justify-between" data-testid={testId}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-base-content/70">{label}</span>
      </div>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}

// Loading skeleton
function GamificationSkeleton({ variant }: { variant: string }) {
  return (
    <div className="space-y-4" data-testid="gamification-skeleton">
      <div className="h-32 bg-base-300/30 rounded-lg animate-pulse" />
      {variant === 'full' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-base-300/30 rounded-lg animate-pulse" />
            <div className="h-24 bg-base-300/30 rounded-lg animate-pulse" />
          </div>
        </>
      )}
    </div>
  );
}

// Empty state
function GamificationEmptyState({ variant }: { variant: string }) {
  return (
    <div className="text-center py-8" data-testid="gamification-empty-state">
      <Trophy className="w-12 h-12 text-base-content/30 mx-auto mb-4" />
      <p className="text-base-content/70 mb-2">Start your journey!</p>
      <p className="text-sm text-base-content/50">Complete actions to begin earning XP and unlocking achievements.</p>
    </div>
  );
}