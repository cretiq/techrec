import { CvSection } from './types';

// Common CV section headers (case-insensitive, allow variations)
// This list can be expanded based on observed CV formats
const COMMON_SECTION_HEADERS = [
  'summary', 'profile', 'objective', 'about me',
  'experience', 'work experience', 'professional experience', 'employment history',
  'education', 'academic background',
  'skills', 'technical skills', 'competencies', 'languages',
  'projects', 'personal projects',
  'certifications', 'licenses', 'courses',
  'awards', 'honors', 'achievements',
  'references',
  'contact' // Sometimes contact info might look like a header
];

// Regex to match potential section headers (start of line, common patterns)
// Looks for lines that are likely headers (mostly uppercase, short, ending optionally with colon)
// or match our known headers list. 
const HEADER_REGEX = new RegExp(
  `^(?:(?:\s*(${COMMON_SECTION_HEADERS.join('|')})[:\s]*$)|(?:\s*[A-Z][A-Z\s\-\&]{3,30}[A-Z][: ]*$))`, 
  'im' // i = case-insensitive, m = multiline (so ^ matches start of line)
);

/**
 * Attempts to structure raw CV text into logical sections based on common headers.
 * 
 * @param text The raw text extracted from the CV.
 * @returns An array of identified CvSection objects.
 */
export function structureTextIntoSections(text: string): CvSection[] {
  const sections: CvSection[] = [];
  const lines = text.split(/\r?\n/); // Split text into lines
  let currentSection: CvSection | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue; // Skip empty lines

    const headerMatch = trimmedLine.match(HEADER_REGEX);

    if (headerMatch) {
      // Found a potential header
      const title = headerMatch[1] ? 
                      COMMON_SECTION_HEADERS.find(h => h === headerMatch[1].toLowerCase()) || trimmedLine 
                      : trimmedLine;
      
      // Start a new section
      currentSection = {
        title: title.charAt(0).toUpperCase() + title.slice(1).toLowerCase(), // Normalize capitalization
        content: []
      };
      sections.push(currentSection);
      // Add the header line itself as the first piece of content for context, or skip?
      // Let's skip adding the header line itself to the content for now.
    } else if (currentSection) {
      // Not a header, add to the content of the current section
      currentSection.content.push(trimmedLine);
    } else {
      // Content before the first identified header
      // Create a default section (e.g., for contact info or an initial summary without a clear header)
      currentSection = {
        title: null, // Or perhaps 'Introduction'?
        content: [trimmedLine]
      };
      sections.push(currentSection);
    }
  }

  // Filter out sections with no content (might happen if headers are back-to-back)
  const nonEmptySections = sections.filter(sec => sec.content.length > 0);

  if (nonEmptySections.length === 0 && text.trim().length > 0) {
     console.warn('No sections identified, returning full text as single section.');
     // If no headers were found at all, return the whole text as one unnamed section
     return [{ title: null, content: lines.filter(line => line.trim() !== '') }];
  }
  
  return nonEmptySections;
} 