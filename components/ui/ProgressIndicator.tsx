import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, Variants } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2 } from 'lucide-react';

export interface Milestone {
  value: number; // Percentage value 0-100 where milestone sits
  label: string;
  completed: boolean;
}

export interface ProgressIndicatorProps {
  value?: number; // Percentage value 0-100
  type?: 'bar' | 'circle' | 'milestone';
  size?: 'sm' | 'md' | 'lg'; // Affects circle size and milestone track height
  showLabel?: boolean; // Show percentage label inside circle
  milestones?: Milestone[]; // Add milestones prop back
}

// Basic SVG Circle implementation using framer-motion
const CircularProgress: React.FC<{ value: number; size: number; strokeWidth: number; showLabel?: boolean }> = ({ value, size, strokeWidth, showLabel }) => {
  const radius = (size - strokeWidth) / 2;
  const pathLength = 1;
  const pathProgress = value / 100;

  // Define variants for the animation
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const progress = i / 100;
      return {
        pathLength: progress,
        opacity: 1,
        transition: {
          pathLength: { type: "spring", duration: 1.5, bounce: 0 },
          opacity: { duration: 0.01 }
        }
      };
    }
  };

  return (
    <motion.svg
      height={size}
      width={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <motion.circle
        className="text-muted/20"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <motion.circle
        className="text-primary"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        variants={draw}
        custom={value}
        initial="hidden"
        animate="visible"
      />
      {showLabel && (
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          className="text-xs font-medium fill-foreground rotate-90 origin-center"
        >
          {`${Math.round(value)}%`}
        </text>
      )}
    </motion.svg>
  );
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value = 0,
  type = 'bar',
  size = 'md',
  showLabel = true,
  milestones = []
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  const circleSizes = {
    sm: { dimension: 40, stroke: 4 },
    md: { dimension: 60, stroke: 6 },
    lg: { dimension: 80, stroke: 8 },
  };

  if (type === 'circle') {
    const { dimension, stroke } = circleSizes[size];
    return (
      <div className="inline-flex items-center justify-center">
        <CircularProgress value={clampedValue} size={dimension} strokeWidth={stroke} showLabel={showLabel} />
      </div>
    );
  }

  if (type === 'milestone') {
    const trackHeight = {
      sm: "h-1.5",
      md: "h-2",
      lg: "h-3",
    }[size];

    const markerSize = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    }[size];

    return (
      <TooltipProvider delayDuration={200}>
        <div className="relative w-full pt-4 pb-2">
          <div className={cn("absolute top-0 left-0 w-full rounded-full bg-muted", trackHeight)} />
          <motion.div 
            className={cn("absolute top-0 left-0 rounded-full bg-primary", trackHeight)}
            initial={{ width: "0%" }}
            animate={{ width: `${clampedValue}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          {milestones.map((milestone, index) => {
            const isCompleted = milestone.completed || clampedValue >= milestone.value;
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
                    style={{ left: `${milestone.value}%` }}
                  >
                    <div 
                      className={cn(
                        "rounded-full border-2 border-background dark:border-background",
                        markerSize,
                        isCompleted ? "bg-primary" : "bg-muted-foreground"
                      )}
                      aria-label={`Milestone: ${milestone.label} at ${milestone.value}%${isCompleted ? ' (Completed)' : ''}`}
                    />
                    {isCompleted && (
                      <CheckCircle2 className={cn("absolute text-primary-foreground dark:text-primary-foreground", size === 'sm' ? "w-2 h-2" : size === 'md' ? "w-2.5 h-2.5" : "w-3 h-3")} />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{milestone.label} ({milestone.value}%)</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  // Default to bar
  return <Progress value={clampedValue} className={cn("w-full", size === 'sm' ? "h-1.5" : size === 'lg' ? "h-3" : "h-2")} />;
}; 