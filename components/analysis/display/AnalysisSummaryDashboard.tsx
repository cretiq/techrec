'use client';

import React from 'react';
import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import { Progress } from '@/components/ui/progress';
import {  Button  } from '@/components/ui-daisy/button';
import { Wand2, AlertCircle } from 'lucide-react';
import { CvAnalysisData, CvImprovementSuggestion } from '@/types/cv';

interface SectionMetrics {
  completeness: number;
  suggestions: number;
}

interface AnalysisSummaryDashboardProps {
  analysisData: CvAnalysisData;
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
  
  // Calculate section metrics
  const calculateSectionMetrics = (section: keyof CvAnalysisData): SectionMetrics => {
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
        completeness = data ? (data.length > 50 ? 100 : (data.length / 50) * 100) : 0;
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
  const sections: (keyof CvAnalysisData)[] = ['contactInfo', 'about', 'skills', 'experience', 'education'];
  const sectionMetrics = sections.map(section => ({
    section,
    ...calculateSectionMetrics(section)
  }));

  const overallCompleteness = Math.round(
    sectionMetrics.reduce((acc, curr) => acc + curr.completeness, 0) / sections.length
  );

  const totalSuggestions = suggestions?.length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Overall Score Card */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall CV Score</CardTitle>
          <Button 
            onClick={onGetSuggestions} 
            disabled={isSuggesting}
            variant="outline" 
            size="sm"
          >
            {isSuggesting ? (
              <>Getting Suggestions...</>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Get Suggestions
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{overallCompleteness}%</div>
          <Progress value={overallCompleteness} className="h-2" />
          {totalSuggestions > 0 && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {totalSuggestions} improvement suggestion{totalSuggestions !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section Score Cards */}
      {sectionMetrics.map(({ section, completeness, suggestions: sectionSuggestions }) => (
        <Card key={section}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </CardTitle>
            {sectionSuggestions > 0 && (
              <span className="text-sm text-muted-foreground">
                {sectionSuggestions} suggestion{sectionSuggestions !== 1 ? 's' : ''}
              </span>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{completeness}%</div>
            <Progress value={completeness} className="h-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 