import { z } from 'zod';
import { AnalysisStatus } from '@prisma/client'; // Import only AnalysisStatus

// New type for validation warnings
export interface ValidationWarning {
  path: string[];
  message: string;
  suggestedFix?: string;
  originalValue?: any;
}

export interface ValidationResult<T> {
  data: T;
  warnings: ValidationWarning[];
  hasWarnings: boolean;
}

// --- Zod Schemas for Validation ---

// Schema for basic contact info within analysis data
export const ContactInfoSchema = z.object({
  name: z.string().min(1, "Name is required").nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
});

// Define skill level enum
export const SkillLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT"
} as const;

// Schema for a single skill
export const SkillSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  category: z.string().optional(),
  level: z.enum([
    SkillLevel.BEGINNER,
    SkillLevel.INTERMEDIATE,
    SkillLevel.ADVANCED,
    SkillLevel.EXPERT
  ]).optional(),
});

// Schema for a single experience item
export const ExperienceItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  responsibilities: z.array(z.string()).nullable().optional(),
  isNew: z.boolean().optional(),
});

// Schema for a single education item
export const EducationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().optional(),
  degree: z.string().nullable().optional(),
  year: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isNew: z.boolean().optional(),
});

// Schema for a single achievement item
export const AchievementSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  issuer: z.string().nullable().optional(),
});

// Helper function to validate with warnings and required field checks
export const validateWithWarnings = <T>(
  schema: z.ZodType<T>,
  data: any,
  options?: {
    checkDates?: boolean;
    checkUrls?: boolean;
    checkEmail?: boolean;
    requiredFields?: { [key: string]: string };
  }
): ValidationResult<T> => {
  const warnings: ValidationWarning[] = [];
  
  // Basic schema validation
  const result = schema.safeParse(data);
  if (!result.success) {
    result.error.errors.forEach(error => {
      warnings.push({
        path: error.path.map(p => String(p)),
        message: error.message,
        originalValue: error.path.reduce((obj, key) => obj?.[key], data)
      });
    });
  }

  // Additional validation checks if data passed basic validation
  if (result.success && options) {
    const validateData = (obj: any, path: string[] = []) => {
      // Check required fields
      if (options.requiredFields) {
        Object.entries(options.requiredFields).forEach(([fieldPath, message]) => {
          const pathParts = fieldPath.split('.');
          const value = pathParts.reduce((o, key) => o?.[key], obj);
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            warnings.push({
              path: [...path, ...pathParts],
              message,
              originalValue: value
            });
          }
        });
      }

      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = [...path, key];
        
        if (options.checkEmail && key === 'email' && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            warnings.push({
              path: currentPath,
              message: 'Invalid email format',
              originalValue: value,
              suggestedFix: value.replace(/\s+/g, '_')
            });
          }
        }

        if (options.checkUrls && ['linkedin', 'github', 'website', 'url'].includes(key) && typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            warnings.push({
              path: currentPath,
              message: 'Invalid URL format',
              originalValue: value
            });
          }
        }

        if (options.checkDates && ['startDate', 'endDate', 'date'].includes(key) && typeof value === 'string') {
          const dateRegex = /^\d{4}-\d{2}(-\d{2})?$/;
          if (!dateRegex.test(value)) {
            warnings.push({
              path: currentPath,
              message: 'Invalid date format (should be YYYY-MM or YYYY-MM-DD)',
              originalValue: value
            });
          }
        }

        if (value && typeof value === 'object') {
          validateData(value, currentPath);
        }
      });
    };

    validateData(data);
  }

  return {
    data: result.success ? result.data : data,
    warnings,
    hasWarnings: warnings.length > 0
  };
};

// Schema for the entire analysis result data structure
export const CvAnalysisDataSchema = z.object({
  contactInfo: ContactInfoSchema.nullable().optional(),
  about: z.string().nullable().optional(),
  skills: z.array(SkillSchema).nullable().optional(),
  experience: z.array(ExperienceItemSchema).nullable().optional(),
  education: z.array(EducationItemSchema).nullable().optional(),
  achievements: z.array(AchievementSchema).nullable().optional(),
  
  // Add the nested CV relation for extracted text
  cv: z.object({
    extractedText: z.string().nullable().optional()
  }).nullable().optional()
});

// Schema for the request body of PUT /api/cv-analysis/[id]
export const UpdateCvAnalysisSchema = CvAnalysisDataSchema;

// Schema for the request body of POST /api/cv-improvement or /api/cv-improvement-gemini
export const CvImprovementRequestSchema = CvAnalysisDataSchema;

// Schema for the response of POST /api/cv-improvement or /api/cv-improvement-gemini
export const CvImprovementResponseSchema = z.object({
    suggestions: z.array(
        z.object({
            section: z.string(),
            originalText: z.string().nullable().optional(),
            suggestionType: z.enum(["wording", "add_content", "remove_content", "reorder", "format"]),
            suggestedText: z.string().nullable().optional(),
            reasoning: z.string(),
        })
    ),
    fromCache: z.boolean().optional(),
});

// Schema for the request body of POST /api/cv-analysis/export
export const CvExportRequestSchema = z.object({
  analysisData: CvAnalysisDataSchema,
  originalFormat: z.string().min(1, "Original format is required"),
});

// Schema for query parameters of GET /api/cv
export const CvListFilterSchema = z.object({
    search: z.string().optional(),
    status: z.nativeEnum(AnalysisStatus).optional(),
});

// --- TypeScript Interfaces/Types derived from Zod Schemas ---
export type ContactInfoData = z.infer<typeof ContactInfoSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type AchievementItem = z.infer<typeof AchievementSchema>;
export type CvAnalysisData = z.infer<typeof CvAnalysisDataSchema>;
export type CvListFilters = z.infer<typeof CvListFilterSchema>;
export type CvImprovementSuggestion = z.infer<typeof CvImprovementResponseSchema>['suggestions'][number];

// --- Enum for shared status (if not using Prisma directly) ---
// export { CvStatus, AnalysisStatus }; // Re-export if needed elsewhere 