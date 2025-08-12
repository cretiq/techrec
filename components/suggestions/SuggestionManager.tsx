'use client';

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { AppDispatch } from '@/lib/store';
import { 
  selectSuggestions, 
  selectAcceptedSuggestions, 
  selectDeclinedSuggestions,
  selectSuggestionsVisibility,
  selectSectionVisibility,
  acceptSuggestion,
  declineSuggestion,
  setSectionVisibility,
  selectSuggestionsLoading,
  selectSuggestionsError,
  selectSuggestionsStats
} from '@/lib/features/suggestionsSlice';
import { 
  updateAnalysisData,
  selectCurrentAnalysisData,
  clearRecentlyUpdatedPaths
} from '@/lib/features/analysisSlice';
import { SuggestionOverlay } from './SuggestionOverlay';
import { MvpSuggestionDisplay } from './MvpSuggestionDisplay';
import { useToast } from '@/components/ui-daisy/use-toast';

interface SuggestionManagerProps {
  section: string; // Target section (experience, education, skills, about)
  targetId?: string; // Specific item ID within section
  targetField?: string; // Specific field within item (e.g., "title", "responsibilities[0]")
  className?: string;
}

export function SuggestionManager({
  section,
  targetId,
  targetField,
  className
}: SuggestionManagerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // Early return if this is contactInfo section - no suggestions allowed
  if (section === 'contactInfo') {
    return null;
  }

  // Redux selectors
  const suggestions = useSelector(selectSuggestions);
  const acceptedSuggestions = useSelector(selectAcceptedSuggestions);
  const declinedSuggestions = useSelector(selectDeclinedSuggestions);
  const isGloballyVisible = useSelector(selectSuggestionsVisibility);
  const isSectionVisible = useSelector(selectSectionVisibility(section));
  const isLoading = useSelector(selectSuggestionsLoading);
  const error = useSelector(selectSuggestionsError);
  const stats = useSelector(selectSuggestionsStats);
  const currentAnalysisData = useSelector(selectCurrentAnalysisData);

  // Filter suggestions for this section/target/field
  const sectionSuggestions = suggestions.filter(suggestion => {
    const matchesSection = suggestion.section === section;
    const matchesTarget = !targetId || (suggestion as any).targetId === targetId;
    const matchesField = !targetField || (suggestion as any).targetField === targetField;
    return matchesSection && matchesTarget && matchesField;
  });

  // Check if this is an MVP suggestion (text-based)
  const isMvpSuggestion = section === 'overall' && sectionSuggestions.length > 0 && 
    sectionSuggestions[0] && (sectionSuggestions[0] as any).type === 'text';
  
  // Debug logging for suggestion filtering
  console.log(`🔍 [SuggestionManager] Filtering for section: "${section}", targetId: "${targetId || 'none'}", targetField: "${targetField || 'none'}"`);
  console.log(`📊 [SuggestionManager] Total suggestions: ${suggestions.length}`);
  console.log(`📊 [SuggestionManager] Filtered suggestions: ${sectionSuggestions.length}`);
  console.log(`🏷️ [SuggestionManager] Is MVP suggestion: ${isMvpSuggestion}`);
  if (suggestions.length > 0 && sectionSuggestions.length === 0) {
    console.log('⚠️ [SuggestionManager] No matches! Available sections:', 
      [...new Set(suggestions.map(s => s.section))].join(', '));
    if (targetId || targetField) {
      console.log('⚠️ [SuggestionManager] Available targetIds:', 
        [...new Set(suggestions.map(s => (s as any).targetId).filter(Boolean))].join(', '));
      console.log('⚠️ [SuggestionManager] Available targetFields:', 
        [...new Set(suggestions.map(s => (s as any).targetField).filter(Boolean))].join(', '));
    }
  }

  // Handle accepting a suggestion
  const handleAcceptSuggestion = useCallback(async (suggestionId: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) {
        console.error('Suggestion not found:', suggestionId);
        return;
      }

      console.log('🎯 [SuggestionManager] Accepting suggestion:', {
        id: suggestionId,
        section: suggestion.section,
        suggestedContent: suggestion.suggestedContent,
        currentData: currentAnalysisData?.[suggestion.section as keyof typeof currentAnalysisData]
      });

      // Step 1: Update the actual CV data in the analysis slice
      if (currentAnalysisData && suggestion.suggestedContent) {
        dispatch(updateAnalysisData({ 
          path: suggestion.section, 
          value: suggestion.suggestedContent 
        }));
        console.log('✅ [SuggestionManager] Updated analysis data for section:', suggestion.section);
      } else {
        console.warn('⚠️ [SuggestionManager] Cannot update CV data - missing data or content:', {
          hasAnalysisData: !!currentAnalysisData,
          hasSuggestedContent: !!suggestion.suggestedContent
        });
      }

      // Step 2: Mark suggestion as accepted in suggestions slice
      dispatch(acceptSuggestion({ 
        suggestionId, 
        appliedContent: suggestion.suggestedContent 
      }));

      // Step 3: Show success toast
      toast({
        title: "Suggestion Applied!",
        description: `"${suggestion.title}" has been applied to your ${suggestion.section} section.`,
      });

      console.log('✅ [SuggestionManager] Successfully applied suggestion:', suggestion.id);

      // Clear the green highlighting after 3 seconds
      setTimeout(() => {
        dispatch(clearRecentlyUpdatedPaths());
      }, 3000);
      
    } catch (error) {
      console.error('❌ [SuggestionManager] Error accepting suggestion:', error);
      toast({
        title: "Error Applying Suggestion",
        description: "Failed to update your CV data. Please try again.",
        variant: "destructive",
      });
    }
  }, [suggestions, dispatch, toast, currentAnalysisData]);

  // Handle declining a suggestion
  const handleDeclineSuggestion = useCallback(async (suggestionId: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return;

      // Dispatch decline action
      dispatch(declineSuggestion(suggestionId));

      // Show toast
      toast({
        title: "Suggestion Declined",
        description: `"${suggestion.title}" has been marked as declined.`,
      });

      console.log('Declined suggestion:', suggestion);
      
    } catch (error) {
      console.error('Error declining suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to decline suggestion. Please try again.",
        variant: "destructive",
      });
    }
  }, [suggestions, dispatch, toast]);

  // Handle section visibility toggle
  const handleToggleSectionVisibility = useCallback(() => {
    dispatch(setSectionVisibility({ 
      section, 
      visible: !isSectionVisible 
    }));
  }, [dispatch, section, isSectionVisible]);

  // Don't render if no suggestions for this section or globally hidden
  if (!isGloballyVisible || sectionSuggestions.length === 0) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-red-50 border border-red-200 rounded-lg"
        data-testid={`suggestion-manager-error-${section}`}
      >
        <p className="text-sm text-red-700">
          Error loading suggestions: {error}
        </p>
      </motion.div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
        data-testid={`suggestion-manager-loading-${section}`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
          />
          <p className="text-sm text-primary">
            Loading AI suggestions for {section}...
          </p>
        </div>
      </motion.div>
    );
  }

  // Handle MVP suggestions differently
  if (isMvpSuggestion && isSectionVisible) {
    const mvpSuggestion = sectionSuggestions[0];
    return (
      <MvpSuggestionDisplay
        suggestions={mvpSuggestion.suggestedContent}
        analysisTime={(mvpSuggestion as any).analysisTime}
        fromCache={(mvpSuggestion as any).fromCache}
        className={className}
      />
    );
  }

  return (
    <AnimatePresence>
      {isSectionVisible && (
        <SuggestionOverlay
          suggestions={sectionSuggestions}
          section={section}
          targetId={targetId}
          acceptedSuggestions={acceptedSuggestions}
          declinedSuggestions={declinedSuggestions}
          onAcceptSuggestion={handleAcceptSuggestion}
          onDeclineSuggestion={handleDeclineSuggestion}
          onToggleVisibility={handleToggleSectionVisibility}
          isVisible={isSectionVisible}
          className={className}
        />
      )}
    </AnimatePresence>
  );
}

