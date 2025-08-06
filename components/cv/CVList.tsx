'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {  Button  } from '@/components/ui-daisy/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Download, Eye, Play } from 'lucide-react'; // Icons
import { useToast } from '@/components/ui-daisy/use-toast';
import { format } from 'date-fns'; // For date formatting
import { SearchFilters } from './SearchFilters'; // Import the new component
import { AnalysisStatus } from '@prisma/client';
import {  Badge  } from '@/components/ui-daisy/badge';
import { useRouter } from 'next/navigation';

// Define the expected structure of a CV object from the API
interface CV {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string; // Assuming ISO string format
  status: AnalysisStatus;
  s3Key: string;
  analysisId?: string | null;
  improvementScore?: number | null;
}

// Define filter state type
interface CurrentFilters {
  search?: string;
  status?: AnalysisStatus;
}

// Add refreshKey prop
interface CVListProps {
  refreshKey: number;
}

// Map status to badge variants
const statusBadgeVariant: { [key in AnalysisStatus]: "default" | "secondary" | "error" | "outline" | "success" | "warning" | "info" } = {
  [AnalysisStatus.PENDING]: "secondary",
  [AnalysisStatus.ANALYZING]: "info",
  [AnalysisStatus.COMPLETED]: "success",
  [AnalysisStatus.FAILED]: "error",
};

