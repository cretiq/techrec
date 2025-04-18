import { DeveloperProfile } from './developer'

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  INTERVIEWED = 'INTERVIEWED',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum ProjectStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export interface PrismaDeveloper {
  id: string
  email: string
  profileEmail?: string | null
  name: string
  title?: string | null
  about?: string | null
  isDeleted: boolean
  deletedAt?: Date | null
  contactInfo?: PrismaContactInfo | null
  developerSkills: PrismaDeveloperSkill[]
  experience: PrismaExperience[]
  education: PrismaEducation[]
  achievements: PrismaAchievement[]
  projects: PrismaProject[]
  applications: PrismaApplication[]
  savedRoles: PrismaSavedRole[]
  createdAt: Date
  updatedAt: Date
}

export interface PrismaContactInfo {
  id: string
  developerId: string
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  linkedin?: string | null
  github?: string | null
  website?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PrismaSkillCategory {
  id: string
  name: string
  description?: string | null
  skills: PrismaSkill[]
  createdAt: Date
  updatedAt: Date
}

export interface PrismaSkill {
  id: string
  name: string
  categoryId: string
  description?: string | null
  category: PrismaSkillCategory
  developerSkills: PrismaDeveloperSkill[]
  createdAt: Date
  updatedAt: Date
}

export interface PrismaDeveloperSkill {
  id: string
  developerId: string
  skillId: string
  level: SkillLevel
  developer: PrismaDeveloper
  skill: PrismaSkill
  createdAt: Date
  updatedAt: Date
}

export interface PrismaExperience {
  id: string
  title: string
  company: string
  description: string
  location?: string | null
  startDate: Date
  endDate?: Date | null
  current: boolean
  responsibilities: string[]
  achievements: string[]
  teamSize?: number | null
  techStack: string[]
  developerId: string
  developer: PrismaDeveloper
  createdAt: Date
  updatedAt: Date
}

export interface PrismaEducation {
  id: string
  degree?: string | null
  institution: string
  year: string
  location?: string | null
  startDate: Date
  endDate?: Date | null
  gpa?: number | null
  honors: string[]
  activities: string[]
  developerId: string
  developer: PrismaDeveloper
  createdAt: Date
  updatedAt: Date
}

export interface PrismaProject {
  id: string
  name: string
  description?: string | null
  technologies: string[]
  url?: string | null
  status: ProjectStatus
  startDate: Date
  endDate?: Date | null
  repository?: string | null
  liveUrl?: string | null
  teamSize?: number | null
  role?: string | null
  highlights: string[]
  developerId: string
  developer: PrismaDeveloper
  createdAt: Date
  updatedAt: Date
}

export interface PrismaApplication {
  id: string
  status: ApplicationStatus
  appliedAt: Date
  coverLetter?: string | null
  resumeUrl?: string | null
  developerId: string
  roleId: string
  developer: PrismaDeveloper
  createdAt: Date
  updatedAt: Date
}

export interface PrismaSavedRole {
  id: string
  roleId: string
  notes?: string | null
  developerId: string
  developer: PrismaDeveloper
  createdAt: Date
  updatedAt: Date
}

export interface PrismaAchievement {
  id: string
  title: string
  description: string
  date: Date
  url?: string | null
  issuer?: string | null
  developerId: string
  developer: PrismaDeveloper
  createdAt: Date
  updatedAt: Date
} 