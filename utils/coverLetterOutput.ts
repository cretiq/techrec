import { WORD_BOUNDS, RequestType } from '@/types/coverLetter';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  wordCount: number;
}

/**
 * Validates a generated cover letter or outreach message
 * @param letter - The generated letter content
 * @param requestType - Type of request (coverLetter or outreach)
 * @returns ValidationResult with validation status and details
 */
export function validateLetterOutput(
  letter: string, 
  requestType: RequestType = 'coverLetter'
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic content validation
  if (!letter || letter.trim().length === 0) {
    errors.push('Letter content is empty');
    return { isValid: false, errors, warnings, wordCount: 0 };
  }
  
  const trimmedLetter = letter.trim();
  const words = trimmedLetter.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const bounds = WORD_BOUNDS[requestType];
  
  // Word count validation
//   if (wordCount < bounds.min) {
//     errors.push(`Letter is too short (${wordCount} words, minimum ${bounds.min})`);
//   } else if (wordCount > bounds.max) {
//     errors.push(`Letter is too long (${wordCount} words, maximum ${bounds.max})`);
//   }
  
  // Check for required structural elements
  const lowerLetter = trimmedLetter.toLowerCase();
  
  // Must have a greeting
  if (!lowerLetter.includes('dear ')) {
    errors.push('Letter must include a proper greeting (Dear ...)');
  }
  
  // Must have a closing
  const hasClosing = /\b(sincerely|best regards|regards|thank you)\b/i.test(trimmedLetter);
  if (!hasClosing) {
    warnings.push('Letter should include a professional closing');
  }
  
  // Check for common issues
  
  // No markdown formatting should remain
  if (trimmedLetter.includes('**') || trimmedLetter.includes('*') || trimmedLetter.includes('###')) {
    errors.push('Letter contains markdown formatting that should be removed');
  }
  
  // No placeholder text
  const placeholders = ['[company]', '[role]', '[name]', 'xyz', 'abc'];
  for (const placeholder of placeholders) {
    if (lowerLetter.includes(placeholder.toLowerCase())) {
      errors.push(`Letter contains placeholder text: ${placeholder}`);
    }
  }
  
  // Should not be overly repetitive
  const sentences = trimmedLetter.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 3) {
    warnings.push('Letter may be too simple (less than 3 sentences)');
  }
  
  // Check for professional tone indicators
  const unprofessionalWords = ['awesome', 'cool', 'amazing', 'super excited'];
  for (const word of unprofessionalWords) {
    if (lowerLetter.includes(word.toLowerCase())) {
      warnings.push(`Consider replacing informal word: "${word}"`);
    }
  }
  
  // Ensure it mentions specific role/company (basic check)
  if (!lowerLetter.includes('position') && !lowerLetter.includes('role') && !lowerLetter.includes('opportunity')) {
    warnings.push('Letter should reference the specific position or role');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    wordCount
  };
}

/**
 * Sanitizes input text by removing control characters and normalizing whitespace
 * @param input - Raw input text
 * @returns Cleaned input text
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Enforces word count by gracefully trimming content if it exceeds the limit
 * @param text - Input text
 * @param maxWords - Maximum allowed words
 * @returns Trimmed text within word limit
 */
export function enforceWordCount(text: string, maxWords: number): string {
  if (!text) return '';
  
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  
  // Take only the allowed number of words and ensure we end with a complete sentence
  const truncatedWords = words.slice(0, maxWords);
  let truncatedText = truncatedWords.join(' ');
  
  // Try to end with a sentence if possible
  const lastSentenceEnd = Math.max(
    truncatedText.lastIndexOf('.'),
    truncatedText.lastIndexOf('!'),
    truncatedText.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > truncatedText.length * 0.7) {
    // If we can keep at least 70% of the content and end with a sentence, do so
    truncatedText = truncatedText.substring(0, lastSentenceEnd + 1);
  } else {
    // Otherwise, add ellipsis to indicate truncation
    truncatedText += '...';
  }
  
  return truncatedText;
}

/**
 * Checks if the letter content meets basic quality standards
 * @param letter - Generated letter content
 * @param requestType - Type of request
 * @returns true if letter passes basic quality checks
 */
export function isValidLetter(letter: string, requestType: RequestType = 'coverLetter'): boolean {
  const validation = validateLetterOutput(letter, requestType);
  return validation.isValid;
}

/**
 * Gets suggested improvements for a letter based on validation results
 * @param letter - Generated letter content
 * @param requestType - Type of request
 * @returns Array of improvement suggestions
 */
export function getLetterImprovements(letter: string, requestType: RequestType = 'coverLetter'): string[] {
  const validation = validateLetterOutput(letter, requestType);
  const improvements: string[] = [];
  
  improvements.push(...validation.errors);
  improvements.push(...validation.warnings);
  
  return improvements;
}