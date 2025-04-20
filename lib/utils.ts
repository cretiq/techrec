import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateSafe = (date: Date | string | null): string => {
  if (!date) return 'Present';
  
  try {
    // If date is a string, convert it to a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('formatDateSafe received invalid date:', date);
      return 'Invalid date';
    }
    
    // Format as Month Year (e.g., "Jan 2023")
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

