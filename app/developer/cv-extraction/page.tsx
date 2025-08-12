'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CVExtractionManager } from '@/components/cv/CVExtractionManager';
import { Card } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { ArrowLeft, Loader2, AlertCircle, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AnalysisStatus } from '@prisma/client';

interface CV {
  id: string;
  developerId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  status: AnalysisStatus;
  uploadDate: string;
  extractedText?: string | null;
  improvementScore?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  description: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  responsibilities: string[];
  achievements: string[];
  teamSize?: number | null;
  techStack: string[];
  parentId?: string | null;
  children?: Experience[];
  displayOrder: number;
  mergedFrom?: string[];
}

interface CvAnalysisVersion {
  id: string;
  cvId: string;
  versionNumber: number;
  modelUsed: string;
  prompt?: string | null;
  analysisDate: string;
  extractedData: any;
  improvementScore: number;
  userEdits?: any | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CVExtractionPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cv, setCv] = useState<CV | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [activeVersion, setActiveVersion] = useState<CvAnalysisVersion | undefined>(undefined);

  // Get CV ID from URL params or find latest CV
  const cvIdParam = searchParams.get('cvId');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  }, [status, router]);

  // Fetch data on mount
  useEffect(() => {
    if (status === 'authenticated') {
      if (cvIdParam) {
        fetchCVData(cvIdParam);
      } else {
        fetchLatestCV();
      }
    }
  }, [status, cvIdParam]);

  // Fetch specific CV by ID
  const fetchCVData = async (cvId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[CVExtraction] Fetching CV data for ID: ${cvId}`);
      
      // Fetch CV details
      const cvResponse = await fetch(`/api/cv/${cvId}`);
      if (!cvResponse.ok) {
        throw new Error(`CV not found (${cvResponse.status})`);
      }
      
      const cvData: CV = await cvResponse.json();
      console.log(`[CVExtraction] CV data:`, cvData);
      
      // Check if CV is completed
      if (cvData.status !== AnalysisStatus.COMPLETED) {
        setError(`CV analysis is ${cvData.status.toLowerCase()}. Please wait for analysis to complete.`);
        setCv(cvData);
        return;
      }
      
      setCv(cvData);
      
      // Fetch experiences and versions in parallel
      await Promise.all([
        fetchExperiences(),
        fetchActiveVersion(cvId)
      ]);
      
    } catch (error: any) {
      console.error('[CVExtraction] Error fetching CV data:', error);
      setError(error.message || 'Failed to load CV data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest completed CV
  const fetchLatestCV = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[CVExtraction] Fetching latest CV');
      
      const response = await fetch('/api/cv');
      if (!response.ok) {
        throw new Error('Failed to fetch CVs');
      }
      
      const cvs: CV[] = await response.json();
      console.log(`[CVExtraction] Found ${cvs.length} CVs`);
      
      // Find most recent completed CV
      const completedCVs = cvs.filter(cv => cv.status === AnalysisStatus.COMPLETED);
      
      if (completedCVs.length === 0) {
        setError('No completed CV analysis found. Please upload and analyze a CV first.');
        return;
      }
      
      const latestCV = completedCVs.sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      )[0];
      
      console.log(`[CVExtraction] Using latest completed CV:`, latestCV.id);
      
      // Update URL to reflect the CV being used
      router.replace(`/developer/cv-extraction?cvId=${latestCV.id}`);
      
      setCv(latestCV);
      
      // Fetch experiences and versions
      await Promise.all([
        fetchExperiences(),
        fetchActiveVersion(latestCV.id)
      ]);
      
    } catch (error: any) {
      console.error('[CVExtraction] Error fetching latest CV:', error);
      setError(error.message || 'Failed to load CV data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user experiences
  const fetchExperiences = async () => {
    try {
      console.log('[CVExtraction] Fetching experiences');
      
      const response = await fetch('/api/developer/me/experience');
      if (!response.ok) {
        console.warn('[CVExtraction] Failed to fetch experiences:', response.status);
        setExperiences([]);
        return;
      }
      
      const data = await response.json();
      console.log(`[CVExtraction] Loaded ${data.length} experiences`);
      setExperiences(data || []);
      
    } catch (error) {
      console.error('[CVExtraction] Error fetching experiences:', error);
      setExperiences([]);
    }
  };

  // Fetch active version for CV
  const fetchActiveVersion = async (cvId: string) => {
    try {
      console.log(`[CVExtraction] Fetching versions for CV: ${cvId}`);
      
      const response = await fetch(`/api/cv/versions/${cvId}`);
      if (!response.ok) {
        console.warn('[CVExtraction] Failed to fetch versions:', response.status);
        return;
      }
      
      const data = await response.json();
      const versions: CvAnalysisVersion[] = data.versions || [];
      
      console.log(`[CVExtraction] Found ${versions.length} versions`);
      
      // Find active version
      const active = versions.find(v => v.isActive);
      if (active) {
        console.log(`[CVExtraction] Active version: ${active.versionNumber}`);
        setActiveVersion(active);
      }
      
    } catch (error) {
      console.error('[CVExtraction] Error fetching versions:', error);
    }
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto py-8">
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <span className="text-lg">Loading CV extraction data...</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto py-8">
          {/* Header */}
          <div className="mb-6">
            <Link href="/developer/cv-management">
              <Button variant="ghost" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to CV Management
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">CV Extraction & Organization</h1>
          </div>

          {/* Error Card */}
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load CV Data</h2>
            <p className="text-base-content opacity-70 mb-6">{error}</p>
            
            <div className="flex gap-4 justify-center">
              <Link href="/developer/cv-management">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload & Analyze CV
                </Button>
              </Link>
              <Button 
                variant="primary" 
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <Loader2 className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // No CV found
  if (!cv) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-base-content opacity-30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No CV Found</h2>
            <p className="text-base-content opacity-70 mb-6">
              Please upload and analyze a CV first to use the extraction tools.
            </p>
            
            <Link href="/developer/cv-management">
              <Button variant="primary" className="gap-2">
                <Upload className="h-4 w-4" />
                Go to CV Management
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/developer/cv-management">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to CV Management
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">CV Extraction & Organization</h1>
              <p className="text-base-content opacity-70 mt-2">
                Organize your CV data with AI-powered suggestions and version control
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-base-content opacity-60 mb-1">
                Current CV
              </div>
              <div className="font-medium">{cv.originalName}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={cv.status === AnalysisStatus.COMPLETED ? 'success' : 'warning'}
                  size="sm"
                >
                  {cv.status}
                </Badge>
                {cv.improvementScore && (
                  <Badge variant="info" size="sm">
                    Score: {cv.improvementScore}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CV Extraction Manager */}
        <CVExtractionManager
          cvId={cv.id}
          initialExperiences={experiences}
          currentVersion={activeVersion}
        />
      </div>
    </div>
  );
}