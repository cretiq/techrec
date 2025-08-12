'use client';

import React, { useState } from 'react';
import { TextExtractionUpload } from '@/components/cv/TextExtractionUpload';
import { TextExtractionDisplay } from '@/components/cv/TextExtractionDisplay';
import { Card } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { ArrowLeft, Eye, FileText, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TextExtractionResult } from '@/types/cv';

export default function TextExtractionPage() {
  const router = useRouter();
  const [extractionResult, setExtractionResult] = useState<TextExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Handle successful extraction
  const handleExtractionComplete = (result: TextExtractionResult) => {
    setExtractionResult(result);
    setIsExtracting(false);
  };

  // Handle extraction start
  const handleExtractionStart = () => {
    setIsExtracting(true);
    setExtractionResult(null);
  };

  // Reset to upload state
  const handleReset = () => {
    setExtractionResult(null);
    setIsExtracting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => router.push('/cv')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to CV Management
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <Eye className="h-8 w-8 text-blue-500" />
              Simple CV Text Extraction
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Debug and verify what text Gemini actually reads from your CV. 
              No analysis, no processing - just raw text extraction for complete transparency.
            </p>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card variant="outlined" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-6 w-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Full CV Analysis</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Structured JSON parsing</li>
              <li>• Contact info, skills, experience extraction</li>
              <li>• Database sync and profile updates</li>
              <li>• 10-15 second processing time</li>
              <li>• AI-powered content analysis</li>
            </ul>
            <Button 
              variant="outlined" 
              size="sm" 
              className="mt-4"
              onClick={() => router.push('/cv')}
            >
              Go to Full Analysis
            </Button>
          </Card>

          <Card variant="gradient" className="p-6 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Simple Text Extraction</h3>
            </div>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Raw text output only</li>
              <li>• Exactly what Gemini reads</li>
              <li>• No database operations</li>
              <li>• &lt;5 second extraction time</li>
              <li>• Perfect for debugging</li>
            </ul>
            <div className="mt-4 bg-blue-50 rounded-lg p-2">
              <p className="text-blue-800 text-sm font-medium">👈 You are here</p>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        {!extractionResult && !isExtracting && (
          <TextExtractionUpload 
            onExtractionComplete={handleExtractionComplete}
            onExtractionStart={handleExtractionStart}
          />
        )}

        {isExtracting && (
          <Card variant="outlined" className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500 animate-bounce" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Extracting Text...</h3>
              <p className="text-gray-600">
                Gemini is reading your CV and extracting all visible text content.
              </p>
              <div className="max-w-md mx-auto bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </Card>
        )}

        {extractionResult && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Button
                variant="outlined"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Extract Another CV
              </Button>
            </div>
            
            <TextExtractionDisplay extractionResult={extractionResult} />
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card variant="outlined" className="p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-gray-500" />
              <h4 className="text-lg font-semibold text-gray-900">Why Use Text Extraction?</h4>
            </div>
            <div className="text-left max-w-3xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">🐛 Debug Issues</h5>
                  <p className="text-sm text-gray-600">
                    See exactly what text Gemini reads to identify parsing problems or missing content.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">🔍 Verify Quality</h5>
                  <p className="text-sm text-gray-600">
                    Ensure your CV text is being read correctly before running the full analysis.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">⚡ Fast Feedback</h5>
                  <p className="text-sm text-gray-600">
                    Get instant text extraction results without waiting for complex analysis processing.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}