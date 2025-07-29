import { CvImprovementSuggestion } from '@/types/cv';
import crypto from 'crypto';

export interface CvSuggestionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestionCount: number;
  qualitySuggestions: CvImprovementSuggestion[];
}

// Valid suggestion sections
const VALID_SECTIONS = [
  'contactInfo', 'contactInfo.email', 'contactInfo.phone', 'contactInfo.name',
  'about', 'summary',
  'skills', 'experience', 'education', 'achievements', 'certificates',
  'experience[0]', 'experience[1]', 'experience[2]', 'experience[3]',
  'experience[0].description', 'experience[1].description', 'experience[2].description',
  'experience[0].responsibilities', 'experience[1].responsibilities', 'experience[2].responsibilities',
  'education[0]', 'education[1]', 'education[2]',
  'cv.extractedText', 'general'
] as const;

// Valid suggestion types
const VALID_SUGGESTION_TYPES = [
  'wording', 'add_content', 'remove_content', 'reorder', 'format'
] as const;

// Enhanced valid suggestion types for new schema
const ENHANCED_SUGGESTION_TYPES = [
  'experience_bullet', 'education_gap', 'missing_skill', 'summary_improvement', 'general_improvement'
] as const;

/**
 * Validates a CV improvement suggestions response
 * @param suggestionsData - The parsed JSON response from AI
 * @returns CvSuggestionValidationResult with validation status and filtered suggestions
 */
export function validateCvSuggestionsOutput(suggestionsData: any): CvSuggestionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const qualitySuggestions: CvImprovementSuggestion[] = [];

  // Basic structure validation
  if (!suggestionsData || typeof suggestionsData !== 'object') {
    errors.push('Suggestions response is not a valid object');
    return { isValid: false, errors, warnings, suggestionCount: 0, qualitySuggestions: [] };
  }

  if (!suggestionsData.suggestions || !Array.isArray(suggestionsData.suggestions)) {
    errors.push('Suggestions response missing or invalid suggestions array');
    return { isValid: false, errors, warnings, suggestionCount: 0, qualitySuggestions: [] };
  }

  const suggestions = suggestionsData.suggestions;
  
  // Check for minimum suggestions count
  if (suggestions.length === 0) {
    warnings.push('No suggestions provided in response');
  }

  // Validate each suggestion
  suggestions.forEach((suggestion: any, index: number) => {
    const suggestionErrors = validateSingleSuggestion(suggestion, index);
    
    if (suggestionErrors.length === 0) {
      // This is a valid suggestion, add to quality list
      qualitySuggestions.push(suggestion as CvImprovementSuggestion);
    } else {
      // Track validation issues but don't fail the entire response
      warnings.push(`Suggestion ${index + 1}: ${suggestionErrors.join(', ')}`);
    }
  });

  // Quality checks
  if (qualitySuggestions.length === 0) {
    errors.push('No valid suggestions found after filtering');
  } else if (qualitySuggestions.length < suggestions.length * 0.5) {
    warnings.push(`Only ${qualitySuggestions.length} out of ${suggestions.length} suggestions passed validation`);
  }

  // Check for duplicate suggestions
  const uniqueSuggestions = removeDuplicateSuggestions(qualitySuggestions);
  if (uniqueSuggestions.length < qualitySuggestions.length) {
    warnings.push(`Removed ${qualitySuggestions.length - uniqueSuggestions.length} duplicate suggestions`);
  }

  // Content quality validation
  const contentIssues = validateSuggestionContent(uniqueSuggestions);
  warnings.push(...contentIssues);

  return {
    isValid: errors.length === 0 && uniqueSuggestions.length > 0,
    errors,
    warnings,
    suggestionCount: uniqueSuggestions.length,
    qualitySuggestions: uniqueSuggestions
  };
}

/**
 * Validates a single suggestion object
 * @param suggestion - Individual suggestion to validate
 * @param index - Index for error reporting
 * @returns Array of validation errors
 */
