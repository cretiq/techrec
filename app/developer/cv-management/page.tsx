'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UploadForm } from '@/components/cv/UploadForm';
import { AnalysisResultDisplay } from '@/components/analysis/AnalysisResultDisplay';
import { AnalysisActionButtons } from '@/components/analysis/AnalysisActionButtons';
import { ProfileScoringSidebar } from '@/components/cv/ProfileScoringSidebar';
import {  Card, CardContent, CardDescription, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import { toast } from "@/components/ui/use-toast";
import {  Button  } from '@/components/ui-daisy/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store';
import { setAnalysis, clearAnalysis, selectCurrentAnalysisId, selectAnalysisStatus, selectCurrentAnalysisData } from '@/lib/features/analysisSlice';
import { cn } from '@/lib/utils';
import { RefreshCw, Download, BarChart3, Rocket } from 'lucide-react';
import { ProjectEnhancementModal } from '@/components/analysis/ProjectEnhancementModal';
import { ReUploadButton } from '@/components/cv/ReUploadButton';
import { useSession } from 'next-auth/react';

export default function CVManagementPage() {
    // ALL HOOKS MUST BE AT THE TOP - React Rules of Hooks
    const [originalMimeType, setOriginalMimeType] = useState<string>('application/pdf'); // Keep this for now
    const [showProjectEnhancementModal, setShowProjectEnhancementModal] = useState(false);

    // Authentication hooks
    const { data: session, status } = useSession();
    const router = useRouter();
    
    // Redux hooks
    const dispatch: AppDispatch = useDispatch();
    const searchParams = useSearchParams();
    const analysisIdFromStore = useSelector(selectCurrentAnalysisId);
    const analysisStatus = useSelector(selectAnalysisStatus);
    const analysisData = useSelector(selectCurrentAnalysisData);

    // Ref hooks
    const hasInitialLoaded = useRef(false);

    // Callback hooks
    const fetchLatestUserAnalysis = useCallback(async () => {
        try {
            const response = await fetch('/api/cv-analysis/latest');
            
            if (response.ok) {
                const latestAnalysis = await response.json();
                console.log('[CVManagementPage] Found latest analysis:', latestAnalysis.id);
                
                // ARCHITECTURAL CHANGE: Load the analysis data directly from the response
                // No need to make another API call since /api/cv-analysis/latest returns complete data
                dispatch(setAnalysis({ id: latestAnalysis.id, data: latestAnalysis }));
                
                // NO URL PARAMETERS: Single CV approach doesn't need URL state
                // The user always sees their latest/current CV
                console.log('[CVManagementPage] Analysis loaded directly, no URL parameters needed');
            } else if (response.status === 404) {
                console.log('[CVManagementPage] No latest analysis found - user needs to upload CV');
                // Keep showing upload/start from scratch options
            } else {
                console.error('[CVManagementPage] Error fetching latest analysis:', response.status);
            }
        } catch (error) {
            console.error('[CVManagementPage] Failed to fetch latest analysis:', error);
        }
    }, [dispatch]);

    // --- Handler for Upload Completion ---
    const handleUploadComplete = useCallback((signal?: string) => {
        console.log('[CVManagementPage] ✅ handleUploadComplete called with signal:', signal);
        console.log('[CVManagementPage] ✅ Callback triggered - starting immediate fetch');
        
        // Always fetch the latest analysis when upload completes
        // This ensures we get the user's single "current" CV analysis
        console.log('[CVManagementPage] 🔄 Upload complete, fetching latest analysis NOW');
        
        // Add a small delay to ensure upload processing is complete on server
        setTimeout(() => {
            console.log('[CVManagementPage] 🔄 Delayed fetch starting...');
            fetchLatestUserAnalysis();
        }, 1000); // 1 second delay
    }, [fetchLatestUserAnalysis]);

    // Effect hooks - ALL MUST BE TOGETHER
    // Authentication effect
    useEffect(() => {
        if (status === 'loading') return; // Still loading
        
        if (status === 'unauthenticated') {
            console.log('[CVManagementPage] Unauthenticated user detected, redirecting to signin');
            router.push('/auth/signin');
            return;
        }
    }, [status, router]);

    // SIMPLIFIED: Always use latest analysis approach (no URL parameters)
    useEffect(() => {
        // Skip if already loading
        if (analysisStatus === 'loading') {
            return;
        }

        // If no analysis loaded and not already attempted, fetch user's latest analysis
        if (!hasInitialLoaded.current && !analysisIdFromStore && analysisStatus === 'idle') {
            console.log('[CVManagementPage] Loading user\'s latest analysis (single CV approach)');
            fetchLatestUserAnalysis();
            hasInitialLoaded.current = true;
        }
    }, [analysisIdFromStore, analysisStatus, fetchLatestUserAnalysis]);

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
            analysisStatus,
            analysisIdFromStore,
            hasAnalysisData: !!analysisData,
        });
    }, [analysisStatus, analysisIdFromStore, analysisData]);



    // Calculate total years of experience from CV data
    const calculateTotalExperience = (analysisData: any): number => {
        if (!analysisData?.experience || !Array.isArray(analysisData.experience)) {
            return 0;
        }

        let totalMonths = 0;
        const now = new Date();

        analysisData.experience.forEach((exp: any) => {
            if (exp.startDate) {
                const startDate = new Date(exp.startDate);
                const endDate = exp.endDate ? new Date(exp.endDate) : now;
                
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                     (endDate.getMonth() - startDate.getMonth());
                    totalMonths += Math.max(0, monthsDiff);
                }
            }
        });

        return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal place
    };

    // Authentication guards - AFTER all hooks are defined
    if (status === 'loading') {
        return (
            <div className="container mx-auto p-4 space-y-8 animate-fade-in-up" data-testid="cv-management-page-loading">
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    // Don't render anything if not authenticated (redirect in progress)
    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="container mx-auto p-4 space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }} data-testid="cv-management-page-container">
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }} data-testid="cv-management-page-header">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2" data-testid="cv-management-title">My Profile & CV</h1>
                <p className="text-base-content/70 mb-6" data-testid="cv-management-description">Build your professional profile - upload your CV or start from scratch</p>
            </div>
            {/* Entry Section - Upload CV or Start from Scratch - Only show when no analysis data */}
            {!analysisData && (
                <Card 
                    variant="transparent" 
                    className="animate-fade-in-up" 
                    style={{ animationDelay: '300ms' }}
                    data-testid="cv-management-entry-section"
                >
                <CardContent className="p-8">
                    <div className="max-w-md mx-auto text-center space-y-8">
                        <div data-testid="cv-management-entry-options">
                            {/* Upload CV Option - Simplified single option */}
                            <div className="space-y-4" data-testid="cv-management-upload-option">
                                <UploadForm onUploadComplete={handleUploadComplete} />
                            </div>
                        </div>
                    </div>
                </CardContent>
                </Card>
            )}

            {/* Profile/Analysis Section */}
            {(() => {
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
                                <CardDescription data-testid="cv-management-profile-loading-description">Loading your CV...</CardDescription>
                            </CardHeader>
                            <CardContent data-testid="cv-management-profile-loading-content">
                                <div className="flex justify-center items-center h-40" data-testid="cv-management-profile-loading-spinner">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }

                // Show analysis if we have data (either from URL param or auto-loaded)
                if (analysisData && analysisIdFromStore) {
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
                                            <ReUploadButton
                                                analysisData={analysisData}
                                                onUploadComplete={handleUploadComplete}
                                            />
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
                                                leftIcon={<Download className="h-4 w-4" />}
                                                data-testid="cv-management-action-export"
                                            >
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
                                                leftIcon={<BarChart3 className="h-4 w-4" />}
                                                data-testid="cv-management-action-analysis"
                                            >
                                                View Analysis
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowProjectEnhancementModal(true)}
                                                leftIcon={<Rocket className="h-4 w-4" />}
                                                data-testid="cv-management-action-project-enhancement"
                                            >
                                                Enhance Projects
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-muted-foreground">
                                                Last updated: {new Date().toLocaleDateString()}
                                            </div>
                                            {/* Additional action buttons moved from AnalysisResultDisplay */}
                                            <div className="flex gap-2" data-testid="cv-management-additional-actions">
                                                <AnalysisActionButtons />
                                            </div>
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


            {/* Project Enhancement Modal */}
            {showProjectEnhancementModal && (
                <ProjectEnhancementModal
                    isOpen={showProjectEnhancementModal}
                    onClose={() => setShowProjectEnhancementModal(false)}
                    totalYearsExperience={analysisData ? calculateTotalExperience(analysisData) : 0}
                />
            )}

        </div>
    );
} 