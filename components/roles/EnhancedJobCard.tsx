// Enhanced Job Card with proper type safety and performance optimizations
"use client"

import React, { useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui-daisy/card'
import { Button } from '@/components/ui-daisy/button'
import { Badge } from '@/components/ui-daisy/badge'
import { Sparkles, Target, Users, Check, Building, MapPin, Briefcase, Clock, Bookmark, BookmarkCheck } from 'lucide-react'
import { EnhancedRole, getAiSkills, getAiBenefits, getLinkedInOrgData } from '@/types/enhancedRole'
import { formatJobType } from '@/utils/mappers'

interface EnhancedJobCardProps {
  role: EnhancedRole;
  index: number;
  isSelected: boolean;
  isRoleSaved: boolean;
  onCardClick: () => void;
  onSaveClick: (e: React.MouseEvent) => void;
  onWriteClick: (e: React.MouseEvent) => void;
  hasSession: boolean;
  'data-testid'?: string;
}

const EnhancedJobCard = React.memo<EnhancedJobCardProps>(({
  role,
  index,
  isSelected,
  isRoleSaved,
  onCardClick,
  onSaveClick,
  onWriteClick,
  hasSession,
  'data-testid': testId,
}) => {
  // Memoized AI data processing for performance
  const aiSkills = useMemo(() => getAiSkills(role), [role.ai_key_skills]);
  const aiBenefits = useMemo(() => getAiBenefits(role), [role.ai_benefits]);
  const linkedInOrgData = useMemo(() => getLinkedInOrgData(role), [
    role.linkedin_org_industry,
    role.linkedin_org_type,
    role.linkedin_org_description,
    role.linkedin_org_size
  ]);

  // Memoized location processing
  const primaryLocation = useMemo(() => {
    if (Array.isArray(role.locations_derived) && role.locations_derived.length > 0) {
      return role.locations_derived[0];
    }
    return role.location || 'Location Not Specified';
  }, [role.locations_derived, role.location]);

  // Memoized salary processing
  const salaryDisplay = useMemo(() => {
    if (role.salary_raw?.value) {
      const { minValue, maxValue, value, unitText } = role.salary_raw.value;
      const currency = role.salary_raw.currency || '$';
      
      if (minValue && maxValue) {
        return `${currency}${minValue.toLocaleString()} - ${currency}${maxValue.toLocaleString()}${unitText ? ` / ${unitText}` : ''}`;
      } else if (value) {
        return `${currency}${value.toLocaleString()}${unitText ? ` / ${unitText}` : ''}`;
      }
    }
    return role.salary || 'No Salary Specified';
  }, [role.salary_raw, role.salary]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick();
    }
  }, [onCardClick]);

  return (
    <Card 
      variant={isSelected ? "selected-interactive" : "elevated-interactive"}
      animated
      clickable
      tabIndex={0}
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`Job: ${role.title} at ${role.company?.name}`}
      onClick={onCardClick}
      onKeyDown={handleKeyDown}
      className="flex flex-col h-full relative focus:outline-none"
      style={{ animationDelay: `${index * 100}ms` }}
      data-testid={testId || `enhanced-job-card-${role.id}`}
    >
      {hasSession && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSaveClick}
          className="absolute top-2 right-2 text-muted-foreground hover:text-primary shrink-0 z-10"
          aria-label={isRoleSaved ? "Unsave role" : "Save role"}
          title={isRoleSaved ? "Unsave Role" : "Save Role"}
          data-testid={`save-button-${role.id}`}
        >
          {isRoleSaved ? (
            <BookmarkCheck className="h-5 w-5 text-primary" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </Button>
      )}

      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          {/* Organization Logo */}
          {role.organization_logo && (
            <div className="mr-3 flex-shrink-0">
              <img 
                src={role.organization_logo} 
                alt={`${role.company?.name} logo`}
                className="w-12 h-12 rounded-lg object-contain border border-base-300/50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="space-y-2 flex-1">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-2 break-words flex-1">{role.title}</CardTitle>
            </div>
            
            <div className="space-y-1 text-base-content/70 text-sm">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span className="line-clamp-1 text-xs font-medium">{role.company?.name || 'Unknown Company'}</span>
                {/* AI-enhanced org data indicator */}
                {(linkedInOrgData.industry || linkedInOrgData.type) && (
                  <Sparkles className="h-3 w-3 text-primary/60" title="AI-enhanced company data" />
                )}
              </div>
              
              {/* Enhanced company context with type-safe LinkedIn org data */}
              {linkedInOrgData.type && (
                <div className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1" role="complementary" aria-label="Organization type">
                  <Target className="h-3 w-3" />
                  {linkedInOrgData.type}
                </div>
              )}
              
              {linkedInOrgData.industry && (
                <div className="text-xs text-muted-foreground line-clamp-1" role="complementary" aria-label="Industry">
                  {linkedInOrgData.industry}
                </div>
              )}
              
              {linkedInOrgData.size && (
                <div className="text-xs text-muted-foreground flex items-center gap-1" role="complementary" aria-label="Company size">
                  <Users className="h-3 w-3" />
                  {linkedInOrgData.size}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" leftIcon={<MapPin className="h-3 w-3 flex-shrink-0" />} className="whitespace-nowrap">
            {primaryLocation}
          </Badge>
          <Badge variant="secondary" leftIcon={<Briefcase className="h-3 w-3 flex-shrink-0" />} className="whitespace-nowrap">
            {formatJobType(role.type)}
          </Badge>
          {role.remote && (
            <Badge variant="secondary" leftIcon={<Clock className="h-3 w-3 flex-shrink-0" />} className="whitespace-nowrap">
              Remote
            </Badge>
          )}
        </div>

        {/* Enhanced Job Description */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {role.description_text || role.description || 'No description available.'}
          </p>
          {role.description_text && (
            <div className="flex items-center gap-1" role="note" aria-label="AI-enhanced description">
              <Sparkles className="h-3 w-3 text-primary/60" />
              <span className="text-xs text-primary/80">Enhanced job description</span>
            </div>
          )}
        </div>

        {/* AI-Curated Skills Section */}
        {aiSkills.length > 0 && (
          <div className="space-y-2" role="region" aria-label="AI-curated key skills">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">Key Skills (AI-Curated)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSkills.map((skill, idx) => (
                <Badge 
                  key={`${role.id}-ai-skill-${idx}`} 
                  variant="default" 
                  className="text-xs bg-primary/10 text-primary border-primary/30"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI-Enhanced Job Details */}
        {(role.ai_core_responsibilities || role.ai_work_arrangement || aiBenefits.length > 0) && (
          <div className="space-y-3 border-t border-base-300/50 pt-3" role="region" aria-label="AI-enhanced job details">
            {/* Core Responsibilities */}
            {role.ai_core_responsibilities && (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">Core Responsibilities</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {role.ai_core_responsibilities}
                </p>
              </div>
            )}

            {/* Work Arrangement */}
            {role.ai_work_arrangement && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-secondary" />
                  <span className="text-xs font-medium text-secondary">Work Arrangement</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-secondary/10 text-secondary border-secondary/30">
                  {role.ai_work_arrangement}
                </Badge>
              </div>
            )}

            {/* Benefits */}
            {aiBenefits.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-success" />
                  <span className="text-xs font-medium text-success">Benefits</span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                  {aiBenefits.slice(0, 4).map((benefit, idx) => (
                    <Badge 
                      key={`${role.id}-benefit-${idx}`} 
                      variant="outline" 
                      className="text-xs bg-success/5 text-success/80 border-success/30"
                    >
                      {benefit}
                    </Badge>
                  ))}
                  {aiBenefits.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{aiBenefits.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="card-body pt-2 mt-auto space-y-3">
        {/* Salary Section */}
        <div className="w-full text-center">
          <div className="text-md font-semibold" role="text" aria-label={`Salary: ${salaryDisplay}`}>
            {salaryDisplay}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center w-full px-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onWriteClick}
            className="text-xs px-3"
            data-testid={`write-button-${role.id}`}
            aria-label="Generate cover letter for this role"
          >
            Write Cover Letter
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

EnhancedJobCard.displayName = 'EnhancedJobCard';

export default EnhancedJobCard;