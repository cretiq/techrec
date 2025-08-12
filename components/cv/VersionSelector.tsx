'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui-daisy/button';
import { Card } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
// Removed Select import - using native select with DaisyUI classes
import { cn } from '@/lib/utils';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  RefreshCw,
  Trash2,
  Star,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

interface VersionSelectorProps {
  cvId: string;
  currentVersionId?: string;
  onVersionChange: (version: CvAnalysisVersion) => void;
  onReanalyze: () => void;
}

export function VersionSelector({
  cvId,
  currentVersionId,
  onVersionChange,
  onReanalyze,
}: VersionSelectorProps) {
  const [versions, setVersions] = useState<CvAnalysisVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(currentVersionId);
  const [isLoading, setIsLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

  // Fetch versions
  useEffect(() => {
    fetchVersions();
  }, [cvId]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cv/versions/${cvId}`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      
      const data = await response.json();
      setVersions(data.versions || []);
      
      // Set active version as selected if no current version specified
      if (!currentVersionId && data.versions.length > 0) {
        const activeVersion = data.versions.find((v: CvAnalysisVersion) => v.isActive);
        if (activeVersion) {
          setSelectedVersionId(activeVersion.id);
        }
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to load analysis versions');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle version selection
  const handleVersionSelect = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setSelectedVersionId(versionId);
      onVersionChange(version);
    }
  };

  // Activate a version
  const handleActivateVersion = async (versionId: string) => {
    try {
      const response = await fetch(`/api/cv/versions/${cvId}/${versionId}/activate`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to activate version');
      
      // Update local state
      setVersions(versions.map(v => ({
        ...v,
        isActive: v.id === versionId,
      })));
      
      toast.success('Version activated successfully');
      
      // Notify parent
      const version = versions.find(v => v.id === versionId);
      if (version) {
        onVersionChange(version);
      }
    } catch (error) {
      console.error('Error activating version:', error);
      toast.error('Failed to activate version');
    }
  };

  // Delete a version
  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version?')) return;
    
    try {
      const response = await fetch(`/api/cv/versions/${cvId}/${versionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete version');
      
      // Remove from local state
      setVersions(versions.filter(v => v.id !== versionId));
      
      // If deleted version was selected, select another
      if (selectedVersionId === versionId) {
        const remainingVersions = versions.filter(v => v.id !== versionId);
        if (remainingVersions.length > 0) {
          const activeVersion = remainingVersions.find(v => v.isActive) || remainingVersions[0];
          handleVersionSelect(activeVersion.id);
        }
      }
      
      toast.success('Version deleted successfully');
    } catch (error) {
      console.error('Error deleting version:', error);
      toast.error('Failed to delete version');
    }
  };

  // Get model display name
  const getModelDisplayName = (model: string): string => {
    const modelMap: Record<string, string> = {
      'gemini-2.5-flash': 'Gemini Flash',
      'gemini-2.5-pro': 'Gemini Pro',
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5',
    };
    return modelMap[model] || model;
  };

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2">Loading versions...</span>
        </div>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-base-content opacity-50 mx-auto mb-2" />
          <p className="text-sm text-base-content opacity-70">No analysis versions found</p>
          <Button
            variant="primary"
            size="sm"
            onClick={onReanalyze}
            className="mt-4 gap-2"
          >
            <Brain className="h-4 w-4" />
            Analyze CV
          </Button>
        </div>
      </Card>
    );
  }

  const selectedVersion = versions.find(v => v.id === selectedVersionId);

  return (
    <div className="space-y-4">
      {/* Version selector header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Analysis Versions</h3>
          <div className="flex items-center gap-2">
            <Badge variant="info">{versions.length} versions</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onReanalyze}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Version list */}
        <div className="space-y-2">
          {versions.map((version) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-3 rounded-lg border transition-all cursor-pointer',
                selectedVersionId === version.id
                  ? 'border-primary bg-primary/5'
                  : 'border-base-300 hover:border-base-content/20'
              )}
              onClick={() => handleVersionSelect(version.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Version {version.versionNumber}</span>
                    {version.isActive && (
                      <Badge variant="success" size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    {version.userEdits && (
                      <Badge variant="warning" size="sm">
                        Edited
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-base-content opacity-70">
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {getModelDisplayName(version.modelUsed)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(version.analysisDate), 'MMM d, yyyy HH:mm')}
                    </span>
                    <span className={cn('font-medium', getScoreColor(version.improvementScore))}>
                      Score: {version.improvementScore}%
                    </span>
                  </div>
                  
                  {version.prompt && (
                    <p className="text-xs text-base-content opacity-60 mt-1 line-clamp-1">
                      Custom prompt: {version.prompt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {!version.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateVersion(version.id);
                      }}
                      className="p-1"
                      title="Activate this version"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {showComparison && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompareVersionId(version.id === compareVersionId ? null : version.id);
                      }}
                      className={cn(
                        'p-1',
                        compareVersionId === version.id && 'text-primary'
                      )}
                      title="Compare with selected"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {versions.length > 1 && !version.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVersion(version.id);
                      }}
                      className="p-1 text-error hover:text-error"
                      title="Delete this version"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison toggle */}
        <div className="mt-4 pt-4 border-t border-base-300">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {showComparison ? 'Hide' : 'Show'} Comparison Mode
          </Button>
        </div>
      </Card>

      {/* Version comparison panel */}
      <AnimatePresence>
        {showComparison && compareVersionId && selectedVersionId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <VersionComparison
              version1={versions.find(v => v.id === selectedVersionId)!}
              version2={versions.find(v => v.id === compareVersionId)!}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Version comparison component
function VersionComparison({
  version1,
  version2,
}: {
  version1: CvAnalysisVersion;
  version2: CvAnalysisVersion;
}) {
  const compareData = (data1: any, data2: any) => {
    const differences: string[] = [];
    
    // Compare basic metrics
    if (data1.skills?.length !== data2.skills?.length) {
      differences.push(`Skills: ${data1.skills?.length || 0} vs ${data2.skills?.length || 0}`);
    }
    if (data1.experience?.length !== data2.experience?.length) {
      differences.push(`Experiences: ${data1.experience?.length || 0} vs ${data2.experience?.length || 0}`);
    }
    if (data1.education?.length !== data2.education?.length) {
      differences.push(`Education: ${data1.education?.length || 0} vs ${data2.education?.length || 0}`);
    }
    
    return differences;
  };

  const differences = compareData(version1.extractedData, version2.extractedData);

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3">Version Comparison</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Badge variant="primary" className="mb-2">Version {version1.versionNumber}</Badge>
          <div className="text-sm space-y-1">
            <p>Model: {version1.modelUsed}</p>
            <p>Score: {version1.improvementScore}%</p>
            <p>Date: {format(new Date(version1.analysisDate), 'MMM d, yyyy')}</p>
          </div>
        </div>
        
        <div>
          <Badge variant="secondary" className="mb-2">Version {version2.versionNumber}</Badge>
          <div className="text-sm space-y-1">
            <p>Model: {version2.modelUsed}</p>
            <p>Score: {version2.improvementScore}%</p>
            <p>Date: {format(new Date(version2.analysisDate), 'MMM d, yyyy')}</p>
          </div>
        </div>
      </div>
      
      {differences.length > 0 && (
        <div className="mt-4 pt-4 border-t border-base-300">
          <p className="text-sm font-medium mb-2">Key Differences:</p>
          <ul className="text-sm text-base-content/70 space-y-1">
            {differences.map((diff, index) => (
              <li key={index}>• {diff}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}