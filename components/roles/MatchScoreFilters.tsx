// components/roles/MatchScoreFilters.tsx
// Client-side filtering and sorting controls for match scores

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { Label } from '@/components/ui-daisy/label';
import { Slider } from '@/components/ui-daisy/slider';
import { Switch } from '@/components/ui-daisy/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-daisy/select';
import { 
  Target, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter,
  RotateCcw,
  Star,
  User,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MatchFilterOptions {
  minScore: number;
  maxScore: number;
  requireSkillsListed: boolean;
  sortBy: 'match' | 'date' | 'title' | 'company';
  sortDirection: 'asc' | 'desc';
  showOnlyMatches: boolean; // Only show roles with skills listed
}

interface MatchScoreFiltersProps {
  filters: MatchFilterOptions;
  onFiltersChange: (filters: MatchFilterOptions) => void;
  userHasSkills: boolean;
  totalRoles: number;
  rolesWithSkills: number;
  className?: string;
}

const MatchScoreFilters: React.FC<MatchScoreFiltersProps> = ({
  filters,
  onFiltersChange,
  userHasSkills,
  totalRoles,
  rolesWithSkills,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<MatchFilterOptions>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    onFiltersChange({
      minScore: 0,
      maxScore: 100,
      requireSkillsListed: false,
      sortBy: userHasSkills ? 'match' : 'date',
      sortDirection: 'desc',
      showOnlyMatches: false
    });
  };

  const getScoreRangeLabel = (min: number, max: number): string => {
    if (min === 0 && max === 100) return 'All Scores';
    if (min === 70) return 'Excellent Match (70%+)';
    if (min === 40) return 'Good Match (40%+)';
    if (max === 39) return 'Limited Match (0-39%)';
    return `${min}% - ${max}%`;
  };

  // Quick filter presets
  const quickFilters = [
    { label: 'Excellent (70%+)', min: 70, max: 100, icon: Star, color: 'text-green-600' },
    { label: 'Good (40-69%)', min: 40, max: 69, icon: TrendingUp, color: 'text-yellow-600' },
    { label: 'All Matches', min: 0, max: 100, icon: Target, color: 'text-blue-600' }
  ];

  const sortOptions = [
    { value: 'match', label: 'Match Score', available: userHasSkills },
    { value: 'date', label: 'Date Posted', available: true },
    { value: 'title', label: 'Job Title', available: true },
    { value: 'company', label: 'Company Name', available: true }
  ];

  // If user has no skills, show profile completion prompt
  if (!userHasSkills) {
    return (
      <Card className={cn("bg-base-100/60 backdrop-blur-sm", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Add Skills for Match Scores</h3>
              <p className="text-xs text-base-content/70">
                Complete your profile to see compatibility scores
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => window.location.href = '/developer/profile?tab=skills'}
            >
              Add Skills
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-base-100/60 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Match Scores
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {rolesWithSkills}/{totalRoles} with skills
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6"
            >
              {isExpanded ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((preset) => {
            const Icon = preset.icon;
            const isActive = filters.minScore === preset.min && filters.maxScore === preset.max;
            
            return (
              <Badge
                key={preset.label}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "cursor-pointer hover:bg-primary/20 transition-colors text-xs",
                  isActive && "shadow-sm"
                )}
                onClick={() => updateFilters({ minScore: preset.min, maxScore: preset.max })}
              >
                <Icon className={cn("h-3 w-3 mr-1", preset.color)} />
                {preset.label}
              </Badge>
            );
          })}
        </div>

        {/* Sort Control */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium">Sort by:</Label>
          <Select 
            value={filters.sortBy} 
            onValueChange={(value: 'match' | 'date' | 'title' | 'company') => 
              updateFilters({ sortBy: value })
            }
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions
                .filter(option => option.available)
                .map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateFilters({ 
              sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' 
            })}
            className="h-8 w-8"
            title={`Sort ${filters.sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          >
            {filters.sortDirection === 'asc' ? 
              <ArrowUp className="h-3 w-3" /> : 
              <ArrowDown className="h-3 w-3" />
            }
          </Button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-base-300/50">
            {/* Score Range Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Score Range</Label>
                <span className="text-xs text-base-content/70">
                  {getScoreRangeLabel(filters.minScore, filters.maxScore)}
                </span>
              </div>
              <div className="px-2">
                <Slider
                  value={[filters.minScore, filters.maxScore]}
                  onValueChange={([min, max]) => updateFilters({ minScore: min, maxScore: max })}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-base-content/60 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Filter Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Skills Listed Only</Label>
                <Switch
                  checked={filters.requireSkillsListed}
                  onCheckedChange={(checked) => updateFilters({ requireSkillsListed: checked })}
                  size="sm"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Hide No-Match Roles</Label>
                <Switch
                  checked={filters.showOnlyMatches}
                  onCheckedChange={(checked) => updateFilters({ showOnlyMatches: checked })}
                  size="sm"
                />
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="w-full text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchScoreFilters;