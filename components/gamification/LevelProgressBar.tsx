'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { UserGamificationProfile } from '@/types/gamification';
import { SubscriptionTier } from '@prisma/client';
import { XPCalculator } from '@/lib/gamification/xpCalculator';

interface LevelProgressBarProps {
  userProfile: UserGamificationProfile;
  showDetails?: boolean;
  className?: string;
  animated?: boolean;
}

// Subscription tier color mappings for visual consistency
const tierColors: Record<SubscriptionTier, { bg: string; border: string; text: string; glow: string }> = {
  FREE: {
    bg: 'from-gray-400/20 to-gray-500/20',
    border: 'border-gray-400/30',
    text: 'text-gray-600',
    glow: 'shadow-gray-400/20'
  },
  BASIC: {
    bg: 'from-blue-400/20 to-blue-500/20',
    border: 'border-blue-400/30',
    text: 'text-blue-600',
    glow: 'shadow-blue-400/20'
  },
  STARTER: {
    bg: 'from-green-400/20 to-green-500/20',
    border: 'border-green-400/30',
    text: 'text-green-600',
    glow: 'shadow-green-400/20'
  },
  PRO: {
    bg: 'from-purple-400/20 to-purple-500/20',
    border: 'border-purple-400/30',
    text: 'text-purple-600',
    glow: 'shadow-purple-400/20'
  },
  EXPERT: {
    bg: 'from-orange-400/20 to-orange-500/20',
    border: 'border-orange-400/30',
    text: 'text-orange-600',
    glow: 'shadow-orange-400/20'
  }
};

