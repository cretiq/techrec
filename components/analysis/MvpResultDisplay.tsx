'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui-daisy/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Copy, Download, Eye, EyeOff, Code, FileText, Lightbulb, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui-daisy/use-toast';
import { motion } from 'framer-motion';
import { SuggestionManager } from '@/components/suggestions/SuggestionManager';

/**
 * MVP-specific CV display component
 * Shows simplified extraction results in two formats:
 * 1. Formatted text (markdown)  
 * 2. Basic JSON structure
 */

interface MvpResultDisplayProps {
  formattedText?: string;
  basicJson?: Record<string, any>;
  improvementScore?: number;
  extractionDuration?: number;
  characterCount?: number;
  wordCount?: number;
  filename?: string;
  onGetSuggestions?: () => void;
  suggestionsVisible?: boolean;
}

export function MvpResultDisplay({
  formattedText = '',
  basicJson = {},
  improvementScore = 0,
  extractionDuration = 0,
  characterCount = 0,
  wordCount = 0,
  filename = 'CV',
  onGetSuggestions,
  suggestionsVisible = false
}: MvpResultDisplayProps) {
  const [activeTab, setActiveTab] = useState<'markdown' | 'text'>('markdown');
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);
  const { toast } = useToast();

  // Copy to clipboard functionality
  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${type} content copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  // Download functionality
  const downloadContent = (content: string, type: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${type.toLowerCase()}.${type === 'Text' ? 'md' : 'json'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${type} content saved as file`,
    });
  };

  // Format JSON for display
  const formattedJsonString = JSON.stringify(basicJson, null, 2);

  return (
    <div className="space-y-6">
      {/* MVP Mode Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10 border-purple-300/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                CV Processed Successfully (MVP Mode)
              </CardTitle>
              <CardDescription>
                Your CV has been extracted in two formats for maximum flexibility
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Score: {improvementScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Processing Time</p>
              <p className="font-semibold">{extractionDuration}ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">Characters</p>
              <p className="font-semibold">{characterCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Words</p>
              <p className="font-semibold">{wordCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data Quality</p>
              <p className="font-semibold">
                {Object.keys(basicJson).length > 5 ? 'Good' : 'Basic'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Layout - Side by Side */}
      <div className="flex gap-6">
        {/* Left: CV Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Extracted Content</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={activeTab === 'markdown' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('markdown')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    variant={activeTab === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('text')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Raw Text
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
          {/* Markdown Preview Tab */}
          {activeTab === 'markdown' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Rendered markdown preview of your CV content
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formattedText, 'Markdown')}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadContent(formattedText, 'Markdown')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-background border rounded-md p-6 prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mb-2 mt-4">{children}</h3>,
                      p: ({ children }) => <p className="text-foreground mb-3 leading-relaxed text-base">{children}</p>,
                      ul: ({ children }) => <ul className="text-foreground mb-4 pl-6 space-y-1 text-base">{children}</ul>,
                      ol: ({ children }) => <ol className="text-foreground mb-4 pl-6 space-y-1 text-base">{children}</ol>,
                      li: ({ children }) => <li className="text-foreground text-base">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                      code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">{children}</blockquote>,
                    }}
                  >
                    {formattedText || 'No content available'}
                  </ReactMarkdown>
                </div>
                {formattedText.length > 1000 && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="outline" className="bg-background/80">
                      {Math.round(formattedText.length / 1000)}K chars
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Raw Text Tab */}
          {activeTab === 'text' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Raw markdown text format ready for AI processing
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formattedText, 'Text')}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadContent(formattedText, 'Text')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-background border rounded-md p-6 prose prose-sm max-w-none text-foreground">
                  <pre className="whitespace-pre-wrap font-mono text-base leading-relaxed overflow-auto max-h-96">
                    {formattedText || 'No formatted text available'}
                  </pre>
                </div>
                {formattedText.length > 1000 && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="outline" className="bg-background/80">
                      {Math.round(formattedText.length / 1000)}K chars
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          )}

            </CardContent>
          </Card>
        </div>

        {/* Right: AI Suggestions Sidebar */}
        {suggestionsVisible && (
          <div className="w-80">
            <Card 
              variant="elevated-interactive" 
              className="sticky top-20"
              data-testid="cv-management-suggestions-sidebar"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Suggestions
                </CardTitle>
                <CardDescription>
                  Personalized recommendations to improve your CV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {/* Overall MVP suggestions */}
                <div className="space-y-4">
                  <SuggestionManager section="overall" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>
            Your CV content is ready for AI-powered suggestions and cover letter generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {onGetSuggestions && (
              <Button 
                variant="default"
                className="flex items-center gap-2"
                onClick={onGetSuggestions}
              >
                <Lightbulb className="w-4 h-4" />
                Get Suggestions
              </Button>
            )}
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Cover Letter
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Content
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview Format
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}