import { isInMvpMode } from './featureFlags';
import type { Role } from '@/types/role';
import type { RapidApiJob } from '@/types/rapidapi';

/**
 * Determines whether job data should be enriched based on MVP mode and environment settings
 */
export const shouldEnrichJobData = (): boolean => {
  // Only enrich in non-MVP mode OR if explicitly enabled via environment variable
  return !isInMvpMode() || process.env.ENABLE_JOB_ENRICHMENT === 'true';
};

/**
 * Enhanced job data structure for future enrichment
 */
export interface EnrichedJobData {
  // Original RapidAPI data
  originalData: RapidApiJob | Role;
  
  // Future enrichment fields (when available from additional sources)
  enrichedDescription?: string;
  parsedRequirements?: string[];
  parsedResponsibilities?: string[];
  detailedBenefits?: string[];
  
  // Enrichment metadata
  enrichmentSource: 'rapidapi' | 'future_api' | 'manual' | 'none';
  enrichmentDate: Date;
  enrichmentQuality: 'basic' | 'enhanced' | 'full';
}

/**
 * Job Data Service for current and future enrichment
 * Currently maximizes RapidAPI data usage
 * Future: Will integrate additional data sources (no scraping)
 */
export class JobDataService {
  private static instance: JobDataService;
  
  private constructor() {}
  
  static getInstance(): JobDataService {
    if (!JobDataService.instance) {
      JobDataService.instance = new JobDataService();
    }
    return JobDataService.instance;
  }
  
  /**
   * Enriches job data from available sources
   * Currently: Returns enhanced RapidAPI data
   * Future: Will integrate additional data sources (no scraping)
   */
  async enrichJobData(role: Role): Promise<EnrichedJobData> {
    // Check if enrichment is enabled
    if (!shouldEnrichJobData()) {
      return {
        originalData: role,
        enrichmentSource: 'none',
        enrichmentDate: new Date(),
        enrichmentQuality: 'basic'
      };
    }
    
    // Current implementation: Maximize RapidAPI data
    const enriched: EnrichedJobData = {
      originalData: role,
      enrichmentSource: 'rapidapi',
      enrichmentDate: new Date(),
      enrichmentQuality: this.assessDataQuality(role)
    };
    
    // Future: Check for additional data sources
    const additionalData = await this.fetchFromAlternativeSource(role.id);
    if (additionalData) {
      enriched.enrichedDescription = additionalData.description;
      enriched.parsedRequirements = additionalData.requirements;
      enriched.parsedResponsibilities = additionalData.responsibilities;
      enriched.detailedBenefits = additionalData.benefits;
      enriched.enrichmentSource = 'future_api';
      enriched.enrichmentQuality = 'enhanced';
    }
    
    return enriched;
  }
  
  /**
   * Assesses the quality of available job data
   */
  private assessDataQuality(role: Role): 'basic' | 'enhanced' | 'full' {
    let score = 0;
    
    // Check for basic fields
    if (role.title) score++;
    if (role.description && role.description !== 'No description available.') score++;
    if (role.requirements && role.requirements.length > 0) score++;
    if (role.skills && role.skills.length > 0) score++;
    
    // Check for enhanced fields (from our enhanced mapping)
    const enhancedRole = role as any;
    if (enhancedRole.seniority) score++;
    if (enhancedRole.ai_core_responsibilities) score++;
    if (enhancedRole.ai_requirements_summary) score++;
    if (enhancedRole.ai_benefits && enhancedRole.ai_benefits.length > 0) score++;
    if (enhancedRole.ai_key_skills && enhancedRole.ai_key_skills.length > 0) score++;
    
    // Check for company data
    if (role.company.description) score++;
    if (role.company.specialties && role.company.specialties.length > 0) score++;
    if (role.company.industry) score++;
    
    // Determine quality level
    if (score >= 10) return 'full';
    if (score >= 5) return 'enhanced';
    return 'basic';
  }
  
  /**
   * Future placeholder for alternative data sources
   * (API partnerships, user-submitted data, cached enrichments, etc.)
   */
  async fetchFromAlternativeSource(jobId: string): Promise<any> {
    // Placeholder for future implementation
    // This is where we would integrate:
    // - Partner job APIs (Indeed, Adzuna, ZipRecruiter)
    // - User-submitted job descriptions
    // - Cached enrichments from previous sessions
    // - Community-contributed job data
    
    // For now, return null (no additional data available)
    return null;
  }
  
  /**
   * Formats enriched job data for cover letter generation
   */
  formatForCoverLetter(enrichedData: EnrichedJobData): {
    roleInfo: any;
    companyInfo: any;
    enrichmentMetadata: {
      source: string;
      quality: string;
      hasEnrichedData: boolean;
    };
  } {
    const role = enrichedData.originalData as Role;
    const enhancedRole = role as any;
    
    return {
      roleInfo: {
        title: role.title,
        description: enrichedData.enrichedDescription || role.description,
        requirements: enrichedData.parsedRequirements || role.requirements,
        skills: role.skills.map(s => typeof s === 'string' ? s : s.name),
        // Enhanced fields
        location: role.location,
        url: role.url,
        seniority: enhancedRole.seniority,
        employmentType: enhancedRole.employment_type,
        remote: role.remote,
        directApply: role.applicationInfo?.directApply,
        // AI fields
        aiKeySkills: enhancedRole.ai_key_skills,
        aiCoreResponsibilities: enhancedRole.ai_core_responsibilities || enrichedData.parsedResponsibilities?.join('\n'),
        aiRequirementsSummary: enhancedRole.ai_requirements_summary,
        aiBenefits: enrichedData.detailedBenefits || enhancedRole.ai_benefits,
        aiWorkArrangement: enhancedRole.ai_work_arrangement,
        aiWorkingHours: enhancedRole.ai_working_hours,
        // Recruiter info
        recruiterName: role.applicationInfo?.recruiter?.name,
        recruiterTitle: role.applicationInfo?.recruiter?.title,
        aiHiringManagerName: role.applicationInfo?.hiringManager?.name,
      },
      companyInfo: {
        name: role.company.name,
        location: role.location,
        remote: role.remote,
        // Enhanced company fields
        industry: role.company.industry,
        size: role.company.size,
        headquarters: role.company.headquarters,
        description: role.company.description,
        specialties: role.company.specialties,
        employeeCount: role.company.employeeCount,
        foundedDate: (role.company as any).foundedDate,
        linkedinUrl: role.company.linkedinUrl,
      },
      enrichmentMetadata: {
        source: enrichedData.enrichmentSource,
        quality: enrichedData.enrichmentQuality,
        hasEnrichedData: enrichedData.enrichmentSource !== 'none' && enrichedData.enrichmentSource !== 'rapidapi'
      }
    };
  }
}

// Export singleton instance for convenience
export const jobDataService = JobDataService.getInstance();