'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {  Button  } from '@/components/ui-daisy/button';
import {  Input  } from '@/components/ui-daisy/input';
import { Label } from '@/components/ui-daisy/label';
import { Progress } from '@/components/ui-daisy/progress'; // Assuming Progress component exists
import { useToast } from '@/components/ui-daisy/use-toast'; // Assuming useToast hook exists
import { CheckCircle, Loader2, UploadCloud } from 'lucide-react'; // Import icons
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Animation states for spectacular upload effects
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [processingText, setProcessingText] = useState('Uploading...');
  
  // Fun processing text phrases for upload
  const processingTexts = [
    "Uploading...",
    "Scanning...", 
    "Processing...",
    "Analyzing...",
    "Parsing...",
    "Extracting...",
    "Understanding...",
    "Building...",
    "Organizing...",
    "Finalizing..."
  ];
  
  // Text colors - Blue/Teal shades only
  const textColors = [
    'text-blue-400',      // Uploading...
    'text-teal-500',      // Scanning... 
    'text-blue-600',      // Processing...
    'text-cyan-500',      // Analyzing...
    'text-blue-500',      // Parsing...
    'text-teal-600',      // Extracting...
    'text-cyan-400',      // Understanding...
    'text-blue-700',      // Building...
    'text-teal-400',      // Organizing...
    'text-cyan-600'       // Finalizing...
  ];

  const resetState = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadState('idle');
  }

  // Text rotation effect during upload
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (uploadState === 'uploading') {
      interval = setInterval(() => {
        setCurrentTextIndex(prev => {
          const newIndex = (prev + 1) % processingTexts.length;
          setProcessingText(processingTexts[newIndex]);
          return newIndex;
        });
      }, 1200); // Change text every 1.2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uploadState, processingTexts]);

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
      const file = acceptedFiles[0];
      console.log('🔍 [UploadForm] File accepted with details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      setSelectedFile(file);
      setUploadProgress(0);
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

    // Enhanced debugging: Check file details before upload
    console.log('🔍 [UploadForm] Starting upload with file:', {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      lastModified: selectedFile.lastModified
    });

    // Verify file has content by reading first few bytes
    const fileSlice = selectedFile.slice(0, 100);
    const arrayBuffer = await fileSlice.arrayBuffer();
    const firstBytes = new Uint8Array(arrayBuffer);
    console.log('🔍 [UploadForm] File first 10 bytes:', Array.from(firstBytes.slice(0, 10)));
    
    if (selectedFile.size === 0) {
      console.error('❌ [UploadForm] File size is 0 - aborting upload');
      toast({
        title: "Upload Error",
        description: "Selected file is empty. Please select a valid CV file.",
        variant: "destructive",
      });
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Debug FormData
    console.log('🔍 [UploadForm] FormData created. Entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, {
          name: value.name,
          size: value.size,
          type: value.type
        });
      } else {
        console.log(`  ${key}:`, value);
      }
    }

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
          onUploadComplete('upload-complete'); // Call the callback to refresh list
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
    <div className="w-full max-w-md" data-testid="cv-management-upload-form-container">
      {/* Animated Container */}
      <motion.div
        className="relative overflow-hidden rounded-xl border border-base-300"
        animate={{
          scale: uploadState === 'uploading' ? [1, 1.02, 1] : 1,
          rotate: uploadState === 'uploading' ? [0, 0.2, -0.2, 0] : 0
        }}
        transition={{
          duration: 2,
          repeat: uploadState === 'uploading' ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Base background */}
        <div className="absolute inset-0 bg-gradient-to-br from-base-200/80 via-base-300/90 to-base-400/80" />
        
        {/* Glowing rings during upload */}
        {uploadState === 'uploading' && (
          <>
            <motion.div 
              className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 via-teal-500/20 to-cyan-500/20 rounded-xl blur-lg -z-10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-teal-600/30 to-cyan-400/30 rounded-xl blur-sm -z-10"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}

        <div className="relative p-6">
          <Label htmlFor="cv-upload" className="text-lg font-semibold mb-4 block" data-testid="cv-management-upload-label">Upload Your CV</Label>
          
          <div
            {...getRootProps()}
            id="cv-upload"
            className={`flex flex-col justify-center items-center w-full min-h-48 px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
              isDragActive ? 'border-primary bg-primary/10 scale-105' : 
              uploadState === 'uploading' ? 'border-blue-400 bg-blue-50/50' :
              uploadState === 'success' ? 'border-green-500 bg-green-50' : 
              'border-base-300 hover:border-primary/50 hover:bg-base-50'
            }`}
            data-testid="cv-management-upload-dropzone"
          >
            <input {...getInputProps()} disabled={uploadState === 'uploading' || uploadState === 'success'} data-testid="cv-management-upload-file-input" />
            
            {/* Icon with animations */}
            <motion.div
              animate={{
                rotate: uploadState === 'uploading' ? 360 : 0,
                scale: uploadState === 'uploading' ? [1, 1.1, 1] : 1
              }}
              transition={{
                rotate: { duration: 2, repeat: uploadState === 'uploading' ? Infinity : 0, ease: "linear" },
                scale: { duration: 1, repeat: uploadState === 'uploading' ? Infinity : 0, ease: "easeInOut" }
              }}
            >
              {uploadState === 'uploading' ? (
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" data-testid="cv-management-upload-icon-loading" />
              ) : uploadState === 'success' ? (
                <CheckCircle className="h-12 w-12 text-green-500" data-testid="cv-management-upload-icon-success" />
              ) : (
                <UploadCloud className="h-12 w-12 text-base-content/60" data-testid="cv-management-upload-icon-default" />
              )}
            </motion.div>

            {/* Animated text for upload state */}
            {uploadState === 'uploading' ? (
              <div className="mt-4 text-center">
                {/* Slot machine text animation */}
                <div className="relative h-16 overflow-hidden flex items-center justify-center min-w-[200px] mb-2">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={processingText}
                      initial={{ y: 48, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -48, opacity: 0 }}
                      transition={{ 
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                      className={`absolute inset-x-0 text-center text-2xl font-bold ${textColors[currentTextIndex]}`}
                    >
                      {processingText}
                    </motion.span>
                  </AnimatePresence>
                </div>
                
                {/* Progress indicator */}
                <motion.p
                  className="text-lg text-base-content/70 font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {uploadProgress}% Complete
                </motion.p>
              </div>
            ) : (
              <div className="mt-4 text-center">
                <p className={`text-lg font-medium ${uploadState === 'success' ? 'text-green-600' : 'text-base-content'}`} data-testid="cv-management-upload-status-text">
                  {isDragActive ? "Drop the file here!" : 
                   uploadState === 'success' ? "Upload Complete!" : 
                   selectedFile ? selectedFile.name : 
                   "Drag & drop or click to select"}
                </p>
                {uploadState !== 'success' && !selectedFile && (
                  <p className="text-sm text-base-content/60 mt-2" data-testid="cv-management-upload-file-restrictions">
                    PDF, DOCX, TXT - Max {MAX_FILE_SIZE_MB}MB
                  </p>
                )}
              </div>
            )}
          </div>

          {selectedFile && uploadState !== 'success' && (
            <div className="mt-6" data-testid="cv-management-upload-actions">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Button
                  onClick={handleUpload}
                  disabled={uploadState === 'uploading'}
                  variant="primary"
                  size="lg"
                  className="w-full shadow-md"
                  data-testid="cv-management-button-upload-trigger"
                >
                  {uploadState === 'uploading' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="cv-management-upload-button-spinner" /> Processing...</>
                  ) : (
                    'Upload CV'
                  )}
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 