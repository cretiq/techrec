export interface DeveloperProfile {
  name: string
  email: string
  phone: string | null // Mapped from ContactInfo
  location: string | null // Mapped from ContactInfo address
  linkedin?: string | null // Mapped from ContactInfo
  github?: string | null // Mapped from ContactInfo
  portfolio?: string | null // Mapped from ContactInfo website
  skills: Skill[]
  achievements: Achievement[]
  experience: Experience[]
  education: Education[]
  applications: Application[]
  savedRoles: SavedRole[]
  customRoles: CustomRole[] // Added missing field
  totalExperience?: string // This seems calculated, keep as is for now
}

export interface CustomRole {
  id: string
  title: string
  description: string
  requirements: string[]
  skills: string[] // Note: Prisma model has skills: String[], matching this
  location: string
  salary?: string | null
  type: string // RoleType enum as string
  remote: boolean
  visaSponsorship: boolean
  companyName?: string | null
  url?: string | null
  originalRoleId?: string | null
  createdAt: string // DateTime as string
  updatedAt: string // DateTime as string
}

// Represents the mapped DeveloperSkill structure used in API response
export interface Skill {
  id: string
  name: string
  category: string // category name from related SkillCategory
  level: string // SkillLevel enum as string
}

export interface Achievement {
  id: string
  title: string
  description: string
  date: string // DateTime as string
  url?: string | null
  issuer?: string | null
}

export interface Experience {
  id: string
  title: string
  company: string
  description: string
  location?: string | null // Made optional
  startDate: string // DateTime as string
  endDate?: string | null // Made optional
  current: boolean
  responsibilities: string[]
  achievements: string[]
  teamSize?: number | null // Made optional Int?
  techStack: string[]
}

export interface Education {
  id: string // Added missing id
  degree?: string | null // Made optional
  institution: string
  year: string // Kept as string, matches Prisma
  location?: string | null // Made optional
  startDate: string // DateTime as string
  endDate?: string | null // Made optional
  gpa?: number | null // Made optional Float?
  honors: string[]
  activities: string[]
}

// Represents the mapped Application structure used in API response
export interface Application {
  id: string
  roleId: string // Added from Prisma
  title: string // This likely maps to Role.title, but API uses roleId currently
  description: string // Mapped from coverLetter
  date: string // Mapped from appliedAt
  status: string // ApplicationStatus enum as string - Added from Prisma
}

// Represents the mapped SavedRole structure used in API response
export interface SavedRole {
  id: string
  roleId: string // Added from Prisma
  title: string // This likely maps to Role.title, but API uses roleId currently
  description: string // Mapped from notes
  date: string // Mapped from createdAt
  notes?: string | null // Added from Prisma
}

// Example: Add Prisma enums if needed directly (though using string is often simpler for API transfer)
// export type SkillLevelType = SkillLevel;
// export type ApplicationStatusType = ApplicationStatus;
// export type RoleTypeType = RoleType;