import { useSelector } from 'react-redux';
import { selectRecentlyUpdatedPaths } from '@/lib/features/analysisSlice';

/**
 * Hook to check if a field path was recently updated from an accepted suggestion
 * @param path - The field path to check (e.g., 'about', 'contactInfo.email', 'experience[0].title')
 * @returns boolean indicating if the field should be highlighted green
 */
export function useIsRecentlyUpdated(path: string): boolean {
  const recentlyUpdatedPaths = useSelector(selectRecentlyUpdatedPaths);
  return recentlyUpdatedPaths.includes(path);
}

/**
 * Get CSS classes for highlighting recently updated fields
 * @param path - The field path to check
 * @returns CSS class string for green highlighting if recently updated
 */
export function useHighlightClasses(path: string): string {
  const isRecentlyUpdated = useIsRecentlyUpdated(path);
  
  if (isRecentlyUpdated) {
    return 'bg-green-100 border-green-300 shadow-green-200/50 shadow-lg transition-all duration-1000 animate-pulse';
  }
  
  return '';
}

/**
 * Get inline style for highlighting recently updated fields
 * @param path - The field path to check
 * @returns Inline style object for green highlighting if recently updated
 */
export function useHighlightStyle(path: string): React.CSSProperties {
  const isRecentlyUpdated = useIsRecentlyUpdated(path);
  
  if (isRecentlyUpdated) {
    return {
      backgroundColor: 'rgba(34, 197, 94, 0.1)', // green-500 with opacity
      borderColor: 'rgba(34, 197, 94, 0.3)',
      boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)',
      transition: 'all 1s ease-out'
    };
  }
  
  return {};
}