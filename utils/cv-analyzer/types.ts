import { ParsedCvData } from '../cv-parser/types';

// Re-define suggestion structure based on ai_analysis_specification.md
// Ideally, share this type definition across backend and frontend
// Maybe create a shared types package later?

export type CvSectionName = 
  | 'EXPERIENCE' 
  | 'SKILLS' 
  | 'EDUCATION' 
  | 'SUMMARY' 
  | 'ACHIEVEMENTS' 
  | 'FORMATTING' 
  | 'ATS_OPTIMIZATION'
  | 'PROJECTS' // Added based on parser logic
  | 'CERTIFICATIONS' // Added based on parser logic
  | 'AWARDS' // Added based on parser logic
  | 'REFERENCES' // Added based on parser logic
  | 'CONTACT' // Added based on parser logic
  | 'GENERAL'; // For suggestions not tied to a specific parser section

export type CvSuggestionCategory = 
  | 'IMPACT' 
  | 'CLARITY' 
  | 'QUANTIFICATION' 
  | 'KEYWORDS' 
  | 'FORMATTING' 
  | 'ORGANIZATION' 
  | 'COMPLETENESS'
  | 'ATS'; // Added for direct ATS issues

export type CvSuggestionPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ImprovementMetrics {
  clarity_score?: number; // 0-100, Optional for now
  impact_score?: number;  // 0-100, Optional for now
  ats_score?: number;     // 0-100, Optional for now
  keyword_score?: number; // 0-100, Optional for now
}

export interface SpecificImprovement {
  type: string; // e.g., 'Quantify Achievement', 'Use Action Verb'
  description: string;
  example?: string; 
}

export interface CvSuggestion {
  /** 
   * Tries to map to a section from the parser, or a general category. 
   * Needs careful mapping from parser's `CvSection.title` (string | null) 
   */
  section: CvSectionName;
  category: CvSuggestionCategory;
  priority: CvSuggestionPriority;
  originalText?: string;
  suggestedText?: string;
  reasoning: string;
  /** Placeholder for now, scoring logic TBD */
  improvement_metrics?: ImprovementMetrics;
  /** Placeholder for now, specific breakdowns TBD */
  specific_improvements?: SpecificImprovement[];
}

/**
 * Interface for an analyzer function.
 * Takes parsed CV data and returns relevant suggestions.
 */
export type AnalyzerFunction = (parsedData: ParsedCvData) => Promise<CvSuggestion[]>; 