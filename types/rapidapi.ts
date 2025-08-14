// types/rapidapi.ts

interface PostalAddress {
  "@type": "PostalAddress";
  addressCountry: string;
  addressLocality: string | null;
  addressRegion: string | null;
  streetAddress: string | null;
}

interface Place {
  "@type": "Place";
  address: PostalAddress;
  latitude: number;
  longitude: number;
}

interface QuantitativeValue {
  "@type": "QuantitativeValue";
  minValue: number;
  maxValue: number;
  unitText: string;
}

interface MonetaryAmount {
  "@type": "MonetaryAmount";
  currency: string;
  value: QuantitativeValue;
}

interface LocationRequirement {
  "@type": "Country";
  name: string;
}

// Represents the structure of a single job object expected from the RapidAPI LinkedIn endpoint
export interface RapidApiJob {
  // Core job fields
  id: string;
  date_posted: string;
  date_created: string;
  title: string;
  organization: string;
  organization_url: string;
  date_validthrough: string | null;
  locations_raw: Place[];
  location_type: string | null;
  location_requirements_raw: LocationRequirement[] | null;
  salary_raw: MonetaryAmount | null;
  employment_type: string[];
  url: string;
  external_apply_url?: string; // BLUEPRINT REQUIREMENT - direct application URL
  source_type: string;
  source: string;
  source_domain: string;
  organization_logo: string;
  
  // Job description (optional)
  description_text?: string | null;
  
  // Derived location fields
  cities_derived: string[] | null;
  regions_derived: string[] | null;
  countries_derived: string[];
  locations_derived: string[];
  timezones_derived: string[];
  lats_derived: number[];
  lngs_derived: number[];
  remote_derived: boolean;
  
  // Seniority (missing from original interface)
  seniority: string | null;
  
  // DirectApply field (missing from original interface)
  directapply: boolean;
  
  // Recruiter information
  recruiter_name: string | null;
  recruiter_title: string | null;
  recruiter_url: string | null;
  
  // LinkedIn organization fields
  linkedin_org_employees: number | null;
  linkedin_org_url: string;
  linkedin_org_size: string;
  linkedin_org_slogan: string | null;
  linkedin_org_industry: string;
  linkedin_org_followers: number | null;
  linkedin_org_headquarters: string;
  linkedin_org_type: string;
  linkedin_org_foundeddate: string;
  linkedin_org_specialties: string[];
  linkedin_org_locations: string[];
  linkedin_org_description: string;
  linkedin_org_recruitment_agency_derived: boolean;
  linkedin_org_slug: string;
  
  // AI-enriched fields (BETA features)
  ai_salary_currency?: string | null;
  ai_salary_value?: number | null;
  ai_salary_minvalue?: number | null;
  ai_salary_maxvalue?: number | null;
  ai_salary_unittext?: string | null;
  ai_benefits?: string[] | null;
  ai_experience_level?: string | null;
  ai_work_arrangement?: string | null;
  ai_work_arrangement_office_days?: number | null;
  ai_remote_location?: string[] | null;
  ai_remote_location_derived?: string[] | null;
  ai_key_skills?: string[] | null;
  ai_hiring_manager_name?: string | null;
  ai_hiring_manager_email_address?: string | null;
  ai_core_responsibilities?: string | null;
  ai_requirements_summary?: string | null;
  ai_working_hours?: number | null;
  ai_employment_type?: string[] | null;
  ai_job_language?: string | null;
  ai_visa_sponsorship?: boolean | null;
}
