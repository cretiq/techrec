'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Sparkles,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedCvSuggestion } from '@/types/cv';
import { SuggestionItem } from './SuggestionItem';

interface SuggestionOverlayProps {
  suggestions: EnhancedCvSuggestion[];
  section: string; // Target section (experience, education, skills, about)
  targetId?: string; // Specific item ID within section
  acceptedSuggestions: Set<string>;
  declinedSuggestions: Set<string>;
  onAcceptSuggestion: (suggestionId: string) => void;
  onDeclineSuggestion: (suggestionId: string) => void;
  className?: string;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

// Removed filter and sort types to simplify UI

export function SuggestionOverlay({
  suggestions,
  section,
  targetId,
  acceptedSuggestions,
  declinedSuggestions,
  onAcceptSuggestion,
  onDeclineSuggestion,
  className,
  isVisible = true,
  onToggleVisibility
}: SuggestionOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter suggestions for this specific section/target
  const sectionSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      const matchesSection = suggestion.section === section;
      const matchesTarget = !targetId || suggestion.targetId === targetId;
      return matchesSection && matchesTarget;
    });
  }, [suggestions, section, targetId]);

  // Only show pending suggestions (not accepted or declined)
  const pendingSuggestions = useMemo(() => {
    return sectionSuggestions.filter(s => 
      !acceptedSuggestions.has(s.id) && !declinedSuggestions.has(s.id)
    );
  }, [sectionSuggestions, acceptedSuggestions, declinedSuggestions]);

  // Calculate statistics - simplified to just pending count
  const stats = useMemo(() => {
    const pending = pendingSuggestions.length;
    return { pending };
  }, [pendingSuggestions]);

  // Don't render if no pending suggestions for this section
  if (pendingSuggestions.length === 0) {
    return null;
  }

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const handleAcceptAll = () => {
    pendingSuggestions.forEach(s => onAcceptSuggestion(s.id));
  };

  const handleDeclineAll = () => {
    pendingSuggestions.forEach(s => onDeclineSuggestion(s.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-sm border border-primary/20 rounded-lg shadow-lg overflow-hidden",
        className
      )}
      data-testid={`suggestion-overlay-${section}${targetId ? `-${targetId}` : ''}`}
    >
      {/* Magical shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />

      <div className="relative">
        {/* Header */}
        <div className="p-4 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>
              
              <div>
                <h3 
                  className="font-semibold text-base-content"
                  data-testid={`suggestion-overlay-title-${section}`}
                >
                  AI Suggestions
                  {targetId && <span className="text-base-content/60 ml-1">for this item</span>}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs text-orange-600 border-orange-300"
                    data-testid={`suggestion-overlay-pending-badge-${section}`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.pending} suggestion{stats.pending !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Visibility toggle */}
              {onToggleVisibility && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleVisibility}
                  className="p-2 h-8 w-8"
                  data-testid={`suggestion-overlay-visibility-toggle-${section}`}
                >
                  {isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {/* Expand/collapse toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 h-8 w-8"
                data-testid={`suggestion-overlay-expand-toggle-${section}`}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Bulk actions - simplified */}
          <AnimatePresence>
            {isExpanded && stats.pending > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-primary/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeclineAll}
                    className="text-xs px-3 py-1 h-7 text-red-600 border-red-300 hover:bg-red-50"
                    data-testid={`suggestion-overlay-decline-all-${section}`}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Decline All
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAcceptAll}
                    className="text-xs px-3 py-1 h-7 bg-green-600 hover:bg-green-700"
                    data-testid={`suggestion-overlay-accept-all-${section}`}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Accept All
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions list */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div 
                className="p-4 space-y-3 max-h-96 overflow-y-auto"
                data-testid={`suggestion-overlay-list-${section}`}
              >
                <AnimatePresence mode="popLayout">
                  {pendingSuggestions.map((suggestion, index) => {
                    // Ensure unique key, fallback to index if id is missing or duplicate
                    const uniqueKey = suggestion.id && suggestion.id.trim() !== '' 
                      ? `${suggestion.id}-${section}-${index}` 
                      : `${section}-suggestion-${index}`;
                    
                    return (
                      <SuggestionItem
                        key={uniqueKey}
                        suggestion={suggestion}
                        isAccepted={false} // All pending suggestions are not accepted
                        isDeclined={false} // All pending suggestions are not declined
                        isPending={true} // All pending suggestions are pending
                        onAccept={onAcceptSuggestion}
                        onDecline={onDeclineSuggestion}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}