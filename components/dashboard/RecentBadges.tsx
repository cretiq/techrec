'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Button } from '@/components/ui-daisy/button';
import { Tooltip } from '@/components/ui-daisy/tooltip';
import { Trophy, ArrowRight, Sparkles, Lock, Info } from 'lucide-react';
import Link from 'next/link';
import { UserBadgeWithDetails } from '@/types/gamification';

interface RecentBadgesProps {
  className?: string;
  badges?: any[];
}

export function RecentBadges({ className = '', badges = [] }: RecentBadgesProps) {
  const [recentBadges, setRecentBadges] = useState<UserBadgeWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBadges, setTotalBadges] = useState(0);

  console.log('🏆 [RecentBadges] Component mounted with badges:', badges);

  useEffect(() => {
    console.log('🏆 [RecentBadges] Processing badges data...');
    
    if (badges && badges.length > 0) {
      // Process the badges data from the API
      const processedBadges: UserBadgeWithDetails[] = badges.map(userBadge => ({
        id: userBadge.id,
        badgeId: userBadge.badgeId,
        badge: userBadge.badge,
        earnedAt: userBadge.earnedAt,
        progress: userBadge.progress || 1.0
      }));

      setRecentBadges(processedBadges);
      setTotalBadges(processedBadges.length);
    } else {
      // No badges available
      setRecentBadges([]);
      setTotalBadges(0);
    }
    
    setIsLoading(false);
    
    console.log('🏆 [RecentBadges] Badges processed:', {
      recentCount: badges.length,
      totalCount: badges.length
    });
  }, [badges]);

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'text-gray-600 bg-gray-100';
      case 'UNCOMMON': return 'text-green-600 bg-green-100';
      case 'RARE': return 'text-blue-600 bg-blue-100';
      case 'EPIC': return 'text-purple-600 bg-purple-100';
      case 'LEGENDARY': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'text-amber-700 bg-amber-100';
      case 'SILVER': return 'text-gray-700 bg-gray-100';
      case 'GOLD': return 'text-yellow-700 bg-yellow-100';
      case 'PLATINUM': return 'text-blue-700 bg-blue-100';
      case 'DIAMOND': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <Card 
        variant="transparent" 
        className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        data-testid="recent-badges-loading"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-base-300/50 rounded animate-pulse" />
            <div className="h-5 bg-base-300/50 rounded animate-pulse w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-base-300/50 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-base-300/50 rounded animate-pulse" />
                <div className="h-3 bg-base-300/30 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      variant="transparent" 
      className={`bg-base-100/60 backdrop-blur-sm border border-base-300/50 ${className}`}
      data-testid="recent-badges"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-primary" />
          Recent Badges
          <Tooltip 
            content="Badges are earned by completing activities and milestones. Each badge rewards you with XP to level up your profile."
            size="large"
            position="top"
          >
            <Info className="w-4 h-4 text-base-content/50 hover:text-base-content/80 cursor-help" />
          </Tooltip>
        </CardTitle>
        
        {totalBadges > 0 && (
          <div className="flex items-center justify-between">
            <Tooltip 
              content="Total badges earned across all categories and activities"
              size="medium"
              position="bottom"
            >
              <p className="text-sm text-base-content/70 cursor-help">
                {totalBadges} badge{totalBadges !== 1 ? 's' : ''} earned
              </p>
            </Tooltip>
            <Link href="/developer/badges">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <AnimatePresence>
          {recentBadges.length > 0 ? (
            recentBadges.slice(0, 3).map((userBadge, index) => (
              <motion.div
                key={userBadge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-base-100/40 border border-base-300/30 hover:bg-base-100/60 hover:border-base-300/50 transition-all duration-100"
                data-testid={`recent-badge-${userBadge.badgeId}`}
              >
                {/* Badge Icon */}
                <div className="flex-shrink-0">
                  <Tooltip 
                    content={`${userBadge.badge.name} - ${userBadge.badge.description}`}
                    size="medium"
                    position="left"
                  >
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center text-2xl cursor-help"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`recent-badge-icon-${userBadge.badgeId}`}
                    >
                      {userBadge.badge.icon}
                    </motion.div>
                  </Tooltip>
                </div>
                
                {/* Badge Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-base-content truncate">
                      {userBadge.badge.name}
                    </h4>
                    <Tooltip 
                      content={`${userBadge.badge.tier} tier badge - rarity affects XP rewards and prestige`}
                      size="small"
                      position="top"
                    >
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTierColor(userBadge.badge.tier)} cursor-help`}
                        data-testid={`recent-badge-tier-${userBadge.badgeId}`}
                      >
                        {userBadge.badge.tier}
                      </Badge>
                    </Tooltip>
                  </div>
                  
                  <p className="text-xs text-base-content/70 truncate mb-2">
                    {userBadge.badge.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <Tooltip 
                        content={`This badge awarded ${userBadge.badge.xpReward} XP towards your level progression`}
                        size="small"
                        position="bottom"
                      >
                        <span className="text-xs text-base-content/60 cursor-help">
                          +{userBadge.badge.xpReward} XP
                        </span>
                      </Tooltip>
                    </div>
                    
                    <Tooltip 
                      content={`Badge earned on ${new Date(userBadge.earnedAt).toLocaleDateString()}`}
                      size="small"
                      position="bottom"
                    >
                      <span className="text-xs text-base-content/50 cursor-help">
                        {new Date(userBadge.earnedAt).toLocaleDateString()}
                      </span>
                    </Tooltip>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <EmptyState />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8 space-y-4"
      data-testid="recent-badges-empty"
    >
      <div className="w-16 h-16 mx-auto rounded-full bg-base-200/50 flex items-center justify-center">
        <Lock className="w-8 h-8 text-base-content/50" />
      </div>
      
      <div className="space-y-2">
        <h4 className="font-semibold text-base-content">No badges yet</h4>
        <p className="text-sm text-base-content/70">
          Complete activities to earn your first badge and start building your achievements!
        </p>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs text-base-content/60">Quick ways to earn badges:</p>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs text-base-content/60">
            <span>📄</span>
            <span>Upload your CV</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-base-content/60">
            <span>🤖</span>
            <span>Get AI analysis</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-base-content/60">
            <span>🎯</span>
            <span>Search for jobs</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}