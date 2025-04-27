'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Columns } from 'lucide-react';

interface CvViewerProps {
  pdfUrl?: string; // URL to the original PDF (optional for now)
  // Add props for comparison data later
}

export const CvViewer: React.FC<CvViewerProps> = ({ pdfUrl }) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'comparison'>('pdf');

  return (
    <Card className="mt-6 shadow-lg border">
      <CardHeader className="border-b pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-foreground">Document Viewer</CardTitle>
          <Tabs defaultValue="pdf" value={viewMode} onValueChange={(value) => setViewMode(value as 'pdf' | 'comparison')} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="pdf" className="h-7 text-xs px-2">
                <FileText className="w-4 h-4 mr-1" /> PDF View
              </TabsTrigger>
              <TabsTrigger value="comparison" className="h-7 text-xs px-2" disabled> {/* Disabled for now */}
                <Columns className="w-4 h-4 mr-1" /> Compare
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-6 min-h-[400px] flex items-center justify-center bg-muted">
        {viewMode === 'pdf' && (
          <div className="text-center text-muted-foreground">
            {pdfUrl ? (
              <p>PDF Viewer Placeholder (URL: {pdfUrl})</p>
              // TODO: Integrate actual PDF viewer library here
              // Example: <iframe src={pdfUrl} width="100%" height="500px" />
            ) : (
              <p>No PDF available for preview.</p>
            )}
          </div>
        )}
        {viewMode === 'comparison' && (
          <div className="text-center text-muted-foreground">
            <p>Comparison View Placeholder</p>
            {/* TODO: Implement side-by-side comparison view */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 