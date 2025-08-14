'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface MvpSuggestionDisplayProps {
  suggestions?: string;
  className?: string;
}

export function MvpSuggestionDisplay({
  suggestions = '',
  className
}: MvpSuggestionDisplayProps) {
  // Pre-process markdown text to fix line breaks (same logic as CV content)
  const preprocessMarkdown = (text: string): string => {
    if (!text) return text;
    
    const lines = text.split('\n');
    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      const nextLine = lines[i + 1];
      
      processedLines.push(currentLine);
      
      // Skip if current line is empty (already has a break)
      if (currentLine.trim() === '') {
        continue;
      }
      
      // Skip if next line is empty (already has proper spacing)
      if (!nextLine || nextLine.trim() === '') {
        continue;
      }
      
      // Skip if current line is a header
      if (currentLine.trim().startsWith('#')) {
        continue;
      }
      
      // Skip if next line is a header
      if (nextLine.trim().startsWith('#')) {
        continue;
      }
      
      // Skip if current line is a list item
      if (currentLine.trim().match(/^[-*+]\s/) || currentLine.trim().match(/^\d+\.\s/)) {
        continue;
      }
      
      // Skip if next line is a list item
      if (nextLine.trim().match(/^[-*+]\s/) || nextLine.trim().match(/^\d+\.\s/)) {
        continue;
      }
      
      // Skip if we're in a code block (basic detection)
      if (currentLine.trim().startsWith('```') || currentLine.trim().includes('`')) {
        continue;
      }
      
      // Add an extra line break for content lines that should be separate paragraphs
      if (currentLine.trim().length > 0 && nextLine && nextLine.trim().length > 0) {
        // Special handling for suggestion content patterns
        const isExampleSuggestion = currentLine.includes('Example:') || currentLine.includes('For example:');
        const isSuggestionPoint = currentLine.trim().startsWith('-') && currentLine.includes(':');
        const isNewSuggestion = nextLine.trim().startsWith('-') && nextLine.includes(':');
        
        if (isExampleSuggestion || isSuggestionPoint || isNewSuggestion || 
            // General content that needs separation
            (!currentLine.endsWith(':') && !currentLine.endsWith(',') && !currentLine.endsWith(';'))) {
          processedLines.push(''); // Add empty line
        }
      }
    }
    
    return processedLines.join('\n');
  };
  if (!suggestions || suggestions.trim() === '') {
    return (
      <Card variant="default" className={className}>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <Lightbulb className="w-8 h-8 text-muted-foreground" />
            <p className="text-muted-foreground">No suggestions available yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`h-full flex flex-col ${className || ''}`}
    >
      {/* Direct suggestion text - larger font, fills available height */}
      <div className="prose prose-lg max-w-none flex-1 overflow-y-auto">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-bold text-primary text-primary-enhanced mb-6 mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-semibold text-secondary text-secondary-enhanced mb-5 mt-0 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-medium text-accent text-accent-enhanced mb-4 mt-0 first:mt-0">{children}</h3>,
            p: ({ children }) => <p className="text-base-content/85 mb-5 leading-relaxed text-lg">{children}</p>,
            ul: ({ children }) => <ul className="text-base-content/85 mb-6 pl-6 space-y-2 text-lg">{children}</ul>,
            ol: ({ children }) => <ol className="text-base-content/85 mb-6 pl-6 space-y-2 text-lg">{children}</ol>,
            li: ({ children }) => <li className="text-base-content/85 text-lg leading-relaxed">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-primary text-primary-strong">{children}</strong>,
            em: ({ children }) => <em className="italic text-base-content/80">{children}</em>,
            code: ({ children }) => <code className="bg-base-200 text-base-content px-2 py-1 rounded text-base font-mono">{children}</code>,
            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-base-content/70 my-6">{children}</blockquote>,
          }}
        >
          {preprocessMarkdown(suggestions)}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}