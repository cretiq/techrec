/**
 * Base class for custom errors related to CV parsing.
 */
export class CvParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CvParsingError';
  }
}

/**
 * Error thrown when the provided file format is not supported.
 */
export class UnsupportedFormatError extends CvParsingError {
  constructor(mimeType: string) {
    super(`Unsupported file format: ${mimeType}`);
    this.name = 'UnsupportedFormatError';
  }
}

/**
 * Error thrown when a parsing library encounters an issue with the document content.
 */
export class ParsingLibraryError extends CvParsingError {
  originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(`Parsing failed: ${message}`);
    this.name = 'ParsingLibraryError';
    this.originalError = originalError;
  }
} 