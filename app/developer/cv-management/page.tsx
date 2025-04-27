'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UploadForm } from '@/components/cv/UploadForm';
import { CVList } from '@/components/cv/CVList';
import { AnalysisUploadForm } from '@/components/analysis/AnalysisUploadForm';
import { AnalysisResultDisplay } from '@/components/analysis/AnalysisResultDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from 'next/navigation';
// Import Redux hooks and items
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { fetchAnalysisById, clearAnalysis, selectCurrentAnalysisId, selectAnalysisStatus } from '@/lib/features/analysisSlice';

export default function CVManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  // Remove local state for analysis ID and result
  // const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  // const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('application/pdf'); // Keep this for now
  const [analyses, setAnalyses] = useState<any[]>([]);

  // Get Redux dispatch
  const dispatch: AppDispatch = useDispatch();

  // --- URL State Handling --- 
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'analyze' ? 'analyze' : 'manage';
  const [activeTab, setActiveTab] = useState(initialTab);
  // Remove isRestoringAnalysis state, use Redux status instead
  // const [isRestoringAnalysis, setIsRestoringAnalysis] = useState(false);

  // Select state from Redux
  const analysisIdFromStore = useSelector(selectCurrentAnalysisId);
  const analysisStatus = useSelector(selectAnalysisStatus);

  // Function to update URL and local state when tab changes
  const handleTabChange = useCallback((newTab: string) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', newTab);
      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, router, searchParams]);

  // Effect to sync activeTab state if URL changes externally
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') === 'analyze' ? 'analyze' : 'manage';
    if (tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  // --- Fetch CV List (unrelated to analysis display) ---
  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/cv-analysis');
      if (!response.ok) {
        throw new Error(`Failed to fetch analyses: ${response.statusText}`);
      }
      const data = await response.json();
      setAnalyses(data);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analyses",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleUploadComplete = () => {
    console.log('Standard upload complete, incrementing refresh key...');
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Refactored handler: Only update URL, let useEffect trigger fetch
  const handleAnalysisComplete = (result: any, fromCache: boolean, analysisId: string) => {
    // Store the original mime type when analysis completes
    setOriginalMimeType(result?.mimeType || 'application/pdf'); 

    // Update URL which will trigger the useEffect hook below
    const params = new URLSearchParams(searchParams.toString());
    params.set('analysisId', analysisId);
    // Ensure we switch to the analyze tab
    if (activeTab !== 'analyze') {
        setActiveTab('analyze');
        params.set('tab', 'analyze');
    }
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });

    // Removed PUT request here - saving is handled within AnalysisResultDisplay now
    // if (!fromCache && analysisId) { ... }
  };

  // Refactored Effect: Dispatch Redux actions based on URL
  useEffect(() => {
    const analysisIdFromUrl = searchParams.get('analysisId');
    // Read current state directly here instead of relying on dependencies for these
    const currentStoreId = analysisIdFromStore; 
    const currentStatus = analysisStatus;

    if (analysisIdFromUrl) {
      // Only fetch if the ID is different from the one currently in store
      // or if the status is idle/failed (to allow refetch)
      // Use the directly read currentStatus here
      if (analysisIdFromUrl !== currentStoreId || 
          (currentStatus !== 'loading' && currentStatus !== 'succeeded' && currentStatus !== 'suggesting')) {
        console.log(`URL has analysisId ${analysisIdFromUrl}, dispatching fetchAnalysisById...`);
        dispatch(fetchAnalysisById(analysisIdFromUrl));
      } else {
        // Use the directly read values in the log message
        console.log(`URL analysisId ${analysisIdFromUrl} matches store (${currentStoreId}) or status is ${currentStatus}. Skipping fetch.`);
      }
    } else {
      // If no analysisId in URL, clear the analysis state in Redux
      // Use the directly read currentStoreId here
      if (currentStoreId !== null) {
        console.log('URL has no analysisId, dispatching clearAnalysis...');
        dispatch(clearAnalysis());
      }
    }
    // Dependency: Run ONLY when searchParams (URL) or dispatch function changes.
    // DO NOT include analysisIdFromStore or analysisStatus here.
  }, [searchParams, dispatch]); 

  // Separate effect for switching tab (remains the same)
  useEffect(() => {
      const analysisIdFromUrl = searchParams.get('analysisId');
      if (analysisIdFromUrl && activeTab !== 'analyze') {
          console.log('Analysis ID present, ensuring analyze tab is active.');
          handleTabChange('analyze');
      }
  }, [searchParams, activeTab, handleTabChange]);

  useEffect(() => {
    const styles = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fade-in-up {
        animation: fadeInUp 0.25s ease-out forwards;
        opacity: 0;
      }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Determine loading state from Redux status
  const isLoadingAnalysis = analysisStatus === 'loading';
  
  // Log state just before returning JSX
  console.log('[CVManagementPage] Rendering. States:', {
    isLoadingAnalysis,
    analysisIdFromStore,
  });

  return (
    <div className="container mx-auto p-4 space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h1 className="text-2xl font-bold">CV Management & Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload, manage, analyze, and edit your CV documents.</p>
      </div>
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full animate-fade-in-up" 
        style={{ animationDelay: '300ms' }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage CVs</TabsTrigger>
          <TabsTrigger value="analyze">Analyze & Edit</TabsTrigger>
        </TabsList>
        <TabsContent value="manage" className="mt-4 space-y-6">
             <Card>
                <CardHeader>
                <CardTitle>Upload New CV</CardTitle>
                <CardDescription>Upload a new CV document (PDF, DOCX, TXT).</CardDescription>
                </CardHeader>
                <CardContent>
                    <UploadForm onUploadComplete={handleUploadComplete} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle>My CVs</CardTitle>
                <CardDescription>Manage your uploaded CV documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CVList refreshKey={refreshKey} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="analyze" className="mt-4 space-y-6">
            <Card>
                 <CardHeader>
                    <CardTitle>Analyze New CV</CardTitle>
                    <CardDescription>Upload a CV document to analyze its content and structure. Results appear below.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <AnalysisUploadForm onAnalysisComplete={handleAnalysisComplete} />
                 </CardContent>
            </Card>
            
            {/* Conditional rendering based on Redux state - check directly */}
            {(analysisIdFromStore || isLoadingAnalysis) && (
                 <Card>
                     <CardHeader>
                         <CardTitle>Analysis Result</CardTitle>
                         <CardDescription>
                             {isLoadingAnalysis ? "Loading analysis..." : "View and edit the results of the CV analysis"}
                         </CardDescription>
                     </CardHeader>
                     <CardContent>
                         {isLoadingAnalysis ? (
                             <div className="flex justify-center items-center h-40">Loading...</div>
                         ) : (
                             <AnalysisResultDisplay 
                                originalMimeType={originalMimeType} 
                             />
                         )}
                     </CardContent>
                 </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 