import type { Skill, CompanySummary, RoleType } from './index';

export interface ApplicationInfo {
  directApply: boolean; // LinkedIn Easy Apply availability
  applicationUrl: string; // Primary application URL
  recruiter?: {
    name: string;
    title: string;
    url: string;
  };
  hiringManager?: {
    name: string;
    email: string;
  };
}

export interface Role {
  id: string; // This might be the external ID from TheirStack or internal DB ID
  title: string;
  description: string;
  requirements: string[]; // Keep this for general requirements text
  skills: Skill[]; // Use the Skill interface for structured skills
  company: CompanySummary; // Use the CompanySummary interface
  location: string;
  salary: string; // Keep as string for flexibility (e.g., ranges, "Not Specified")
  type: RoleType | string; // Allow enum or raw string initially
  remote: boolean;
  visaSponsorship: boolean;
  url?: string; // Optional URL to the job posting
  applicationInfo?: ApplicationInfo; // Application routing information
  // Add any other relevant fields that are common across sources
} 