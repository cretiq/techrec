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
  }[]
  totalExperience?: string
  skills: string[]
}