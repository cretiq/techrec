import { ParsedCvData } from '../../cv-parser/types';
import { AnalyzerFunction, CvSuggestion, CvSuggestionPriority, CvSuggestionCategory } from '../types';

// Placeholder list of weak action verbs (expand significantly)
const WEAK_ACTION_VERBS = [
  'worked on', 'responsible for', 'assisted', 'helped', 'managed', 'handled', 'participated in', 'involved in',
  'tasked with', 'supported'
];

// Regex to detect potential metrics (numbers, %, $)
const METRIC_REGEX = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?%?|\$\d{1,3}(?:,\d{3})*(?:\.\d+)?|% \d{1,3}(?:,\d{3})*(?:\.\d+)?)/;

/**
 * Analyzes parsed CV data for achievement quantification and action verb usage.
 * 
 * Checks for:
 * - Experience points lacking quantifiable metrics.
 * - Use of weak action verbs at the start of bullet points.
 */
export const analyzeImpact: AnalyzerFunction = async (parsedData) => {
  const suggestions: CvSuggestion[] = [];
  console.log('Analyzing impact and quantification...');

  // --- TODO: Implement Impact Analysis Checks ---

  const experienceSections = parsedData.sections.filter(s => 
    s.title?.toLowerCase().includes('experience') || s.title?.toLowerCase().includes('projects')
  );

  for (const section of experienceSections) {
    for (const line of section.content) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check for weak action verbs at the start
      const firstWord = trimmedLine.split(' ')[0]?.toLowerCase();
      if (firstWord && WEAK_ACTION_VERBS.includes(firstWord)) {
        suggestions.push({
          // Need mapping from section.title to CvSectionName
          section: section.title?.toUpperCase() as any || 'EXPERIENCE', // Placeholder
          category: 'IMPACT',
          priority: 'MEDIUM',
          originalText: line,
          reasoning: `Start bullet points with strong, specific action verbs instead of weaker ones like "${firstWord}". Consider verbs like 'Developed', 'Led', 'Implemented', 'Increased', 'Reduced'.`,
        });
      }

      // Check for lack of quantification (basic check)
      // More advanced: check only lines that *look* like achievement descriptions
      if (!METRIC_REGEX.test(trimmedLine)) {
          // Avoid adding quantification suggestions for lines already flagged for weak verbs? Or allow both?
          // For now, allow both. Need refinement.
          // Also, this check is very broad; needs refinement to target actual achievement statements.
          suggestions.push({
            section: section.title?.toUpperCase() as any || 'EXPERIENCE', // Placeholder
            category: 'QUANTIFICATION',
            priority: 'MEDIUM',
            originalText: line,
            reasoning: 'Consider quantifying the impact of this achievement. Use numbers, percentages, or currency values to demonstrate the scale and significance of your contributions (e.g., "Increased X by Y%", "Reduced Z by $A").'
          });
      }
    }
  }

  // --- END TODO ---

  // Deduplicate suggestions? Might add similar suggestions multiple times.

  console.log(`Impact analysis generated ${suggestions.length} suggestions.`);
  return suggestions;
}; 