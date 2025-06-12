'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {  Button  } from '@/components/ui-daisy/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Download, Eye, Play } from 'lucide-react'; // Icons
import { useToast } from '@/components/ui/use-toast';
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

  // Render logic remains largely the same, but includes SearchFilters
  return (
    <div className="w-full space-y-4" data-testid="cv-management-cv-list-container">
      <SearchFilters onFilterChange={handleFilterChange} />

      {isLoading && <div data-testid="cv-management-cv-list-loading">Loading CVs...</div>}
      {error && <div className="text-destructive" data-testid="cv-management-cv-list-error">Error loading CVs: {error}</div>}
      
      {!isLoading && !error && (
        <div className="border rounded-lg overflow-hidden" data-testid="cv-management-table-container">
          <Table data-testid="cv-management-table-cv-list">
            <TableHeader data-testid="cv-management-table-header">
              <TableRow data-testid="cv-management-table-header-row">
                <TableHead data-testid="cv-management-table-header-filename">Filename</TableHead>
                <TableHead data-testid="cv-management-table-header-uploaded">Uploaded</TableHead>
                <TableHead data-testid="cv-management-table-header-status">Status</TableHead>
                <TableHead data-testid="cv-management-table-header-score">Score</TableHead>
                <TableHead className="text-right" data-testid="cv-management-table-header-actions">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-testid="cv-management-table-body">
              {cvs.length === 0 ? (
                <TableRow data-testid="cv-management-table-empty-row">
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground" data-testid="cv-management-table-empty-message">
                    No CVs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                cvs.map((cv) => (
                  <TableRow key={cv.id} data-testid={`cv-management-row-cv-item-${cv.id}`}>
                    <TableCell className="font-medium" data-testid={`cv-management-cell-filename-${cv.id}`}>{cv.originalName}</TableCell>
                    <TableCell data-testid={`cv-management-cell-uploaded-${cv.id}`}>{format(new Date(cv.uploadDate), 'PPpp')}</TableCell>
                    <TableCell data-testid={`cv-management-cell-status-${cv.id}`}>
                      <Badge variant={statusBadgeVariant[cv.status] || 'secondary'} data-testid={`cv-management-badge-status-${cv.status.toLowerCase()}-${cv.id}`}>
                        {cv.status}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`cv-management-cell-score-${cv.id}`}>
                      {cv.status === AnalysisStatus.COMPLETED && typeof cv.improvementScore === 'number' 
                        ? `${cv.improvementScore.toFixed(0)}%` 
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right" data-testid={`cv-management-cell-actions-${cv.id}`}>
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
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(cv.id, cv.originalName)} title="Download" data-testid={`cv-management-button-download-${cv.id}`}>
                        <Download className="h-4 w-4" data-testid={`cv-management-icon-download-${cv.id}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cv.id, cv.originalName)} title="Delete" data-testid={`cv-management-button-delete-${cv.id}`}>
                        <Trash2 className="h-4 w-4 text-destructive" data-testid={`cv-management-icon-delete-${cv.id}`} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 