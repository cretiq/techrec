'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UploadForm } from '@/components/cv/UploadForm';
import { CVList } from '@/components/cv/CVList';
import { AnalysisResultDisplay } from '@/components/analysis/AnalysisResultDisplay';
import {  Card, CardContent, CardDescription, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import {  Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui-daisy/tabs';
import { toast } from "@/components/ui/use-toast";
import {  Button  } from '@/components/ui-daisy/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store';
import { fetchAnalysisById, clearAnalysis, selectCurrentAnalysisId, selectAnalysisStatus, selectCurrentAnalysisData } from '@/lib/features/analysisSlice';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CVManagementPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [originalMimeType, setOriginalMimeType] = useState<string>('application/pdf'); // Keep this for now
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [redisTestMessage, setRedisTestMessage] = useState<string | null>(null);

    // Get Redux dispatch
    const dispatch: AppDispatch = useDispatch();

    // --- URL State Handling --- 
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    const initialTab = tabFromUrl === 'analyze' ? 'analyze' : 'manage';
    const [activeTab, setActiveTab] = useState(initialTab);
    
    // Only log on mount
    useEffect(() => {
        console.log('[CVManagementPage] Mount: tabFromUrl=', tabFromUrl, 'initialTab=', initialTab, 'activeTab=', activeTab);
    }, []); // Empty deps = mount only


    // Select state from Redux
    const analysisIdFromStore = useSelector(selectCurrentAnalysisId);
    const analysisStatus = useSelector(selectAnalysisStatus);
    const analysisData = useSelector(selectCurrentAnalysisData);

    // Function to update URL and local state when tab changes
    const handleTabChange = useCallback((newTab: string) => {
        if (newTab !== activeTab) {
            setActiveTab(newTab);
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', newTab);
            // If switching away from analyze, remove the analysisId
            if (newTab !== 'analyze') {
                params.delete('analysisId');
                // Optionally clear Redux state immediately, though the effect should handle it
                // dispatch(clearAnalysis()); 
            } else {
                // If switching TO analyze, ensure analysisId (if present in store) is in URL
                // This case might be redundant if selection always adds ID to URL
                const currentStoreId = analysisIdFromStore; // Read directly
                if (currentStoreId && !params.has('analysisId')) {
                    params.set('analysisId', currentStoreId);
                }
            }
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }
    }, [activeTab, router, searchParams, dispatch, analysisIdFromStore]); // Add dependencies

    // Effect to sync activeTab state if URL changes externally
    useEffect(() => {
        const rawTabFromUrl = searchParams.get('tab');
        const tabFromUrl = rawTabFromUrl === 'analyze' ? 'analyze' : 'manage';
        console.log('[CVManagementPage] URL sync effect: rawTabFromUrl=', rawTabFromUrl, 'tabFromUrl=', tabFromUrl, 'activeTab=', activeTab);
        if (tabFromUrl !== activeTab) {
            console.log('[CVManagementPage] Updating activeTab from', activeTab, 'to', tabFromUrl);
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]); // Remove activeTab from dependencies to prevent loops

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
        console.log('[CVManagementPage] Standard upload complete, incrementing refresh key...');
        setRefreshKey(prevKey => prevKey + 1);
    };

    // Refactored handler: Only update URL, let useEffect trigger fetch
    const handleAnalysisComplete = (result: any, fromCache: boolean, analysisId: string) => {
        // Store the original mime type when analysis completes
        setOriginalMimeType(result?.mimeType || 'application/pdf');
        console.log(`[CVManagementPage] Handling analysis complete. Analysis ID: ${analysisId}, From Cache: ${fromCache}`); // Added log

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
        const currentStoreId = analysisIdFromStore;
        const currentStatus = analysisStatus;
        console.log(`[CVManagementPage useEffect] Running effect. URL ID: ${analysisIdFromUrl}, Store ID: ${currentStoreId}, Status: ${currentStatus}`); // LOG

        if (analysisIdFromUrl) {
            // Only fetch if:
            // 1. The URL ID is different from store ID, OR
            // 2. We don't have analysis data yet, AND
            // 3. We're not currently loading
            const shouldFetch = (analysisIdFromUrl !== currentStoreId || !analysisData) && 
                               currentStatus !== 'loading' && 
                               currentStatus !== 'succeeded';
            
            if (shouldFetch) {
                console.log(`[CVManagementPage useEffect] Dispatching fetchAnalysisById(${analysisIdFromUrl})...`); // LOG
                dispatch(fetchAnalysisById(analysisIdFromUrl));
            } else {
                console.log(`[CVManagementPage useEffect] Skipping fetch. URL ID: ${analysisIdFromUrl}, Store ID: ${currentStoreId}, Status: ${currentStatus}.`); // LOG
            }
        } else {
            if (currentStoreId !== null) {
                console.log(`[CVManagementPage useEffect] Dispatching clearAnalysis... Current store ID was: ${currentStoreId}`); // LOG
                dispatch(clearAnalysis());
            } else {
                console.log(`[CVManagementPage useEffect] Skipping clearAnalysis. No ID in URL or store.`); // LOG
            }
        }
    }, [searchParams, dispatch, analysisIdFromStore, analysisStatus]); // Remove analysisData to prevent infinite loops 

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

    // Only log state changes, not every render
    useEffect(() => {
        console.log('[CVManagementPage] State changed:', {
            activeTab,
            analysisIdFromUrl: searchParams.get('analysisId'),
            analysisStatus,
            analysisIdFromStore,
        });
    }, [activeTab, analysisStatus, analysisIdFromStore]);

    // --- Redis Test Handlers ---
    const handleTestRedisSet = async () => {
        setRedisTestMessage('Setting test value in Redis...');
        console.log('[CVManagementPage] handleTestRedisSet triggered'); // Added log
        try {
            const response = await fetch('/api/redis-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    key: 'my_temporary_test_key',
                    value: `Hello from CV Management Page @ ${new Date().toLocaleTimeString()}`,
                    ttl: 120 // 2 minutes TTL
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to set Redis test value');
            }
            setRedisTestMessage(`Set successful: ${JSON.stringify(result)}`);
            toast({
                title: "Redis Test: Set OK",
                description: `Key: ${result.key}, Value: ${result.value}`,
            });
        } catch (error: any) {
            console.error('Error testing Redis set:', error);
            setRedisTestMessage(`Set error: ${error.message}`);
            toast({
                title: "Redis Test: Set FAILED",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleTestRedisGet = async () => {
        setRedisTestMessage('Getting test value from Redis...');
        const testKey = 'my_temporary_test_key';
        console.log('[CVManagementPage] handleTestRedisGet triggered'); // Added log
        try {
            const response = await fetch(`/api/redis-test?key=${testKey}`);
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to get Redis test value');
            }
            setRedisTestMessage(`Get result: ${JSON.stringify(result)}`);
            toast({
                title: result.fromCache ? "Redis Test: Get HIT" : "Redis Test: Get MISS",
                description: result.fromCache ? `Value: ${JSON.stringify(result.value)}` : `Key ${testKey} not found.`,
            });
        } catch (error: any) {
            console.error('Error testing Redis get:', error);
            setRedisTestMessage(`Get error: ${error.message}`);
            toast({
                title: "Redis Test: Get FAILED",
                description: error.message,
                variant: "destructive",
            });
        }
    };
    // --- End Redis Test Handlers ---

    return (
        <div className="container mx-auto p-4 space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }} data-testid="cv-management-page-container">
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }} data-testid="cv-management-page-header">
                <h1 className="text-2xl font-bold" data-testid="cv-management-title">CV Management & Analysis</h1>
                <p className="text-sm text-muted-foreground mt-1" data-testid="cv-management-description">Upload, manage, analyze, and edit your CV documents.</p>
            </div>
            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full animate-fade-in-up"
                style={{ animationDelay: '150ms' }}
                data-testid="cv-management-tabs-container"
            >
                <TabsList className="grid w-full grid-cols-2 gap-2 p-1 bg-base-100/20 backdrop-blur-sm rounded-lg border border-base-300" variant="default" data-testid="cv-management-tabs-list">
                    <TabsTrigger 
                        value="manage" 
                        className={cn(
                            "font-semibold transition-all duration-200",
                            activeTab === "manage" 
                                ? "bg-base-100/80 text-base-content shadow-lg transform scale-[1.02]" 
                                : "bg-base-100/20 hover:bg-base-100/30 hover:shadow-md"
                        )}
                        size="lg"
                        data-testid="cv-management-tab-manage"
                    >
                        Manage CVs
                    </TabsTrigger>
                    <TabsTrigger 
                        value="analyze"
                        className={cn(
                            "font-semibold transition-all duration-200",
                            activeTab === "analyze" 
                                ? "bg-base-100/80 text-base-content shadow-lg transform scale-[1.02]" 
                                : "bg-base-100/20 hover:bg-base-100/30 hover:shadow-md"
                        )}
                        size="lg"
                        data-testid="cv-management-tab-analyze"
                    >
                        Analyze & Edit
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="manage" className="mt-4 space-y-6" data-testid="cv-management-content-manage">
                    <Card data-testid="cv-management-card-upload">
                        <CardHeader data-testid="cv-management-upload-header">
                            <CardTitle data-testid="cv-management-upload-title">Upload New CV</CardTitle>
                            <CardDescription data-testid="cv-management-upload-description">Upload a new CV document (PDF, DOCX, TXT). Analysis will start automatically.</CardDescription>
                        </CardHeader>
                        <CardContent data-testid="cv-management-upload-content">
                            <UploadForm onUploadComplete={handleUploadComplete} />
                        </CardContent>
                    </Card>
                    <Card data-testid="cv-management-card-cv-list">
                        <CardHeader data-testid="cv-management-cv-list-header">
                            <CardTitle data-testid="cv-management-cv-list-title">My CVs</CardTitle>
                            <CardDescription data-testid="cv-management-cv-list-description">Manage your uploaded CVs. Click 'Improve' to view analysis.</CardDescription>
                        </CardHeader>
                        <CardContent data-testid="cv-management-cv-list-content">
                            <CVList refreshKey={refreshKey} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="analyze" className="mt-4 space-y-6" data-testid="cv-management-content-analyze">
                    {/* --- Conditional Rendering Logic --- */}
                    {(() => { // Use IIFE for clearer conditional logic
                        const analysisIdFromUrl = searchParams.get('analysisId');
                        const shouldShowAnalysis = !!analysisIdFromUrl; // Base decision on URL for initial render
                        const isLoading = analysisStatus === 'loading';

                        // Condition 1: Loading state (regardless of ID presence)
                        if (isLoading) {
                            return (
                                <Card data-testid="cv-management-analysis-loading">
                                    <CardHeader><CardTitle data-testid="cv-management-analysis-loading-title">Analysis Result</CardTitle><CardDescription data-testid="cv-management-analysis-loading-description">Loading analysis...</CardDescription></CardHeader>
                                    <CardContent><div className="flex justify-center items-center h-40" data-testid="cv-management-analysis-loading-spinner">Loading...</div></CardContent>
                                </Card>
                            );
                        }

                        // Condition 2: Analysis ID exists in URL (and not loading)
                        if (shouldShowAnalysis) {
                            // Verify data exists in store before rendering display
                            // IMPORTANT: The URL might contain either the CV ID or the analysis ID
                            // We don't do strict ID matching because:
                            // 1. CVList might pass cv.id instead of cv.analysisId
                            // 2. The API returns analysis.id which differs from the cv.id
                            // 3. After Redux persistence, IDs might not match but data exists
                            // Solution: Check for data existence rather than ID equality
                            if (analysisData && analysisIdFromStore) {
                                return <AnalysisResultDisplay originalMimeType={originalMimeType} />;
                            } else {
                                // Data isn't ready yet, even though ID is in URL (e.g., still fetching)
                                // Render a loading state consistent with the isLoading condition above
                                return (
                                    <Card data-testid="cv-management-analysis-fetching">
                                        <CardHeader><CardTitle data-testid="cv-management-analysis-fetching-title">Analysis Result</CardTitle><CardDescription data-testid="cv-management-analysis-fetching-description">Loading analysis...</CardDescription></CardHeader>
                                        <CardContent><div className="flex justify-center items-center h-40" data-testid="cv-management-analysis-fetching-spinner">Loading...</div></CardContent>
                                    </Card>
                                );
                            }
                        }

                        // Condition 3: No Analysis ID in URL and not loading
                        // Show the placeholder/prompt to select a CV
                        return (
                            <Card className="mt-4" data-testid="cv-management-analysis-empty">
                                <CardHeader data-testid="cv-management-analysis-empty-header"><CardTitle data-testid="cv-management-analysis-empty-title">Select a CV</CardTitle></CardHeader>
                                <CardContent data-testid="cv-management-analysis-empty-content">
                                    <p className="text-muted-foreground" data-testid="cv-management-analysis-empty-message">
                                        Please select a CV from the 'Manage CVs' tab by clicking the 'Improve' <Play className="inline h-4 w-4 mx-1" /> button to view its analysis and suggestions.
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })()}
                    {/* --- End Conditional Rendering Logic --- */}
                </TabsContent>
            </Tabs>

            {/* --- Temporary Redis Test Card --- */}
            <Card className="mt-6 animate-fade-in-up" style={{ animationDelay: '400ms' }} data-testid="cv-management-redis-test-card">
                <CardHeader data-testid="cv-management-redis-test-header">
                    <CardTitle data-testid="cv-management-redis-test-title">Redis Cache Test (Temporary)</CardTitle>
                    <CardDescription data-testid="cv-management-redis-test-description">
                        Use these buttons to test basic set and get operations with Redis.
                        Check server logs for detailed Redis client interactions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="cv-management-redis-test-content">
                    <div className="flex space-x-4" data-testid="cv-management-redis-test-buttons">
                        <Button onClick={handleTestRedisSet} data-testid="cv-management-button-redis-set">Test Redis Set</Button>
                        <Button onClick={handleTestRedisGet} variant="outline" data-testid="cv-management-button-redis-get">Test Redis Get</Button>
                    </div>
                    {redisTestMessage && (
                        <div className="mt-4 p-3 bg-muted rounded-md text-sm" data-testid="cv-management-redis-test-message">
                            <p className="font-semibold" data-testid="cv-management-redis-test-log-title">Test Log:</p>
                            <pre className="whitespace-pre-wrap break-all" data-testid="cv-management-redis-test-log-content">{redisTestMessage}</pre>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* --- End Temporary Redis Test Card --- */}

        </div>
    );
} 