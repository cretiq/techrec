'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

// Import chart components
import { ImprovementOverTimeChart } from './charts/ImprovementOverTimeChart';
import { StrengthsWeaknessesChart } from './charts/StrengthsWeaknessesChart';
import { CategoryPerformanceChart } from './charts/CategoryPerformanceChart';
import { SuggestionProgressChart } from './charts/SuggestionProgressChart';

// Assume we might get analysis history or aggregated data as props or from Redux later
interface AnalyticsDashboardProps {
  // Example: analysisHistory: AnalysisHistory[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ /* analysisHistory */ }) => {
  // --- State for Filters --- 
  const [dateRange, setDateRange] = useState('last_30_days'); // Example: 'last_7_days', 'last_30_days', 'all_time'
  
  // --- Placeholder Data & Handlers --- 
  // TODO: Replace with actual data fetching/processing logic based on dateRange
  const improvementChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    scores: [65, 70, 72, 78] 
  };
  const strengthsChartData = {
    labels: ['ATS', 'Keywords', 'Impact', 'Clarity', 'Formatting', 'Length'],
    scores: [80, 75, 90, 65, 85, 70]
  };
  const categoryChartData = {
    labels: ['Contact', 'About', 'Skills', 'Experience', 'Education'],
    scores: [90, 70, 85, 75, 95]
  };
  const suggestionProgressData = {
    pending: 15,
    accepted: 25,
    rejected: 5
  };

  const handleExport = (chartName: string) => {
    console.log(`Exporting ${chartName}...`); // Placeholder
    // TODO: Implement chart export logic (e.g., using chart instance methods)
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Analysis Analytics</h2>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          {/* <Button variant="outline" size="sm" onClick={() => handleExport('all')}>
            <Download className="mr-2 h-4 w-4" /> Export All
          </Button> */}
        </div>
      </div>

      {/* Grid for Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Improvement Over Time */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-base font-medium'>Improvement Over Time</CardTitle>
            <Button variant="ghost" size="sm" className='h-7 w-7 p-0 text-muted-foreground' onClick={() => handleExport('Improvement Over Time')}><Download className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <ImprovementOverTimeChart data={improvementChartData} />
          </CardContent>
        </Card>

        {/* Strengths/Weaknesses Radar Chart */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-base font-medium'>Strengths & Weaknesses</CardTitle>
            <Button variant="ghost" size="sm" className='h-7 w-7 p-0 text-muted-foreground' onClick={() => handleExport('Strengths & Weaknesses')}><Download className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <StrengthsWeaknessesChart data={strengthsChartData} />
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-base font-medium'>Category Performance</CardTitle>
            <Button variant="ghost" size="sm" className='h-7 w-7 p-0 text-muted-foreground' onClick={() => handleExport('Category Performance')}><Download className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <CategoryPerformanceChart data={categoryChartData} />
          </CardContent>
        </Card>

        {/* Suggestion Implementation Progress */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-base font-medium'>Suggestion Progress</CardTitle>
            <Button variant="ghost" size="sm" className='h-7 w-7 p-0 text-muted-foreground' onClick={() => handleExport('Suggestion Progress')}><Download className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <SuggestionProgressChart data={suggestionProgressData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 