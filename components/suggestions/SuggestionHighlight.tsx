'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SuggestionHighlightProps {
  children: React.ReactNode;
  // Props for type/intensity can be added later based on design
  className?: string;
}

/**
 * A simple wrapper component to apply subtle highlighting 
 * to text/elements that have an associated suggestion.
 */
export function SuggestionHighlight({ children, className }: SuggestionHighlightProps) {
  // Define base highlighting style
  // Example: subtle yellow background and maybe a bottom border
  const baseStyle = 'bg-yellow-100/60 dark:bg-yellow-900/30 px-0.5 rounded-sm'; 

  return (
    <span className={cn(baseStyle, className)}>
      {children}
    </span>
  );
} 