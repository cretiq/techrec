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

type FilterType = 'all' | 'pending' | 'accepted' | 'declined';
type SortType = 'priority' | 'type' | 'confidence';

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
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('priority');

  // Filter suggestions for this specific section/target
  const sectionSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      const matchesSection = suggestion.section === section;
      const matchesTarget = !targetId || suggestion.targetId === targetId;
      return matchesSection && matchesTarget;
    });
  }, [suggestions, section, targetId]);

  // Apply filters and sorting
  const filteredAndSortedSuggestions = useMemo(() => {
    let filtered = sectionSuggestions;

    // Apply status filter
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(s => 
          !acceptedSuggestions.has(s.id) && !declinedSuggestions.has(s.id)
        );
        break;
      case 'accepted':
        filtered = filtered.filter(s => acceptedSuggestions.has(s.id));
        break;
      case 'declined':
        filtered = filtered.filter(s => declinedSuggestions.has(s.id));
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'confidence':
          return b.confidence - a.confidence;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  }, [sectionSuggestions, filter, sortBy, acceptedSuggestions, declinedSuggestions]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = sectionSuggestions.length;
    const pending = sectionSuggestions.filter(s => 
      !acceptedSuggestions.has(s.id) && !declinedSuggestions.has(s.id)
    ).length;
    const accepted = sectionSuggestions.filter(s => 
      acceptedSuggestions.has(s.id)
    ).length;
    const declined = sectionSuggestions.filter(s => 
      declinedSuggestions.has(s.id)
    ).length;
    const highPriority = sectionSuggestions.filter(s => 
      s.priority === 'high' && !acceptedSuggestions.has(s.id) && !declinedSuggestions.has(s.id)
    ).length;

    return { total, pending, accepted, declined, highPriority };
  }, [sectionSuggestions, acceptedSuggestions, declinedSuggestions]);

  // Don't render if no suggestions for this section
  if (sectionSuggestions.length === 0) {
    return null;
  }

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const handleAcceptAll = () => {
    const pendingSuggestions = sectionSuggestions.filter(s => 
      !acceptedSuggestions.has(s.id) && !declinedSuggestions.has(s.id)
    );
    pendingSuggestions.forEach(s => onAcceptSuggestion(s.id));
  };

  const handleDeclineAll = () => {
    const pendingSuggestions = sectionSuggestions.filter(s => 
      !acceptedSuggestions.has(s.id) && !declinedSuggestions.has(s.id)
    );
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
                    className="text-xs"
                    data-testid={`suggestion-overlay-total-badge-${section}`}
                  >
                    {stats.total} total
                  </Badge>
                  {stats.pending > 0 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs text-orange-600 border-orange-300"
                      data-testid={`suggestion-overlay-pending-badge-${section}`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {stats.pending} pending
                    </Badge>
                  )}
                  {stats.accepted > 0 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs text-green-600 border-green-300"
                      data-testid={`suggestion-overlay-accepted-badge-${section}`}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {stats.accepted} applied
                    </Badge>
                  )}
                  {stats.highPriority > 0 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs text-red-600 border-red-300 bg-red-50"
                      data-testid={`suggestion-overlay-high-priority-badge-${section}`}
                    >
                      {stats.highPriority} high priority
                    </Badge>
                  )}
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

          {/* Controls bar */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/10">
                  <div className="flex items-center gap-3">
                    {/* Filter dropdown */}
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as FilterType)}
                      className="text-xs border border-base-300 rounded px-2 py-1 bg-base-100"
                      data-testid={`suggestion-overlay-filter-${section}`}
                    >
                      <option value="all">All ({stats.total})</option>
                      <option value="pending">Pending ({stats.pending})</option>
                      <option value="accepted">Applied ({stats.accepted})</option>
                      <option value="declined">Declined ({stats.declined})</option>
                    </select>

                    {/* Sort dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortType)}
                      className="text-xs border border-base-300 rounded px-2 py-1 bg-base-100"
                      data-testid={`suggestion-overlay-sort-${section}`}
                    >
                      <option value="priority">Priority</option>
                      <option value="confidence">Confidence</option>
                      <option value="type">Type</option>
                    </select>
                  </div>

                  {/* Bulk actions */}
                  {stats.pending > 0 && (
                    <div className="flex gap-2">
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
                  )}
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
                  {filteredAndSortedSuggestions.map((suggestion) => (
                    <SuggestionItem
                      key={suggestion.id}
                      suggestion={suggestion}
                      isAccepted={acceptedSuggestions.has(suggestion.id)}
                      isDeclined={declinedSuggestions.has(suggestion.id)}
                      isPending={!acceptedSuggestions.has(suggestion.id) && !declinedSuggestions.has(suggestion.id)}
                      onAccept={onAcceptSuggestion}
                      onDecline={onDeclineSuggestion}
                    />
                  ))}
                </AnimatePresence>

                {filteredAndSortedSuggestions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-base-content/60"
                    data-testid={`suggestion-overlay-empty-${section}`}
                  >
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No suggestions match the current filter</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}