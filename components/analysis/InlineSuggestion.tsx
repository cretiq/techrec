import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CvImprovementSuggestion } from '@/types/cv';
import { Check, X, Lightbulb, Edit3, Trash2, Move, ZoomIn } from 'lucide-react';
import { motion } from 'framer-motion';
// Import shared animation config
import { defaultTransition, exitTransition } from '@/lib/animation-config';

export interface InlineSuggestionProps {
  suggestion: CvImprovementSuggestion;
  onAccept?: (suggestion: CvImprovementSuggestion) => void;
  onReject?: (suggestion: CvImprovementSuggestion) => void;
  // isHandled might be added later if needed for styling accepted/rejected ones differently inline
}

// Map suggestionType to Icon
const suggestionTypeIconMap: Record<CvImprovementSuggestion['suggestionType'], React.ElementType> = {
  wording: Edit3,
  add_content: Lightbulb,
  remove_content: Trash2,
  reorder: Move,
  format: ZoomIn,
};

export const InlineSuggestion: React.FC<InlineSuggestionProps> = ({
  suggestion,
  onAccept,
  onReject,
}) => {
  const {
    suggestionType,
    originalText,
    suggestedText,
    reasoning
  } = suggestion;

  const SuggestionIcon = suggestionTypeIconMap[suggestionType] || Lightbulb; // Default icon

  const handleAccept = () => {
    if (onAccept) {
      onAccept(suggestion);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(suggestion);
    }
  };

  // Animation variants - Use shared transitions
  const variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: defaultTransition }, // Use defaultTransition
    exit: { 
      opacity: 0, 
      x: -20,
      height: 0, 
      marginTop: 0, 
      marginBottom: 0, 
      paddingTop: 0, 
      paddingBottom: 0, 
      transition: exitTransition // Use exitTransition
    }
  };

  return (
    <motion.div
      className="mt-1 p-2 border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-md shadow-sm"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 text-xs text-blue-800 dark:text-blue-200">
          <div className="flex items-center gap-1 font-medium mb-0.5">
            <SuggestionIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Suggestion ({suggestionType}):
          </div>
          {suggestedText && (
            <p className="mb-1"><em>"{suggestedText}"</em></p>
          )}
          {reasoning && (
            <p className="text-blue-700/80 dark:text-blue-300/80">{reasoning}</p>
          )}
        </div>
        {(onAccept || onReject) && (
          <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
            {onAccept && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAccept}
                className="h-6 w-6 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                aria-label="Accept suggestion"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {onReject && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReject}
                className="h-6 w-6 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Reject suggestion"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}; 