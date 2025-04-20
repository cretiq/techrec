// Placeholder for profile feature Zod schemas 
import { z } from 'zod';
import { SkillLevel, RoleType } from '@prisma/client'; // Import enums for validation

// --- Reusable Base Schemas ---

const nullableString = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();
const isoDateString = z.string().datetime({ message: 'Invalid ISO date format' }); // Validates ISO 8601
const nullableIsoDateString = isoDateString.nullable().optional();
const stringArray = z.array(z.string());

// --- Contact Info --- 
const InternalContactInfoSchema = z.object({
  id: z.string().optional(), // Optional ID
  phone: nullableString,
  address: nullableString, // Keep as single field for now
  city: nullableString,
  country: nullableString,
  linkedin: nullableString,
  github: nullableString,
  website: nullableString, // Maps to portfolio
});

// --- Skills --- 
const InternalSkillSchema = z.object({
  id: z.string(), // ID is required for incoming skills (can be temp ID for new ones)
  name: z.string().min(1, { message: 'Skill name cannot be empty' }),
  category: z.string().min(1, { message: 'Skill category cannot be empty' }), // Assuming category name is provided
  level: z.nativeEnum(SkillLevel),
});

// --- Experience --- 
const InternalExperienceSchema = z.object({
  id: z.string(), // ID required
  title: z.string().min(1, { message: 'Experience title cannot be empty' }),
  company: z.string().min(1, { message: 'Company name cannot be empty' }),
  description: z.string(),
  location: nullableString,
  startDate: isoDateString,
  endDate: nullableIsoDateString,
  current: z.boolean(),
  responsibilities: stringArray,
  achievements: stringArray,
  teamSize: nullableNumber,
  techStack: stringArray,
});

// --- Education --- 
const InternalEducationSchema = z.object({
  id: z.string(), // ID required
  degree: nullableString,
  institution: z.string().min(1, { message: 'Institution name cannot be empty' }),
  year: z.string().min(4, { message: 'Year must be valid' }).max(4, { message: 'Year must be valid' }), // Basic validation, refine if needed
  location: nullableString,
  startDate: isoDateString, // Assuming dates are required
  endDate: nullableIsoDateString,
  gpa: nullableNumber,
  honors: stringArray,
  activities: stringArray,
});

// --- Achievement --- 
const InternalAchievementSchema = z.object({
  id: z.string(), // ID required
  title: z.string().min(1, { message: 'Achievement title cannot be empty' }),
  description: z.string(),
  date: isoDateString,
  url: nullableString,
  issuer: nullableString,
});

// --- Custom Role --- 
const InternalCustomRoleSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  requirements: stringArray,
  skills: stringArray,
  location: z.string(),
  salary: nullableString,
  type: z.nativeEnum(RoleType),
  remote: z.boolean(),
  visaSponsorship: z.boolean(),
  companyName: nullableString,
  url: nullableString,
  originalRoleId: nullableString,
  createdAt: isoDateString,
  updatedAt: isoDateString,
});


// --- Main Profile Update Schema ---
// This schema validates the data structure expected by the PUT /api/developer/me/profile endpoint.
// It reflects the InternalProfile type, making fields optional where appropriate for updates.
export const UpdateProfilePayloadSchema = z.object({
  // Base developer fields
  name: z.string().min(1, { message: 'Name cannot be empty' }).optional(),
  profileEmail: z.string().email({ message: 'Invalid email format' }).nullable().optional(),
  title: nullableString,
  about: nullableString,

  // Contact Info (allow null or the full object)
  contactInfo: InternalContactInfoSchema.nullable().optional(),

  // Related lists (validate array structure and item structure)
  // These are often replaced entirely on update in simpler systems,
  // but could be made more granular if needed (e.g., patch operations).
  skills: z.array(InternalSkillSchema).optional(),
  experience: z.array(InternalExperienceSchema).optional(),
  education: z.array(InternalEducationSchema).optional(),
  achievements: z.array(InternalAchievementSchema).optional(),
  
  // Custom roles might be handled separately, but include if updated via main profile endpoint
  customRoles: z.array(InternalCustomRoleSchema).optional(), 
  
  // Note: Applications and SavedRoles are likely read-only views on the profile 
  // and probably shouldn't be part of the update payload.
});

// Infer the TypeScript type from the schema for use in the service/API route
export type UpdateProfilePayload = z.infer<typeof UpdateProfilePayloadSchema>; 