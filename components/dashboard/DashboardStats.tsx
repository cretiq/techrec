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

        {/* Removed sections for simplified UI:
             - Weekly Activity Chart ("This Week")
             - Monthly Goal
             - Activity Insights
        */}
      </CardContent>
    </Card>
  );
}