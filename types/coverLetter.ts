import { z } from 'zod';
import { InternalProfile } from './types';

// Request types
export type RequestType = "coverLetter" | "outreach";
export type CoverLetterTone = "formal" | "friendly" | "enthusiastic";

// Word count boundaries for different request types
export const WORD_BOUNDS = {
  coverLetter: { min: 170, max: 250 },
  outreach: { min: 120, max: 150 },
} as const;

// Core interfaces
export interface RoleInfo {
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  // Enhanced fields from RapidAPI
  location?: string;
  url?: string;
  seniority?: string;
  employmentType?: string[];
  remote?: boolean;
  directApply?: boolean;
  // AI-extracted fields
  aiKeySkills?: string[];
  aiCoreResponsibilities?: string;
  aiRequirementsSummary?: string;
  aiBenefits?: string[];
  aiWorkArrangement?: string;
  aiWorkingHours?: number;
  // Recruiter information
  recruiterName?: string;
  recruiterTitle?: string;
  aiHiringManagerName?: string;
}

export interface CompanyInfo {
  name: string;
  location?: string;
  remote?: boolean;
  attractionPoints?: string[];
  // Enhanced company fields from RapidAPI
  industry?: string;
  size?: string;
  headquarters?: string;
  description?: string;
  specialties?: string[];
  employeeCount?: number;
  foundedDate?: string;
  linkedinUrl?: string;
}

export interface JobSourceInfo {
  source?: string;
}

// Enhanced cover letter request data
export interface CoverLetterRequestData {
  developerProfile: InternalProfile;
  roleInfo: RoleInfo;
  companyInfo: CompanyInfo;
  jobSourceInfo?: JobSourceInfo;
  hiringManager?: string;
  achievements?: string[];
  requestType?: RequestType;
  tone?: CoverLetterTone;
  regenerationCount?: number;
}

// Redux state interfaces
export interface CoverLetterData {
  roleId: string;
  letter: string;
  generatedAt: string;
  jobSource?: string;
  companyAttractionPoints: string[];
  // Enhanced fields
  tone?: CoverLetterTone;
  requestType?: RequestType;
  hiringManager?: string;
  provider: 'gemini';
  cached?: boolean;
  fallback?: boolean;
}

export interface CoverLettersState {
  coverLetters: Record<string, CoverLetterData>; // Key is roleId
}

// API Response types
export interface CoverLetterResponse {
  letter: string;
  provider: 'openai' | 'gemini';
  cached?: boolean;
  fallback?: boolean;
}

export interface CoverLetterError {
  error: string;
  code?: string;
  meta?: Record<string, unknown>;
}

// Validation schemas
export const JobSourceInfoSchema = z.object({
  source: z.string().optional(),
});

export const CompanyInfoSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  attractionPoints: z.array(z.string()).optional(),
  // Enhanced company fields
  industry: z.string().optional(),
  size: z.string().optional(),
  headquarters: z.string().optional(),
  description: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  employeeCount: z.number().optional(),
  foundedDate: z.string().optional(),
  linkedinUrl: z.string().optional(),
});

export const RoleInfoSchema = z.object({
  title: z.string().min(1, "Role title is required"),
  description: z.string().min(1, "Role description is required"),
  requirements: z.array(z.string()),
  skills: z.array(z.string()),
  // Enhanced fields
  location: z.string().optional(),
  url: z.string().optional(),
  seniority: z.string().optional(),
  employmentType: z.array(z.string()).optional(),
  remote: z.boolean().optional(),
  directApply: z.boolean().optional(),
  // AI-extracted fields
  aiKeySkills: z.array(z.string()).optional(),
  aiCoreResponsibilities: z.string().optional(),
  aiRequirementsSummary: z.string().optional(),
  aiBenefits: z.array(z.string()).optional(),
  aiWorkArrangement: z.string().optional(),
  aiWorkingHours: z.number().optional(),
  // Recruiter information
  recruiterName: z.string().optional(),
  recruiterTitle: z.string().optional(),
  aiHiringManagerName: z.string().optional(),
});

export const CoverLetterRequestSchema = z.object({
  developerProfile: z.any(), // InternalProfile validation would be complex
  roleInfo: RoleInfoSchema,
  companyInfo: CompanyInfoSchema,
  jobSourceInfo: JobSourceInfoSchema.optional(),
  hiringManager: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  requestType: z.enum(["coverLetter", "outreach"]).optional(),
  tone: z.enum(["formal", "friendly", "enthusiastic"]).optional(),
  regenerationCount: z.number().optional(),
});

// Type guards
export function isValidTone(tone: string): tone is CoverLetterTone {
  return ['formal', 'friendly', 'enthusiastic'].includes(tone);
}

export function isValidRequestType(type: string): type is RequestType {
  return ['coverLetter', 'outreach'].includes(type);
}

// Utility types
export type CoverLetterGenerationOptions = {
  temperature?: number;
  maxTokens?: number;
  topK?: number;
  topP?: number;
};

export type CoverLetterCache = {
  key: string;
  letter: string;
  expiresAt: number;
  provider: 'openai' | 'gemini';
};

// Export validation helper
export function validateCoverLetterRequest(data: unknown): CoverLetterRequestData {
  return CoverLetterRequestSchema.parse(data);
}

// Error classes for better error handling
export class CoverLetterError extends Error {
  constructor(
    message: string,
    public code: string,
    public meta: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'CoverLetterError';
  }
}

export class CoverLetterValidationError extends CoverLetterError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, 'VALIDATION_ERROR', meta);
    this.name = 'CoverLetterValidationError';
  }
}

export class CoverLetterGenerationError extends CoverLetterError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, 'GENERATION_ERROR', meta);
    this.name = 'CoverLetterGenerationError';
  }
}