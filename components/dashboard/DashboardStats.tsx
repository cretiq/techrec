'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { 
  BarChart3, 
  FileText, 
  Search, 
  Send, 
  TrendingUp,
  Calendar,
  Target,
  Clock
} from 'lucide-react';

interface DashboardStatsProps {
  className?: string;
  activityStats?: {
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
}

interface ActivityStats {
  cvsAnalyzed: number;
  rolesSearched: number;
  applicationsSubmitted: number;
  coverLettersGenerated: number;
  weeklyActivity: {
    day: string;
    activities: number;
  }[];
  monthlyGoal: {
    target: number;
    current: number;
    label: string;
  };
}

export function DashboardStats({ className = '', activityStats: propActivityStats }: DashboardStatsProps) {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('📊 [DashboardStats] Component mounted with data:', propActivityStats);

  useEffect(() => {
    console.log('📊 [DashboardStats] Processing activity stats...');
    
    if (propActivityStats) {
      // Use the provided activity stats
      setStats(propActivityStats);
      setIsLoading(false);
      
      console.log('📊 [DashboardStats] Activity stats processed:', propActivityStats);
    } else {
      // Fallback to mock data if no activity stats provided
      setStats({
        cvsAnalyzed: 0,
        rolesSearched: 0,
        applicationsSubmitted: 0,
        coverLettersGenerated: 0,
        weeklyActivity: [
          { day: 'Mon', activities: 0 },
          { day: 'Tue', activities: 0 },
          { day: 'Wed', activities: 0 },
          { day: 'Thu', activities: 0 },
          { day: 'Fri', activities: 0 },
          { day: 'Sat', activities: 0 },
          { day: 'Sun', activities: 0 }
        ],
        monthlyGoal: {
          target: 10,
          current: 0,
          label: 'Applications Goal'
        }
      });
      setIsLoading(false);
    }
  }, [propActivityStats]);

  if (isLoading) {
    return (
      <Card 
        variant="transparent" 
        className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        data-testid="dashboard-stats-loading"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-base-300/50 rounded animate-pulse" />
            <div className="h-5 bg-base-300/50 rounded animate-pulse w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-base-300/50 rounded animate-pulse" />
                <div className="h-6 bg-base-300/30 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card 
        variant="transparent" 
        className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        data-testid="dashboard-stats-error"
      >
        <CardContent className="p-4 text-center">
          <p className="text-base-content/70">Failed to load stats</p>
        </CardContent>
      </Card>
    );
  }

  const goalProgress = (stats.monthlyGoal.current / stats.monthlyGoal.target) * 100;
  const maxWeeklyActivity = Math.max(...stats.weeklyActivity.map(d => d.activities));

  return (
    <Card 
      variant="transparent" 
      className={`bg-base-100/60 backdrop-blur-sm border border-base-300/50 ${className}`}
      data-testid="dashboard-stats"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          Your Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        
        {/* Activity Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-3 bg-base-100/40 border border-base-300/30 rounded-lg text-center"
            data-testid="stats-cvs-analyzed"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-base-content/60">CVs</span>
            </div>
            <div className="font-semibold text-base-content">
              {stats.cvsAnalyzed}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-3 bg-base-100/40 border border-base-300/30 rounded-lg text-center"
            data-testid="stats-roles-searched"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Search className="w-4 h-4 text-green-600" />
              <span className="text-xs text-base-content/60">Roles</span>
            </div>
            <div className="font-semibold text-base-content">
              {stats.rolesSearched}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-3 bg-base-100/40 border border-base-300/30 rounded-lg text-center"
            data-testid="stats-applications-submitted"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Send className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-base-content/60">Apps</span>
            </div>
            <div className="font-semibold text-base-content">
              {stats.applicationsSubmitted}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-3 bg-base-100/40 border border-base-300/30 rounded-lg text-center"
            data-testid="stats-cover-letters-generated"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-base-content/60">Letters</span>
            </div>
            <div className="font-semibold text-base-content">
              {stats.coverLettersGenerated}
            </div>
          </motion.div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-base-content flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            This Week
          </h4>
          
          <div className="stats stats-vertical bg-base-100/30 rounded-lg w-full">
            <div className="flex justify-between items-end h-16 p-2 gap-1">
              {stats.weeklyActivity.map((day, index) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex-1 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.activities / maxWeeklyActivity) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-full bg-primary rounded-sm min-h-[2px]"
                      data-testid={`weekly-activity-${day.day}`}
                    />
                  </div>
                  <span className="text-xs text-base-content/60">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-base-content/60">
            <span>Daily Activity</span>
            <span>Peak: {maxWeeklyActivity}</span>
          </div>
        </div>

        {/* Monthly Goal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 bg-primary/5 border border-primary/10 rounded-lg"
          data-testid="monthly-goal"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {stats.monthlyGoal.label}
              </span>
            </div>
            <Badge 
              variant="outline" 
              className="text-xs text-primary"
              data-testid="goal-progress-badge"
            >
              {Math.round(goalProgress)}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-base-content">
                {stats.monthlyGoal.current} / {stats.monthlyGoal.target}
              </span>
              <span className="text-base-content/60">
                {stats.monthlyGoal.target - stats.monthlyGoal.current} left
              </span>
            </div>
            
            <div className="w-full bg-primary/10 rounded-full h-2">
              <motion.div
                className="h-2 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(goalProgress, 100)}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Activity Insights */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-base-content flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Insights
          </h4>
          
          <div className="space-y-1">
            {stats.applicationsSubmitted > 0 && (
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Great job on {stats.applicationsSubmitted} applications!</span>
              </div>
            )}
            
            {stats.coverLettersGenerated > 0 && (
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>You've generated {stats.coverLettersGenerated} cover letters</span>
              </div>
            )}
            
            {stats.rolesSearched > 20 && (
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Active searcher! {stats.rolesSearched} roles explored</span>
              </div>
            )}
            
            {stats.cvsAnalyzed === 0 && (
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Upload your CV for AI analysis</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}