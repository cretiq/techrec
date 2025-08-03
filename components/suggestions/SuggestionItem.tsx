'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { TooltipEnhanced } from '@/components/ui-daisy/tooltip';
import { 
  Check, 
  X, 
  Plus, 
  Lightbulb, 
  Sparkles,
  Target,
  BookOpen,
  User,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedCvSuggestion } from '@/types/cv';

interface SuggestionItemProps {
  suggestion: EnhancedCvSuggestion;
  isAccepted?: boolean;
  isDeclined?: boolean;
  isPending?: boolean;
  onAccept: (suggestionId: string) => void;
  onDecline: (suggestionId: string) => void;
  className?: string;
}

const typeConfig = {
  experience_bullet: {
    icon: Target,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    label: 'Experience Enhancement'
  },
  education_gap: {
    icon: BookOpen,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/30',
    label: 'Education Info'
  },
  missing_skill: {
    icon: Plus,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    label: 'Missing Skill'
  },
  summary_improvement: {
    icon: User,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    label: 'Summary Enhancement'
  },
  general_improvement: {
    icon: Lightbulb,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
    label: 'General Improvement'
  }
};

const priorityConfig = {
  high: {
    color: 'text-error',
    bgColor: 'bg-error/20',
    label: 'High Priority'
  },
  medium: {
    color: 'text-warning',
    bgColor: 'bg-warning/20',
    label: 'Medium Priority'
  },
  low: {
    color: 'text-info',
    bgColor: 'bg-info/20',
    label: 'Low Priority'
  }
};

export function SuggestionItem({
  suggestion,
  isAccepted = false,
  isDeclined = false,
  isPending = true,
  onAccept,
  onDecline,
  className
}: SuggestionItemProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const config = typeConfig[suggestion.type];
  const priorityStyle = priorityConfig[suggestion.priority];
  const IconComponent = config.icon;

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(suggestion.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await onDecline(suggestion.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusDisplay = () => {
    if (isAccepted) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 text-success-content bg-success/20 px-3 py-1 rounded-full"
          data-testid={`suggestion-status-accepted-${suggestion.id}`}
        >
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Applied</span>
        </motion.div>
      );
    }
    
    if (isDeclined) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 text-error-content bg-error/20 px-3 py-1 rounded-full"
          data-testid={`suggestion-status-declined-${suggestion.id}`}
        >
          <X className="h-4 w-4" />
          <span className="text-sm font-medium">Declined</span>
        </motion.div>
      );
    }

    return (
      <div className="flex gap-2" data-testid={`suggestion-actions-${suggestion.id}`}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            variant="default"
            onClick={handleAccept}
            disabled={isProcessing}
            className="btn-success px-4 py-1 h-8"
            data-testid={`suggestion-button-accept-${suggestion.id}`}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 border border-success-content border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                Accept
              </>
            )}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDecline}
            disabled={isProcessing}
            className="btn-error btn-outline px-4 py-1 h-8"
            data-testid={`suggestion-button-decline-${suggestion.id}`}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 border border-error border-t-transparent rounded-full"
              />
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Decline
              </>
            )}
          </Button>
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-lg border transition-all duration-200",
        "bg-base-100/60 backdrop-blur-sm border-base-300/50",
        config.bgColor,
        config.borderColor,
        isAccepted && "ring-2 ring-success/50 bg-success/10",
        isDeclined && "ring-2 ring-error/50 bg-error/10 opacity-60",
        isPending && "hover:bg-base-100/80 hover:border-base-300/70 cursor-pointer",
        className
      )}
      data-testid={`suggestion-item-${suggestion.id}`}
    >
      {/* Shimmer effect for new suggestions */}
      {isPending && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
      )}

      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className={cn("p-2 rounded-lg", config.bgColor)}
            >
              <IconComponent className={cn("h-5 w-5", config.color)} />
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", config.color)}
                  data-testid={`suggestion-badge-type-${suggestion.id}`}
                >
                  {config.label}
                </Badge>
                {suggestion.priority === 'high' && (
                  <Badge 
                    variant="outline"
                    className={cn("text-xs", priorityStyle.color, priorityStyle.bgColor)}
                    data-testid={`suggestion-badge-priority-${suggestion.id}`}
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {priorityStyle.label}
                  </Badge>
                )}
              </div>
              
              <h4 
                className="font-semibold text-base-content text-sm leading-tight truncate"
                data-testid={`suggestion-title-${suggestion.id}`}
              >
                {suggestion.title}
              </h4>
              
              {suggestion.confidence && (
                <div className="mt-1 text-xs text-base-content/60">
                  Confidence: {Math.round(suggestion.confidence * 100)}%
                </div>
              )}
            </div>
          </div>
          
          {getStatusDisplay()}
        </div>

        {/* Suggested Content Preview */}
        <div className="space-y-2">
          <div 
            className="bg-success/20 border border-success/50 rounded-lg p-3"
            data-testid={`suggestion-content-preview-${suggestion.id}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success-content">Suggested Addition</span>
            </div>
            <p className="text-sm text-success-content/90 font-medium leading-relaxed">
              {suggestion.suggestedContent}
            </p>
          </div>

          {/* Tooltip for reasoning */}
          <TooltipEnhanced
            content={
              <div className="max-w-xs">
                <p className="text-sm leading-relaxed">
                  {suggestion.reasoning}
                </p>
              </div>
            }
            position="top"
            size="medium"
            className="inline-block"
          >
            <span 
              className="text-xs text-base-content/60 hover:text-base-content/80 transition-colors cursor-help underline decoration-dotted"
              data-testid={`suggestion-reasoning-tooltip-${suggestion.id}`}
            >
              Why this helps
            </span>
          </TooltipEnhanced>
        </div>
      </div>
    </motion.div>
  );
}