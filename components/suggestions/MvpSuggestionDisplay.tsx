'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Lightbulb, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface MvpSuggestionDisplayProps {
  suggestions?: string;
  analysisTime?: number;
  fromCache?: boolean;
  className?: string;
}

export function MvpSuggestionDisplay({
  suggestions = '',
  analysisTime = 0,
  fromCache = false,
  className
}: MvpSuggestionDisplayProps) {
  if (!suggestions || suggestions.trim() === '') {
    return (
      <Card className={className}>
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
      className={className}
    >
      {/* Header with badges only */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Resume Improvement Suggestions</h3>
        </div>
        <div className="flex items-center gap-2">
          {fromCache && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Cached
            </Badge>
          )}
          {analysisTime > 0 && (
            <Badge variant="outline" className="text-xs">
              {analysisTime}ms
            </Badge>
          )}
        </div>
      </div>

      {/* Direct suggestion text - larger font */}
      <div className="prose prose-base max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mb-5 mt-8 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mb-4 mt-6 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mb-3 mt-5 first:mt-0">{children}</h3>,
            p: ({ children }) => <p className="text-foreground mb-4 leading-relaxed text-base">{children}</p>,
            ul: ({ children }) => <ul className="text-foreground mb-5 pl-6 space-y-2 text-base">{children}</ul>,
            ol: ({ children }) => <ol className="text-foreground mb-5 pl-6 space-y-2 text-base">{children}</ol>,
            li: ({ children }) => <li className="text-foreground text-base leading-relaxed">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            em: ({ children }) => <em className="italic text-foreground">{children}</em>,
            code: ({ children }) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">{children}</code>,
            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-5">{children}</blockquote>,
          }}
        >
          {suggestions}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}