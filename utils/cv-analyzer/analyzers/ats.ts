import { AnalyzerFunction, CvSuggestion } from '@/utils/cv-analyzer';

/**
 * Analyzes parsed CV data for ATS compatibility issues.
 * 
 * Checks for:
 * - Missing standard sections (Summary, Experience, Education, Skills)
 * - Potentially problematic formatting elements (heuristics based on text patterns)
 * - Keyword density (placeholder for future implementation)
 */
export const analyzeAts: AnalyzerFunction = async (parsedData) => {
  const suggestions: CvSuggestion[] = [];
  const sectionTitles = parsedData.sections.map(s => s.title?.toLowerCase());

  console.log('Analyzing ATS compatibility...');

  // Check for missing standard sections
  const requiredSections = ['summary', 'experience', 'education', 'skills'];
  for (const required of requiredSections) {
    if (!sectionTitles.some(title => title?.includes(required))) {
      suggestions.push({
        section: 'GENERAL', // Or maybe ATS_OPTIMIZATION?
        category: 'COMPLETENESS', 
        priority: 'HIGH',
        reasoning: `Consider adding a standard '${required.charAt(0).toUpperCase() + required.slice(1)}' section. ATS systems often rely on standardized section headers to correctly parse CV information.`,
        // improvement_metrics: { ats_score: -10 } // Example scoring idea
      });
    }
  }

  // Placeholder: Check for problematic formatting (e.g., overuse of special chars, tables inferred from text)
  // This requires more advanced text analysis

  // Placeholder: Keyword analysis (requires target job description or industry keywords)

  console.log(`ATS analysis generated ${suggestions.length} suggestions.`);
  return suggestions;
}; 