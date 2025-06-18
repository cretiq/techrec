'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UploadForm } from '@/components/cv/UploadForm';
import { CVList } from '@/components/cv/CVList';
import { AnalysisResultDisplay } from '@/components/analysis/AnalysisResultDisplay';
import { ProfileScoringSidebar } from '@/components/cv/ProfileScoringSidebar';
import { GuidedProfileCreation } from '@/components/cv/GuidedProfileCreation';
import {  Card, CardContent, CardDescription, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import { toast } from "@/components/ui/use-toast";
import {  Button  } from '@/components/ui-daisy/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store';
import { fetchAnalysisById, clearAnalysis, selectCurrentAnalysisId, selectAnalysisStatus, selectCurrentAnalysisData } from '@/lib/features/analysisSlice';
import { cn } from '@/lib/utils';
import { RefreshCw, Download, BarChart3 } from 'lucide-react';

export default function CVManagementPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [originalMimeType, setOriginalMimeType] = useState<string>('application/pdf'); // Keep this for now
    const [showGuidedCreation, setShowGuidedCreation] = useState(false);

    // Get Redux dispatch
    const dispatch: AppDispatch = useDispatch();

    // --- URL State Handling --- 
    const router = useRouter();
    const searchParams = useSearchParams();


    // Select state from Redux
    const analysisIdFromStore = useSelector(selectCurrentAnalysisId);
    const analysisStatus = useSelector(selectAnalysisStatus);
    const analysisData = useSelector(selectCurrentAnalysisData);

    // --- Handler for Upload Completion ---
    const handleUploadComplete = useCallback((analysisId?: string) => {
        console.log('[CVManagementPage] handleUploadComplete called with analysisId:', analysisId);
        
        // Trigger a refresh of the CV list to reflect the new upload
        setRefreshKey(prev => prev + 1);
        
        // Load the new analysis and update URL
        if (analysisId) {
            console.log('[CVManagementPage] Loading analysis:', analysisId);
            dispatch(fetchAnalysisById(analysisId));
            
            // Update the URL to include the analysis ID
            const params = new URLSearchParams(searchParams.toString());
            params.set('analysisId', analysisId);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            router.replace(newUrl);
        }
    }, [dispatch, searchParams, router]);

    // URL Effect: Handle loading analysis from URL params on mount or URL change
    useEffect(() => {
        const analysisIdFromUrl = searchParams.get('analysisId');
        
        console.log('[CVManagementPage] URL Effect triggered with analysisId:', analysisIdFromUrl);
        
        if (analysisIdFromUrl) {
            // Only fetch if we don't already have this analysis loaded in Redux
            if (analysisIdFromStore !== analysisIdFromUrl) {
                console.log('[CVManagementPage] Fetching analysis from URL:', analysisIdFromUrl);
                dispatch(fetchAnalysisById(analysisIdFromUrl));
            } else {
                console.log('[CVManagementPage] Analysis already loaded in Redux, skipping fetch');
            }
        }
    }, [searchParams, dispatch, analysisIdFromStore]);

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

    const handleGuidedCreationComplete = async (profileData: any) => {
        console.log('[CVManagementPage] Guided creation complete:', profileData);
        
        // TODO: Save profile data and create initial CV
        toast({
            title: "Profile Created!",
            description: "Your profile has been created. You can now enhance it further.",
        });
        
        setShowGuidedCreation(false);
        
        // Optionally redirect to show the created profile
        // This would require creating an initial CV/analysis from the profile data
    };

    return (
        <div className="container mx-auto p-4 space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }} data-testid="cv-management-page-container">
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }} data-testid="cv-management-page-header">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2" data-testid="cv-management-title">My Profile & CV</h1>
                <p className="text-base-content/70 mb-6" data-testid="cv-management-description">Build your professional profile - upload your CV or start from scratch</p>
            </div>
            {/* Entry Section - Upload CV or Start from Scratch */}
            <Card 
                variant="transparent" 
                className="animate-fade-in-up" 
                style={{ animationDelay: '300ms' }}
                data-testid="cv-management-entry-section"
            >
                <CardContent className="p-8">
                    <div className="max-w-2xl mx-auto text-center space-y-8">
                        <div data-testid="cv-management-entry-options">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Upload CV Option */}
                                <div className="space-y-4" data-testid="cv-management-upload-option">
                                    <div className="p-6 border-2 border-dashed border-primary/20 rounded-lg hover:border-primary/40 transition-colors">
                                        <UploadForm onUploadComplete={handleUploadComplete} />
                                    </div>
                                    <p className="text-sm text-base-content/60">
                                        Already have a CV? Import & enhance
                                    </p>
                                </div>

                                {/* Start from Scratch Option */}
                                <div className="space-y-4" data-testid="cv-management-scratch-option">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full h-32 flex flex-col gap-2 border-2 border-dashed border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5 transition-all"
                                        onClick={() => setShowGuidedCreation(true)}
                                        data-testid="cv-management-start-scratch-button"
                                    >
                                        <div className="text-2xl">✨</div>
                                        <div className="font-semibold">Start from Scratch</div>
                                        <div className="text-xs text-muted-foreground">Build with guided assistance</div>
                                    </Button>
                                    <p className="text-sm text-base-content/60">
                                        New to this? We'll guide you
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CV Management Section */}
            <Card 
                variant="transparent" 
                className="animate-fade-in-up" 
                style={{ animationDelay: '400ms' }}
                data-testid="cv-management-list-section"
            >
                <CardHeader data-testid="cv-management-list-header">
                    <CardTitle data-testid="cv-management-list-title">My CVs</CardTitle>
                    <CardDescription data-testid="cv-management-list-description">
                        Manage your uploaded CVs. Click 'Improve' to edit your profile.
                    </CardDescription>
                </CardHeader>
                <CardContent data-testid="cv-management-list-content">
                    <CVList refreshKey={refreshKey} />
                </CardContent>
            </Card>

            {/* Profile/Analysis Section */}
            {(() => {
                const analysisIdFromUrl = searchParams.get('analysisId');
                const shouldShowAnalysis = !!analysisIdFromUrl;
                const isLoading = analysisStatus === 'loading';

                if (isLoading) {
                    return (
                        <Card 
                            variant="transparent" 
                            className="animate-fade-in-up" 
                            style={{ animationDelay: '500ms' }}
                            data-testid="cv-management-profile-loading"
                        >
                            <CardHeader data-testid="cv-management-profile-loading-header">
                                <CardTitle data-testid="cv-management-profile-loading-title">Your Professional Profile</CardTitle>
                                <CardDescription data-testid="cv-management-profile-loading-description">Analyzing your CV...</CardDescription>
                            </CardHeader>
                            <CardContent data-testid="cv-management-profile-loading-content">
                                <div className="flex justify-center items-center h-40" data-testid="cv-management-profile-loading-spinner">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }

                if (shouldShowAnalysis && analysisData && analysisIdFromStore) {
                    return (
                        <div 
                            className="animate-fade-in-up space-y-6" 
                            style={{ animationDelay: '500ms' }}
                            data-testid="cv-management-profile-section"
                        >
                            {/* Quick Actions Bar */}
                            <Card 
                                variant="transparent"
                                className="sticky top-4 z-10 shadow-lg"
                                data-testid="cv-management-quick-actions"
                            >
                                <CardContent className="py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const params = new URLSearchParams(searchParams.toString());
                                                    params.delete('analysisId');
                                                    router.replace(`${window.location.pathname}?${params.toString()}`);
                                                }}
                                                data-testid="cv-management-action-reupload"
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Re-upload CV
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // TODO: Implement PDF export
                                                    toast({
                                                        title: "Export PDF",
                                                        description: "PDF export coming soon!",
                                                    });
                                                }}
                                                data-testid="cv-management-action-export"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Export PDF
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    // TODO: Implement view analysis
                                                    toast({
                                                        title: "View Analysis",
                                                        description: "Detailed analysis view coming soon!",
                                                    });
                                                }}
                                                data-testid="cv-management-action-analysis"
                                            >
                                                <BarChart3 className="h-4 w-4 mr-2" />
                                                View Analysis
                                            </Button>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Last updated: {new Date().toLocaleDateString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex gap-6">
                                {/* Smart Scoring Sidebar */}
                                <aside className="w-80 hidden lg:block" data-testid="cv-management-scoring-sidebar">
                                    <Card 
                                        variant="transparent"
                                        className="sticky top-20"
                                        data-testid="cv-management-scoring-card"
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-lg">Profile Score</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <ProfileScoringSidebar analysisData={analysisData} />
                                        </CardContent>
                                    </Card>
                                </aside>

                                {/* Main Profile Content */}
                                <div className="flex-1">
                                    <AnalysisResultDisplay originalMimeType={originalMimeType} />
                                </div>
                            </div>
                        </div>
                    );
                }

                return null;
            })()}

            {/* Guided Profile Creation Modal */}
            {showGuidedCreation && (
                <GuidedProfileCreation
                    onComplete={handleGuidedCreationComplete}
                    onCancel={() => setShowGuidedCreation(false)}
                />
            )}

        </div>
    );
} 