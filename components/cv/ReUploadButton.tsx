'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui-daisy/button';
import { RefreshCw, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui-daisy/use-toast";

interface ReUploadButtonProps {
  analysisData?: any;
  onUploadComplete: (analysisId?: string) => void;
}

export function ReUploadButton({ analysisData, onUploadComplete }: ReUploadButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      
      // Step 2: Show file picker
      setIsDeleting(false);
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

  // Determine the current state and icon/text
  const getButtonContent = () => {
    if (isDeleting) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: "Clearing Data...",
        disabled: true
      };
    }
    
    if (isUploading) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: `Uploading (${uploadProgress}%)`,
        disabled: true
      };
    }

    return {
      icon: <RefreshCw className="h-4 w-4" />,
      text: "Re-upload CV",
      disabled: false
    };
  };

  const { icon, text, disabled } = getButtonContent();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReUpload}
        disabled={disabled || !hasDeveloperData}
        leftIcon={icon}
        data-testid="cv-management-action-reupload"
      >
        {text}
      </Button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-lg w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-error" />
              <h3 className="text-lg font-semibold">Clear Profile Data & Upload New CV?</h3>
            </div>
            
            <div className="space-y-4 mb-6">
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
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={handleCancelConfirmation}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReUpload}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isDeleting ? 'Clearing Data...' : 'Clear All Data & Upload New CV'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}