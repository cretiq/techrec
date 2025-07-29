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
  selectCurrentAnalysisData
} from '@/lib/features/analysisSlice';
import { SuggestionOverlay } from './SuggestionOverlay';
import { useToast } from '@/components/ui/use-toast';

interface SuggestionManagerProps {
  section: string; // Target section (experience, education, skills, about)
  targetId?: string; // Specific item ID within section
  className?: string;
}

export function SuggestionManager({
  section,
  targetId,
  className
}: SuggestionManagerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

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

  // Filter suggestions for this section/target
  const sectionSuggestions = suggestions.filter(suggestion => {
    const matchesSection = suggestion.section === section;
    const matchesTarget = !targetId || suggestion.targetId === targetId;
    return matchesSection && matchesTarget;
  });

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

      const response = await fetch('/api/cv-improvement', {
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
      
      // Dispatch the suggestions to Redux
      dispatch({ type: 'suggestions/setSuggestions', payload: result });

      // Show success toast
      const fromCache = result.fromCache ? " (cached)" : "";
      toast({
        title: "AI Suggestions Generated!",
        description: `Found ${result.suggestions?.length || 0} improvement suggestions${fromCache}.`,
      });

      return result;
      
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