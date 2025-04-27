import { ParsedCvData } from '../cv-parser/types';
import { CvSuggestion, AnalyzerFunction } from './types';
import { analyzeAts } from './analyzers/ats';
import { analyzeFormatting } from './analyzers/formatting';
import { analyzeContent } from './analyzers/content';
import { analyzeImpact } from './analyzers/impact';
// Import other analyzers here as they are created
// import { analyzeClarity } from './analyzers/clarity';
// import { analyzeOrganization } from './analyzers/organization';

// List of all analyzer functions to run
const ALL_ANALYZERS: AnalyzerFunction[] = [
  analyzeAts,
  analyzeFormatting,
  analyzeContent,
  analyzeImpact,
  // Add other analyzers here
  // analyzeClarity,
  // analyzeOrganization,
];

/**
 * Orchestrates the CV analysis process by running all registered analyzers.
 *
 * @param parsedData The structured CV data obtained from the parser.
 * @returns A promise that resolves with an aggregated array of all suggestions.
 */
export async function analyzeCv(parsedData: ParsedCvData): Promise<CvSuggestion[]> {
  console.log('Starting CV analysis orchestration...');
  let allSuggestions: CvSuggestion[] = [];

  // Run all analyzers in parallel (or sequentially if dependencies exist)
  const analysisPromises = ALL_ANALYZERS.map(analyzer => analyzer(parsedData));

  try {
    const results = await Promise.all(analysisPromises);
    // Flatten the array of arrays into a single suggestions array
    allSuggestions = results.flat();
    console.log(`CV analysis complete. Total suggestions: ${allSuggestions.length}`);
  } catch (error) {
    console.error('Error during CV analysis orchestration:', error);
    // Decide on error handling: re-throw, return partial results, or return empty?
    // For now, let's return an empty array and log the error.
    // Consider adding a specific suggestion indicating analysis failure.
    allSuggestions = []; 
  }

  // --- TODO: Add post-processing steps --- 
  // - Prioritize suggestions
  // - Generate overall assessment scores and summaries (requires separate logic)
  // - Ensure final output matches the ai_analysis_specification.md format fully
  // --- END TODO ---

  return allSuggestions; 
} 