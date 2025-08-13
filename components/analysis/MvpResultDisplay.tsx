'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui-daisy/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Copy, Download, Eye, EyeOff, Code, FileText, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui-daisy/use-toast';
import { motion } from 'framer-motion';
import { SuggestionManager } from '@/components/suggestions/SuggestionManager';
import { ReUploadButton } from '@/components/cv/ReUploadButton';

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
  isEnhancementLoading?: boolean;
  suggestionsVisible?: boolean;
  analysisData?: any;
  onUploadComplete?: (analysisId?: string) => void;
  onAnimationStateChange?: (isAnimating: boolean, processingText: string, sparkles: boolean) => void;
  isMvpMode?: boolean;
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
  isEnhancementLoading = false,
  suggestionsVisible = false,
  analysisData,
  onUploadComplete,
  onAnimationStateChange,
  isMvpMode = false
}: MvpResultDisplayProps) {
  const [activeTab, setActiveTab] = useState<'markdown' | 'text'>('markdown');
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);
  const { toast } = useToast();

  // Pre-process markdown text to fix line breaks
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
        // Special handling for job-related content patterns
        const isJobTitle = currentLine.includes('•') || currentLine.match(/\d{2}\/\d{4}/);
        const isJobDescription = nextLine.match(/^[A-Z]/) && !nextLine.includes('•');
        
        if (isJobTitle || isJobDescription || 
            // General content that needs separation
            (!currentLine.endsWith(':') && !currentLine.endsWith(',') && !currentLine.endsWith(';'))) {
          processedLines.push(''); // Add empty line
        }
      }
    }
    
    return processedLines.join('\n');
  };

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

  // Animation state for re-upload button
  const [isReUploading, setIsReUploading] = useState(false);

  // Re-upload handler
  const handleReUpload = async () => {
    if (!analysisData) {
      toast({
        title: "No Profile Data",
        description: "No profile data found to clear.",
        variant: "destructive",
      });
      return;
    }

    setIsReUploading(true);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.docx,.txt';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        toast({
          title: "No File Selected",
          description: "Please select a file to upload",
          variant: "destructive",
        });
        return;
      }

      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF, DOCX, or TXT file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Clear profile data first
        const deleteResponse = await fetch('/api/developer/me/profile', {
          method: 'DELETE',
        });
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.error || 'Failed to clear profile data');
        }
        
        // Upload new file
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/cv/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        
        const result = await uploadResponse.json();
        
        toast({
          title: "Upload Successful",
          description: `CV ${file.name} uploaded and processed successfully!`,
        });

        if (result.analysisId) {
          onUploadComplete?.(result.analysisId);
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Re-upload failed:', error);
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsReUploading(false);
      }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  return (
    <div className="space-y-6">
      {/* Unified Header - CV Status + Actions */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10 border-purple-300/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                CV Processed Successfully
              </CardTitle>
            </div>
            
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Processing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button 
              variant="default" 
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Generate Cover Letter
            </Button>
            {/* Re-Upload Button in MVP Header - always show when we have the necessary props */}
            {analysisData && onUploadComplete && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="default" 
                  className="flex items-center gap-2 relative overflow-hidden"
                  onClick={handleReUpload}
                  disabled={isReUploading}
                >
                  <motion.div
                    animate={isReUploading ? { rotate: 360 } : { rotate: 0 }}
                    transition={isReUploading ? { 
                      duration: 1, 
                      repeat: Infinity, 
                      ease: "linear" 
                    } : { duration: 0.2 }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  <motion.span
                    initial={false}
                    animate={isReUploading ? { opacity: 0.7 } : { opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isReUploading ? 'Re-uploading...' : 'Re-upload CV'}
                  </motion.span>
                  
                  {/* Animated background pulse during upload */}
                  {isReUploading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Layout - Side by Side */}
      <div className="flex gap-6">
        {/* Left: CV Content */}
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-base-200 p-1 rounded-lg">
                  <Button
                    variant={activeTab === 'markdown' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('markdown')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    variant={activeTab === 'text' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('text')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Raw Text
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formattedText, activeTab === 'markdown' ? 'Markdown' : 'Text')}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadContent(formattedText, activeTab === 'markdown' ? 'Markdown' : 'Text')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
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
              
              <div className="relative">
                <div className="bg-background rounded-md p-6 prose prose-lg max-w-none text-foreground">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-3xl font-bold text-foreground mb-5">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-semibold text-foreground mb-4 mt-7">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-medium text-foreground mb-3 mt-5">{children}</h3>,
                      p: ({ children }) => <p className="text-foreground mb-4 leading-relaxed text-lg">{children}</p>,
                      ul: ({ children }) => <ul className="text-foreground mb-5 pl-6 space-y-2 text-lg">{children}</ul>,
                      ol: ({ children }) => <ol className="text-foreground mb-5 pl-6 space-y-2 text-lg">{children}</ol>,
                      li: ({ children }) => <li className="text-foreground text-lg leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                      code: ({ children }) => <code className="bg-muted px-2 py-1 rounded text-base font-mono text-foreground">{children}</code>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-5">{children}</blockquote>,
                    }}
                  >
                    {preprocessMarkdown(formattedText) || 'No content available'}
                  </ReactMarkdown>
                </div>
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
              
              <div className="relative">
                <div className="bg-background rounded-md p-6 prose prose-lg max-w-none text-foreground">
                  <pre className="whitespace-pre-wrap font-mono text-lg leading-relaxed overflow-auto max-h-96">
                    {formattedText || 'No formatted text available'}
                  </pre>
                </div>
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
              className="sticky top-20 flex flex-col"
              data-testid="cv-management-suggestions-sidebar"
              style={{ height: 'calc(100vh - 400px)' }}
            >
              <CardHeader className="flex-shrink-0 border-b border-base-300/50 pb-4 max-h-fit">
                <CardTitle className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  CV Improvement
                </CardTitle>
                
                {/* Enhance CV Button - Large and prominent, right under title */}
                {onGetSuggestions && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button 
                      variant="default" 
                      size="default"
                      className="flex items-center justify-center gap-2 w-full py-3 text-base font-semibold relative overflow-hidden group"
                      onClick={onGetSuggestions}
                      disabled={isEnhancementLoading}
                    >
                      <motion.div
                        animate={isEnhancementLoading ? {
                          rotate: [0, -10, 10, -10, 10, 0],
                          scale: [1, 1.2, 1, 1.2, 1]
                        } : { rotate: 0, scale: 1 }}
                        transition={isEnhancementLoading ? {
                          duration: 0.8,
                          ease: "easeInOut",
                          times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                        } : { duration: 0.2 }}
                      >
                        <Lightbulb className="w-6 h-6" />
                      </motion.div>
                      <motion.span
                        initial={false}
                        animate={isEnhancementLoading ? { opacity: 0.8 } : { opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isEnhancementLoading ? 'Enhancing...' : 'Enhance CV'}
                      </motion.span>
                      
                      {/* Sparkle effect during enhancement */}
                      {isEnhancementLoading && (
                        <>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20"
                            animate={{ 
                              opacity: [0.2, 0.5, 0.2],
                              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-yellow-300 animate-pulse" />
                        </>
                      )}
                      
                      {/* Hover gradient effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    </Button>
                  </motion.div>
                )}
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-0 flex flex-col">
                {/* Overall MVP suggestions */}
                <div className="flex-1 p-4 flex flex-col min-h-0">
                  <SuggestionManager section="overall" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}