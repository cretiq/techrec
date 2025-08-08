import { z } from 'zod';

// Contact Info Schema
export const contactInfoSchema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  linkedin: z.string().url().nullable().optional(),
  github: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  portfolio: z.string().url().nullable().optional()
}).strict();

// Skill Schema
export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
  category: z.string().optional(),
  years: z.number().min(0).optional()
}).strict();

// Experience Schema
export const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  responsibilities: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
  technologies: z.array(z.string()).optional().default([]),
  isCurrentPosition: z.boolean().optional().default(false)
}).strict();

// Education Schema
export const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().nullable().optional(),
  field: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  gpa: z.string().nullable().optional(),
  honors: z.array(z.string()).optional().default([]),
  relevantCoursework: z.array(z.string()).optional().default([])
}).strict();

// Personal Project Schema
export const personalProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().nullable().optional(),
  technologies: z.array(z.string()).optional().default([]),
  url: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(['Active', 'Completed', 'On Hold', 'Cancelled']).optional(),
  highlights: z.array(z.string()).optional().default([])
}).strict();

// CV Metadata Schema
export const cvMetadataSchema = z.object({
  extractedText: z.string().optional(),
  originalFilename: z.string().optional(),
  uploadDate: z.string().optional(),
  fileSize: z.number().optional(),
  pageCount: z.number().optional()
}).strict();

// Analysis Result Schema (the main data structure)
export const analysisResultSchema = z.object({
  id: z.string().optional(), // Allow id field in the data structure
  contactInfo: contactInfoSchema.nullable().optional(),
  about: z.string().nullable().optional(),
  skills: z.array(skillSchema).optional().default([]),
  experience: z.array(experienceSchema).optional().default([]),
  education: z.array(educationSchema).optional().default([]),
  personalProjects: z.array(personalProjectSchema).optional().default([]),
  cv: cvMetadataSchema.optional(),
  // Computed fields
  totalYearsExperience: z.number().min(0).optional(),
  isJuniorDeveloper: z.boolean().optional(),
  improvementScore: z.number().min(0).max(100).optional()
}).strict();

// Full Profile Analysis Data Schema
export const profileAnalysisDataSchema = z.object({
  id: z.string().min(1, "Analysis ID is required"),
  analysisResult: analysisResultSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().min(1).optional().default(1),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional()
}).strict();

// Type exports for use in components
export type ContactInfoData = z.infer<typeof contactInfoSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type PersonalProjectData = z.infer<typeof personalProjectSchema>;
export type CVMetadata = z.infer<typeof cvMetadataSchema>;
export type AnalysisResultData = z.infer<typeof analysisResultSchema>;
export type ProfileAnalysisData = z.infer<typeof profileAnalysisDataSchema>;

// Validation helper functions
export const validateContactInfo = (data: unknown): ContactInfoData => {
  return contactInfoSchema.parse(data);
};

export const validateAnalysisResult = (data: unknown): AnalysisResultData => {
  return analysisResultSchema.parse(data);
};

export const validateProfileAnalysisData = (data: unknown): ProfileAnalysisData => {
  return profileAnalysisDataSchema.parse(data);
};

// Safe validation functions that return validation results
export const safeValidateContactInfo = (data: unknown) => {
  return contactInfoSchema.safeParse(data);
};

export const safeValidateAnalysisResult = (data: unknown) => {
  return analysisResultSchema.safeParse(data);
};

export const safeValidateProfileAnalysisData = (data: unknown) => {
  return profileAnalysisDataSchema.safeParse(data);
};

// Partial validation for form updates
export const partialContactInfoSchema = contactInfoSchema.partial();
export const partialAnalysisResultSchema = analysisResultSchema.partial().deepPartial();

// Validation functions for partial updates
export const validatePartialContactInfo = (data: unknown) => {
  return partialContactInfoSchema.parse(data);
};

export const validatePartialAnalysisResult = (data: unknown) => {
  return partialAnalysisResultSchema.parse(data);
};