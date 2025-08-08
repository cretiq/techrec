'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui-daisy/button';
import { Save, Loader2, Download, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui-daisy/use-toast';
import { ApiFailureModal } from '@/components/ui-daisy/ApiFailureModal';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import {
    selectCurrentAnalysisData,
    selectSuggestions,
    selectAnalysisStatus,
    selectCurrentAnalysisId,
    selectOriginalAnalysisData,
    fetchSuggestions,
    saveAnalysisVersion,
    type AnalysisStatus
} from '@/lib/features/analysisSlice';
import { setSuggestions } from '@/lib/features/suggestionsSlice';

interface AnalysisActionButtonsProps {
    className?: string;
}

export function AnalysisActionButtons({ className }: AnalysisActionButtonsProps) {
    const dispatch: AppDispatch = useDispatch();
    const { toast } = useToast();
    
    // Redux state
    const analysisData = useSelector(selectCurrentAnalysisData);
    const analysisId = useSelector(selectCurrentAnalysisId);
    const suggestions = useSelector(selectSuggestions);
    const status = useSelector(selectAnalysisStatus);
    const originalData = useSelector(selectOriginalAnalysisData);

    // Local state for operations
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [showApiFailureModal, setShowApiFailureModal] = useState(false);


    // Check for unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        if (!analysisData || !originalData) return false;
        return JSON.stringify(analysisData) !== JSON.stringify(originalData);
    }, [analysisData, originalData]);

    const isProcessing = status === 'loading';

    // Handlers
    const handleGetSuggestions = async () => {
        if (!analysisId || !analysisData) {
            toast({
                title: "No Analysis Data",
                description: "Please complete CV analysis first.",
                variant: "destructive",
            });
            return;
        }

        setIsSuggesting(true);
        try {
            const response = await dispatch(fetchSuggestions(analysisData)).unwrap();
            console.log('🎉 [AnalysisActionButtons] Suggestions received, syncing to suggestionsSlice...');
            console.log('📊 [AnalysisActionButtons] Response structure:', response);
            console.log('📊 [AnalysisActionButtons] Total suggestions:', response.suggestions?.length || 0);
            
            // Log each suggestion's section for debugging
            if (response.suggestions && response.suggestions.length > 0) {
                console.log('🔍 [AnalysisActionButtons] Suggestion sections:');
                response.suggestions.forEach((s: any, i: number) => {
                    console.log(`  ${i + 1}. Section: "${s.section}" | Type: ${s.suggestionType || s.type}`);
                });
            }
            
            // Dispatch the full response to suggestionsSlice for UI components
            dispatch(setSuggestions(response));
            console.log('✅ [AnalysisActionButtons] Successfully synced suggestions to suggestionsSlice');
            
            toast({
                title: "Suggestions Generated",
                description: `${response.suggestions?.length || 0} AI improvement suggestions are ready.`,
            });
        } catch (error: any) {
            console.error("Error getting suggestions:", error);
            
            // Check if this is a retry exhaustion error
            if (error?.error === 'RETRY_EXHAUSTED' || error.message?.includes('RETRY_EXHAUSTED') || typeof error === 'string' && error.includes('RETRY_EXHAUSTED')) {
                setShowApiFailureModal(true);
            } else {
                toast({
                    title: "Suggestions Error",
                    description: error.message || 'Could not generate suggestions.',
                    variant: "destructive",
                });
            }
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSaveAll = async () => {
        if (!analysisId || !analysisData) {
            toast({
                title: "No Changes to Save",
                description: "Analysis data is not available.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            await dispatch(saveAnalysisVersion({
                analysisId,
                updatedData: analysisData
            })).unwrap();

            toast({
                title: "Changes Saved",
                description: "Your CV analysis has been updated successfully.",
            });
        } catch (error: any) {
            console.error("Error saving analysis:", error);
            toast({
                title: "Save Error",
                description: error.message || 'Could not save changes.',
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        if (!analysisData || !analysisId) {
            toast({
                title: "Export Error",
                description: "No analysis data available for export.",
                variant: "destructive",
            });
            return;
        }

        setIsExporting(true);
        try {
            const response = await fetch(`/api/cv-analysis/${analysisId}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisData })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Export failed (${response.status})`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `exported_cv.docx`;
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast({ title: "Export Successful", description: `Downloaded ${filename}` });
        } catch (error: any) {
            console.error("Error exporting CV:", error);
            toast({ title: "Export Error", description: error.message || 'Could not export CV.', variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <>
            <ApiFailureModal
                isOpen={showApiFailureModal}
                onClose={() => setShowApiFailureModal(false)}
                title="AI Service Temporarily Unavailable"
                feature="CV suggestions generation"
            />
            <div className={`flex gap-2 ${className || ''}`} data-testid="cv-management-analysis-action-buttons">
            
            <Button
                onClick={handleSaveAll}
                disabled={!hasUnsavedChanges || isSaving || isSuggesting || isExporting || isProcessing || !!(analysisId && analysisId.startsWith('temp-'))}
                size="sm"
                data-testid="cv-management-button-save-changes"
            >
                {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="cv-management-icon-save-loading" />
                ) : (
                    <Save className="mr-2 h-4 w-4" data-testid="cv-management-icon-save" />
                )}
                {isSaving ? 'Saving...' : (hasUnsavedChanges ? 'Save Changes' : 'All Changes Saved')}
            </Button>
            </div>
        </>
    );
}