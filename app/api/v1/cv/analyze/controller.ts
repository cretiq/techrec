import { analyzeCv } from '@/utils/cv-analyzer';
import { ParsedCvData } from '@/utils/cv-parser/types';
import { CvSuggestion } from '@/utils/cv-analyzer/types';

// Placeholder for AI client/SDK import
// import { getAiCvAnalysis } from '../../../../modules/ai-client'; 

// Define the structure expected in the request body
interface AnalyzeRequestBody {
  cv_text: string;
  // Add other potential fields, e.g., target_job_description?
}

// Define the final response structure matching ai_analysis_specification.md
// Note: This duplicates CvSuggestion slightly, maybe refactor later
interface OverallAssessment {
  ats_compatibility_score: number;
  impact_clarity_score: number;
  technical_depth_score: number;
  organization_score: number;
  key_strengths: string[];
  priority_improvements: string[];
}

interface AnalysisResponse {
  suggestions: CvSuggestion[];
  overall_assessment: OverallAssessment;
}

/**
 * Handles the core logic for a CV analysis request.
 *
 * 1. Validates input.
 * 2. Parses the CV text (Currently only extracts text, no structure yet).
 * 3. Runs rule-based analyzers.
 * 4. Calls the AI for analysis using the documented prompt.
 * 5. Combines rule-based and AI suggestions.
 * 6. Generates the overall assessment.
 * 7. Formats the final response.
 *
 * @param body The request body containing cv_text.
 * @returns The structured analysis response.
 */
export async function handleCvAnalysisRequest(body: any): Promise<AnalysisResponse> {
  console.log('Handling CV analysis request in controller...');
  const { cv_text } = body as AnalyzeRequestBody;

  if (!cv_text) {
    console.error('Missing cv_text in request body');
    throw new Error('Missing cv_text'); // Caught by route handler
  }

  // --- 1. Parse CV Text (Placeholder: Using basic text extraction) ---
  // In a real scenario, we'd need the file buffer and mime type from the request.
  // For now, we assume the input *is* the raw text.
  // We also skip the parser module for now and directly use the text.
  console.log('Skipping parser module for now, using raw cv_text.');
  // TODO: Integrate actual cv-parser module later when file upload is handled.
  // const parsedData: ParsedCvData = await parseCv(Buffer.from(cv_text), 'text/plain'); // Example
  const mockParsedData: ParsedCvData = { 
      fullText: cv_text, 
      sections: [{ title: null, content: cv_text.split('\n') }] // Very basic structure
  };
  // --- END Parse --- 

  // --- 2. Run Rule-Based Analyzers --- 
  console.log('Running rule-based analyzers...');
  const ruleBasedSuggestions = await analyzeCv(mockParsedData);
  console.log(`Rule-based analyzers found ${ruleBasedSuggestions.length} suggestions.`);
  // --- END Rule-Based --- 

  // --- 3. Call AI for Analysis --- 
  console.log('Calling AI for analysis...');
  let aiSuggestions: CvSuggestion[] = [];
  let aiAssessment: Partial<OverallAssessment> = {}; // Use Partial for flexibility
  
  try {
    // Placeholder: This function needs to be implemented
    // It should use the system prompt from the documentation
    // and parse the specific JSON structure expected.
    // const aiResponse = await getAiCvAnalysis(mockParsedData.fullText);
    
    // --- MOCK AI RESPONSE --- 
    const mockAiResponse = {
        suggestions: [
            { section: 'EXPERIENCE', category: 'QUANTIFICATION', priority: 'HIGH', reasoning: '[AI] Consider quantifying the result in the project description.', originalText: 'Led a team project.' }
        ],
        overall_assessment: {
            ats_compatibility_score: 75,
            impact_clarity_score: 60,
            technical_depth_score: 70,
            organization_score: 80,
            key_strengths: ['[AI] Good project variety'],
            priority_improvements: ['[AI] Quantify achievements']
        }
    };
    aiSuggestions = mockAiResponse.suggestions as CvSuggestion[];
    aiAssessment = mockAiResponse.overall_assessment;
    console.log(`AI analysis successful. Found ${aiSuggestions.length} suggestions.`);
    // --- END MOCK AI RESPONSE --- 

  } catch (aiError) {
    console.error('AI analysis failed:', aiError);
    // Handle AI errors - maybe proceed with only rule-based suggestions?
    // Or return a specific error? For now, just log and continue.
  }
  // --- END AI Call --- 

  // --- 4. Combine Suggestions (Basic Merge) --- 
  // TODO: Implement smarter merging/deduplication logic if needed.
  const combinedSuggestions = [...ruleBasedSuggestions, ...aiSuggestions];
  console.log(`Combined suggestions count: ${combinedSuggestions.length}`);
  // --- END Combine --- 

  // --- 5. Generate Final Assessment (Using AI result + potentially rules) --- 
  // TODO: Refine assessment generation. Maybe combine scores or use rules to adjust AI assessment.
  const finalAssessment: OverallAssessment = {
    ats_compatibility_score: aiAssessment.ats_compatibility_score ?? 50, // Default if AI failed
    impact_clarity_score: aiAssessment.impact_clarity_score ?? 50,
    technical_depth_score: aiAssessment.technical_depth_score ?? 50,
    organization_score: aiAssessment.organization_score ?? 50,
    key_strengths: aiAssessment.key_strengths ?? [],
    priority_improvements: aiAssessment.priority_improvements ?? ['Review suggestions']
  };
  // --- END Assessment --- 

  // --- 6. Format Final Response --- 
  const finalResponse: AnalysisResponse = {
    suggestions: combinedSuggestions,
    overall_assessment: finalAssessment
  };

  console.log('Successfully processed CV analysis request.');
  return finalResponse;
} 