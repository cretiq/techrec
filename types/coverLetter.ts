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
}

export interface CompanyInfo {
  name: string;
  location?: string;
  remote?: boolean;
  attractionPoints?: string[];
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
});

export const RoleInfoSchema = z.object({
  title: z.string().min(1, "Role title is required"),
  description: z.string().min(1, "Role description is required"),
  requirements: z.array(z.string()),
  skills: z.array(z.string()),
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