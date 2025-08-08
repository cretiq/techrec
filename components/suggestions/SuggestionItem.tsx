'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { Card } from '@/components/ui-daisy/card';
import { Tooltip } from '@/components/ui-daisy/tooltip';
import { 
  Check, 
  X, 
  Plus, 
  Sparkles,
  Target,
  BookOpen,
  User,
  AlertCircle,
  HelpCircle
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
    icon: AlertCircle,
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

    return null;
  };

  return (
    <Card
      variant="transparent" 
      className={cn(
        "border-0",
        isAccepted && "ring-2 ring-success/50 bg-success/10",
        isDeclined && "ring-2 ring-error/50 bg-error/10 opacity-60",
        className
      )}
      data-testid={`suggestion-item-${suggestion.id}`}
    >
      {(isAccepted || isDeclined) && (
        <div className="flex items-start justify-between gap-3 mb-3">
          {getStatusDisplay()}
        </div>
      )}

      {/* Suggested Content */}
      <Tooltip
        content={suggestion.reasoning}
        position="top"
        size="large"
        className="block"
      >
        <div 
          className="relative bg-success/5 rounded-lg p-4 cursor-help hover:bg-success/10 transition-colors"
          data-testid={`suggestion-content-preview-${suggestion.id}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-base-content/60" />
            <span className="text-sm font-medium text-base-content/70">Suggested Addition</span>
          </div>
          
          <p className="text-base text-base-content font-medium leading-relaxed mb-4">
            {suggestion.suggestedContent}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {isPending && (
                <>
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
                </>
              )}
            </div>
            
            <HelpCircle 
              className="h-4 w-4 text-base-content/40" 
              data-testid={`suggestion-reasoning-tooltip-${suggestion.id}`}
            />
          </div>
        </div>
      </Tooltip>
    </Card>
  );
}