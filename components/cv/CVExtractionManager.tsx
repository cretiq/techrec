'use client';

import React, { useState, useEffect } from 'react';
import { ExperienceReorganizer } from './ExperienceReorganizer';
import { VersionSelector } from './VersionSelector';
import { Card } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
// Removed Tabs import - will use manual tab implementation
import { cn } from '@/lib/utils';
import {
  Brain,
  Settings,
  History,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Experience {
  id: string;
  title: string;
  company: string;
  description: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  responsibilities: string[];
  achievements: string[];
  teamSize?: number | null;
  techStack: string[];
  parentId?: string | null;
  children?: Experience[];
  displayOrder: number;
  mergedFrom?: string[];
}

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

interface GroupingSuggestion {
  id: string;
  type: 'merge' | 'nest' | 'reorder';
  confidence: number;
  experienceIds: string[];
  reason: string;
  description: string;
  action: {
    targetId?: string;
    parentId?: string;
    childIds?: string[];
  };
}

interface CVExtractionManagerProps {
  cvId: string;
  initialExperiences: Experience[];
  currentVersion?: CvAnalysisVersion;
}

export function CVExtractionManager({
  cvId,
  initialExperiences,
  currentVersion,
}: CVExtractionManagerProps) {
  const [activeTab, setActiveTab] = useState<'organize' | 'versions' | 'suggestions'>('organize');
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [suggestions, setSuggestions] = useState<GroupingSuggestion[]>([]);
  const [currentVersionData, setCurrentVersionData] = useState<CvAnalysisVersion | undefined>(currentVersion);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Fetch suggestions
  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/cv/suggestions/grouping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to load smart suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Load suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, [cvId]);

  // Handle re-analysis
  const handleReanalyze = async () => {
    try {
      const response = await fetch('/api/cv/reanalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId }),
      });
      
      if (!response.ok) throw new Error('Failed to re-analyze CV');
      
      const data = await response.json();
      toast.success('CV re-analyzed successfully!');
      
      // Switch to versions tab to show new version
      setActiveTab('versions');
      
      // Refresh suggestions
      fetchSuggestions();
    } catch (error) {
      console.error('Error re-analyzing CV:', error);
      toast.error('Failed to re-analyze CV');
    }
  };

  // Handle version change
  const handleVersionChange = (version: CvAnalysisVersion) => {
    setCurrentVersionData(version);
    // Update experiences from the version data
    const versionExperiences = version.userEdits?.experience || version.extractedData?.experience || [];
    setExperiences(versionExperiences);
    fetchSuggestions(); // Refresh suggestions for new data
  };

  // Handle experience save
  const handleExperiencesSave = async (updatedExperiences: Experience[]) => {
    try {
      // Save via the existing profile API endpoints
      // For now, we'll use a batch approach - in production, you might want individual API calls
      
      const reorderResponse = await fetch('/api/developer/me/experience/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceIds: updatedExperiences.map(e => e.id),
        }),
      });
      
      if (!reorderResponse.ok) throw new Error('Failed to save experience order');
      
      // Update local state
      setExperiences(updatedExperiences);
      
      // Refresh suggestions after changes
      fetchSuggestions();
      
      toast.success('Experience organization saved successfully!');
    } catch (error) {
      console.error('Error saving experiences:', error);
      throw error; // Re-throw so component can handle
    }
  };

  // Apply a suggestion
  const handleApplySuggestion = async (suggestion: GroupingSuggestion) => {
    try {
      switch (suggestion.type) {
        case 'merge':
          const mergeResponse = await fetch('/api/developer/me/experience/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceIds: suggestion.experienceIds,
              targetId: suggestion.action.targetId,
            }),
          });
          if (!mergeResponse.ok) throw new Error('Failed to merge experiences');
          break;
          
        case 'nest':
          if (suggestion.action.parentId && suggestion.action.childIds) {
            for (const childId of suggestion.action.childIds) {
              const nestResponse = await fetch('/api/developer/me/experience/nest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  childId,
                  parentId: suggestion.action.parentId,
                }),
              });
              if (!nestResponse.ok) throw new Error('Failed to nest experience');
            }
          }
          break;
          
        case 'reorder':
          // Handle reorder suggestion
          break;
      }
      
      // Remove applied suggestion
      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
      
      // Refresh data
      fetchSuggestions();
      
      toast.success('Suggestion applied successfully!');
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast.error('Failed to apply suggestion');
    }
  };

  const highConfidenceSuggestions = suggestions.filter(s => s.confidence >= 80);
  const mediumConfidenceSuggestions = suggestions.filter(s => s.confidence >= 60 && s.confidence < 80);
  const lowConfidenceSuggestions = suggestions.filter(s => s.confidence < 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">CV Extraction Manager</h2>
            <p className="text-base-content/70">
              Organize your CV data with AI-powered suggestions and version control
            </p>
          </div>
          
          {currentVersionData && (
            <div className="text-right">
              <Badge variant="info" className="mb-2">
                Version {currentVersionData.versionNumber}
              </Badge>
              <p className="text-sm text-base-content/70">
                Score: {currentVersionData.improvementScore}% • {currentVersionData.modelUsed}
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-base-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('organize')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === 'organize'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-300'
              )}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Organize
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === 'versions'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-300'
              )}
            >
              <History className="h-4 w-4 inline mr-2" />
              Versions
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all relative',
                activeTab === 'suggestions'
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-300'
              )}
            >
              <Lightbulb className="h-4 w-4 inline mr-2" />
              Suggestions
              {suggestions.length > 0 && (
                <Badge
                  variant="error"
                  size="sm"
                  className="absolute -top-1 -right-1 min-w-5 h-5 text-xs"
                >
                  {suggestions.length}
                </Badge>
              )}
            </button>
          </div>
          
          <Button
            variant="primary"
            onClick={handleReanalyze}
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            Re-analyze CV
          </Button>
        </div>
      </Card>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'organize' && (
          <motion.div
            key="organize"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ExperienceReorganizer
              experiences={experiences}
              onSave={handleExperiencesSave}
              onReanalyze={handleReanalyze}
              cvId={cvId}
            />
          </motion.div>
        )}

        {activeTab === 'versions' && (
          <motion.div
            key="versions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <VersionSelector
              cvId={cvId}
              currentVersionId={currentVersionData?.id}
              onVersionChange={handleVersionChange}
              onReanalyze={handleReanalyze}
            />
          </motion.div>
        )}

        {activeTab === 'suggestions' && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* High Confidence Suggestions */}
            {highConfidenceSuggestions.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  High Confidence Suggestions
                </h3>
                <div className="space-y-3">
                  {highConfidenceSuggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onApply={handleApplySuggestion}
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* Medium Confidence Suggestions */}
            {mediumConfidenceSuggestions.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Medium Confidence Suggestions
                </h3>
                <div className="space-y-3">
                  {mediumConfidenceSuggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onApply={handleApplySuggestion}
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* Low Confidence Suggestions */}
            {lowConfidenceSuggestions.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-info" />
                  Consider These Ideas
                </h3>
                <div className="space-y-3">
                  {lowConfidenceSuggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onApply={handleApplySuggestion}
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* No Suggestions */}
            {suggestions.length === 0 && !isLoadingSuggestions && (
              <Card className="p-8 text-center">
                <Lightbulb className="h-12 w-12 text-base-content opacity-30 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Suggestions Available</h3>
                <p className="text-base-content opacity-70 mb-4">
                  Your CV data looks well-organized! Try re-analyzing with a different model to get new suggestions.
                </p>
                <Button variant="outline" onClick={handleReanalyze}>
                  Re-analyze for New Suggestions
                </Button>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Suggestion Card Component
function SuggestionCard({
  suggestion,
  onApply,
}: {
  suggestion: GroupingSuggestion;
  onApply: (suggestion: GroupingSuggestion) => void;
}) {
  return (
    <div className="border border-base-300 rounded-lg p-4 bg-base-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant={suggestion.confidence >= 80 ? 'success' : suggestion.confidence >= 60 ? 'warning' : 'info'}
              size="sm"
            >
              {suggestion.confidence}% confidence
            </Badge>
            <Badge variant="outline" size="sm">
              {suggestion.type}
            </Badge>
          </div>
          
          <h4 className="font-medium mb-1">{suggestion.reason}</h4>
          <p className="text-sm text-base-content opacity-70 mb-3">{suggestion.description}</p>
          
          <div className="text-xs text-base-content opacity-60">
            Affects {suggestion.experienceIds.length} experience{suggestion.experienceIds.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="ml-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApply(suggestion)}
            className="gap-2"
          >
            <CheckCircle className="h-3 w-3" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}