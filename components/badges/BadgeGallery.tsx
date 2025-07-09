'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Calendar,
  Target,
  Info
} from 'lucide-react';
import { BadgeDefinition, UserBadgeWithDetails } from '@/types/gamification';
import { BADGE_DEFINITIONS } from '@/lib/gamification/badgeDefinitions';

interface BadgeGalleryProps {
  className?: string;
}

interface BadgeWithProgress extends BadgeDefinition {
  userBadge?: UserBadgeWithDetails;
  progress: number; // 0-100
  isEarned: boolean;
  earnedAt?: Date;
  isInProgress: boolean;
}

export function BadgeGallery({ className = '' }: BadgeGalleryProps) {
  const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithProgress | null>(null);

  console.log('🏆 [BadgeGallery] Component mounted');

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        console.log('🏆 [BadgeGallery] Fetching badges...');
        
        // For now, use mock data - in production this would fetch from API
        // TODO: Replace with actual API call to get user badges and progress
        const mockUserBadges: UserBadgeWithDetails[] = [
          {
            id: 'user-badge-1',
            badgeId: 'first_analysis',
            badge: BADGE_DEFINITIONS.find(b => b.id === 'first_analysis')!,
            earnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            progress: 1.0
          },
          {
            id: 'user-badge-2',
            badgeId: 'ai_collaborator',
            badge: BADGE_DEFINITIONS.find(b => b.id === 'ai_collaborator')!,
            earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            progress: 1.0
          }
        ];

        const badgesWithProgress: BadgeWithProgress[] = BADGE_DEFINITIONS.map(badge => {
          const userBadge = mockUserBadges.find(ub => ub.badgeId === badge.id);
          
          // Mock progress calculation
          let progress = 0;
          if (userBadge) {
            progress = 100; // Earned
          } else {
            // Mock progress for different badges
            switch (badge.id) {
              case 'profile_complete':
                progress = 65;
                break;
              case 'streak_starter':
                progress = 45;
                break;
              case 'first_application':
                progress = 80;
                break;
              default:
                progress = Math.floor(Math.random() * 60);
            }
          }

          return {
            ...badge,
            userBadge,
            progress,
            isEarned: !!userBadge,
            earnedAt: userBadge?.earnedAt,
            isInProgress: progress > 0 && progress < 100
          };
        });

        setBadges(badgesWithProgress);
        setIsLoading(false);
        
        console.log('🏆 [BadgeGallery] Badges loaded:', {
          total: badgesWithProgress.length,
          earned: badgesWithProgress.filter(b => b.isEarned).length,
          inProgress: badgesWithProgress.filter(b => b.isInProgress).length
        });
      } catch (error) {
        console.error('🏆 [BadgeGallery] Error fetching badges:', error);
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'SILVER': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'GOLD': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'PLATINUM': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'DIAMOND': return 'text-purple-700 bg-purple-100 border-purple-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'text-gray-600 bg-gray-100';
      case 'UNCOMMON': return 'text-green-600 bg-green-100';
      case 'RARE': return 'text-blue-600 bg-blue-100';
      case 'EPIC': return 'text-purple-600 bg-purple-100';
      case 'LEGENDARY': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PROFILE_COMPLETION': return 'text-blue-600 bg-blue-50';
      case 'CV_ANALYSIS': return 'text-green-600 bg-green-50';
      case 'AI_INTERACTION': return 'text-purple-600 bg-purple-50';
      case 'APPLICATION_ACTIVITY': return 'text-red-600 bg-red-50';
      case 'ENGAGEMENT': return 'text-orange-600 bg-orange-50';
      case 'CHALLENGES': return 'text-yellow-600 bg-yellow-50';
      case 'LEVEL_PROGRESSION': return 'text-indigo-600 bg-indigo-50';
      case 'SPECIAL': return 'text-pink-600 bg-pink-50';
      case 'SEASONAL': return 'text-teal-600 bg-teal-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressMessage = (badge: BadgeWithProgress) => {
    if (badge.isEarned) return 'Earned!';
    if (badge.progress > 0) return `${badge.progress}% complete`;
    return 'Not started';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="badge-gallery-loading">
        {[...Array(12)].map((_, i) => (
          <Card
            key={i}
            variant="transparent"
            className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-base-300/50 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-base-300/50 rounded animate-pulse" />
                  <div className="h-3 bg-base-300/30 rounded animate-pulse w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="badge-gallery">
      
      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <Card
                variant="transparent"
                className={`
                  cursor-pointer transition-all duration-200 hover:scale-105
                  ${badge.isEarned 
                    ? 'bg-green-50/50 border-green-200/50 shadow-lg' 
                    : badge.isInProgress 
                      ? 'bg-blue-50/50 border-blue-200/50' 
                      : 'bg-base-100/60 border-base-300/50'
                  }
                  backdrop-blur-sm hover:shadow-xl
                `}
                onClick={() => setSelectedBadge(badge)}
                data-testid={`badge-card-${badge.id}`}
              >
                <CardContent className="p-4">
                  
                  {/* Badge Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`
                          w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2
                          ${badge.isEarned 
                            ? 'bg-green-500/20 border-green-500/30' 
                            : badge.isInProgress 
                              ? 'bg-blue-500/20 border-blue-500/30' 
                              : 'bg-base-200/50 border-base-300/50'
                          }
                        `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {badge.isEarned ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : badge.isInProgress ? (
                          <span className="opacity-70">{badge.icon}</span>
                        ) : (
                          <Lock className="w-6 h-6 text-base-content/30" />
                        )}
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-base-content truncate">
                          {badge.name}
                        </h3>
                        <p className="text-xs text-base-content/70 line-clamp-2">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      {badge.isEarned ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : badge.isInProgress ? (
                        <Target className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-base-content/30" />
                      )}
                    </div>
                  </div>
                  
                  {/* Badges and Progress */}
                  <div className="space-y-3">
                    
                    {/* Tier and Rarity */}
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTierColor(badge.tier)}`}
                        data-testid={`badge-tier-${badge.id}`}
                      >
                        {badge.tier}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRarityColor(badge.rarity)}`}
                        data-testid={`badge-rarity-${badge.id}`}
                      >
                        {badge.rarity}
                      </Badge>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-base-content/70">
                          {getProgressMessage(badge)}
                        </span>
                        <span className="text-base-content/60">
                          +{badge.xpReward} XP
                        </span>
                      </div>
                      <Progress 
                        value={badge.progress} 
                        className="h-2"
                        data-testid={`badge-progress-${badge.id}`}
                      />
                    </div>
                    
                    {/* Earned Date */}
                    {badge.earnedAt && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Earned {badge.earnedAt.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                {/* Earned Badge Glow */}
                {badge.isEarned && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-sm -z-10"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBadge(null)}
            data-testid="badge-detail-modal"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-base-100 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                
                {/* Badge Header */}
                <div className="flex items-center gap-4">
                  <div className={`
                    w-16 h-16 rounded-lg flex items-center justify-center text-4xl border-2
                    ${selectedBadge.isEarned 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : 'bg-base-200/50 border-base-300/50'
                    }
                  `}>
                    {selectedBadge.isEarned ? '✅' : selectedBadge.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-base-content">
                      {selectedBadge.name}
                    </h2>
                    <p className="text-base-content/70">
                      {selectedBadge.description}
                    </p>
                  </div>
                </div>
                
                {/* Badge Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getTierColor(selectedBadge.tier)}`}
                    >
                      {selectedBadge.tier} Tier
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`${getRarityColor(selectedBadge.rarity)}`}
                    >
                      {selectedBadge.rarity}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`${getCategoryColor(selectedBadge.category)}`}
                    >
                      {selectedBadge.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm text-base-content">
                      Rewards {selectedBadge.xpReward} XP
                    </span>
                  </div>
                </div>
                
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/70">Progress</span>
                    <span className="text-base-content">
                      {getProgressMessage(selectedBadge)}
                    </span>
                  </div>
                  <Progress value={selectedBadge.progress} className="h-3" />
                </div>
                
                {/* Requirements */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-base-content">
                      Requirements
                    </span>
                  </div>
                  <div className="p-3 bg-base-200/50 rounded-lg">
                    <p className="text-sm text-base-content/70">
                      {selectedBadge.requirements.type.replace('_', ' ')} - 
                      Threshold: {selectedBadge.requirements.threshold}
                    </p>
                  </div>
                </div>
                
                {/* Close Button */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedBadge(null)}
                    data-testid="badge-detail-close"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}