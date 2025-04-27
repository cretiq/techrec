import { ParsedCvData } from '../../cv-parser/types';
import { AnalyzerFunction, CvSuggestion, CvSuggestionPriority, CvSuggestionCategory } from '../types';

// Placeholder list of generic phrases to detect
const GENERIC_PHRASES = [
  'responsible for',
  'duties included',
  'worked on',
  'involved in',
  'assisted with',
  'team player',
  'hard worker',
  'results-oriented',
  'detail-oriented' // Often better to show, not tell
];

/**
 * Analyzes parsed CV data for content quality and job-specific tailoring.
 * 
 * Checks for:
 * - Use of generic phrases instead of specific actions/results.
 * - Basic keyword presence (requires target keywords)
 * - Alignment with job requirements (placeholder)
 */
export const analyzeContent: AnalyzerFunction = async (parsedData/*, targetJobKeywords: string[] = []*/) => {
  const suggestions: CvSuggestion[] = [];
  console.log('Analyzing content quality and tailoring...');

  // --- TODO: Implement Content Analysis Checks ---

  // Check for generic phrases in Experience sections
  const experienceSections = parsedData.sections.filter(s => s.title?.toLowerCase().includes('experience'));
  for (const section of experienceSections) {
    for (const line of section.content) {
      for (const phrase of GENERIC_PHRASES) {
        if (line.toLowerCase().includes(phrase)) {
          suggestions.push({
            // Need a robust way to map section.title to CvSectionName
            section: 'EXPERIENCE', // Placeholder mapping
            category: 'CLARITY', // Or IMPACT?
            priority: 'MEDIUM',
            originalText: line,
            reasoning: `Avoid generic phrases like "${phrase}". Instead, use strong action verbs to describe your specific accomplishments and quantify results where possible.`,
          });
          // Avoid adding multiple suggestions for the same line if it contains multiple generic phrases
          break; 
        }
      }
    }
  }

  // Placeholder: Keyword analysis against targetJobKeywords
  // const fullTextLower = parsedData.fullText.toLowerCase();
  // for (const keyword of targetJobKeywords) {
  //   if (!fullTextLower.includes(keyword.toLowerCase())) {
  //     suggestions.push({...
  //       reasoning: `Consider incorporating the keyword "${keyword}" relevant to the target role.`
  //     });
  //   }
  // }

  // Placeholder: Analyze alignment with specific job requirements (needs JD input)

  // --- END TODO ---

  console.log(`Content analysis generated ${suggestions.length} suggestions.`);
  return suggestions;
}; 