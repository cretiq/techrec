import { ParsedCvData } from '../types';
import { ParsingLibraryError } from '../errors';
import { structureTextIntoSections } from '../structure'; // Import the structuring function

// Import pdf-parse
import pdf from 'pdf-parse';

/**
 * Parses CV text content from a PDF file buffer.
 *
 * @param fileBuffer The buffer containing the PDF file data.
 * @returns A promise that resolves with the parsed CV data.
 * @throws {ParsingLibraryError} If the pdf-parse library fails.
 */
export async function parsePdf(fileBuffer: Buffer): Promise<ParsedCvData> {
  console.log('Parsing PDF...');
  try {
    // Use pdf-parse to extract text data
    const data = await pdf(fileBuffer);
    const fullText = data.text;

    if (!fullText) {
      console.warn('PDF parsing yielded empty text content.');
      // Decide how to handle empty text - return empty structure or throw error?
      // Returning empty structure for now.
      return {
        sections: [],
        fullText: ''
      };
    }

    // Structure the extracted text into sections
    const sections = structureTextIntoSections(fullText);

    console.log('PDF Parsed successfully.');
    return {
      sections,
      fullText,
    };
  } catch (error) {
    console.error('Error during PDF parsing:', error);
    throw new ParsingLibraryError('Failed to parse PDF content', error instanceof Error ? error : undefined);
  }
} 