export function LevelProgressBar({ 
  userProfile, 
  showDetails = true, 
  className = '',
  animated = true 
}: LevelProgressBarProps) {
  const { totalXP, currentLevel, levelProgress, subscriptionTier, nextLevelXP, currentLevelXP } = userProfile;
  
  const tierStyle = tierColors[subscriptionTier];
  const levelInfo = XPCalculator.getLevelInfo(currentLevel);
  const nextMilestone = XPCalculator.getNextMilestone(totalXP);
  
  // Calculate XP for current level progress
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  
  return (
    <Card 
      variant="transparent" 
      className={`bg-base-100/60 backdrop-blur-sm border border-base-300/50 ${className}`}
      data-testid="gamification-level-progress-bar"
    >
      <CardContent className="p-4 space-y-4">
        {/* Level and Tier Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className={`relative p-2 rounded-full bg-gradient-to-br ${tierStyle.bg} ${tierStyle.border} border backdrop-blur-sm`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              data-testid="gamification-level-icon"
            >
              {subscriptionTier === 'EXPERT' && <Star className="w-5 h-5 text-orange-600" />}
              {subscriptionTier === 'PRO' && <Zap className="w-5 h-5 text-purple-600" />}
              {subscriptionTier === 'STARTER' && <Trophy className="w-5 h-5 text-green-600" />}
              {(subscriptionTier === 'BASIC' || subscriptionTier === 'FREE') && <Trophy className={`w-5 h-5 ${tierStyle.text}`} />}
              
              {/* Tier glow effect */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${tierStyle.bg} opacity-50 blur-md -z-10`} />
            </motion.div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base-content" data-testid="gamification-level-title">
                  Level {currentLevel}
                </h3>
                <Badge 
                  variant="outline" 
                  className={`${tierStyle.border} ${tierStyle.text} bg-gradient-to-r ${tierStyle.bg}`}
                  data-testid={`gamification-tier-badge-${subscriptionTier.toLowerCase()}`}
                >
                  {subscriptionTier.charAt(0) + subscriptionTier.slice(1).toLowerCase()}
                </Badge>
              </div>
              <p className="text-sm text-base-content/70" data-testid="gamification-level-subtitle">
                {levelInfo.title}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-base-content" data-testid="gamification-total-xp">
              {totalXP.toLocaleString()} XP
            </p>
            {showDetails && (
              <p className="text-xs text-base-content/60" data-testid="gamification-xp-breakdown">
                {xpInCurrentLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-3 bg-base-300/30 rounded-full overflow-hidden backdrop-blur-sm">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-base-300/20 to-base-300/40" />
            
            {/* Progress fill with animation */}
            <motion.div
              className={`h-full bg-gradient-to-r from-primary/80 to-primary rounded-full relative overflow-hidden`}
              initial={{ width: animated ? 0 : `${levelProgress * 100}%` }}
              animate={{ width: `${levelProgress * 100}%` }}
              transition={{ 
                duration: animated ? 1.5 : 0, 
                ease: "easeOut",
                delay: animated ? 0.3 : 0
              }}
              data-testid="gamification-progress-fill"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['100%', '-100%'] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: animated ? 1.8 : 0
                }}
              />
              
              {/* Progress glow */}
              <div className="absolute inset-0 bg-primary/20 blur-sm" />
            </motion.div>
            
            {/* Progress indicators */}
            <div className="absolute inset-0 flex items-center justify-between px-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-px h-2 ${
                    i / 4 <= levelProgress ? 'bg-white/60' : 'bg-base-content/20'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Progress details */}
          <div className="flex justify-between items-center text-xs text-base-content/60">
            <span data-testid="gamification-current-level-xp">
              Level {currentLevel}
            </span>
            <span className="font-medium" data-testid="gamification-progress-percentage">
              {Math.round(levelProgress * 100)}%
            </span>
            <span data-testid="gamification-next-level-xp">
              Level {currentLevel + 1}
            </span>
          </div>
        </div>
        
        {/* Next Milestone Info */}
        <AnimatePresence>
          {showDetails && nextMilestone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-primary/5 border border-primary/10 rounded-lg backdrop-blur-sm"
              data-testid="gamification-next-milestone"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">
                    Next {nextMilestone.type === 'level' ? 'Level' : 'Tier'}
                  </p>
                  <p className="text-xs text-base-content/70">
                    {nextMilestone.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {nextMilestone.xpNeeded.toLocaleString()} XP
                  </p>
                  <p className="text-xs text-base-content/60">
                    to go
                  </p>
                </div>
              </div>
              
              {/* Mini progress bar for milestone */}
              <div className="mt-2 h-1 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.max(0, 100 - (nextMilestone.xpNeeded / (nextMilestone.target - currentLevelXP)) * 100)}%` 
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Level Benefits */}
        {showDetails && levelInfo.benefits.length > 0 && (
          <div className="space-y-2" data-testid="gamification-level-benefits">
            <p className="text-sm font-medium text-base-content">
              Level {currentLevel} Benefits:
            </p>
            <div className="space-y-1">
              {levelInfo.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="flex items-center gap-2 text-xs text-base-content/70"
                  data-testid={`gamification-benefit-${index}`}
                >
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for sidebar use
export function CompactLevelProgress({ userProfile, className = '' }: LevelProgressBarProps) {
  const { totalXP, currentLevel, levelProgress, subscriptionTier } = userProfile;
  const tierStyle = tierColors[subscriptionTier];
  
  return (
    <div 
      className={`flex items-center gap-3 p-3 bg-base-100/40 backdrop-blur-sm border border-base-300/30 rounded-lg ${className}`}
      data-testid="gamification-compact-level-progress"
    >
      <div className={`p-1.5 rounded-full bg-gradient-to-br ${tierStyle.bg} ${tierStyle.border} border`}>
        <Trophy className={`w-4 h-4 ${tierStyle.text}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-base-content">
            Level {currentLevel}
          </span>
          <span className="text-xs text-base-content/60">
            {totalXP.toLocaleString()} XP
          </span>
        </div>
        
        <div className="h-1.5 bg-base-300/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

// XP notification component for floating animations
export function XPGainNotification({ 
  amount, 
  source, 
  isVisible, 
  onComplete 
}: {
  amount: number;
  source: string;
  isVisible: boolean;
  onComplete: () => void;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.6 }}
          transition={{ duration: 2, ease: "easeOut" }}
          onAnimationComplete={() => setTimeout(onComplete, 500)}
          className="fixed top-20 right-4 z-50 pointer-events-none"
          data-testid="gamification-xp-notification"
        >
          <div className="bg-green-500/90 backdrop-blur-sm border border-green-400/50 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-white font-semibold">
                +{amount} XP
              </span>
            </div>
            <p className="text-green-100 text-xs mt-1">
              {source}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}