import { LucideIcon } from 'lucide-react';
import { ElementType } from 'react';

// --- Enums ---

export enum RoleType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

// --- Interfaces ---

export interface Skill {
  id: string;
  name: string;
  description?: string; // Made optional as it might not always be present
}

export interface CompanySummary {
  id?: string; // Make ID optional as it might come from different sources
  name: string;
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
  // Add any other relevant fields that are common across sources
}

// For Comboboxes and data sources
export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Technology {
  slug: string;
  name: string;
  icon?: LucideIcon | ElementType; // Allow LucideIcon or general ElementType
}

export interface Company {
  id?: string; // Make ID optional here too
  name: string;
  // Add other company details if needed elsewhere
}

// Interface for Combobox options derived from the above
export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode; // Keep flexible for flags or icons
} 