// Hook for fetching suggestions
export function useSuggestionsFetcher() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const fetchSuggestions = useCallback(async (analysisData: any) => {
    try {
      dispatch({ type: 'suggestions/setLoading', payload: true });

      const response = await fetch('/api/cv-improvement-mvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `AI service failed (${response.status})`);
      }

      const result = await response.json();
      
      // For MVP, the suggestions are plain text, so we need to format them differently
      const formattedResult = {
        suggestions: [{
          id: 'mvp-suggestions-' + Date.now(),
          section: 'overall',
          title: 'Resume Improvement Suggestions',
          suggestedContent: result.suggestions,
          confidence: 0.9,
          type: 'text',
          analysisTime: result.analysisTime,
          fromCache: result.fromCache
        }],
        fromCache: result.fromCache,
        analysisTime: result.analysisTime,
        debugSessionId: result.debugSessionId
      };
      
      // Dispatch the formatted suggestions to Redux
      dispatch({ type: 'suggestions/setSuggestions', payload: formattedResult });

      // Show success toast
      const fromCache = result.fromCache ? " (cached)" : "";
      toast({
        title: "AI Suggestions Generated!",
        description: `Resume improvement suggestions ready${fromCache}.`,
      });

      return formattedResult;
      
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      dispatch({ type: 'suggestions/setError', payload: error.message });
      
      toast({
        title: "Failed to Get Suggestions",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      
      throw error;
    }
  }, [dispatch, toast]);

  return { fetchSuggestions };
}