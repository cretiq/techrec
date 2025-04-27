'use client';

import React, { useState } from 'react';
import { Lightbulb, Check, X as XIcon } from 'lucide-react'; // Or Wand2, Edit etc.
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { CvImprovementSuggestion } from '@/types/cv';

interface SuggestionIndicatorProps {
  suggestion: CvImprovementSuggestion;
  onAccept?: (suggestion: CvImprovementSuggestion) => void;
  onReject?: (suggestion: CvImprovementSuggestion) => void;
  className?: string;
}

/**
 * Displays an indicator icon for a suggestion,
 * showing details and Accept/Reject buttons in a popover.
 */
export function SuggestionIndicator({ suggestion, onAccept, onReject, className }: SuggestionIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Choose icon based on suggestion.suggestionType later if needed
  const Icon = Lightbulb;
  const popoverTitle = suggestion.reasoning || 'Suggestion';

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent popover closing immediately if needed
    onAccept?.(suggestion);
    setIsOpen(false); // Close popover after action
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReject?.(suggestion);
    setIsOpen(false); // Close popover after action
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          type="button" 
          aria-label={`Suggestion: ${popoverTitle}`}
          className={cn(
            'inline-flex items-center justify-center align-middle',
            'ml-1 -mt-1 p-0.5 w-4 h-4 rounded-full', 
            'bg-yellow-400/80 text-yellow-900 dark:bg-yellow-600/80 dark:text-yellow-100', 
            'hover:bg-yellow-500/90 dark:hover:bg-yellow-700/90',
            'focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:ring-offset-1',
            'transition-colors duration-150',
            className
          )}
          onClick={(e) => { 
            e.stopPropagation(); // Prevent event bubbling if nested
            setIsOpen(!isOpen);
          }} 
        >
          <Icon className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="center" 
        className="w-auto max-w-xs p-3 text-xs shadow-lg z-50" 
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing if needed
      >
        <div className="space-y-2">
          <p className="font-medium">{popoverTitle}</p>
          {suggestion.suggestedText && (
            <p className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
              Suggest: <span className="font-semibold">{suggestion.suggestedText}</span>
            </p>
          )}
          {/* Add Accept/Reject Buttons if callbacks are provided */} 
          {(onAccept || onReject) && (
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {onReject && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleReject}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 h-6 px-2"
                >
                  <XIcon className="h-3 w-3 mr-1" /> Reject
                </Button>
              )}
              {onAccept && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAccept}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300 h-6 px-2"
                >
                  <Check className="h-3 w-3 mr-1" /> Accept
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 