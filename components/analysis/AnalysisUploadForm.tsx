'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import {  Button  } from '@/components/ui-daisy/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Loader2, UploadCloud, AlertCircle, FileText, X, RefreshCw } from 'lucide-react';
import {  Badge  } from '@/components/ui-daisy/badge'; // For status display

// Define allowed MIME types and max size (should match backend)
const ALLOWED_ANALYSIS_MIME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const MAX_ANALYSIS_FILE_SIZE_MB = 10;
const MAX_ANALYSIS_FILE_SIZE_BYTES = MAX_ANALYSIS_FILE_SIZE_MB * 1024 * 1024;

// Add constants for polling configuration
const MAX_POLLING_MINUTES = 10;
const POLLING_INTERVAL_MS = 5000;

// Interface for analysis response
interface AnalysisResponse {
    message: string;
    analysis?: any; // Adjust based on actual analysis structure
    fromCache?: boolean;
    analysisId?: string;
    fileHash?: string;
    status?: string; 
    error?: string;
    isStale?: boolean;
}

// Prop to handle successful analysis result
interface AnalysisUploadFormProps {
  onAnalysisComplete: (result: any, fromCache: boolean, analysisId: string) => void;
}

export function AnalysisUploadForm({ onAnalysisComplete }: AnalysisUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error' | 'cached'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to clear polling interval
  const clearPollingInterval = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('[AnalysisUploadForm] Polling interval cleared for analysis ID:', analysisId);
    }
    pollingStartTimeRef.current = null;
  };

  const resetState = (delay: number = 0) => {
    clearPollingInterval();
    setTimeout(() => {
      setSelectedFile(null);
      setUploadProgress(0);
      setUploadState('idle');
      setAnalysisId(null);
      setErrorMessage(null);
    }, delay);
  };

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => clearPollingInterval();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setUploadState('idle');
    setErrorMessage(null);
    setAnalysisId(null);
    clearPollingInterval(); // Clear previous polling if any

    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let message = 'File rejected.';
      if (rejection.errors[0].code === 'file-too-large') {
        message = `File is larger than ${MAX_ANALYSIS_FILE_SIZE_MB}MB.`;
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        message = 'Invalid file type.';
      }
      toast({ title: "Upload Error", description: message, variant: "destructive" });
      resetState();
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadProgress(0);
      console.log('[AnalysisUploadForm] Analysis file accepted:', acceptedFiles[0].name);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: MAX_ANALYSIS_FILE_SIZE_BYTES,
    multiple: false,
    disabled: uploadState === 'uploading' || uploadState === 'analyzing' || uploadState === 'success' || uploadState === 'cached',
  });

  // Function to poll for analysis status
  const pollAnalysisStatus = useCallback(async (id: string) => {
    // Check if we've exceeded maximum polling time
    if (pollingStartTimeRef.current) {
      const pollingDuration = (Date.now() - pollingStartTimeRef.current) / (1000 * 60);
      if (pollingDuration > MAX_POLLING_MINUTES) {
        console.log(`[AnalysisUploadForm] Polling timeout after ${pollingDuration.toFixed(1)} minutes`);
        clearPollingInterval();
        setUploadState('error');
        setErrorMessage('Analysis timed out. Please try uploading again.');
        toast({ 
          title: "Analysis Timeout", 
          description: "The analysis took too long. Please try again.", 
          variant: "destructive" 
        });
        return;
      }
    }

    console.log(`[AnalysisUploadForm] Polling status for Analysis ID: ${id}`);
    try {
      const response = await fetch(`/api/cv-analysis/${id}/status`);
      if (!response.ok) {
        console.error(`Polling error: Status ${response.status} for ${id}`);
        if (response.status === 404) { 
          setErrorMessage('Analysis record disappeared.');
          setUploadState('error');
          clearPollingInterval();
        }
        return;
      }
      
      const data: AnalysisResponse = await response.json();

      if (data.status === 'COMPLETED') {
        console.log('[AnalysisUploadForm] Polling: Analysis completed.', data.analysis);
        clearPollingInterval();
        setUploadState('success');
        toast({ title: "Analysis Successful", description: "CV analysis finished." });
        onAnalysisComplete(data.analysis, false, id);
        resetState(3000);
      } else if (data.status === 'FAILED') {
        console.log('[AnalysisUploadForm] Polling: Analysis failed.', data.error);
        clearPollingInterval();
        setUploadState('error');
        setErrorMessage(data.error || 'Analysis failed.');
        toast({ 
          title: "Analysis Failed", 
          description: data.isStale ? "Analysis timed out. Click retry to try again." : data.error || 'Analysis failed.', 
          variant: "destructive" 
        });
      } else {
        console.log(`[AnalysisUploadForm] Polling: Status is still ${data.status}`);
      }
    } catch (error) {
      console.error(`Polling fetch error for ${id}:`, error);
    }
  }, [onAnalysisComplete, toast, errorMessage]);

  const handleRetry = async () => {
    if (!analysisId) return;

    try {
      setUploadState('analyzing');
      setErrorMessage(null);
      
      const response = await fetch(`/api/cv-analysis/${analysisId}/retry`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to restart analysis');
      }

      toast({ title: "Analysis Restarted", description: "Analysis process has been restarted." });
      
      // Start polling again
      pollingStartTimeRef.current = Date.now();
      pollingIntervalRef.current = setInterval(
        () => pollAnalysisStatus(analysisId),
        POLLING_INTERVAL_MS
      );

    } catch (error) {
      console.error('Error retrying analysis:', error);
      setUploadState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to restart analysis');
      toast({ 
        title: "Retry Failed", 
        description: error instanceof Error ? error.message : 'Failed to restart analysis', 
        variant: "destructive" 
      });
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      toast({ title: "No File Selected", description: "Please select a file to analyze.", variant: "destructive" });
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setErrorMessage(null);
    setAnalysisId(null);
    clearPollingInterval();

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(Math.min(percentComplete, 95));
        }
      };

      xhr.onload = () => {
        setUploadProgress(100);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: AnalysisResponse = JSON.parse(xhr.responseText);
            const currentAnalysisId = response.analysisId;
            setAnalysisId(currentAnalysisId || null);

            if (response.analysis) {
              setUploadState(response.fromCache ? 'cached' : 'success');
              toast({ title: response.fromCache ? "Cached Result" : "Analysis Successful", description: response.message });
              onAnalysisComplete(response.analysis, response.fromCache ?? false, currentAnalysisId ?? '');
              resetState(3000);
            } else if (currentAnalysisId && (response.status === 'PENDING' || response.status === 'ANALYZING')) {
              setUploadState('analyzing');
              toast({ title: "Analysis Initiated", description: response.message });
              // Start polling with timeout tracking
              clearPollingInterval();
              pollingStartTimeRef.current = Date.now();
              console.log('[AnalysisUploadForm] Starting polling for analysis ID:', currentAnalysisId);
              pollingIntervalRef.current = setInterval(
                () => pollAnalysisStatus(currentAnalysisId),
                POLLING_INTERVAL_MS
              );
            } else {
              throw new Error(response.message || 'Unexpected response format from server.');
            }
          } catch (parseOrLogicError: any) {
            console.error("Error processing analysis response:", parseOrLogicError);
            setUploadState('error');
            setErrorMessage(parseOrLogicError.message || 'Failed to process server response.');
            toast({ title: "Processing Error", description: errorMessage, variant: "destructive" });
          }
        } else {
          let errorMsg = 'Analysis request failed.';
          try {
            const errorResponse: AnalysisResponse = JSON.parse(xhr.responseText);
            errorMsg = errorResponse.error || errorMsg;
          } catch (e) { /* Ignore JSON parse error */ }
          setUploadState('error');
          setErrorMessage(errorMsg);
          toast({ title: "Analysis Failed", description: errorMsg, variant: "destructive" });
          setUploadProgress(0);
        }
      };

      xhr.onerror = () => {
        setUploadState('error');
        setUploadProgress(0);
        setErrorMessage('A network error occurred during the request.');
        toast({ title: "Network Error", description: errorMessage, variant: "destructive" });
      };

      xhr.open('POST', '/api/cv-analysis', true);
      xhr.send(formData);

    } catch (error: any) {
      setUploadState('error');
      setUploadProgress(0);
      setErrorMessage('An unexpected error occurred initiating the request.');
      console.error('Upload initiation error:', error);
      toast({ title: "Request Failed", description: errorMessage, variant: "destructive" });
    }
  };

  const clearSelection = () => {
      resetState();
  }

  return (
    <div className="w-full max-w-lg p-4 border rounded-lg shadow-sm space-y-4">
      <Label htmlFor="analysis-upload">Analyze New CV</Label>
      
      {/* Dropzone */} 
      {!selectedFile && uploadState === 'idle' && (
          <div
            {...getRootProps()}
            id="analysis-upload"
            className={`flex flex-col justify-center items-center w-full h-32 px-6 py-10 border-2 border-dashed rounded-md cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
             <p className="mt-2 text-sm text-center text-muted-foreground">
              {isDragActive ? "Drop the file here ..." : "Drag & drop or click to select"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">(PDF, DOCX, TXT - Max {MAX_ANALYSIS_FILE_SIZE_MB}MB)</p>
          </div>
      )}
      
      {/* File Preview & Status */} 
      {selectedFile && (
          <div className={`p-3 border rounded-md flex items-center justify-between gap-2 ${uploadState === 'error' ? 'border-destructive bg-destructive/10' : 'border-input'}`}>
              <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium truncate" title={selectedFile.name}>{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
               {/* Action Button or Status Indicator */} 
              <div className="flex-shrink-0 flex items-center gap-2">
                 {uploadState === 'idle' && (
                     <Button size="sm" onClick={handleUploadAndAnalyze}>Analyze</Button>
                 )}
                 {uploadState === 'uploading' && (
                     <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Uploading ({uploadProgress}%)</Badge>
                 )}
                  {uploadState === 'analyzing' && (
                     <Badge variant="outline"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Analyzing...</Badge>
                 )}
                 {uploadState === 'success' && (
                     <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-3 w-3" />Done</Badge>
                 )}
                 {uploadState === 'cached' && (
                     <Badge variant="secondary"><CheckCircle className="mr-1 h-3 w-3" />Cached</Badge>
                 )}
                 {uploadState === 'error' && (
                    <>
                      <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Error</Badge>
                      {analysisId && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleRetry}
                          className="ml-2"
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Retry
                        </Button>
                      )}
                    </>
                 )}
              </div>
              {/* Cancel/Clear Button */} 
              {(uploadState === 'idle' || uploadState === 'error') && (
                 <Button variant="ghost" size="icon" onClick={clearSelection} className="h-6 w-6 ml-1">
                     <X className="h-4 w-4" />
                 </Button>
              )} 
          </div>
      )}

      {/* Error Message Display */} 
      {uploadState === 'error' && errorMessage && (
          <p className="text-sm text-destructive px-1">Error: {errorMessage}</p>
      )}

    </div>
  );
} 