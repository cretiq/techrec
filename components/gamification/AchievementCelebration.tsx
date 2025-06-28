'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Sparkles, 
  X, 
  Award,
  TrendingUp,
  Flame,
  Zap
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { 
  selectCelebration, 
  dismissCelebration,
  markNotificationRead 
} from '@/lib/features/gamificationSlice';

interface CelebrationData {
  type: 'level_up' | 'badge_earned' | 'challenge_completed' | 'streak_milestone';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  xpAwarded?: number;
  newLevel?: number;
  badgeIcon?: string;
  badgeName?: string;
  streakCount?: number;
  challengeName?: string;
}

export function AchievementCelebration() {
  const dispatch = useDispatch();
  const celebration = useSelector(selectCelebration);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);

  useEffect(() => {
    if (celebration) {
      const data = formatCelebrationData(celebration);
      setCelebrationData(data);
      setShowCelebration(true);
    }
  }, [celebration]);

  const formatCelebrationData = (celebration: any): CelebrationData => {
    switch (celebration.type) {
      case 'level_up':
        return {
          type: 'level_up',
          title: 'Level Up!',
          description: `Congratulations! You've reached level ${celebration.data.newLevel}`,
          icon: <Trophy className="w-12 h-12 text-yellow-500" />,
          color: 'from-yellow-400 to-orange-500',
          newLevel: celebration.data.newLevel,
          xpAwarded: celebration.data.xpAwarded
        };
      
      case 'badge_earned':
        return {
          type: 'badge_earned',
          title: 'Badge Earned!',
          description: `You've unlocked the "${celebration.data.badge.name}" badge`,
          icon: <Award className="w-12 h-12 text-blue-500" />,
          color: 'from-blue-400 to-purple-600',
          badgeIcon: celebration.data.badge.icon,
          badgeName: celebration.data.badge.name,
          xpAwarded: celebration.data.xpAwarded
        };
      
      case 'challenge_completed':
        return {
          type: 'challenge_completed',
          title: 'Challenge Complete!',
          description: `Great job completing "${celebration.data.challengeName}"`,
          icon: <Star className="w-12 h-12 text-green-500" />,
          color: 'from-green-400 to-emerald-600',
          challengeName: celebration.data.challengeName,
          xpAwarded: celebration.data.xpAwarded
        };
      
      case 'streak_milestone':
        return {
          type: 'streak_milestone',
          title: 'Streak Milestone!',
          description: `Amazing! You've maintained a ${celebration.data.streakCount}-day streak`,
          icon: <Flame className="w-12 h-12 text-orange-500" />,
          color: 'from-orange-400 to-red-500',
          streakCount: celebration.data.streakCount,
          xpAwarded: celebration.data.xpAwarded
        };
      
      default:
        return {
          type: 'level_up',
          title: 'Achievement Unlocked!',
          description: 'You did something amazing!',
          icon: <Sparkles className="w-12 h-12 text-purple-500" />,
          color: 'from-purple-400 to-pink-600'
        };
    }
  };

  const handleDismiss = () => {
    setShowCelebration(false);
    setTimeout(() => {
      dispatch(dismissCelebration());
      setCelebrationData(null);
    }, 300); // Wait for exit animation
  };

  const handleShare = () => {
    if (!celebrationData) return;
    
    // Create shareable message
    let shareText = '';
    switch (celebrationData.type) {
      case 'level_up':
        shareText = `🎉 Just reached level ${celebrationData.newLevel} on TechRec! #CareerGrowth #TechRec`;
        break;
      case 'badge_earned':
        shareText = `🏆 Earned the "${celebrationData.badgeName}" badge on TechRec! #Achievement #TechRec`;
        break;
      case 'challenge_completed':
        shareText = `✅ Completed "${celebrationData.challengeName}" challenge on TechRec! #Challenge #TechRec`;
        break;
      case 'streak_milestone':
        shareText = `🔥 ${celebrationData.streakCount}-day streak on TechRec! Consistency pays off! #Streak #TechRec`;
        break;
    }

    // Use Web Share API if available, otherwise copy to clipboard
    if (navigator.share) {
      navigator.share({
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // Could show a toast here
    }
  };

  if (!showCelebration || !celebrationData) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        data-testid="achievement-celebration-overlay"
      >
        {/* Background confetti effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -100, 
                x: Math.random() * window.innerWidth,
                rotate: 0,
                opacity: 0
              }}
              animate={{ 
                y: window.innerHeight + 100, 
                rotate: 360,
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
              className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded"
              style={{
                background: `hsl(${Math.random() * 360}, 70%, 60%)`
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="relative max-w-md w-full"
        >
          <Card 
            variant="transparent" 
            className="relative overflow-hidden bg-base-100/95 backdrop-blur-sm border-2 border-primary/30"
            data-testid="achievement-celebration-card"
          >
            {/* Gradient background */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${celebrationData.color} opacity-10`}
            />
            
            {/* Glow effect */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${celebrationData.color} opacity-20 blur-xl`}
            />

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-10 text-base-content/60 hover:text-base-content"
              data-testid="achievement-celebration-close"
            >
              <X className="w-4 h-4" />
            </Button>

            <CardContent className="relative z-10 p-8 text-center space-y-6">
              {/* Icon with pulse animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="flex justify-center"
                data-testid="achievement-celebration-icon"
              >
                {celebrationData.type === 'badge_earned' && celebrationData.badgeIcon ? (
                  <div className="text-6xl">{celebrationData.badgeIcon}</div>
                ) : (
                  celebrationData.icon
                )}
              </motion.div>

              {/* Title with gradient text */}
              <div className="space-y-2">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`text-3xl font-bold bg-gradient-to-r ${celebrationData.color} bg-clip-text text-transparent`}
                  data-testid="achievement-celebration-title"
                >
                  {celebrationData.title}
                </motion.h2>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base-content/80 text-lg"
                  data-testid="achievement-celebration-description"
                >
                  {celebrationData.description}
                </motion.p>
              </div>

              {/* XP Reward */}
              {celebrationData.xpAwarded && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="flex justify-center"
                  data-testid="achievement-celebration-xp"
                >
                  <Badge 
                    variant="outline" 
                    className="text-lg px-4 py-2 bg-primary/10 border-primary/30"
                  >
                    <Zap className="w-4 h-4 mr-2 text-primary" />
                    +{celebrationData.xpAwarded} XP
                  </Badge>
                </motion.div>
              )}

              {/* Additional details */}
              {celebrationData.type === 'level_up' && celebrationData.newLevel && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <div className="text-sm text-base-content/60">
                    You're now at level {celebrationData.newLevel}!
                  </div>
                  <div className="text-xs text-base-content/50">
                    Keep up the momentum to unlock more rewards
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3 justify-center pt-4"
                data-testid="achievement-celebration-actions"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="px-6"
                  data-testid="achievement-celebration-share"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDismiss}
                  className="px-6"
                  data-testid="achievement-celebration-continue"
                >
                  Continue
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Smaller inline celebration for less prominent achievements
export function InlineCelebration({ 
  type, 
  message, 
  xpAwarded,
  onDismiss 
}: {
  type: 'xp_gain' | 'progress' | 'completion';
  message: string;
  xpAwarded?: number;
  onDismiss?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'xp_gain':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'progress':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'completion':
        return <Star className="w-4 h-4 text-green-500" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'xp_gain':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      case 'progress':
        return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'completion':
        return 'border-green-300 bg-green-50 text-green-800';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={`
            fixed top-4 right-4 z-40 max-w-sm p-3 rounded-lg border 
            ${getColor()} backdrop-blur-sm shadow-lg
          `}
          data-testid="inline-celebration"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {getIcon()}
            </motion.div>
            
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
              {xpAwarded && (
                <p className="text-xs opacity-80">+{xpAwarded} XP</p>
              )}
            </div>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onDismiss(), 300);
                }}
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}