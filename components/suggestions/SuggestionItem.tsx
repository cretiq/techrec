'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { 
  Check, 
  X, 
  Plus, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp,
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
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Experience Enhancement'
  },
  education_gap: {
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Education Info'
  },
  missing_skill: {
    icon: Plus,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Missing Skill'
  },
  summary_improvement: {
    icon: User,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Summary Enhancement'
  },
  general_improvement: {
    icon: Lightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'General Improvement'
  }
};

const priorityConfig = {
  high: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'High Priority'
  },
  medium: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Medium Priority'
  },
  low: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
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
  const [isExpanded, setIsExpanded] = useState(false);
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
          className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full"
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
          className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-1 rounded-full"
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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 h-8"
            data-testid={`suggestion-button-accept-${suggestion.id}`}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 border border-white border-t-transparent rounded-full"
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
            className="border-red-300 text-red-600 hover:bg-red-50 px-4 py-1 h-8"
            data-testid={`suggestion-button-decline-${suggestion.id}`}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 border border-red-600 border-t-transparent rounded-full"
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
        config.bgColor,
        config.borderColor,
        isAccepted && "ring-2 ring-green-300 bg-green-50",
        isDeclined && "ring-2 ring-red-300 bg-red-50 opacity-60",
        isPending && "hover:shadow-md cursor-pointer",
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
            className="bg-green-50 border border-green-200 rounded-lg p-3"
            data-testid={`suggestion-content-preview-${suggestion.id}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Suggested Addition</span>
            </div>
            <p className="text-sm text-green-700 font-medium leading-relaxed">
              {suggestion.suggestedContent}
            </p>
          </div>

          {/* Expandable reasoning */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs text-base-content/60 hover:text-base-content/80 transition-colors"
            data-testid={`suggestion-expand-button-${suggestion.id}`}
          >
            <span>Why this helps</span>
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </motion.button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div 
                  className="bg-base-100/50 rounded-lg p-3 border border-base-300/30"
                  data-testid={`suggestion-reasoning-${suggestion.id}`}
                >
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    {suggestion.reasoning}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}