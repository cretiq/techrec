'use client';

import React, { useState, useEffect } from 'react';
import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import {  Button  } from '@/components/ui-daisy/button';
import {  Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui-daisy/tabs';
import { FileText, Columns } from 'lucide-react';

interface CvViewerProps {
  pdfUrl?: string; // URL to the original PDF (optional for now)
  extractedText?: string | null; // Add extractedText prop
  // Add props for comparison data later
}

export const CvViewer: React.FC<CvViewerProps> = ({ pdfUrl, extractedText }) => {
  console.log('[CvViewer] Rendering with pdfUrl:', pdfUrl, 'and extractedText (length):', extractedText?.length); // LOG
  const [viewMode, setViewMode] = useState<'pdf' | 'text' | 'comparison'>('text');

  useEffect(() => {
    if (pdfUrl) {
      setViewMode('pdf');
    } else if (extractedText) {
      setViewMode('text');
    } else {
      setViewMode('pdf');
    }
  }, [pdfUrl, extractedText]);

  return (
    <Card className="mt-6 shadow-lg border">
      <CardHeader className="border-b pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-foreground">Document Viewer</CardTitle>
          <Tabs 
            defaultValue={pdfUrl ? 'pdf' : (extractedText ? 'text' : 'pdf')} 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as 'pdf' | 'text' | 'comparison')} 
            className="w-auto min-w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="pdf" className="h-7 text-xs px-2" disabled={!pdfUrl}>
                <FileText className="w-4 h-4 mr-1" /> PDF View
              </TabsTrigger>
              <TabsTrigger value="comparison" className="h-7 text-xs px-2" disabled> {/* Disabled for now */}
                <Columns className="w-4 h-4 mr-1" /> Compare
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-6 min-h-[400px] bg-muted/50 dark:bg-muted/20">
        {viewMode === 'pdf' && (
          <div className="text-center text-muted-foreground p-4">
            {pdfUrl ? (
              <p>PDF Viewer Placeholder (URL: {pdfUrl})</p>
              // TODO: Integrate actual PDF viewer library here
              // Example: <iframe src={pdfUrl} width="100%" height="500px" />
            ) : (
              extractedText ? (
                <pre className="whitespace-pre-wrap text-left text-sm text-foreground font-mono bg-background dark:bg-gray-800 p-4 rounded-md border overflow-auto max-h-[600px]">
                  {extractedText}
                </pre>
              ) : (
                <p>No PDF or extracted text available for preview.</p>
              )
            )}
          </div>
        )}
        {viewMode === 'comparison' && (
          <div className="text-center text-muted-foreground p-4">
            <p>Comparison View Placeholder</p>
            {/* TODO: Implement side-by-side comparison view */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 