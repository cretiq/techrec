/**
 * Represents a logically distinct section identified within the CV.
 */
export interface CvSection {
  /**
   * The inferred title of the section (e.g., 'Experience', 'Education', 'Skills').
   * Could be null if a section cannot be clearly titled.
   */
  title: string | null;
  /**
   * An array of text blocks or bullet points identified within this section.
   */
  content: string[];
}

/**
 * The structured representation of the parsed CV data.
 */
export interface ParsedCvData {
  /**
   * An array of identified sections in the order they appeared.
   */
  sections: CvSection[];
  /**
   * The complete raw text extracted from the document, potentially useful for full-text analysis.
   */
  fullText: string;
} 