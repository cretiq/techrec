"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface CVUploadCardProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadState: 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';
  uploadProgress: number;
}

export function CVUploadCard({
  onUpload,
  uploadState,
  uploadProgress,
}: CVUploadCardProps) {
  const { toast } = useToast()

  return (
    <Card className="border-0 shadow-none bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 animate-fade-in-up">
      <CardHeader className="pb-3">
        <CardTitle>Upload CV</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Upload your CV to automatically update your profile with your skills and experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">CV</h3>
            <label className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={onUpload}
                className="hidden"
                disabled={uploadState === 'uploading' || uploadState === 'analyzing'}
              />
              <span 
                className={cn(
                  "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200",
                  uploadState === 'uploading' || uploadState === 'analyzing' 
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                )}
              >
                {uploadState === 'uploading' && (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                )}
                {uploadState === 'analyzing' && (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                )}
                {uploadState === 'idle' && 'Upload CV'}
                {uploadState === 'success' && (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 animate-bounce" />
                    Success!
                  </>
                )}
                {uploadState === 'error' && 'Try Again'}
              </span>
            </label>
          </div>
          
          {(uploadState === 'uploading' || uploadState === 'analyzing' || uploadState === 'success') && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {uploadState === 'uploading' && 'Uploading CV...'}
                  {uploadState === 'analyzing' && 'Analyzing CV...'}
                  {uploadState === 'success' && 'CV Processed Successfully!'}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300 ease-out",
                    uploadState === 'success' 
                      ? "bg-green-500" 
                      : "bg-gradient-to-r from-blue-600 to-purple-600",
                    uploadState === 'success' && "animate-pulse"
                  )}
                  style={{ 
                    width: `${uploadProgress}%`,
                    transition: 'width 0.5s ease-out'
                  }}
                />
              </div>
            </div>
          )}
          
          {uploadState === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md animate-fade-in">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">CV analyzed successfully!</p>
                <p className="text-sm">Your profile has been updated with the extracted information.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Supported formats: PDF, DOC, DOCX. Max size: 5MB
      </CardFooter>
    </Card>
  )
} 