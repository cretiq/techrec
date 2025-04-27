import { ParsedCvData } from '../types';
import { ParsingLibraryError } from '../errors';
import { structureTextIntoSections } from '../structure'; // Import the structuring function

// Import mammoth
import mammoth from 'mammoth';

/**
 * Parses CV text content from a DOCX file buffer.
 *
 * @param fileBuffer The buffer containing the DOCX file data.
 * @returns A promise that resolves with the parsed CV data.
 * @throws {ParsingLibraryError} If the mammoth library fails.
 */
export async function parseDocx(fileBuffer: Buffer): Promise<ParsedCvData> {
  console.log('Parsing DOCX...');
  try {
    // Use mammoth to extract raw text
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const fullText = result.value; // The raw text
    // mammoth can also extract messages, like warnings during conversion
    if (result.messages && result.messages.length > 0) {
      console.warn('Mammoth parsing generated messages:', result.messages);
    }

    if (!fullText) {
      console.warn('DOCX parsing yielded empty text content.');
      return {
        sections: [],
        fullText: ''
      };
    }

    // Structure the extracted text into sections
    const sections = structureTextIntoSections(fullText);

    console.log('DOCX Parsed successfully.');
    return {
      sections,
      fullText,
    };
  } catch (error) {
    console.error('Error during DOCX parsing:', error);
    throw new ParsingLibraryError('Failed to parse DOCX content', error instanceof Error ? error : undefined);
  }
} 