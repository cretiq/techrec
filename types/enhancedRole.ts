// Enhanced Role interface for AI-enriched job data
import { Role } from './role';

export interface EnhancedRole extends Role {
  // AI-Enriched Fields
  ai_key_skills?: string[];
  ai_core_responsibilities?: string;
  ai_requirements_summary?: string;
  ai_benefits?: string[];
  ai_work_arrangement?: string;
  ai_working_hours?: number;
  ai_salary_currency?: string;
  ai_salary_minvalue?: number;
  ai_salary_maxvalue?: number;
  ai_salary_unittext?: string;
  ai_visa_sponsorship?: boolean;
  ai_hiring_manager_name?: string;
  ai_hiring_manager_email?: string;
  
  // LinkedIn Organization Fields
  linkedin_org_industry?: string;
  linkedin_org_type?: string;
  linkedin_org_description?: string;
  linkedin_org_size?: string;
  linkedin_org_specialties?: string[];
  linkedin_org_slogan?: string;
  linkedin_org_followers?: number;
  linkedin_org_headquarters?: string;
  linkedin_org_foundeddate?: string;
  
  // Additional Context Fields
  description_text?: string;
  salary_raw?: {
    currency?: string;
    value?: {
      minValue?: number;
      maxValue?: number;
      value?: number;
      unitText?: string;
    };
  };
  organization?: string;
  external_apply_url?: string;
  organization_logo?: string;
  date_posted?: string;
  locations_derived?: string[];
  seniority?: string;
  employment_type?: string[];
}

// Type guard for enhanced role validation
export function isEnhancedRole(role: any): role is EnhancedRole {
  return role && typeof role === 'object' && 'id' in role;
}

// Safe accessor helpers
export const getAiSkills = (role: EnhancedRole): string[] => {
  return Array.isArray(role.ai_key_skills) ? role.ai_key_skills : [];
};

export const getAiBenefits = (role: EnhancedRole): string[] => {
  return Array.isArray(role.ai_benefits) ? role.ai_benefits : [];
};

export const getLinkedInOrgData = (role: EnhancedRole) => ({
  industry: role.linkedin_org_industry || null,
  type: role.linkedin_org_type || null,
  description: role.linkedin_org_description || null,
  size: role.linkedin_org_size || null,
});