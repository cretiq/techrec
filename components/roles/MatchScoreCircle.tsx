// components/roles/MatchScoreCircle.tsx
// Circular match indicator component for role cards

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MatchScoreCircleProps } from '@/types/matching';

const MatchScoreCircle: React.FC<MatchScoreCircleProps> = ({
  score,
  size = 'md',
  showTooltip = true,
  animate = true,
  hasSkillsListed,
  loading = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  
  // Size configurations
  const sizeConfig = {
    sm: { diameter: 20, strokeWidth: 2, fontSize: 'text-xs' },
    md: { diameter: 24, strokeWidth: 2.5, fontSize: 'text-xs' },
    lg: { diameter: 32, strokeWidth: 3, fontSize: 'text-sm' }
  };
  
  const { diameter, strokeWidth, fontSize } = sizeConfig[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Animation trigger
  useEffect(() => {
    if (animate && hasSkillsListed && score > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [score, animate, hasSkillsListed]);
  
  // Score-based styling
  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-500';
  };
  
  const getCircleColor = (score: number): string => {
    if (score >= 70) return 'stroke-green-500';
    if (score >= 40) return 'stroke-yellow-500';
    return 'stroke-red-400';
  };
  
  const getBackgroundColor = (score: number): string => {
    if (score >= 70) return 'bg-green-50';
    if (score >= 40) return 'bg-yellow-50';
    return 'bg-red-50';
  };
  
  // Loading state
  if (loading) {
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center rounded-full bg-base-200/50",
          "border border-base-300/50"
        )}
        style={{ width: diameter, height: diameter }}
        data-testid="match-score-circle-loading"
        title="Calculating match score..."
      >
        <Loader2 className="h-3 w-3 animate-spin text-base-content/60" />
      </div>
    );
  }
  
  // No skills listed state
  if (!hasSkillsListed) {
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "bg-base-200/50 border border-base-300/50 group cursor-help"
        )}
        style={{ width: diameter, height: diameter }}
        data-testid="match-score-circle-no-skills"
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        title="Skills not specified for this role"
      >
        <HelpCircle className="h-3 w-3 text-base-content/60 group-hover:text-base-content/80 transition-colors" />
        
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && showTooltipState && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className={cn(
                "absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2",
                "bg-base-100 text-base-content text-xs rounded-lg px-3 py-2 shadow-lg",
                "border border-base-300 whitespace-nowrap z-50"
              )}
            >
              <div className="text-center">
                <div className="font-medium">Skills not specified</div>
                <div className="text-base-content/60">Cannot calculate match</div>
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-300"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  // Score display state
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-full group cursor-help",
        getBackgroundColor(score),
        "border border-base-300/50 hover:shadow-md transition-all duration-200"
      )}
      style={{ width: diameter, height: diameter }}
      data-testid="match-score-circle"
      onMouseEnter={() => showTooltip && setShowTooltipState(true)}
      onMouseLeave={() => setShowTooltipState(false)}
      title={`${score}% match score`}
    >
      {/* Background circle */}
      <svg
        width={diameter}
        height={diameter}
        className="absolute inset-0 transform -rotate-90"
      >
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-base-300/30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(getCircleColor(score), "transition-colors duration-300")}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: animate ? circumference : strokeDashoffset,
          }}
          initial={animate ? { strokeDashoffset: circumference } : undefined}
          animate={animate ? { strokeDashoffset } : undefined}
          transition={animate ? { 
            duration: 1.2, 
            ease: "easeOut",
            delay: 0.2 
          } : undefined}
        />
      </svg>
      
      {/* Score text */}
      <motion.span
        className={cn(
          fontSize,
          "font-semibold leading-none",
          getScoreColor(score),
          "relative z-10"
        )}
        initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
        animate={animate ? { opacity: 1, scale: 1 } : undefined}
        transition={animate ? { 
          duration: 0.4, 
          delay: 0.8,
          ease: "easeOut" 
        } : undefined}
        data-testid="match-score-text"
      >
        {score}%
      </motion.span>
      
      {/* Sparkle animation for high scores */}
      <AnimatePresence>
        {isAnimating && score >= 70 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                style={{
                  top: '10%',
                  left: '50%',
                  transformOrigin: '0 12px',
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  rotate: i * 90 
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0, 1, 1, 0],
                  y: [-2, -8, -12, -16],
                  rotate: i * 90 + 45
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: 1 + i * 0.1,
                  ease: "easeOut" 
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && showTooltipState && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2",
              "bg-base-100 text-base-content text-xs rounded-lg px-3 py-2 shadow-lg",
              "border border-base-300 whitespace-nowrap z-50"
            )}
          >
            <div className="text-center">
              <div className="font-medium">{score}% Skills Match</div>
              <div className="text-base-content/60">
                {score >= 70 && "Excellent fit!"}
                {score >= 40 && score < 70 && "Good potential match"}
                {score < 40 && "Limited skill overlap"}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-300"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchScoreCircle;