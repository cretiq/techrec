'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui-daisy/button';
import { Modal, ModalContent, ModalFooter } from '@/components/ui-daisy/modal';
import { RefreshCw, Upload, AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from "@/components/ui-daisy/use-toast";
import { motion, AnimatePresence } from 'framer-motion';

interface ReUploadButtonProps {
  analysisData?: any;
  onUploadComplete: (analysisId?: string) => void;
  onAnimationStateChange?: (isAnimating: boolean, processingText: string, sparkles: boolean) => void;
}

export function ReUploadButton({ analysisData, onUploadComplete, onAnimationStateChange }: ReUploadButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Animation states
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  
  // Fun processing text phrases
  const processingTexts = [
    "Uploading...",
    "Churning...", 
    "Analyzing...",
    "Building...",
    "Cooking...",
    "Processing...",
    "Optimizing...",
    "Enhancing...",
    "Polishing...",
    "Finalizing..."
  ];

  // Check if we have developer data (any profile information)
  const hasDeveloperData = analysisData && (
    analysisData.contactInfo ||
    (analysisData.skills && analysisData.skills.length > 0) ||
    (analysisData.experience && analysisData.experience.length > 0) ||
    (analysisData.education && analysisData.education.length > 0) ||
    analysisData.about
  );

  // Get the current CV ID from analysis data
  const currentCvId = analysisData?.cv?.id || analysisData?.cvId;

  // Jackpot-style text rotation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isDeleting || isUploading) {
      setShowSparkles(true);
      interval = setInterval(() => {
        setCurrentTextIndex(prev => (prev + 1) % processingTexts.length);
      }, 800); // Change text every 800ms for that jackpot feel
    } else {
      setShowSparkles(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDeleting, isUploading, processingTexts.length]);

  // Notify parent component about animation state changes
  useEffect(() => {
    const isAnimating = isDeleting || isUploading;
    const currentText = processingTexts[currentTextIndex];
    
    if (onAnimationStateChange) {
      onAnimationStateChange(isAnimating, currentText, showSparkles);
    }
  }, [isDeleting, isUploading, currentTextIndex, showSparkles, onAnimationStateChange, processingTexts]);

  const handleReUpload = useCallback(async () => {
    if (!hasDeveloperData) {
      toast({
        title: "No Profile Data",
        description: "No profile data found to clear. Please upload a CV first.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  }, [hasDeveloperData]);

  const handleConfirmReUpload = useCallback(async () => {
    setShowConfirmation(false);
    setIsDeleting(true);

    try {
      // Step 1: Clear all profile data (includes CV files, skills, experience, etc.)
      console.log('[ReUpload] Clearing all profile data...');
      const deleteResponse = await fetch('/api/developer/me/profile', {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Failed to clear profile data');
      }

      const deleteResult = await deleteResponse.json();
      console.log('[ReUpload] Profile data cleared successfully:', deleteResult);
      
      // Reset deleting state immediately after successful deletion
      setIsDeleting(false);
      
      // Step 2: Show file picker
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf,.docx,.txt';
      fileInput.style.display = 'none';
      
      fileInput.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          // User cancelled file selection - no action needed since we're already in normal state
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

        // Step 3: Upload new CV
        await handleFileUpload(file);
      };
      
      // Trigger file picker
      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);

    } catch (error) {
      console.error('[ReUpload] Error clearing profile data:', error);
      setIsDeleting(false);
      toast({
        title: "Data Clearing Failed",
        description: error instanceof Error ? error.message : "Failed to clear profile data",
        variant: "destructive",
      });
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Progress event handler
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentComplete);
        }
      };

      // Completion handler
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          setUploadProgress(100);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            let errorMsg = 'Upload failed. Please try again.';
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMsg = errorResponse.error || errorMsg;
            } catch (e) {
              // Ignore JSON parse error
            }
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error occurred during upload'));
        };
      });

      xhr.open('POST', '/api/cv/upload', true);
      xhr.send(formData);

      const response = await uploadPromise as any;
      
      toast({
        title: "Upload Successful",
        description: `CV ${file.name} uploaded and processed successfully!`,
      });

      // Call the upload completion handler with the new analysis ID
      if (response.analysisId) {
        onUploadComplete(response.analysisId);
      } else {
        // Fallback: trigger a refresh
        window.location.reload();
      }

    } catch (error) {
      console.error('[ReUpload] Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete]);

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  // Determine the current state for dynamic variant selection
  const getButtonState = () => {
    if (isDeleting) {
      return {
        variant: "primary-interactive" as const,
        icon: <Sparkles className="h-4 w-4 text-primary-content animate-pulse" />,
        text: processingTexts[currentTextIndex],
        loading: true,
        animated: true,
        accentuated: true
      };
    }
    
    if (isUploading) {
      return {
        variant: "flashy-interactive" as const,
        icon: <Sparkles className="h-4 w-4 text-primary animate-spin" />,
        text: uploadProgress > 0 ? `${processingTexts[currentTextIndex]} (${uploadProgress}%)` : processingTexts[currentTextIndex],
        loading: true,
        animated: true,
        accentuated: true
      };
    }

    return {
      variant: "flashy-interactive" as const,
      icon: <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />,
      text: "Re-upload CV",
      loading: false,
      animated: false,
      accentuated: false
    };
  };

  const { variant, icon, text, loading, animated, accentuated } = getButtonState();

  return (
    <>
      {/* Simple button without container animations */}
      <Button
        variant={variant}
        size="lg"
        onClick={handleReUpload}
        disabled={!hasDeveloperData}
        leftIcon={icon}
        loading={loading}
        animated={animated}
        data-testid="cv-management-action-reupload"
        className={`
          ${accentuated ? 'shadow-2xl shadow-primary/40 border-2 border-primary/60' : 'border-2 border-base-300'}
          ${isUploading ? 'ring-4 ring-primary/50 ring-offset-4 ring-offset-base-100 border-primary' : ''}
          transition-all duration-300 ease-in-out relative overflow-hidden px-6 py-3
        `}
      >
        {text}
      </Button>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={handleCancelConfirmation}
        title="Clear Profile Data & Upload New CV?"
        variant="elevated"
        backdropVariant="default"
        size="lg"
        closeOnBackdrop={!isDeleting}
        closeOnEscape={!isDeleting}
      >
        <ModalContent className="p-0">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
            <span className="text-base text-base-content/80">This action will permanently delete all your data</span>
          </div>
          
          <div className="space-y-4">
            <div className="bg-error/10 border border-error/20 p-4 rounded-md">
              <p className="text-error font-medium mb-2">⚠️ WARNING: This action will permanently delete ALL your profile data!</p>
              <p className="text-base-content/80 text-sm">
                This includes your CV file, extracted profile information, work experience, education, skills, and all analysis results. You will need to start over with a fresh CV upload and analysis.
              </p>
            </div>
            
            {/* Show what will be deleted */}
            <div className="bg-base-200 p-4 rounded-md">
              <h4 className="font-medium text-base-content mb-2">The following data will be permanently deleted:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-base-content/70">
                {analysisData?.contactInfo && <div>• Contact Information</div>}
                {analysisData?.about && <div>• About/Summary</div>}
                {analysisData?.skills?.length > 0 && <div>• {analysisData.skills.length} Skills</div>}
                {analysisData?.experience?.length > 0 && <div>• {analysisData.experience.length} Work Experiences</div>}
                {analysisData?.education?.length > 0 && <div>• {analysisData.education.length} Education Entries</div>}
                {analysisData?.cv && <div>• CV File: {analysisData.cv.originalName || 'Current CV'}</div>}
                <div>• All Analysis Results</div>
                <div>• Profile Score & Metrics</div>
              </div>
            </div>

            <p className="text-error text-sm font-medium">
              🚨 This action cannot be undone! Make sure you want to completely start over.
            </p>
          </div>
        </ModalContent>
        
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={handleCancelConfirmation}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="error"
            onClick={handleConfirmReUpload}
            disabled={isDeleting}
            leftIcon={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          >
            {isDeleting ? 'Clearing Data...' : 'Clear All Data & Upload New CV'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}