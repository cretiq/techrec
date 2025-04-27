import { ParsedCvData } from '../../cv-parser/types';
import { AnalyzerFunction, CvSuggestion, CvSuggestionPriority, CvSuggestionCategory, CvSectionName } from '../types';

/**
 * Analyzes parsed CV data for formatting consistency issues.
 *
 * Checks for:
 * - Inconsistent bullet point styles (placeholder)
 * - Variations in spacing or font usage (requires more advanced parsing or metadata)
 */
export const analyzeFormatting: AnalyzerFunction = async (parsedData) => {
  const suggestions: CvSuggestion[] = [];

  console.log('Analyzing formatting consistency...');

  // --- TODO: Implement Formatting Checks ---

  // Placeholder: Check for inconsistent bullet points within sections
  // Would need to analyze line starts within each section's content
  // Example Check (very basic):
  // for (const section of parsedData.sections) {
  //   const bulletChars = new Set<string>();
  //   let hasBullets = false;
  //   for (const line of section.content) {
  //     const match = line.match(/^\s*([*\-\u2022])\s+/); // Basic bullet check
  //     if (match) {
  //       hasBullets = true;
  //       bulletChars.add(match[1]);
  //     }
  //   }
  //   if (hasBullets && bulletChars.size > 1) {
  //     suggestions.push({
  //       section: section.title ? section.title.toUpperCase() as CvSectionName : 'GENERAL', // Needs mapping
  //       category: 'FORMATTING',
  //       priority: 'LOW',
  //       reasoning: `Inconsistent bullet point styles (${Array.from(bulletChars).join(', ')}) found in the '${section.title || 'Unnamed'}' section. Using a single, consistent bullet style improves readability.`,
  //     });
  //   }
  // }

  // Placeholder: Check for font consistency (requires font info from parser, not just text)

  // Placeholder: Check for spacing issues (e.g., double spaces, inconsistent line breaks)

  // --- END TODO ---

  if (suggestions.length === 0) {
      console.log('No major formatting inconsistencies detected (based on current checks).');
  } else {
      console.log(`Formatting analysis generated ${suggestions.length} suggestions.`);
  }
  
  return suggestions;
}; 