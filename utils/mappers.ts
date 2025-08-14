import { Role, RoleType, Skill, CompanySummary } from '@/types'; // Adjust path as necessary
import type { ApplicationInfo } from '@/types/role';
import { RapidApiJob } from '@/types/rapidapi'; // Adjust path as necessary
import { EnhancedRole } from '@/types/enhancedRole';

// Formats the job type enum/string into a user-friendly string
export const formatJobType = (type: RoleType | string | undefined): string => {
  if (!type) return 'Unknown Type';

  switch (type) {
    case RoleType.FULL_TIME:
    case 'Full-time': // Handle common string variations
      return 'Full-time';
    case RoleType.PART_TIME:
    case 'Part-time':
      return 'Part-time';
    case RoleType.CONTRACT:
    case 'Contract':
      return 'Contract';
    case RoleType.INTERNSHIP:
    case 'Internship':
      return 'Internship';
    case RoleType.FREELANCE:
    case 'Freelance':
      return 'Freelance';
    default:
      // Handle potential raw strings if they don't match enum keys or common variations
      if (typeof type === 'string') {
        // Replace underscores and capitalize words for better display
        return type
          .split(/[_\s-]/) // Split by underscore, space, or hyphen
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      } 
      return 'Unknown Type';
  }
};

// Maps a job from the RapidAPI response to the internal EnhancedRole interface
export const mapRapidApiJobToRole = (apiJob: RapidApiJob): EnhancedRole => {
  // Helper to format salary with comprehensive null safety
  const formatSalary = (): string => {
    // Check if salary_raw exists and has the expected structure
    if (!apiJob.salary_raw || !apiJob.salary_raw.value) {
      // Check for AI-extracted salary as fallback
      if (apiJob.ai_salary_minvalue && apiJob.ai_salary_maxvalue) {
        const currency = apiJob.ai_salary_currency || '$';
        const unit = apiJob.ai_salary_unittext || 'year';
        return `${currency}${apiJob.ai_salary_minvalue.toLocaleString()} - ${currency}${apiJob.ai_salary_maxvalue.toLocaleString()} / ${unit.toLowerCase()}`;
      } else if (apiJob.ai_salary_value) {
        const currency = apiJob.ai_salary_currency || '$';
        const unit = apiJob.ai_salary_unittext || 'year';
        return `${currency}${apiJob.ai_salary_value.toLocaleString()} / ${unit.toLowerCase()}`;
      }
      return 'Not Specified';
    }
    
    const { minValue, maxValue, unitText } = apiJob.salary_raw.value;
    
    // Safely handle potentially undefined values
    if (minValue && maxValue) {
      return `$${minValue.toLocaleString()} - $${maxValue.toLocaleString()} / ${(unitText || 'year').toLowerCase()}`.trim();
    } else if (minValue) {
      return `From $${minValue.toLocaleString()} / ${(unitText || 'year').toLowerCase()}`.trim();
    } else if (maxValue) {
      return `Up to $${maxValue.toLocaleString()} / ${(unitText || 'year').toLowerCase()}`.trim();
    }
    return 'Not Specified';
  };

  // Map skills from LinkedIn specialties as skills
  const mapSkills = (): Skill[] => {
    return (apiJob.linkedin_org_specialties || []).map(skillName => ({
      id: skillName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: skillName,
      // description is not available from this API source
    }));
  };

  // Map company data with enhanced information
  const mapCompany = (): CompanySummary => {
    // Generate a safe ID from organization URL or fallback to organization name
    let companyId: string;
    try {
      // Try to use organization URL as ID, but ensure it's valid
      companyId = apiJob.organization_url && apiJob.organization_url.trim() 
        ? apiJob.organization_url 
        : `org-${(apiJob.organization || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    } catch {
      // Fallback to safe string generation
      companyId = `org-${(apiJob.organization || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
    
    return {
      id: companyId,
      name: apiJob.organization || 'Unknown Company',
      industry: apiJob.linkedin_org_industry || undefined,
      size: apiJob.linkedin_org_size || undefined,
      headquarters: apiJob.linkedin_org_headquarters || undefined,
      description: apiJob.linkedin_org_description || undefined,
      specialties: apiJob.linkedin_org_specialties && apiJob.linkedin_org_specialties.length > 0 
        ? apiJob.linkedin_org_specialties 
        : undefined,
      employeeCount: apiJob.linkedin_org_employees || undefined,
      logoUrl: apiJob.organization_logo || undefined,
      linkedinUrl: apiJob.linkedin_org_url || undefined,
      foundedDate: apiJob.linkedin_org_foundeddate || undefined,
    } as CompanySummary & { foundedDate?: string };
  };

  // Basic mapping for RoleType
  const mapRoleType = (): RoleType | string => {
    // Handle null employment_type and ensure it's an array
    if (!apiJob.employment_type || !Array.isArray(apiJob.employment_type) || apiJob.employment_type.length === 0) {
      return 'Unknown Type';
    }
    
    // Since employment_type is now an array, we'll use the first type if available
    const type = apiJob.employment_type[0]?.toUpperCase().replace('-', '_');
    if (type && type in RoleType) {
      return type as RoleType;
    }
    return apiJob.employment_type[0] || 'Unknown Type';
  };

  // Get the primary location string with safe array access
  const getPrimaryLocation = (): string => {
    // Try locations_derived first
    if (apiJob.locations_derived && Array.isArray(apiJob.locations_derived) && apiJob.locations_derived.length > 0) {
      const location = apiJob.locations_derived[0];
      if (location && typeof location === 'string' && location.trim()) {
        return location.trim();
      }
    }
    
    // Fallback to constructing location from derived fields
    const parts: string[] = [];
    if (apiJob.cities_derived && Array.isArray(apiJob.cities_derived) && apiJob.cities_derived.length > 0) {
      parts.push(apiJob.cities_derived[0]);
    }
    if (apiJob.regions_derived && Array.isArray(apiJob.regions_derived) && apiJob.regions_derived.length > 0) {
      parts.push(apiJob.regions_derived[0]);
    }
    if (apiJob.countries_derived && Array.isArray(apiJob.countries_derived) && apiJob.countries_derived.length > 0) {
      parts.push(apiJob.countries_derived[0]);
    }
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
    
    return 'Location Not Specified';
  };

  // Map application information from RapidAPI data
  const mapApplicationInfo = (): ApplicationInfo => {
    const applicationInfo: ApplicationInfo = {
      directApply: Boolean(apiJob.directapply),
      applicationUrl: apiJob.url || '',
    };

    // Add recruiter information if available
    if (apiJob.recruiter_name || apiJob.recruiter_title || apiJob.recruiter_url) {
      applicationInfo.recruiter = {
        name: apiJob.recruiter_name || 'Unknown',
        title: apiJob.recruiter_title || 'Recruiter',
        url: apiJob.recruiter_url || '',
      };
    }

    // Add hiring manager information if available from AI extraction
    if (apiJob.ai_hiring_manager_name || apiJob.ai_hiring_manager_email_address) {
      applicationInfo.hiringManager = {
        name: apiJob.ai_hiring_manager_name || 'Hiring Manager',
        email: apiJob.ai_hiring_manager_email_address || '',
      };
    }

    return applicationInfo;
  };

  return {
    id: apiJob.id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: apiJob.title || 'Job Title Not Available',
    description: apiJob.description_text || 'Role description not provided by job source.',
    requirements: apiJob.linkedin_org_specialties || [],
    skills: mapSkills(),
    company: mapCompany(),
    location: getPrimaryLocation(),
    salary: formatSalary(),
    type: mapRoleType(),
    remote: Boolean(apiJob.remote_derived),
    visaSponsorship: Boolean(apiJob.ai_visa_sponsorship), // Use AI field if available
    url: apiJob.url || '',
    applicationInfo: mapApplicationInfo(),
    
    // Preserve AI fields for matching and cover letter generation
    ai_key_skills: apiJob.ai_key_skills || undefined,
    linkedin_org_specialties: apiJob.linkedin_org_specialties || undefined,
    
    // Preserve additional RapidAPI fields for enhanced cover letters
    seniority: apiJob.seniority || undefined,
    employment_type: apiJob.employment_type || undefined,
    ai_core_responsibilities: apiJob.ai_core_responsibilities || undefined,
    ai_requirements_summary: apiJob.ai_requirements_summary || undefined,
    ai_benefits: apiJob.ai_benefits || undefined,
    ai_work_arrangement: apiJob.ai_work_arrangement || undefined,
    ai_working_hours: apiJob.ai_working_hours || undefined,
    
    // HIGH-IMPACT LinkedIn org fields for enhanced cover letter generation
    linkedin_org_industry: apiJob.linkedin_org_industry || undefined,
    linkedin_org_type: apiJob.linkedin_org_type || undefined,
    linkedin_org_description: apiJob.linkedin_org_description || undefined,
    linkedin_org_size: apiJob.linkedin_org_size || undefined,
    
    // Additional context fields for cover letter enhancement
    description_text: apiJob.description_text || undefined, // Full job description
    salary_raw: apiJob.salary_raw || undefined,
    organization: apiJob.organization || undefined,
    external_apply_url: apiJob.external_apply_url || undefined, // BLUEPRINT REQUIREMENT
    organization_logo: apiJob.organization_logo || undefined, // BLUEPRINT REQUIREMENT
    date_posted: apiJob.date_posted || undefined, // BLUEPRINT REQUIREMENT
    locations_derived: apiJob.locations_derived || undefined, // BLUEPRINT REQUIREMENT
  } as EnhancedRole;
}; 