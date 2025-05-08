'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Download, Eye, Play } from 'lucide-react'; // Icons
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns'; // For date formatting
import { SearchFilters } from './SearchFilters'; // Import the new component
import { AnalysisStatus } from '@prisma/client';
import { Badge } from "@/components/ui/badge";
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
const statusBadgeVariant: { [key in AnalysisStatus]: "default" | "secondary" | "destructive" | "outline" } = {
  [AnalysisStatus.PENDING]: "secondary",
  [AnalysisStatus.ANALYZING]: "outline",
  [AnalysisStatus.COMPLETED]: "default", // Default is often green/primary
  [AnalysisStatus.FAILED]: "destructive",
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
    <div className="w-full space-y-4">
      <SearchFilters onFilterChange={handleFilterChange} />

      {isLoading && <div>Loading CVs...</div>}
      {error && <div className="text-destructive">Error loading CVs: {error}</div>}
      
      {!isLoading && !error && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cvs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No CVs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                cvs.map((cv) => (
                  <TableRow key={cv.id}>
                    <TableCell className="font-medium">{cv.originalName}</TableCell>
                    <TableCell>{format(new Date(cv.uploadDate), 'PPpp')}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[cv.status] || 'secondary'}>
                        {cv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cv.status === AnalysisStatus.COMPLETED && typeof cv.improvementScore === 'number' 
                        ? `${cv.improvementScore.toFixed(0)}%` 
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleImprove(cv.analysisId)} 
                        disabled={cv.status !== AnalysisStatus.COMPLETED || !cv.analysisId}
                        title="View Analysis & Improve"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(cv.id, cv.originalName)} title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cv.id, cv.originalName)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
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