export function CVList({ refreshKey }: CVListProps) {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CurrentFilters>({}); // State to hold current filters
  const { toast } = useToast();
  const router = useRouter();

  // Wrap fetchCVs in useCallback to stabilize its reference
  const fetchCVs = useCallback(async (currentFilters: CurrentFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      // Construct query parameters based on filters
      const params = new URLSearchParams();
      if (currentFilters.search) {
        params.append('search', currentFilters.search);
      }
      if (currentFilters.status) {
        params.append('status', currentFilters.status);
      }
      // Add pagination params here if needed

      const apiUrl = `/api/cv?${params.toString()}`;
      console.log('[CVList] Fetching CVs from:', apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CVs: ${response.statusText}`);
      }
      const data: CV[] = await response.json();
      setCvs(data);
    } catch (err: any) {
      console.error('Error fetching CVs:', err);
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: "Error Loading CVs",
        description: err.message || 'Could not load CV list.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Dependency array includes toast

  // useEffect to fetch data when filters or refreshKey change
  useEffect(() => {
    console.log('[CVList] Fetching data due to filter/key change. Key:', refreshKey);
    fetchCVs(filters);
  }, [filters, refreshKey, fetchCVs]); // Add refreshKey to dependency array

  // Callback for the SearchFilters component
  const handleFilterChange = useCallback((newFilters: CurrentFilters) => {
    setFilters(newFilters);
  }, []); // Empty dependency array, this function doesn't change

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/cv/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMsg = `Failed to delete CV: ${response.statusText}`;
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {} 
        throw new Error(errorMsg);
      }
      
      toast({
        title: "CV Deleted",
        description: `${name} has been deleted.`,
      });
      // Refresh the list after deletion, using current filters
      fetchCVs(filters); 
    } catch (err: any) {
      console.error('[CVList] Error deleting CV:', err);
      toast({
        title: "Delete Error",
        description: err.message || 'Could not delete the CV.',
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (id: string, name: string) => {
    toast({ title: "Preparing Download", description: `Generating download link for ${name}...` });
    try {
      // Request the CV details with the download flag
      const response = await fetch(`/api/cv/${id}?download=true`);
      if (!response.ok) {
        let errorMsg = `Failed to get download link: ${response.statusText}`;
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {} 
        throw new Error(errorMsg);
      }
      const data = await response.json();

      if (data.downloadUrl) {
        // Open the presigned URL in a new tab (or trigger download)
        window.open(data.downloadUrl, '_blank');
        toast({ title: "Download Ready", description: `Your download for ${name} should start shortly.` });
      } else {
        throw new Error('Download URL not found in response.');
      }
    } catch (err: any) {
      console.error('Error getting download link:', err);
      toast({
        title: "Download Error",
        description: err.message || 'Could not generate download link.',
        variant: "destructive",
      });
    }
  };

  const handleImprove = (analysisId: string | null | undefined) => {
    if (analysisId) {
      router.push(`/developer/cv-management?tab=analyze&analysisId=${analysisId}`);
    } else {
      toast({ title: "Analysis Not Ready", description: "Analysis is not yet complete for this CV.", variant: "destructive" });
    }
  };

  // Orbital Loading Component
  const OrbitalLoader = ({ testId }: { testId: string }) => (
    <div className="flex items-center justify-start pl-4" data-testid={testId}>
      <div className="relative w-6 h-6" data-testid={`${testId}-container`}>
        <motion.div
          className="absolute inset-0 border-2 border-primary/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          data-testid={`${testId}-ring`}
        />
        <motion.div
          className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '50% 12px' }}
          data-testid={`${testId}-dot-1`}
        />
        <motion.div
          className="absolute top-1/2 left-0 w-1 h-1 bg-primary/70 rounded-full transform -translate-y-1/2"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '12px 50%' }}
          data-testid={`${testId}-dot-2`}
        />
      </div>
    </div>
  );

  // Skeleton Row Component
  const SkeletonRow = ({ index }: { index: number }) => (
    <TableRow key={`skeleton-${index}`} data-testid={`cv-management-skeleton-row-${index}`}>
      <TableCell className="w-[40%] min-w-[200px]" data-testid={`cv-management-skeleton-filename-${index}`}>
        <div className="flex items-center gap-3">
          <OrbitalLoader testId={`cv-management-loader-filename-${index}`} />
          <div className="h-4 w-32 bg-base-300/30 rounded animate-pulse" data-testid={`cv-management-skeleton-filename-placeholder-${index}`} />
        </div>
      </TableCell>
      <TableCell className="w-[25%] min-w-[140px]" data-testid={`cv-management-skeleton-uploaded-${index}`}>
        <div className="h-4 w-28 bg-base-300/30 rounded animate-pulse" data-testid={`cv-management-skeleton-uploaded-placeholder-${index}`} />
      </TableCell>
      <TableCell className="w-[15%] min-w-[100px]" data-testid={`cv-management-skeleton-status-${index}`}>
        <div className="h-6 w-20 bg-base-300/30 rounded-full animate-pulse" data-testid={`cv-management-skeleton-status-placeholder-${index}`} />
      </TableCell>
      <TableCell className="w-[10%] min-w-[60px]" data-testid={`cv-management-skeleton-score-${index}`}>
        <div className="h-4 w-8 bg-base-300/30 rounded animate-pulse" data-testid={`cv-management-skeleton-score-placeholder-${index}`} />
      </TableCell>
      <TableCell className="w-[10%] min-w-[120px] text-right" data-testid={`cv-management-skeleton-actions-${index}`}>
        <div className="flex justify-end gap-1" data-testid={`cv-management-skeleton-actions-container-${index}`}>
          <div className="h-8 w-8 bg-base-300/30 rounded animate-pulse" data-testid={`cv-management-skeleton-action-1-${index}`} />
          <div className="h-8 w-8 bg-base-300/30 rounded animate-pulse" data-testid={`cv-management-skeleton-action-2-${index}`} />
          <div className="h-8 w-8 bg-base-300/30 rounded animate-pulse" data-testid={`cv-management-skeleton-action-3-${index}`} />
        </div>
      </TableCell>
    </TableRow>
  );

  // Render logic remains largely the same, but includes SearchFilters
  return (
    <div className="w-full space-y-4" data-testid="cv-management-cv-list-container">
      <SearchFilters onFilterChange={handleFilterChange} />

      {error && <div className="text-destructive" data-testid="cv-management-cv-list-error">Error loading CVs: {error}</div>}
      
      {/* Always show table structure - with skeleton rows when loading */}
      <div className="border border-base-300 rounded-lg overflow-hidden bg-base-100/30 backdrop-blur-sm" data-testid="cv-management-table-container">
        <Table className="table-fixed w-full" data-testid="cv-management-table-cv-list">
          <TableHeader data-testid="cv-management-table-header">
            <TableRow data-testid="cv-management-table-header-row">
              <TableHead className="w-[40%] min-w-[200px]" data-testid="cv-management-table-header-filename">Filename</TableHead>
              <TableHead className="w-[25%] min-w-[140px]" data-testid="cv-management-table-header-uploaded">Uploaded</TableHead>
              <TableHead className="w-[15%] min-w-[100px]" data-testid="cv-management-table-header-status">Status</TableHead>
              <TableHead className="w-[10%] min-w-[60px]" data-testid="cv-management-table-header-score">Score</TableHead>
              <TableHead className="w-[10%] min-w-[120px] text-right" data-testid="cv-management-table-header-actions">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody data-testid="cv-management-table-body">
            {isLoading ? (
              // Show skeleton rows while loading
              <>  
                {[...Array(3)].map((_, index) => (
                  <SkeletonRow key={`skeleton-${index}`} index={index} />
                ))}
              </>
            ) : cvs.length === 0 ? (
              <TableRow data-testid="cv-management-table-empty-row">
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground" data-testid="cv-management-table-empty-message">
                  No CVs found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              // Show actual CV data with staggered animation
              cvs.map((cv, index) => (
                <motion.tr
                  key={cv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  data-testid={`cv-management-row-cv-item-${cv.id}`}
                >
                  <TableCell className="w-[40%] min-w-[200px] font-medium" data-testid={`cv-management-cell-filename-${cv.id}`}>
                    {cv.originalName}
                  </TableCell>
                  <TableCell className="w-[25%] min-w-[140px]" data-testid={`cv-management-cell-uploaded-${cv.id}`}>
                    {format(new Date(cv.uploadDate), 'PPpp')}
                  </TableCell>
                  <TableCell className="w-[15%] min-w-[100px]" data-testid={`cv-management-cell-status-${cv.id}`}>
                    <Badge 
                      variant={statusBadgeVariant[cv.status] || 'secondary'} 
                      data-testid={`cv-management-badge-status-${cv.status.toLowerCase()}-${cv.id}`}
                    >
                      {cv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[10%] min-w-[60px]" data-testid={`cv-management-cell-score-${cv.id}`}>
                    {cv.status === AnalysisStatus.COMPLETED && typeof cv.improvementScore === 'number' 
                      ? `${cv.improvementScore.toFixed(0)}%` 
                      : '-'}
                  </TableCell>
                  <TableCell className="w-[10%] min-w-[120px] text-right" data-testid={`cv-management-cell-actions-${cv.id}`}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleImprove(cv.analysisId)} 
                      disabled={cv.status !== AnalysisStatus.COMPLETED || !cv.analysisId}
                      title="View Analysis & Improve"
                      data-testid={`cv-management-button-analyze-${cv.id}`}
                    >
                      <Play className="h-4 w-4" data-testid={`cv-management-icon-analyze-${cv.id}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDownload(cv.id, cv.originalName)} 
                      title="Download" 
                      data-testid={`cv-management-button-download-${cv.id}`}
                    >
                      <Download className="h-4 w-4" data-testid={`cv-management-icon-download-${cv.id}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(cv.id, cv.originalName)} 
                      title="Delete" 
                      data-testid={`cv-management-button-delete-${cv.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" data-testid={`cv-management-icon-delete-${cv.id}`} />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 