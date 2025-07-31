'use client';

import React from 'react';
import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import { Progress } from '@/components/ui/progress';
import {  Button  } from '@/components/ui-daisy/button';
import { Wand2, AlertCircle } from 'lucide-react';
import { ProfileAnalysisData, CvImprovementSuggestion } from '@/types/cv';
import { motion } from 'framer-motion';

interface SectionMetrics {
  completeness: number;
  suggestions: number;
}

interface AnalysisSummaryDashboardProps {
  analysisData: ProfileAnalysisData;
  suggestions: CvImprovementSuggestion[] | null;
  onGetSuggestions: () => void;
  isSuggesting: boolean;
}

export function AnalysisSummaryDashboard({ 
  analysisData, 
  suggestions, 
  onGetSuggestions,
  isSuggesting 
}: AnalysisSummaryDashboardProps) {
  
  const scaleOnHover = { scale: 1.05 };

  // Calculate section metrics
  const calculateSectionMetrics = (section: keyof ProfileAnalysisData): SectionMetrics => {
    const data = analysisData[section];
    if (!data) return { completeness: 0, suggestions: 0 };

    let completeness = 0;
    const sectionSuggestions = suggestions?.filter(s => s.section.startsWith(section))?.length || 0;

    // Calculate completeness based on section type
    switch (section) {
      case 'contactInfo':
        const contactFields = Object.values(data).filter(Boolean).length;
        const totalContactFields = Object.keys(data).length;
        completeness = (contactFields / totalContactFields) * 100;
        break;
      case 'about':
        completeness = typeof data === 'string' && data ? (data.length > 50 ? 100 : (data.length / 50) * 100) : 0;
        break;
      case 'skills':
        const skills = Array.isArray(data) ? data : [];
        completeness = Math.min((skills.length / 5) * 100, 100); // Assume 5+ skills is "complete"
        break;
      case 'experience':
        const exp = Array.isArray(data) ? data : [];
        completeness = Math.min((exp.length / 2) * 100, 100); // Assume 2+ experiences is "complete"
        break;
      case 'education':
        const edu = Array.isArray(data) ? data : [];
        completeness = Math.min((edu.length / 1) * 100, 100); // Assume 1+ education entry is "complete"
        break;
    }

    return {
      completeness: Math.round(completeness),
      suggestions: sectionSuggestions
    };
  };

  // Calculate overall metrics
  const sections: (keyof ProfileAnalysisData)[] = ['contactInfo', 'about', 'skills', 'experience', 'education'];
  const sectionMetrics = sections.map(section => ({
    section,
    ...calculateSectionMetrics(section)
  }));

  const overallCompleteness = Math.round(
    sectionMetrics.reduce((acc, curr) => acc + curr.completeness, 0) / sections.length
  );

  const totalSuggestions = suggestions?.length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="cv-analysis-dashboard-container">
      {/* Overall Score Card */}
      <Card className="col-span-full md:col-span-1 bg-base-100/60" data-testid="cv-analysis-card-overall-score">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" data-testid="cv-analysis-title-overall-score">Overall CV Score</CardTitle>
          <Button 
            onClick={onGetSuggestions} 
            disabled={isSuggesting}
            variant="outline" 
            size="sm"
            data-testid="cv-analysis-button-get-suggestions-trigger"
          >
            {isSuggesting ? (
              <span data-testid="cv-analysis-text-getting-suggestions">Getting Suggestions...</span>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" data-testid="cv-analysis-icon-suggestions-wand" />
                <span data-testid="cv-analysis-text-get-suggestions">Get Suggestions</span>
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2" data-testid="cv-analysis-score-overall-percentage">{overallCompleteness}%</div>
          <Progress value={overallCompleteness} className="h-2" data-testid="cv-analysis-progress-overall-score" />
          {totalSuggestions > 0 && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center" data-testid="cv-analysis-text-suggestions-summary">
              <AlertCircle className="h-4 w-4 mr-1" data-testid="cv-analysis-icon-suggestions-alert" />
              <span data-testid="cv-analysis-text-suggestions-count">{totalSuggestions} improvement suggestion{totalSuggestions !== 1 ? 's' : ''}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section Score Cards */}
      {sectionMetrics.map(({ section, completeness, suggestions: sectionSuggestions }) => (
        <motion.div key={section} whileHover={scaleOnHover} data-testid={`cv-analysis-motion-section-${section}`}>
          <Card 
            className='bg-base-100/60 cursor-pointer'
            onClick={() => {
              const sectionId = section === 'contactInfo' ? 'contact-info' : section;
              const element = document.getElementById(sectionId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const sectionId = section === 'contactInfo' ? 'contact-info' : section;
                const element = document.getElementById(sectionId);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
            data-testid={`cv-analysis-card-section-${section}`}
          >
            <CardHeader 
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-testid={`cv-analysis-header-section-${section}`}
            >
              <CardTitle className="text-sm font-medium" data-testid={`cv-analysis-title-section-${section}`}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </CardTitle>
              {sectionSuggestions > 0 && (
                <span className="text-sm text-muted-foreground" data-testid={`cv-analysis-text-section-${section}-suggestions`}>
                  {sectionSuggestions} suggestion{sectionSuggestions !== 1 ? 's' : ''}
                </span>
              )}
            </CardHeader>
            <CardContent data-testid={`cv-analysis-content-section-${section}`}>
              <div className="text-2xl font-bold mb-2" data-testid={`cv-analysis-score-section-${section}-percentage`}>{completeness}%</div>
              <Progress value={completeness} className="h-2" data-testid={`cv-analysis-progress-${section}-score`} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 