'use client';

import React, { useState } from 'react';
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
        <div
          className="flex items-center gap-2 text-success-content bg-success/20 px-3 py-1 rounded-full"
          data-testid={`suggestion-status-accepted-${suggestion.id}`}
        >
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Applied</span>
        </div>
      );
    }
    
    if (isDeclined) {
      return (
        <div
          className="flex items-center gap-2 text-error-content bg-error/20 px-3 py-1 rounded-full"
          data-testid={`suggestion-status-declined-${suggestion.id}`}
        >
          <X className="h-4 w-4" />
          <span className="text-sm font-medium">Declined</span>
        </div>
      );
    }

    return (
      <div className="flex gap-2" data-testid={`suggestion-actions-${suggestion.id}`}>
        <Button
          size="sm"
          variant="default"
          onClick={handleAccept}
          disabled={isProcessing}
          data-testid={`suggestion-button-accept-${suggestion.id}`}
        >
          {isProcessing ? (
            <div className="h-3 w-3 border border-success-content border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check className="h-3 w-3 mr-1" />
              Accept
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDecline}
          disabled={isProcessing}
          data-testid={`suggestion-button-decline-${suggestion.id}`}
        >
          {isProcessing ? (
            <div className="h-3 w-3 border border-error border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <X className="h-3 w-3 mr-1" />
              Decline
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg transition-all duration-100",
        "bg-base-100/60 backdrop-blur-sm",
        config.bgColor,
        isAccepted && "ring-2 ring-success/50 bg-success/10",
        isDeclined && "ring-2 ring-error/50 bg-error/10 opacity-60",
        className
      )}
      data-testid={`suggestion-item-${suggestion.id}`}
    >
      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <IconComponent className={cn("h-5 w-5", config.color)} />
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
    </div>
  );
}