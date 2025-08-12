'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { 
  Copy, 
  Download, 
  FileText, 
  Clock,
  BarChart3,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/components/ui-daisy/use-toast';
import { TextExtractionResult } from '@/types/cv';

interface TextExtractionDisplayProps {
  extractionResult: TextExtractionResult;
}

export function TextExtractionDisplay({ extractionResult }: TextExtractionDisplayProps) {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  // Handle copy to clipboard
  const handleCopyText = async () => {
    if (!extractionResult.extractedText) return;
    
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(extractionResult.extractedText);
      toast({
        title: "Copied to Clipboard",
        description: "Extracted text has been copied to your clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard.",
        variant: "error"
      });
    } finally {
      setIsCopying(false);
    }
  };

  // Handle download as text file
  const handleDownloadText = () => {
    if (!extractionResult.extractedText) return;

    const blob = new Blob([extractionResult.extractedText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = extractionResult.metadata?.originalName 
      ? `extracted_${extractionResult.metadata.originalName.replace(/\.[^/.]+$/, '')}.txt`
      : 'extracted_cv_text.txt';
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Downloaded ${filename}`
    });
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  if (!extractionResult.success) {
    return (
      <Card variant="outlined" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="h-6 w-6 text-red-500" />
          <h2 className="text-xl font-semibold text-red-700">Text Extraction Failed</h2>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 mb-2">
            <strong>Error:</strong> {extractionResult.error}
          </p>
          {extractionResult.extractionDuration > 0 && (
            <p className="text-red-600 text-sm">
              Duration: {formatDuration(extractionResult.extractionDuration)}
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Success Status */}
      <Card variant="outlined" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <h2 className="text-xl font-semibold text-green-700">Text Extraction Successful</h2>
        </div>
        
        {/* File Metadata */}
        {extractionResult.metadata && (
          <div className="grid grid-cols-2 gap-4 bg-green-50 rounded-lg p-4">
            <div>
              <p className="text-sm text-green-600 font-medium">Original File</p>
              <p className="text-green-800">{extractionResult.metadata.originalName}</p>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">File Type</p>
              <p className="text-green-800">{extractionResult.metadata.mimeType}</p>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">File Size</p>
              <p className="text-green-800">{formatFileSize(extractionResult.metadata.fileSize)}</p>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Extraction Time</p>
              <p className="text-green-800">{formatDuration(extractionResult.extractionDuration)}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Text Statistics */}
      <Card variant="outlined" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-base-content">Text Statistics</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {extractionResult.characterCount?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-blue-800">Characters</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {extractionResult.wordCount?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-purple-800">Words</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {extractionResult.lineCount?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-orange-800">Lines</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {formatDuration(extractionResult.extractionDuration)}
            </p>
            <p className="text-sm text-green-800">Duration</p>
          </div>
        </div>
      </Card>

      {/* Extracted Text Display */}
      <Card variant="outlined" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-base-content">Extracted Text</h3>
            <span className="text-sm text-gray-500">
              (Raw text as read by Gemini)
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outlined"
              size="sm"
              onClick={handleCopyText}
              disabled={isCopying || !extractionResult.extractedText}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {isCopying ? 'Copying...' : 'Copy'}
            </Button>
            
            <Button 
              variant="outlined"
              size="sm"
              onClick={handleDownloadText}
              disabled={!extractionResult.extractedText}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Text Content */}
        <div className="relative">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {extractionResult.extractedText || 'No text extracted'}
            </pre>
          </div>
          
          {/* Text Preview Indicator */}
          {extractionResult.extractedText && extractionResult.extractedText.length > 5000 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                📝 Large text content detected. Use the download button to view the complete text.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card variant="outlined" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-base-content">Debug Information</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(extractionResult, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}