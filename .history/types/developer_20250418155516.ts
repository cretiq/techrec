export interface DeveloperProfile {
  name: string
  email: string
  phone: string
  location: string
  linkedin?: string
  github?: string
  portfolio?: string
  skills: Skill[]
  achievements: Achievement[]
  experience: Experience[]
  education: Education[]
  applications: Application[]
  savedRoles: SavedRole[]
  totalExperience?: string
}

export interface Skill {
  id: string
  name: string
  category: string
  level: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  date: string
  url?: string
  issuer?: string
}

export interface Experience {
  id: string
  title: string
  company: string
  description: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  responsibilities: string[]
  achievements: string[]
}

export interface Education {
  degree: string
  institution: string
  year: string
  location: string
  startDate: string
  endDate: string
  gpa: number
  honors: string[]
  activities: string[]
}

export interface Application {
  id: string
  title: string
  description: string
  date: string
}

export interface SavedRole {
  id: string
  title: string
  description: string
  date: string
}