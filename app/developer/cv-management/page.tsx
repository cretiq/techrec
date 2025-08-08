'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UploadForm } from '@/components/cv/UploadForm';
import { AnalysisResultDisplay } from '@/components/analysis/AnalysisResultDisplay';
import { AnalysisActionButtons } from '@/components/analysis/AnalysisActionButtons';
import { ProfileScoringSidebar } from '@/components/cv/ProfileScoringSidebar';
import {  Card, CardContent, CardDescription, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import { toast } from "@/components/ui-daisy/use-toast";
import {  Button  } from '@/components/ui-daisy/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store';
import { setAnalysis, clearAnalysis, selectCurrentAnalysisId, selectAnalysisStatus, selectCurrentAnalysisData } from '@/lib/features/analysisSlice';
import { cn } from '@/lib/utils';
import { RefreshCw, Download, BarChart3, Rocket, Loader2, Sparkles } from 'lucide-react';
import { ProjectEnhancementModal } from '@/components/analysis/ProjectEnhancementModal';
import { ReUploadButton } from '@/components/cv/ReUploadButton';
import { useSession } from 'next-auth/react';
import { AnalysisStatus } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function CVManagementPage() {
    // ALL HOOKS MUST BE AT THE TOP - React Rules of Hooks
    const [originalMimeType, setOriginalMimeType] = useState<string>('application/pdf'); // Keep this for now
    const [showProjectEnhancementModal, setShowProjectEnhancementModal] = useState(false);
    const [userCVs, setUserCVs] = useState<CV[]>([]);
    const [cvFetchStatus, setCvFetchStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
    const [currentCV, setCurrentCV] = useState<CV | null>(null);
    
    // Animation state for the quick actions card
    const [isAnimating, setIsAnimating] = useState(false);
    const [processingText, setProcessingText] = useState('');
    const [showSparkles, setShowSparkles] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

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
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Callback hooks
    const fetchLatestUserAnalysis = useCallback(async () => {
        console.log('[CVManagementPage] 🚀 STARTING fetchLatestUserAnalysis');
        console.log('[CVManagementPage] 📞 Making request to /api/cv-analysis/latest');
        
        try {
            const startTime = Date.now();
            const response = await fetch('/api/cv-analysis/latest');
            const duration = Date.now() - startTime;
            
            console.log('[CVManagementPage] 📡 API RESPONSE RECEIVED:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                duration: `${duration}ms`,
                headers: {
                    contentType: response.headers.get('content-type'),
                    contentLength: response.headers.get('content-length'),
                },
                timestamp: new Date().toISOString(),
            });
            
            if (response.ok) {
                const latestAnalysis = await response.json();
                
                console.log('[CVManagementPage] ✅ SUCCESSFUL RESPONSE PARSED:', {
                    analysisId: latestAnalysis.id,
                    hasAnalysisResult: !!latestAnalysis.analysisResult,
                    responseKeys: Object.keys(latestAnalysis),
                    analysisResultKeys: latestAnalysis.analysisResult ? Object.keys(latestAnalysis.analysisResult) : [],
                    dataStructure: {
                        contactInfo: !!latestAnalysis.analysisResult?.contactInfo,
                        about: !!latestAnalysis.analysisResult?.about,
                        skills: latestAnalysis.analysisResult?.skills?.length || 0,
                        experience: latestAnalysis.analysisResult?.experience?.length || 0,
                        education: latestAnalysis.analysisResult?.education?.length || 0,
                        cv: !!latestAnalysis.cv,
                        extractedText: !!latestAnalysis.cv?.extractedText,
                    },
                    sampleData: {
                        contactName: latestAnalysis.analysisResult?.contactInfo?.name,
                        contactEmail: latestAnalysis.analysisResult?.contactInfo?.email,
                        aboutPreview: latestAnalysis.analysisResult?.about?.substring(0, 50) + '...',
                        firstSkill: latestAnalysis.analysisResult?.skills?.[0]?.name,
                        firstExperience: latestAnalysis.analysisResult?.experience?.[0]?.title,
                    }
                });
                
                console.log('[CVManagementPage] 🔄 DISPATCHING TO REDUX:', {
                    action: 'setAnalysis',
                    id: latestAnalysis.id,
                    hasData: !!latestAnalysis,
                    hasAnalysisResult: !!latestAnalysis.analysisResult,
                    dispatchTime: new Date().toISOString(),
                });
                
                console.log('[CVManagementPage] 🔧 CRITICAL FIX: Passing analysisResult directly to Redux instead of full response');
                console.log('[CVManagementPage] 📊 Data structure being passed:', {
                    originalDataKeys: Object.keys(latestAnalysis),
                    analysisResultKeys: latestAnalysis.analysisResult ? Object.keys(latestAnalysis.analysisResult) : [],
                    passingAnalysisResultInstead: true,
                });
                
                // CRITICAL FIX: Pass analysisResult directly, not the full API response
                // Component expects analysis data at root level, not nested under analysisResult
                dispatch(setAnalysis({ id: latestAnalysis.id, data: latestAnalysis.analysisResult }));
                
                console.log('[CVManagementPage] ✅ REDUX DISPATCH COMPLETED');
                console.log('[CVManagementPage] 📋 Analysis loaded directly, no URL parameters needed');
                
            } else if (response.status === 404) {
                console.log('[CVManagementPage] 📭 404 NOT FOUND: No latest analysis found');
                console.log('[CVManagementPage] 💡 User needs to upload CV first');
                // Keep showing upload/start from scratch options
                
            } else {
                const errorText = await response.text().catch(() => 'Unable to read error text');
                console.error('[CVManagementPage] ❌ API ERROR RESPONSE:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText,
                    duration: `${duration}ms`,
                });
            }
            
        } catch (error) {
            console.error('[CVManagementPage] 💥 FETCH EXCEPTION:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString(),
            });
        }
        
        console.log('[CVManagementPage] 🏁 fetchLatestUserAnalysis COMPLETED');
    }, [dispatch]);

    // Function to poll for CV status updates
    const startPollingForCVStatus = useCallback((cvId: string) => {
        console.log('[CVManagementPage] Starting to poll for CV status:', cvId);
        
        // Clear any existing polling
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
        
        // Poll every 3 seconds
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch('/api/cv');
                if (response.ok) {
                    const cvs: CV[] = await response.json();
                    const updatedCV = cvs.find(cv => cv.id === cvId);
                    
                    if (updatedCV) {
                        console.log('[CVManagementPage] Polling - CV status:', updatedCV.status);
                        setCurrentCV(updatedCV);
                        
                        // Stop polling if status is no longer ANALYZING
                        if (updatedCV.status !== AnalysisStatus.ANALYZING) {
                            console.log('[CVManagementPage] CV analysis completed, stopping polling');
                            if (pollingIntervalRef.current) {
                                clearInterval(pollingIntervalRef.current);
                                pollingIntervalRef.current = null;
                            }
                            
                            // If COMPLETED, fetch the analysis data
                            if (updatedCV.status === AnalysisStatus.COMPLETED) {
                                fetchLatestUserAnalysis();
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('[CVManagementPage] Error polling CV status:', error);
            }
        }, 3000);
    }, [fetchLatestUserAnalysis]);

    // Function to fetch user's CVs
    const fetchUserCVs = useCallback(async () => {
        setCvFetchStatus('loading');
        try {
            const response = await fetch('/api/cv');
            if (response.ok) {
                const cvs: CV[] = await response.json();
                console.log('[CVManagementPage] Fetched CVs:', cvs.length);
                setUserCVs(cvs);
                
                // Find the most recent CV with COMPLETED or ANALYZING status
                const latestCV = cvs
                    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                    .find(cv => cv.status === AnalysisStatus.COMPLETED || cv.status === AnalysisStatus.ANALYZING);
                
                if (latestCV) {
                    console.log('[CVManagementPage] Found latest CV:', latestCV.id, 'Status:', latestCV.status);
                    setCurrentCV(latestCV);
                    
                    // If CV is ANALYZING, start polling for updates
                    if (latestCV.status === AnalysisStatus.ANALYZING) {
                        startPollingForCVStatus(latestCV.id);
                    }
                    // If CV is COMPLETED, fetch the analysis data for display
                    else if (latestCV.status === AnalysisStatus.COMPLETED) {
                        console.log('[CVManagementPage] CV is COMPLETED, fetching analysis data...');
                        fetchLatestUserAnalysis();
                    }
                } else {
                    console.log('[CVManagementPage] No CV with COMPLETED or ANALYZING status found');
                    setCurrentCV(null);
                }
                
                setCvFetchStatus('succeeded');
            } else {
                console.error('[CVManagementPage] Error fetching CVs:', response.status);
                setCvFetchStatus('failed');
            }
        } catch (error) {
            console.error('[CVManagementPage] Failed to fetch CVs:', error);
            setCvFetchStatus('failed');
        }
    }, [startPollingForCVStatus]);

    // --- Handler for Upload Completion ---
    const handleUploadComplete = useCallback((signal?: string) => {
        console.log('[CVManagementPage] ✅ handleUploadComplete called with signal:', signal);
        console.log('[CVManagementPage] ✅ Callback triggered - starting immediate fetch');
        
        // Fetch CVs and check for ANALYZING status when upload completes
        console.log('[CVManagementPage] 🔄 Upload complete, fetching user CVs NOW');
        
        // Add a small delay to ensure upload processing is complete on server
        setTimeout(() => {
            console.log('[CVManagementPage] 🔄 Delayed fetch starting...');
            fetchUserCVs();
        }, 1000); // 1 second delay
    }, [fetchUserCVs]);

    // --- Handler for Animation State Change ---
    const handleAnimationStateChange = useCallback((animating: boolean, text: string, sparkles: boolean) => {
        setIsAnimating(animating);
        setProcessingText(text);
        setShowSparkles(sparkles);
    }, []);

    // Text colors for each phrase - Blue/Teal shades only
    const textColors = [
        'text-blue-400',      // Uploading...
        'text-teal-500',      // Churning... 
        'text-blue-600',      // Analyzing...
        'text-cyan-500',      // Building...
        'text-blue-500',      // Cooking...
        'text-teal-600',      // Processing...
        'text-cyan-400',      // Optimizing...
        'text-blue-700',      // Enhancing...
        'text-teal-400',      // Polishing...
        'text-cyan-600'       // Finalizing...
    ];


    // Enhanced sparkle particles animations
    const SparkleParticle = ({ delay = 0, variant = 'default' }: { delay?: number, variant?: 'default' | 'large' | 'star' | 'shooting' }) => {
        const variants = {
            default: {
                className: "absolute w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full",
                scale: [0, 1.5, 0],
                duration: 1.2
            },
            large: {
                className: "absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full",
                scale: [0, 2, 0],
                duration: 1.8
            },
            star: {
                className: "absolute w-1 h-1 bg-gradient-to-r from-pink-400 to-red-500",
                scale: [0, 2, 0],
                duration: 1.5
            },
            shooting: {
                className: "absolute w-0.5 h-3 bg-gradient-to-b from-cyan-400 to-transparent rounded-full",
                scale: [0, 1, 0],
                duration: 0.8
            }
        };

        const config = variants[variant];
        
        return (
            <motion.div
                className={config.className}
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                }}
                initial={{ 
                    opacity: 0,
                    scale: 0,
                    rotate: variant === 'star' ? 0 : undefined
                }}
                animate={{
                    opacity: [0, 1, 1, 0],
                    scale: config.scale,
                    x: variant === 'shooting' ? [0, Math.random() * 100 - 50] : [0, Math.random() * 40 - 20],
                    y: variant === 'shooting' ? [0, Math.random() * 100 + 50] : [0, Math.random() * 40 - 20],
                    rotate: variant === 'star' ? [0, 180, 360] : [0, 360]
                }}
                transition={{
                    duration: config.duration,
                    delay,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3 + 1,
                    ease: variant === 'shooting' ? "easeOut" : "easeInOut"
                }}
            />
        );
    };

    // Floating text sparkles that appear around the text
    const TextSparkle = ({ delay = 0 }: { delay?: number }) => (
        <motion.div
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
            style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
            }}
            initial={{ 
                opacity: 0,
                scale: 0,
            }}
            animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                y: [0, -20, -40],
                rotate: [0, 180]
            }}
            transition={{
                duration: 2,
                delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 4 + 2,
                ease: "easeOut"
            }}
        />
    );

    // Corner burst effects
    const CornerBurst = ({ corner, delay = 0 }: { corner: 'tl' | 'tr' | 'bl' | 'br', delay?: number }) => {
        const positions = {
            tl: { top: '10%', left: '10%' },
            tr: { top: '10%', right: '10%' },
            bl: { bottom: '10%', left: '10%' },
            br: { bottom: '10%', right: '10%' }
        };

        return (
            <motion.div
                className="absolute"
                style={positions[corner]}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                    duration: 0.5,
                    delay,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 5 + 3
                }}
            >
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-0.5 h-0.5 bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full"
                        initial={{ 
                            scale: 0,
                            x: 0,
                            y: 0
                        }}
                        animate={{
                            scale: [0, 1.5, 0],
                            x: [0, (Math.cos(i * 60 * Math.PI / 180) * 25)],
                            y: [0, (Math.sin(i * 60 * Math.PI / 180) * 25)]
                        }}
                        transition={{
                            duration: 0.8,
                            delay: delay + (i * 0.05),
                            repeat: Infinity,
                            repeatDelay: Math.random() * 5 + 3
                        }}
                    />
                ))}
            </motion.div>
        );
    };

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

    // CV Loading Effect: Fetch user's CVs on mount
    useEffect(() => {
        // Skip if already loading or attempted
        if (cvFetchStatus === 'loading' || hasInitialLoaded.current) {
            return;
        }

        // Only fetch if authenticated
        if (status === 'authenticated') {
            console.log('[CVManagementPage] Loading user\'s CVs (new CV status approach)');
            fetchUserCVs();
            hasInitialLoaded.current = true;
        }
    }, [status, cvFetchStatus, fetchUserCVs]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, []);

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
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in-up" style={{ animationDelay: '100ms' }} data-testid="cv-management-page-container">
            {/* Entry Section - Upload CV or Start from Scratch - Show when no completed CV */}
            {(!currentCV || currentCV.status === AnalysisStatus.FAILED || currentCV.status === AnalysisStatus.PENDING) && (
                <Card 
                    variant="glass-interactive" 
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

            {/* CV Status-based sections */}
            {(() => {
                const isCVLoading = cvFetchStatus === 'loading';

                // Show loading while fetching CV data
                if (isCVLoading) {
                    return (
                        <Card 
                            variant="glass-interactive" 
                            className="animate-fade-in-up" 
                            style={{ animationDelay: '500ms' }}
                            data-testid="cv-management-cv-loading"
                        >
                            <CardHeader data-testid="cv-management-cv-loading-header">
                                <CardTitle data-testid="cv-management-cv-loading-title">Loading CV Status</CardTitle>
                                <CardDescription data-testid="cv-management-cv-loading-description">Checking your uploaded CVs...</CardDescription>
                            </CardHeader>
                            <CardContent data-testid="cv-management-cv-loading-content">
                                <div className="flex justify-center items-center h-40" data-testid="cv-management-cv-loading-spinner">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }

                // Show analyzing status
                if (currentCV && currentCV.status === AnalysisStatus.ANALYZING) {
                    return (
                        <Card 
                            variant="glass-interactive" 
                            className="animate-fade-in-up" 
                            style={{ animationDelay: '500ms' }}
                            data-testid="cv-management-analyzing"
                        >
                            <CardHeader data-testid="cv-management-analyzing-header">
                                <CardTitle className="flex items-center gap-2" data-testid="cv-management-analyzing-title">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Analyzing Your CV
                                </CardTitle>
                                <CardDescription data-testid="cv-management-analyzing-description">
                                    AI is analyzing "{currentCV.originalName}" to extract your profile information...
                                </CardDescription>
                            </CardHeader>
                            <CardContent data-testid="cv-management-analyzing-content">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-base text-neutral-600 leading-6">
                                        <div className="animate-pulse h-2 w-2 bg-primary rounded-full"></div>
                                        <span>Extracting contact information and skills</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-base text-neutral-600 leading-6">
                                        <div className="animate-pulse h-2 w-2 bg-primary rounded-full" style={{ animationDelay: '0.5s' }}></div>
                                        <span>Processing work experience and achievements</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-base text-neutral-600 leading-6">
                                        <div className="animate-pulse h-2 w-2 bg-primary rounded-full" style={{ animationDelay: '1s' }}></div>
                                        <span>Analyzing education and certifications</span>
                                    </div>
                                    <div className="mt-6 p-4 bg-info/10 rounded-lg">
                                        <p className="text-base text-info-content leading-6">
                                            This usually takes 30-60 seconds. We'll automatically update when complete.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }

                // Show analysis results if CV is completed
                if (currentCV && currentCV.status === AnalysisStatus.COMPLETED && analysisData && analysisIdFromStore) {
                    return (
                        <div 
                            className="animate-fade-in-up space-y-6" 
                            style={{ animationDelay: '500ms' }}
                            data-testid="cv-management-profile-section"
                        >
                            {/* Quick Actions Bar - With Spectacular Animations */}
                            <Card 
                                variant="gradient"
                                className="rounded-xl"
                                data-testid="cv-management-quick-actions"
                            >
                                <motion.div
                                    className="relative overflow-visible"
                                    animate={{
                                        scale: isAnimating ? [1, 1.02, 1] : 1,
                                        rotate: isAnimating ? [0, 0.3, -0.3, 0] : 0
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: isAnimating ? Infinity : 0,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {/* Base gray gradient background */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-base-200/80 via-base-300/90 to-base-400/80" />
                                    


                                    {/* Epic glowing effect rings for active states */}
                                    {isAnimating && (
                                        <>
                                            <motion.div 
                                                className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-xl blur-lg -z-10"
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                    opacity: [0.2, 0.4, 0.2]
                                                }}
                                                transition={{
                                                    duration: 4,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                            <motion.div 
                                                className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-xl blur-sm -z-10"
                                                animate={{
                                                    scale: [1, 1.05, 1],
                                                    opacity: [0.3, 0.6, 0.3]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        </>
                                    )}

                                    <CardContent className={`relative ${isAnimating ? 'py-0' : 'py-3'}`}>
                                        <AnimatePresence mode="wait">
                                            {isAnimating ? (
                                                /* Animated processing state */
                                                <motion.div
                                                    key="processing"
                                                    className="flex items-center justify-center"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {/* Jackpot-style animated text - Slot machine wheel effect */}
                                                    <div className="relative h-12 overflow-hidden flex items-center justify-center min-w-[160px]">
                                                        <AnimatePresence mode="wait">
                                                            <motion.span
                                                                key={processingText}
                                                                initial={{ y: 32, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                exit={{ y: -32, opacity: 0 }}
                                                                transition={{ 
                                                                    duration: 0.5,
                                                                    ease: "easeInOut"
                                                                }}
                                                                className={`absolute inset-x-0 text-center text-lg font-bold ${textColors[currentTextIndex]}`}
                                                            >
                                                                {processingText}
                                                            </motion.span>
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                /* Normal button state */
                                                <motion.div
                                                    key="buttons"
                                                    className="flex items-center justify-between"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <ReUploadButton
                                                            analysisData={analysisData}
                                                            onUploadComplete={handleUploadComplete}
                                                            onAnimationStateChange={handleAnimationStateChange}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {/* Additional action buttons moved from AnalysisResultDisplay */}
                                                        <div className="flex gap-2" data-testid="cv-management-additional-actions">
                                                            <AnalysisActionButtons />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </motion.div>
                            </Card>

                            <div className="flex gap-6">
                                {/* Smart Scoring Sidebar */}
                                <aside className="w-80 hidden lg:block" data-testid="cv-management-scoring-sidebar">
                                    <Card 
                                        variant="elevated-interactive"
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

                // Show error state for failed analysis
                if (currentCV && currentCV.status === AnalysisStatus.FAILED) {
                    return (
                        <Card 
                            variant="glass-interactive" 
                            className="animate-fade-in-up" 
                            style={{ animationDelay: '500ms' }}
                            data-testid="cv-management-failed"
                        >
                            <CardHeader data-testid="cv-management-failed-header">
                                <CardTitle className="text-error" data-testid="cv-management-failed-title">
                                    Analysis Failed
                                </CardTitle>
                                <CardDescription data-testid="cv-management-failed-description">
                                    We couldn't analyze "{currentCV.originalName}". Please try uploading again or contact support.
                                </CardDescription>
                            </CardHeader>
                            <CardContent data-testid="cv-management-failed-content">
                                <div className="space-y-4">
                                    <div className="p-4 bg-error/10 rounded-lg">
                                        <p className="text-base text-error-content leading-6">
                                            Common issues: corrupted file, unsupported format, or file too large.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => fetchUserCVs()} 
                                        variant="elevated"
                                        size="sm"
                                        hoverable
                                        leftIcon={<RefreshCw className="h-4 w-4" />}
                                        className="shadow-md hover:shadow-lg"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
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