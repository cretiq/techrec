export const formatDateSafe = (date: Date | string | null): string => {
  if (!date) return 'Present';
  
  try {
    // If date is a string, convert it to a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}; 