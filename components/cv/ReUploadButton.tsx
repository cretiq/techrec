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

  // Get the current CV ID from analysis data
  const currentCvId = analysisData?.cv?.id || analysisData?.cvId;

  const handleReUpload = useCallback(async () => {
    if (!currentCvId) {
      toast({
        title: "Error",
        description: "No CV found to replace",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  }, [currentCvId]);

  const handleConfirmReUpload = useCallback(async () => {
    setShowConfirmation(false);
    setIsDeleting(true);

    try {
      // Step 1: Delete existing CV
      console.log('[ReUpload] Deleting existing CV:', currentCvId);
      const deleteResponse = await fetch(`/api/cv/${currentCvId}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Failed to delete existing CV');
      }

      console.log('[ReUpload] CV deleted successfully');
      
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
      console.error('[ReUpload] Error deleting CV:', error);
      setIsDeleting(false);
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete existing CV",
        variant: "destructive",
      });
    }
  }, [currentCvId]);

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
        text: "Deleting CV...",
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
        disabled={disabled || !currentCvId}
        leftIcon={icon}
        data-testid="cv-management-action-reupload"
      >
        {text}
      </Button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-warning" />
              <h3 className="text-lg font-semibold">Replace Current CV?</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-base-content/80">
                This will permanently delete your current CV and all its analysis data. 
                You'll then be able to upload a new CV file.
              </p>
              
              <div className="bg-base-200 p-3 rounded-md">
                <div className="text-sm">
                  <div><strong>Current CV:</strong> {analysisData?.cv?.originalName || 'Unknown'}</div>
                  <div><strong>Upload Date:</strong> {analysisData?.cv?.uploadDate ? new Date(analysisData.cv.uploadDate).toLocaleDateString() : 'Unknown'}</div>
                </div>
              </div>

              <p className="text-warning text-sm font-medium">
                ⚠️ This action cannot be undone!
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
                Replace CV
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}