function validateSingleSuggestion(suggestion: any, index: number): string[] {
  const errors: string[] = [];

  // Check if suggestion is an object
  if (!suggestion || typeof suggestion !== 'object') {
    errors.push('Suggestion is not a valid object');
    return errors;
  }

  // Check if suggestion is a string (malformed response case)
  if (typeof suggestion === 'string') {
    errors.push('Suggestion is a string instead of object (malformed response)');
    return errors;
  }

  // Required fields validation
  const requiredFields = ['section', 'suggestionType', 'reasoning'];
  for (const field of requiredFields) {
    if (!suggestion[field] || typeof suggestion[field] !== 'string') {
      errors.push(`Missing or invalid ${field}`);
    }
  }

  // Validate section
  if (suggestion.section && typeof suggestion.section === 'string') {
    const isValidSection = VALID_SECTIONS.some(validSection => 
      suggestion.section === validSection || suggestion.section.startsWith(validSection)
    );
    if (!isValidSection) {
      errors.push(`Invalid section: ${suggestion.section}`);
    }
  }

  // Validate suggestion type (support both legacy and enhanced schemas)
  if (suggestion.suggestionType) {
    const isLegacyType = VALID_SUGGESTION_TYPES.includes(suggestion.suggestionType);
    const isEnhancedType = ENHANCED_SUGGESTION_TYPES.includes(suggestion.type || suggestion.suggestionType);
    
    if (!isLegacyType && !isEnhancedType) {
      errors.push(`Invalid suggestion type: ${suggestion.suggestionType || suggestion.type}`);
    }
  }

  // Validate reasoning length
  if (suggestion.reasoning && typeof suggestion.reasoning === 'string') {
    if (suggestion.reasoning.length < 10) {
      errors.push('Reasoning too short (minimum 10 characters)');
    } else if (suggestion.reasoning.length > 500) {
      errors.push('Reasoning too long (maximum 500 characters)');
    }
  }

  // Validate suggested content
  if (suggestion.suggestedText || suggestion.suggestedContent) {
    const content = suggestion.suggestedText || suggestion.suggestedContent;
    if (typeof content === 'string' && content.length === 0) {
      errors.push('Suggested content is empty');
    }
  }

  // Check for placeholder text
  const placeholders = ['[placeholder]', '[company]', '[role]', '[name]', 'TODO', 'FIXME'];
  const allText = `${suggestion.reasoning || ''} ${suggestion.suggestedText || suggestion.suggestedContent || ''}`.toLowerCase();
  
  for (const placeholder of placeholders) {
    if (allText.includes(placeholder.toLowerCase())) {
      errors.push(`Contains placeholder text: ${placeholder}`);
    }
  }

  return errors;
}

/**
 * Removes duplicate suggestions based on section and content similarity
 * @param suggestions - Array of suggestions to deduplicate
 * @returns Array with duplicates removed
 */
