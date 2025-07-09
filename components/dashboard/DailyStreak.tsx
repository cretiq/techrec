'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Flame, Calendar, Target, TrendingUp } from 'lucide-react';

interface DailyStreakProps {
  className?: string;
  streakData?: {
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
}

interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: Date | null;
  isStreakActive: boolean;
  nextMilestone: {
    target: number;
    reward: string;
    daysLeft: number;
  } | null;
}

export function DailyStreak({ className = '', streakData: propStreakData }: DailyStreakProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔥 [DailyStreak] Component mounted with data:', propStreakData);

  useEffect(() => {
    console.log('🔥 [DailyStreak] Processing streak data...');
    
    if (propStreakData) {
      // Use the provided streak data
      setStreakData(propStreakData);
      setIsLoading(false);
      
      console.log('🔥 [DailyStreak] Streak data processed:', propStreakData);
    } else {
      // Fallback to mock data if no streak data provided
      setStreakData({
        currentStreak: 0,
        bestStreak: 0,
        lastActivityDate: null,
        isStreakActive: false,
        nextMilestone: {
          target: 3,
          reward: 'Consistency Starter Badge',
          daysLeft: 3
        }
      });
      setIsLoading(false);
    }
  }, [propStreakData]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-red-600 bg-red-100';
    if (streak >= 14) return 'text-orange-600 bg-orange-100';
    if (streak >= 7) return 'text-yellow-600 bg-yellow-100';
    if (streak >= 3) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Legendary streak! 🏆';
    if (streak >= 14) return 'On fire! 🔥';
    if (streak >= 7) return 'Great momentum! 💪';
    if (streak >= 3) return 'Building consistency! 📈';
    if (streak >= 1) return 'Good start! 🌟';
    return 'Start your streak today! 🚀';
  };

  const getFlameAnimation = (streak: number) => {
    if (streak >= 7) {
      return {
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0],
        transition: { duration: 2, repeat: Infinity }
      };
    }
    return { scale: 1 };
  };

  if (isLoading) {
    return (
      <Card 
        variant="transparent" 
        className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        data-testid="daily-streak-loading"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-base-300/50 rounded animate-pulse" />
            <div className="h-5 bg-base-300/50 rounded animate-pulse w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-base-300/50 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-base-300/50 rounded animate-pulse" />
            <div className="h-3 bg-base-300/30 rounded animate-pulse w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!streakData) {
    return (
      <Card 
        variant="transparent" 
        className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        data-testid="daily-streak-error"
      >
        <CardContent className="p-4 text-center">
          <p className="text-base-content/70">Failed to load streak data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      variant="transparent" 
      className={`bg-base-100/60 backdrop-blur-sm border border-base-300/50 ${className}`}
      data-testid="daily-streak"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <motion.div
            animate={getFlameAnimation(streakData.currentStreak)}
          >
            <Flame className={`w-5 h-5 ${streakData.isStreakActive ? 'text-orange-500' : 'text-gray-400'}`} />
          </motion.div>
          Daily Streak
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        {/* Current Streak Display */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative inline-flex items-center justify-center"
          >
            <div className="stats bg-base-200 rounded-full w-20 h-20 flex items-center justify-center">
              <div className="stat text-center p-0">
                <div className="stat-value text-2xl font-bold text-base-content" data-testid="streak-current-count">
                  {streakData.currentStreak}
                </div>
                <div className="stat-desc text-xs">
                  day{streakData.currentStreak !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {/* Glow effect for active streaks */}
            {streakData.isStreakActive && streakData.currentStreak >= 3 && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/20 to-red-500/20 blur-md -z-10"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-base-content">
              {getStreakMessage(streakData.currentStreak)}
            </p>
            <Badge 
              variant="outline" 
              className={`text-xs ${getStreakColor(streakData.currentStreak)}`}
              data-testid="streak-status-badge"
            >
              {streakData.isStreakActive ? 'Active Streak' : 'Streak Lost'}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-base-content/60">Best</span>
            </div>
            <div className="font-semibold text-base-content" data-testid="streak-best-count">
              {streakData.bestStreak}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs text-base-content/60">Last</span>
            </div>
            <div className="font-semibold text-base-content text-xs" data-testid="streak-last-activity">
              {streakData.lastActivityDate 
                ? streakData.lastActivityDate.toLocaleDateString()
                : 'Never'
              }
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        {streakData.nextMilestone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 bg-primary/5 border border-primary/10 rounded-lg"
            data-testid="streak-next-milestone"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Next Milestone
                </span>
              </div>
              <Badge variant="outline" className="text-xs text-primary">
                {streakData.nextMilestone.daysLeft} days left
              </Badge>
            </div>
            
            <div className="mt-2 space-y-1">
              <p className="text-sm text-base-content">
                Reach {streakData.nextMilestone.target} days
              </p>
              <p className="text-xs text-base-content/70">
                Reward: {streakData.nextMilestone.reward}
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="mt-2 h-2 bg-primary/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min((streakData.currentStreak / streakData.nextMilestone.target) * 100, 100)}%` 
                }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {/* Streak Tips */}
        {streakData.currentStreak === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 bg-base-100/40 border border-base-300/30 rounded-lg"
            data-testid="streak-tips"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-base-content">
                💡 Quick tips to build your streak:
              </p>
              <div className="space-y-1 text-xs text-base-content/70">
                <div>• Log in daily to maintain your streak</div>
                <div>• Complete profile sections</div>
                <div>• Use AI analysis features</div>
                <div>• Apply to jobs or save roles</div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}