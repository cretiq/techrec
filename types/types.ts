// Placeholder for profile feature types 

import { SkillLevel, RoleType, ApplicationStatus } from '@prisma/client'; // Use Prisma enums where appropriate
import { z } from 'zod';

/**
 * Represents the core contact information for a developer profile,
 * used internally within the application logic and UI.
 */
export interface InternalContactInfo {
  id?: string; // Optional ID if it exists
  phone: string | null;
  address: string | null; // Maybe split further if needed (city, country) later
  city: string | null;
  country: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null; // Maps to portfolio in old type
}

/**
 * Represents a skill associated with a developer, including its category and proficiency level.
 */
export interface InternalSkill {
  id: string; // Can be Prisma ID or a temporary ID for new skills
  name: string;
  category: string;
  level: SkillLevel;
}

/**
 * Represents a project within a professional experience entry.
 */
export interface InternalExperienceProject {
  name: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  teamSize: number | null;
  role: string | null;
}

/**
 * Represents a professional experience entry for a developer.
 */
export interface InternalExperience {
  id: string; // Can be Prisma ID or a temporary ID for new entries
  title: string;
  company: string;
  description: string;
  location: string | null;
  startDate: string; // ISO Date string
  endDate: string | null; // ISO Date string
  current: boolean;
  responsibilities: string[];
  achievements: string[];
  teamSize: number | null;
  techStack: string[];
  projects: InternalExperienceProject[];
}

/**
 * Represents an educational background entry for a developer.
 */
export interface InternalEducation {
  id: string; // Can be Prisma ID or a temporary ID for new entries
  degree: string | null;
  institution: string;
  year: string; // Consider converting to number if primarily numeric
  location: string | null;
  startDate: string; // ISO Date string
  endDate: string | null; // ISO Date string
  gpa: number | null;
  honors: string[];
  activities: string[];
}

/**
 * Represents an achievement or certification obtained by a developer.
 */
export interface InternalAchievement {
  id: string; // Can be Prisma ID or a temporary ID for new entries
  title: string;
  description: string;
  date: string; // ISO Date string
  url: string | null;
  issuer: string | null;
}

// --- Types related to Roles/Applications (Might belong in a separate 'roles' or 'applications' feature later) ---

/**
 * Represents a job application made by the developer.
 * Simplified for profile view.
 */
export interface InternalApplication {
  id: string;
  roleId: string;
  roleTitle: string; // Added for clarity
  companyName: string; // Added for clarity
  appliedAt: string; // ISO Date string
  status: ApplicationStatus;
}

/**
 * Represents a role saved by the developer.
 * Simplified for profile view.
 */
export interface InternalSavedRole {
  id: string;
  roleId: string;
  roleTitle: string; // Added for clarity
  companyName: string; // Added for clarity
  savedAt: string; // ISO Date string
  notes: string | null;
  
  // NEW APPLICATION TRACKING FIELDS
  appliedFor: boolean; // Track if user applied to this role
  appliedAt: string | null; // When they marked it as applied (ISO Date string)
  applicationMethod: string | null; // 'easy_apply', 'external', 'manual', 'cover_letter'
  jobPostingUrl: string | null; // Original job posting URL for reference
  applicationNotes: string | null; // User notes about the application
}

/**
 * Represents a custom role created or modified by the developer.
 */
export interface InternalCustomRole {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  salary: string | null;
  type: RoleType;
  remote: boolean;
  visaSponsorship: boolean;
  companyName: string | null;
  url: string | null;
  originalRoleId: string | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}


// --- Main Profile Type ---

/**
 * Represents the comprehensive developer profile used internally within the application,
 * combining developer details, contact info, and related professional data.
 * Decoupled from the raw Prisma model structure.
 */
export interface InternalProfile {
  id: string; // Developer ID
  name: string;
  email: string; // This should likely be the primary account email
  profileEmail: string | null; // Optional separate profile email
  title: string | null;
  about: string | null;

  // Embedded or closely related data
  contactInfo: InternalContactInfo | null;

  // Related lists
  skills: InternalSkill[];
  experience: InternalExperience[];
  education: InternalEducation[];
  achievements: InternalAchievement[];

  // Potentially move these to their respective features later
  applications: InternalApplication[];
  savedRoles: InternalSavedRole[];
  customRoles: InternalCustomRole[];

  // Consider adding calculated fields if needed by the UI, populated by the service/mapper
  // e.g., totalYearsExperience?: number;
}

export const ProfileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Professional title is required'),
  profileEmail: z.string().email().nullable(),
  about: z.string().nullable(),
  contactInfo: z.object({
    id: z.string().optional(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    linkedin: z.string().nullable(),
    github: z.string().nullable(),
    website: z.string().nullable(),
  }).nullable(),
  skills: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    category: z.string(),
    level: z.string()
  })).optional().default([]),
  experience: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    company: z.string(),
    description: z.string(),
    location: z.string().nullable(),
    startDate: z.string(),
    endDate: z.string().nullable(),
    current: z.boolean(),
    responsibilities: z.array(z.string()),
    achievements: z.array(z.string()),
    teamSize: z.number().nullable(),
    techStack: z.array(z.string()),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      teamSize: z.number().nullable(),
      role: z.string().nullable()
    })).optional().default([])
  })).optional().default([]),
  education: z.array(z.object({
    id: z.string().optional(),
    degree: z.string().nullable(),
    institution: z.string(),
    year: z.string(),
    location: z.string().nullable(),
    startDate: z.string(),
    endDate: z.string().nullable(),
    gpa: z.number().nullable(),
    honors: z.array(z.string()),
    activities: z.array(z.string())
  })).optional().default([]),
  achievements: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    date: z.string(),
    url: z.string().nullable(),
    issuer: z.string().nullable()
  })).optional().default([]),
  personalProjects: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    repository: z.string().nullable(),
    liveUrl: z.string().nullable(),
    status: z.string(),
    startDate: z.string(),
    teamSize: z.number().nullable(),
    role: z.string().nullable(),
    highlights: z.array(z.string())
  })).optional().default([]),
  customRoles: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    requirements: z.array(z.string()),
    skills: z.array(z.string()),
    location: z.string().nullable(),
    salary: z.string().nullable(),
    type: z.string(),
    remote: z.boolean(),
    visaSponsorship: z.boolean(),
    companyName: z.string(),
    url: z.string().nullable(),
    originalRoleId: z.string().nullable()
  })).optional().default([])
});

export type ProfileUpdatePayload = z.infer<typeof ProfileUpdateSchema>; 