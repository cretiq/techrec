import { Role, RoleType, Skill, CompanySummary } from '@/types'; // Adjust path as necessary
import { RapidApiJob } from '@/types/rapidapi'; // Adjust path as necessary
import { Developer, DeveloperSkill, ContactInfo } from '@prisma/client';

// Formats the job type enum/string into a user-friendly string
export const formatJobType = (type: RoleType | string | undefined): string => {
  if (!type) return 'Unknown Type';

  switch (type) {
    case RoleType.FULL_TIME:
    case 'Full-time': // Handle common string variations
      return 'Full-time';
    case RoleType.PART_TIME:
    case 'Part-time':
      return 'Part-time';
    case RoleType.CONTRACT:
    case 'Contract':
      return 'Contract';
    case RoleType.INTERNSHIP:
    case 'Internship':
      return 'Internship';
    case RoleType.FREELANCE:
    case 'Freelance':
      return 'Freelance';
    default:
      // Handle potential raw strings if they don't match enum keys or common variations
      if (typeof type === 'string') {
        // Replace underscores and capitalize words for better display
        return type
          .split(/[_\s-]/) // Split by underscore, space, or hyphen
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      } 
      return 'Unknown Type';
  }
};

// Maps a job from the RapidAPI response to the internal Role interface
export const mapRapidApiJobToRole = (apiJob: RapidApiJob): Role => {
  // Helper to format salary
  const formatSalary = (): string => {
    if (!apiJob.salary_raw) return 'Not Specified';
    
    const { minValue, maxValue, unitText } = apiJob.salary_raw.value;
    const currency = apiJob.salary_raw.currency;
    
    if (minValue && maxValue) {
      return `$${minValue.toLocaleString()} - $${maxValue.toLocaleString()} ${currency} ${unitText}`.trim();
    } else if (minValue) {
      return `From $${minValue.toLocaleString()} ${currency} ${unitText}`.trim();
    } else if (maxValue) {
      return `Up to $${maxValue.toLocaleString()} ${currency} ${unitText}`.trim();
    }
    return 'Not Specified';
  };

  // Map skills from LinkedIn specialties as skills
  const mapSkills = (): Skill[] => {
    return (apiJob.linkedin_org_specialties || []).map(skillName => ({
      id: skillName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: skillName,
      // description is not available from this API source
    }));
  };

  // Map company data
  const mapCompany = (): CompanySummary => ({
    id: apiJob.organization_url, // Use organization URL as ID
    name: apiJob.organization,
  });

  // Basic mapping for RoleType
  const mapRoleType = (): RoleType | string => {
    // Since employment_type is now an array, we'll use the first type if available
    const type = apiJob.employment_type[0]?.toUpperCase().replace('-', '_');
    if (type && type in RoleType) {
      return type as RoleType;
    }
    return apiJob.employment_type[0] || 'Unknown Type';
  };

  // Get the primary location string
  const getPrimaryLocation = (): string => {
    if (apiJob.locations_derived && apiJob.locations_derived.length > 0) {
      return apiJob.locations_derived[0];
    }
    return 'Location Not Specified';
  };

  return {
    id: apiJob.id,
    title: apiJob.title,
    description: apiJob.linkedin_org_description || 'No description available.',
    requirements: apiJob.linkedin_org_specialties || [],
    skills: mapSkills(),
    company: mapCompany(),
    location: getPrimaryLocation(),
    salary: formatSalary(),
    type: mapRoleType(),
    remote: apiJob.remote_derived,
    visaSponsorship: false, // Not available in the API response
    url: apiJob.url,
  };
};

interface DeveloperWithRelations extends Omit<Developer, 'createdAt' | 'updatedAt' | 'deletedAt'> {
  contactInfo?: ContactInfo | null;
  developerSkills: (DeveloperSkill & {
    skill: {
      name: string;
      category?: {
        name: string;
      } | null;
    };
  })[];
  about?: string | null;
}

interface MappedDeveloper {
  id: string;
  email: string;
  profileEmail?: string | null;
  name: string;
  title?: string | null;
  about?: string | null;
  phone: string;
  location: string;
  city: string;
  state: string;
  country: string;
  skills: {
    id: string;
    name: string;
    category: string;
    level: string;
  }[];
}

export const mapDeveloperProfile = (developer: DeveloperWithRelations): MappedDeveloper => {
  return {
    ...developer,
    phone: developer.contactInfo?.phone || '',
    location: developer.contactInfo?.address || '',
    city: developer.contactInfo?.city || '',
    state: developer.contactInfo?.state || '',
    country: developer.contactInfo?.country || '',
    about: developer.about || '',
    skills: developer.developerSkills.map(skill => ({
      id: skill.id,
      name: skill.skill.name,
      category: skill.skill.category?.name || 'Other',
      level: skill.level
    }))
  };
}; 