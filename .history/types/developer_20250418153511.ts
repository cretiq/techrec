export interface DeveloperProfile {
  name: string
  email: string
  phone: string
  location: string
  linkedin?: string
  github?: string
  portfolio?: string
  achievements: {
    id: string
    title: string
    description: string
    date: string
    url?: string
    issuer?: string
  }[]
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
