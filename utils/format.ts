export const formatJobType = (type: string): string => {
  switch (type) {
    case 'FULL_TIME':
      return 'Full Time'
    case 'PART_TIME':
      return 'Part Time'
    case 'CONTRACT':
      return 'Contract'
    case 'INTERNSHIP':
      return 'Internship'
    case 'FREELANCE':
      return 'Freelance'
    default:
      return type
  }
} 