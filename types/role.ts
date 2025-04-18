import type { Skill, CompanySummary, RoleType } from './index';

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
  // Add any other relevant fields that are common across sources
} 