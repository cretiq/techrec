'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {  Button  } from '@/components/ui-daisy/button';
import {  Input  } from '@/components/ui-daisy/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress'; // Assuming Progress component exists
import { useToast } from '@/components/ui/use-toast'; // Assuming useToast hook exists
import { CheckCircle, Loader2, UploadCloud } from 'lucide-react'; // Import icons

// Define allowed MIME types and max size (should match backend)
const ALLOWED_MIME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Add onUploadComplete prop
interface UploadFormProps {
  onUploadComplete: () => void;
}

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const resetState = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadState('idle');
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadState('idle'); // Reset state if new file dropped
    if (rejectedFiles && rejectedFiles.length > 0) {
      // Handle rejected files (e.g., wrong type, too large)
      const rejection = rejectedFiles[0];
      let message = 'File rejected.';
      if (rejection.errors[0].code === 'file-too-large') {
        message = `File is larger than ${MAX_FILE_SIZE_MB}MB.`;
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        message = 'Invalid file type.';
      }
      toast({
        title: "Upload Error",
        description: message,
        variant: "destructive",
      });
      resetState();
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadProgress(0);
      console.log('File accepted:', acceptedFiles[0].name);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: false, // Allow only single file upload
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();

      // Progress event handler
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentComplete);
        }
      };

      // Completion handler
      xhr.onload = () => {
        setUploadProgress(100); // Ensure progress hits 100 on load
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setUploadState('success');
          toast({
            title: "Upload Successful",
            description: `CV ${selectedFile.name} uploaded (ID: ${response.cvId}).`,
            // Optional: Add success style if available
          });
          onUploadComplete(); // Call the callback to refresh list
          // Reset after a short delay to show success state
          setTimeout(() => {
              resetState();
          }, 2000);
        } else {
          // Handle server errors
          setUploadState('error');
          let errorMsg = 'Upload failed. Please try again.';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMsg = errorResponse.error || errorMsg;
          } catch (e) { /* Ignore JSON parse error */ }
          toast({
            title: "Upload Failed",
            description: errorMsg,
            variant: "destructive",
          });
           setUploadProgress(0); // Reset progress on failure
           // Optionally reset state immediately on error or after delay
           // resetState(); 
        }
      };

      // Error handler
      xhr.onerror = () => {
        setUploadState('error');
        setUploadProgress(0);
        toast({
          title: "Upload Error",
          description: "An network error occurred during upload.",
          variant: "destructive",
        });
         // Optionally reset state immediately on error or after delay
         // resetState();
      };

      xhr.open('POST', '/api/cv/upload', true);
      // TODO: Add authorization header if needed (e.g., JWT token)
      // xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (error) {
      setUploadState('error');
      setUploadProgress(0);
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      // Optionally reset state immediately on error or after delay
      // resetState();
    }
  };

  return (
    <div className="w-full max-w-md p-4 border rounded-lg shadow-sm dark:border-gray-500" data-testid="cv-management-upload-form-container">
      <Label htmlFor="cv-upload" data-testid="cv-management-upload-label">Upload CV</Label>
      <div
        {...getRootProps()}
        id="cv-upload"
        className={`mt-2 flex flex-col justify-center items-center w-full h-32 px-6 py-10 border-2 border-dashed dark:border-gray-500 rounded-md cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/50'} ${uploadState === 'success' ? 'border-green-500 bg-green-50' : ''}`}
        data-testid="cv-management-upload-dropzone"
      >
        <input {...getInputProps()} disabled={uploadState === 'uploading' || uploadState === 'success'} data-testid="cv-management-upload-file-input" />
        {
          uploadState === 'uploading' ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="cv-management-upload-icon-loading" />
          ) : uploadState === 'success' ? (
            <CheckCircle className="h-8 w-8 text-green-500" data-testid="cv-management-upload-icon-success" />
          ) : (
             <UploadCloud className="h-8 w-8 text-muted-foreground" data-testid="cv-management-upload-icon-default" />
          )
        }
        <p className={`mt-2 text-sm text-center ${uploadState === 'success' ? 'text-green-600 font-medium' : 'text-muted-foreground'}`} data-testid="cv-management-upload-status-text">
          {isDragActive ? "Drop the file here ..." : 
           uploadState === 'uploading' ? `Uploading (${uploadProgress}%)` : 
           uploadState === 'success' ? "Upload Complete!" : 
           selectedFile ? selectedFile.name : 
           "Drag & drop or click to select"}
        </p>
        {uploadState !== 'uploading' && uploadState !== 'success' && !selectedFile && (
             <p className="text-xs text-muted-foreground mt-1" data-testid="cv-management-upload-file-restrictions">(PDF, DOCX, TXT - Max {MAX_FILE_SIZE_MB}MB)</p>
        )}
      </div>

      {selectedFile && uploadState !== 'success' && (
        <div className="mt-4" data-testid="cv-management-upload-actions">
          {/* Optionally show progress bar outside dropzone too */}
          {/* {uploadState === 'uploading' && <Progress value={uploadProgress} className="mt-2 h-2" />} */} 
          <Button
            onClick={handleUpload}
            disabled={uploadState === 'uploading'}
            className="w-full"
            data-testid="cv-management-button-upload-trigger"
          >
            {uploadState === 'uploading' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="cv-management-upload-button-spinner" /> Uploading...</> : 'Upload CV'}
          </Button>
        </div>
      )}
    </div>
  );
} 