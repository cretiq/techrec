import { ParsedCvData } from './types';
import { UnsupportedFormatError } from './errors';
import { parsePdf } from './formats/pdf';
import { parseDocx } from './formats/docx';

// Define supported MIME types
const SUPPORTED_MIME_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Add other supported types here if needed, e.g., text/plain
};

/**
 * Parses a CV file buffer based on its MIME type.
 *
 * @param fileBuffer The buffer containing the file data.
 * @param mimeType The MIME type of the file (e.g., 'application/pdf').
 * @returns A promise that resolves with the parsed CV data.
 * @throws {UnsupportedFormatError} If the MIME type is not supported.
 * @throws {ParsingLibraryError} If the underlying parsing library fails.
 */
export async function parseCv(fileBuffer: Buffer, mimeType: string): Promise<ParsedCvData> {
  console.log(`Attempting to parse file with MIME type: ${mimeType}`);

  switch (mimeType) {
    case SUPPORTED_MIME_TYPES.PDF:
      return parsePdf(fileBuffer);

    case SUPPORTED_MIME_TYPES.DOCX:
      return parseDocx(fileBuffer);

    // Add cases for other supported types here
    // case 'text/plain':
    //   return parseTxt(fileBuffer); // Assuming a parseTxt function exists

    default:
      console.error(`Unsupported MIME type: ${mimeType}`);
      throw new UnsupportedFormatError(mimeType);
  }
} 