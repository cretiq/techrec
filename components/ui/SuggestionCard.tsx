import React from 'react';
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import {  Button  } from '@/components/ui-daisy/button';
import { cn } from '@/lib/utils';
import { CvImprovementSuggestion } from '@/types/cv'; // Import the correct type
import { Check, X, Lightbulb, Edit3, Trash2, Move, ZoomIn } from 'lucide-react'; // Icons for actions and suggestion types

export interface SuggestionCardProps {
  suggestion: CvImprovementSuggestion;
  onAccept?: (suggestion: CvImprovementSuggestion) => void;
  onReject?: (suggestion: CvImprovementSuggestion) => void;
  // Status will be managed externally, not passed as a prop here
  isHandled?: boolean; // Indicate if the suggestion is already handled (accepted/rejected)
  className?: string;
}

// Map suggestionType to Icon and potentially color/style later
const suggestionTypeIconMap: Record<CvImprovementSuggestion['suggestionType'], React.ElementType> = {
  wording: Edit3,
  add_content: Lightbulb,
  remove_content: Trash2,
  reorder: Move,
  format: ZoomIn, // Example icon for formatting
};

// Helper function to format section name for title
const formatSectionName = (section: string): string => {
  // Example: experience[0].title -> Experience Title (Item 1)
  const parts = section.split(/[.\[\]]/).filter(Boolean);
  let formatted = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  if (parts[1] && !isNaN(Number(parts[1]))) {
    formatted += ` (Item ${Number(parts[1]) + 1})`;
    if (parts[2]) {
      formatted += ` - ${parts[2].charAt(0).toUpperCase() + parts[2].slice(1)}`;
    }
  } else if (parts[1]) {
    formatted += ` - ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}`;
  }
  return formatted;
};

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onAccept,
  onReject,
  isHandled = false, // Default to not handled
  className
}) => {
  const {
    section,
    suggestionType,
    originalText,
    suggestedText,
    reasoning
  } = suggestion;

  // Derive title and icon from existing fields
  const displayTitle = `Suggestion: ${formatSectionName(section)}`;
  const SuggestionIcon = suggestionTypeIconMap[suggestionType] || Lightbulb; // Default icon

  return (
    <Card className={cn("w-full flex flex-col transition-opacity duration-300", className, isHandled ? 'opacity-60' : 'opacity-100')}>
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className='flex items-center gap-2'>
            <SuggestionIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <CardTitle className='text-base font-semibold leading-tight'>{displayTitle}</CardTitle>
          </div>
          {/* Suggestion Type Badge */}
          <span className="text-xs capitalize px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground whitespace-nowrap">
            {suggestionType.replace('_', ' ')}
          </span>
        </div>
        <CardDescription className='text-sm'>{reasoning}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow text-sm space-y-3">
        {originalText && suggestedText && (
          <div className='space-y-1.5'>
            <p className="text-muted-foreground text-xs font-medium">PROPOSED CHANGE</p>
            <div className="p-2 rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <span className="text-red-700 dark:text-red-400 line-through break-words">{originalText}</span>
            </div>
            <div className="p-2 rounded bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
              <span className="text-green-700 dark:text-green-400 break-words">{suggestedText}</span>
            </div>
          </div>
        )}
        {!originalText && suggestedText && suggestionType === 'add_content' && (
          <div className='space-y-1.5'>
            <p className="text-muted-foreground text-xs font-medium">SUGGESTED ADDITION</p>
            <div className="p-2 rounded bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
              <span className="text-green-700 dark:text-green-400 break-words">{suggestedText}</span>
            </div>
          </div>
        )}
        {originalText && !suggestedText && suggestionType === 'remove_content' && (
          <div className='space-y-1.5'>
            <p className="text-muted-foreground text-xs font-medium">SUGGESTED REMOVAL</p>
            <div className="p-2 rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <span className="text-red-700 dark:text-red-400 line-through break-words">{originalText}</span>
            </div>
          </div>
        )}
      </CardContent>
      {/* Show actions only if not handled and handlers are provided */}
      {!isHandled && (onAccept || onReject) && (
        <CardFooter className="flex flex-wrap justify-end gap-2 pt-4 border-t mt-auto">
          {onReject && (
            <Button
              variant='ghost' // Changed variant for less emphasis
              size='sm'
              onClick={() => onReject(suggestion)}
              className='text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
            >
              <X className="w-4 h-4 mr-1" /> Reject
            </Button>
          )}
          {onAccept && (
            <Button
              variant='ghost' // Changed variant for less emphasis
              size='sm'
              onClick={() => onAccept(suggestion)}
              className='text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
            >
              <Check className="w-4 h-4 mr-1" /> Accept
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}; 