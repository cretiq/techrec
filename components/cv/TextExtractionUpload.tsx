'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { 
  Upload, 
  FileText, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/ui-daisy/use-toast';
import { TextExtractionResult } from '@/types/cv';

interface TextExtractionUploadProps {
  onExtractionComplete: (result: TextExtractionResult) => void;
  onExtractionStart?: () => void;
}

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function TextExtractionUpload({ 
  onExtractionComplete, 
  onExtractionStart 
}: TextExtractionUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return `Invalid file type. Please upload PDF, DOCX, or TXT files only.`;
    }
    
    if (file.size === 0) {
      return `File appears to be empty. Please upload a valid CV file.`;
    }
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size must be less than ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`;
    }
    
    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "File Validation Error",
        description: validationError,
        variant: "error"
      });
      return;
    }
    
    setSelectedFile(file);
    console.log('🔍 [TEXT-EXTRACTION-UPLOAD] File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle upload and extraction
  const handleUploadAndExtract = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    onExtractionStart?.();
    
    console.log('🔍 [TEXT-EXTRACTION-UPLOAD] Starting upload and extraction...');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/cv/extract-text', {
        method: 'POST',
        body: formData
      });
      
      const result: TextExtractionResult = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Text extraction failed');
      }
      
      console.log('🔍 [TEXT-EXTRACTION-UPLOAD] Extraction completed successfully');
      toast({
        title: "Extraction Complete",
        description: `Successfully extracted text from ${selectedFile.name}`
      });
      
      onExtractionComplete(result);
      
      // Reset state
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('🔍 [TEXT-EXTRACTION-UPLOAD] Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Extraction Failed",
        description: errorMessage,
        variant: "error"
      });
      
      onExtractionComplete({
        success: false,
        error: errorMessage,
        extractionDuration: 0
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card variant="outlined" className="p-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-blue-500" />
          <h2 className="text-2xl font-semibold text-base-content">
            Simple Text Extraction
          </h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Upload your CV to see exactly what raw text Gemini reads from your document.
          No analysis, no structure - just pure text extraction for debugging and verification.
        </p>
        
        {/* File Selection Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 mb-6 transition-colors
            ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${selectedFile ? 'border-green-400 bg-green-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="font-medium text-green-800">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {selectedFile.type} • {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={handleClearFile}
                  disabled={isUploading}
                >
                  Choose Different File
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleUploadAndExtract}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Extracting Text...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Extract Text
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-base-content">
                  Drag and drop your CV here
                </p>
                <p className="text-gray-500">or click to browse files</p>
              </div>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto"
              >
                Choose File
              </Button>
            </div>
          )}
        </div>
        
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {/* File Requirements */}
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800 mb-2">File Requirements:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Supported formats: PDF, DOCX, TXT</li>
                <li>• Maximum file size: {MAX_FILE_SIZE_MB}MB</li>
                <li>• File must contain readable text content</li>
                <li>• Processing typically takes 5-15 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}