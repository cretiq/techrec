import { RoleType } from '../types'; // Use relative path

// Formats the job type enum/string into a user-friendly string
export const formatJobType = (type: RoleType | string | undefined): string => {
  if (!type) return 'Unknown Type';

  switch (type) {
    case RoleType.FULL_TIME:
      return 'Full-time';
    case RoleType.PART_TIME:
      return 'Part-time';
    case RoleType.CONTRACT:
      return 'Contract';
    case RoleType.INTERNSHIP:
      return 'Internship';
    case RoleType.FREELANCE:
      return 'Freelance';
    default:
      // Handle potential raw strings if they don't match enum keys
      if (typeof type === 'string') {
        // Replace underscores and capitalize words for better display
        return type
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      } 
      return 'Unknown Type';
  }
}; 