function removeDuplicateSuggestions(suggestions: CvImprovementSuggestion[]): CvImprovementSuggestion[] {
  const seen = new Set<string>();
  const unique: CvImprovementSuggestion[] = [];

  for (const suggestion of suggestions) {
    // Create a key based on section and suggested content
    const suggestedContent = suggestion.suggestedText || (suggestion as any).suggestedContent || '';
    const key = `${suggestion.section}:${suggestedContent.substring(0, 100)}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(suggestion);
    }
  }

  return unique;
}

/**
 * Validates the overall quality and content of suggestions
 * @param suggestions - Array of suggestions to validate
 * @returns Array of content warnings
 */
function validateSuggestionContent(suggestions: CvImprovementSuggestion[]): string[] {
  const warnings: string[] = [];

  // Check for balanced suggestion types
  const sectionCounts: Record<string, number> = {};
  suggestions.forEach(suggestion => {
    const mainSection = suggestion.section.split('[')[0].split('.')[0]; // Get main section
    sectionCounts[mainSection] = (sectionCounts[mainSection] || 0) + 1;
  });

  const sections = Object.keys(sectionCounts);
  if (sections.length === 1) {
    warnings.push('All suggestions target the same section - consider diversifying');
  }

  // Check for repetitive reasoning
  const reasoningWords = suggestions.map(s => s.reasoning.toLowerCase().split(' ')).flat();
  const wordCounts: Record<string, number> = {};
  reasoningWords.forEach(word => {
    if (word.length > 4) { // Only check longer words
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  const overusedWords = Object.entries(wordCounts)
    .filter(([_, count]) => count > suggestions.length * 0.7)
    .map(([word, _]) => word);

  if (overusedWords.length > 0) {
    warnings.push(`Repetitive language detected: ${overusedWords.join(', ')}`);
  }

  // Check for professional language
  const unprofessionalWords = ['awesome', 'cool', 'amazing', 'super', 'totally'];
  const allReasoningText = suggestions.map(s => s.reasoning).join(' ').toLowerCase();
  
  const foundUnprofessional = unprofessionalWords.filter(word => 
    allReasoningText.includes(word)
  );

  if (foundUnprofessional.length > 0) {
    warnings.push(`Consider more professional language: ${foundUnprofessional.join(', ')}`);
  }

  return warnings;
}

/**
 * Checks if a suggestions response meets basic quality standards
 * @param suggestionsData - Parsed suggestions response
 * @returns true if suggestions pass basic quality checks
 */
export function isValidCvSuggestionsResponse(suggestionsData: any): boolean {
  const validation = validateCvSuggestionsOutput(suggestionsData);
  return validation.isValid && validation.qualitySuggestions.length > 0;
}

/**
 * Gets improvement recommendations for the suggestions themselves
 * @param suggestionsData - Parsed suggestions response
 * @returns Array of improvement recommendations
 */
export function getSuggestionImprovements(suggestionsData: any): string[] {
  const validation = validateCvSuggestionsOutput(suggestionsData);
  const improvements: string[] = [];
  
  improvements.push(...validation.errors);
  improvements.push(...validation.warnings);
  
  return improvements;
}

/**
 * Sanitizes and fixes common issues in suggestions data
 * @param suggestionsData - Raw suggestions data
 * @returns Cleaned suggestions data
 */
export function sanitizeSuggestionsData(suggestionsData: any): any {
  if (!suggestionsData || !suggestionsData.suggestions) {
    return suggestionsData;
  }

  console.log(`🧹 [sanitize] Starting sanitization of ${suggestionsData.suggestions.length} raw suggestions`);

  // Track used IDs to ensure uniqueness
  const usedIds = new Set<string>();

  // Filter out string elements and fix common issues
  const cleanedSuggestions = suggestionsData.suggestions
    .filter((suggestion: any, index: number) => {
      if (typeof suggestion === 'string') {
        console.log(`🗑️ [sanitize] Filtering out string element at index ${index}: "${suggestion}"`);
        return false;
      }
      if (typeof suggestion !== 'object' || suggestion === null) {
        console.log(`🗑️ [sanitize] Filtering out non-object element at index ${index}: ${typeof suggestion}`);
        return false;
      }
      return true;
    })
    .map((suggestion: any, index: number) => {
      console.log(`🔧 [sanitize] Processing suggestion ${index}: ${Object.keys(suggestion).join(', ')}`);
      
      // Fix common field name variations
      if (suggestion.suggestedContent && !suggestion.suggestedText) {
        console.log(`🔧 [sanitize] Renamed suggestedContent to suggestedText`);
        suggestion.suggestedText = suggestion.suggestedContent;
        delete suggestion.suggestedContent;
      }
      
      // Ensure reasoning exists
      if (!suggestion.reasoning && suggestion.description) {
        console.log(`🔧 [sanitize] Renamed description to reasoning`);
        suggestion.reasoning = suggestion.description;
        delete suggestion.description;
      }
      
      // Validate and fix section names (keep original case for now)
      if (suggestion.section && typeof suggestion.section === 'string') {
        const originalSection = suggestion.section;
        // Remove extra whitespace but preserve valid section names
        suggestion.section = suggestion.section.trim();
        if (originalSection !== suggestion.section) {
          console.log(`🔧 [sanitize] Cleaned section name: "${originalSection}" → "${suggestion.section}"`);
        }
      }
      
      // Ensure all required fields are strings or null
      ['section', 'originalText', 'suggestionType', 'suggestedText', 'reasoning'].forEach(field => {
        if (suggestion[field] !== null && typeof suggestion[field] !== 'string') {
          console.log(`🔧 [sanitize] Converting ${field} from ${typeof suggestion[field]} to string`);
          suggestion[field] = String(suggestion[field]);
        }
      });
      
      // Validate reasoning length
      if (suggestion.reasoning && suggestion.reasoning.length < 20) {
        console.log(`🔧 [sanitize] Extending short reasoning: "${suggestion.reasoning}"`);
        suggestion.reasoning = `${suggestion.reasoning} - This improvement enhances the CV's professional presentation.`;
      }
      
      // Generate unique ID if missing or duplicate
      let needsNewId = false;
      if (!suggestion.id || typeof suggestion.id !== 'string' || suggestion.id.trim() === '') {
        needsNewId = true;
        console.log(`🔧 [sanitize] Missing or empty ID detected`);
      } else if (usedIds.has(suggestion.id)) {
        needsNewId = true;
        console.log(`🔧 [sanitize] Duplicate ID detected: ${suggestion.id}`);
      }
      
      if (needsNewId) {
        let attempts = 0;
        let newId;
        do {
          const hashContent = [
            suggestion.section || '',
            suggestion.suggestionType || '',
            suggestion.reasoning?.substring(0, 50) || '',
            Date.now().toString(),
            Math.random().toString(),
            attempts.toString()
          ].join('|');
          newId = crypto.createHash('sha256').update(hashContent).digest('hex').substring(0, 16);
          attempts++;
        } while (usedIds.has(newId) && attempts < 10);
        
        const oldId = suggestion.id;
        suggestion.id = newId;
        console.log(`🔧 [sanitize] Generated unique ID: ${oldId || 'none'} → ${suggestion.id}`);
      }
      
      // Track this ID as used
      usedIds.add(suggestion.id);
      
      // Add missing fields for EnhancedCvSuggestion compatibility
      if (!suggestion.type) {
        // Map legacy suggestionType to new type system
        const typeMapping: Record<string, string> = {
          'wording': 'general_improvement',
          'add_content': 'general_improvement',
          'remove_content': 'general_improvement',
          'reorder': 'general_improvement',
          'format': 'general_improvement'
        };
        suggestion.type = typeMapping[suggestion.suggestionType] || 'general_improvement';
        console.log(`🔧 [sanitize] Mapped suggestionType "${suggestion.suggestionType}" to type "${suggestion.type}"`);
      }
      
      // Add other required EnhancedCvSuggestion fields
      if (!suggestion.title) {
        suggestion.title = `Improve ${suggestion.section}`;
        console.log(`🔧 [sanitize] Generated title: "${suggestion.title}"`);
      }
      
      if (!suggestion.suggestedContent && suggestion.suggestedText) {
        suggestion.suggestedContent = suggestion.suggestedText;
      }
      
      if (!suggestion.originalContent && suggestion.originalText) {
        suggestion.originalContent = suggestion.originalText;
      }
      
      // Set default values
      if (!suggestion.priority) {
        suggestion.priority = 'medium';
      }
      
      if (typeof suggestion.confidence !== 'number') {
        suggestion.confidence = 0.8;
      }
      
      return suggestion;
    })
    .filter((suggestion: any) => {
      // Final validation - ensure all required fields exist
      const requiredFields = ['section', 'suggestionType', 'reasoning'];
      const hasAllRequired = requiredFields.every(field => suggestion[field]);
      
      if (!hasAllRequired) {
        const missing = requiredFields.filter(field => !suggestion[field]);
        console.log(`🗑️ [sanitize] Filtering out incomplete suggestion missing: ${missing.join(', ')}`);
        return false;
      }
      
      return true;
    });

  console.log(`✅ [sanitize] Sanitization complete: ${cleanedSuggestions.length} valid suggestions remaining`);

  return {
    ...suggestionsData,
    suggestions: cleanedSuggestions
  };
}