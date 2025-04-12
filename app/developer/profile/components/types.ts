export interface SkillCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string | null;
}

export interface DeveloperSkill {
  id: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  skill: Skill;
  developerId: string;
}

export interface Profile {
  id: string;
  name: string;
  title: string | null;
  about: string | null;
  email: string;
  profileEmail: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  contactInfo: {
    id: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
  } | null;
  developerSkills: DeveloperSkill[];
  experience: {
    id: string;
    title: string;
    company: string;
    description: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    responsibilities: string[];
    achievements: string[];
    teamSize: number | null;
    techStack: string[];
  }[];
  education: {
    id: string;
    degree: string | null;
    institution: string;
    year: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    gpa: number | null;
    honors: string[];
    activities: string[];
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    date: Date;
    url: string | null;
    issuer: string | null;
  }[];
  projects: {
    id: string;
    name: string;
    description: string | null;
    technologies: string[];
    url: string | null;
    status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
    startDate: Date;
    endDate: Date | null;
    repository: string | null;
    liveUrl: string | null;
    teamSize: number | null;
    role: string | null;
    highlights: string[];
  }[];
  assessments: {
    id: string;
    title: string;
    type: "TECHNICAL" | "BEHAVIORAL" | "LANGUAGE" | "CODING_CHALLENGE";
    status: string;
    score: number | null;
    completedAt: Date | null;
    timeSpent: number | null;
    maxTime: number | null;
    validUntil: Date | null;
    attempts: number;
    maxAttempts: number;
    metadata: any | null;
  }[];
  applications: {
    id: string;
    role: {
      id: string;
      title: string;
      company: {
        id: string;
        name: string;
      };
    };
    status: "PENDING" | "REVIEWING" | "INTERVIEWED" | "OFFERED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
    appliedAt: Date;
    coverLetter: string | null;
    resumeUrl: string | null;
    interviews: {
      id: string;
      type: string;
      scheduledAt: Date;
      duration: number;
      notes: string | null;
      feedback: string | null;
      status: string;
    }[];
  }[];
  savedRoles: {
    id: string;
    role: {
      id: string;
      title: string;
      company: {
        id: string;
        name: string;
      };
    };
    notes: string | null;
  }[];
  customRoles: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    location: string;
    salary: string;
    type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
    remote: boolean;
  }[];
} 