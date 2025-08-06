// Removed pdf2json dependency - using LangChain PDFLoader instead
import mammoth from 'mammoth';
import { Buffer } from 'buffer';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { Document } from '@langchain/core/documents';
import { performance } from 'perf_hooks';
import { writeFile } from 'fs/promises';
import { join } from 'path';

interface ParsedPdfData {
  text: string;
  numPages: number;
  // Add other relevant metadata if needed (e.g., text density per page)
}

/**
 * Parses text content from a PDF buffer using pdf2json.
 * Includes basic text density analysis (character count per page).
 * @param pdfBuffer Buffer containing the PDF file content.
 * @returns Promise resolving to an object with extracted text and page count.
 */
export const parsePdf = (pdfBuffer: Buffer): Promise<ParsedPdfData> => {
  return new Promise((resolve, reject) => {
    // Validate buffer before parsing
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('PDF Parsing: Buffer is empty or invalid');
      reject(new Error('PDF buffer is empty or invalid. Cannot parse empty file.'));
      return;
    }
    
    console.log(`PDF Parsing: Starting with buffer size: ${pdfBuffer.length} bytes`);
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        if (!pdfData || !pdfData.Pages) {
           throw new Error('Invalid PDF data structure received from pdf2json.');
        }
        console.log(`PDF Parsing: Processing ${pdfData.Pages.length} pages.`);
        
        const pageTexts = pdfData.Pages.map((page, index) => {
           if (!page.Texts) {
               console.warn(`PDF Parsing: Page ${index + 1} has no text objects.`);
               return '';
           }
           // Decode text components and join them
           return page.Texts.map(text => 
               text.R?.map(r => decodeURIComponent(r.T || '')).join('') || ''
           ).join(' '); // Join text runs with space
        });
        
        const fullText = pageTexts.join('\n\n'); // Join pages with double newline
        const numPages = pdfData.Pages.length;

        console.log(`PDF Parsing: Extracted ${fullText.length} characters from ${numPages} pages.`);
        resolve({ text: fullText, numPages });

      } catch (error) {
        console.error('PDF Parsing: Error processing pdfParser_dataReady event:', error);
        reject(new Error('Failed to process PDF data'));
      }
    });

    pdfParser.on('pdfParser_dataError', (errorData) => {
      console.error('PDF Parsing Error (pdfParser_dataError):', errorData);
      // Construct error message carefully
      let errorMessage = 'Failed to parse PDF buffer';
      if (errorData?.parserError) {
          // If parserError exists, it might be an Error object or a string
          errorMessage = errorData.parserError instanceof Error 
              ? errorData.parserError.message 
              : String(errorData.parserError);
      } else if (errorData instanceof Error) {
          errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
          errorMessage = errorData;
      } 
      reject(new Error(errorMessage));
    });

    try {
        console.log('PDF Parsing: Starting pdfParser.parseBuffer...');
        pdfParser.parseBuffer(pdfBuffer);
    } catch(error) {
        console.error('PDF Parsing: Error calling pdfParser.parseBuffer:', error);
        reject(new Error('Error initiating PDF parsing'));
    }
  });
};

/**
 * Parses text content from a DOCX buffer using mammoth.
 * @param docxBuffer Buffer containing the DOCX file content.
 * @returns Promise resolving to the extracted text content as a string.
 */
export const parseDocx = async (docxBuffer: Buffer): Promise<string> => {
   console.log('DOCX Parsing: Starting mammoth.extractRawText...');
   try {
        const result = await mammoth.extractRawText({ buffer: docxBuffer });
        const text = result.value; // The raw text
        const messages = result.messages;
        if (messages && messages.length > 0) {
            console.warn('DOCX Parsing: Messages generated during parsing:', messages);
        }
        console.log(`DOCX Parsing: Extracted ${text.length} characters.`);
        return text;
   } catch (error) {
       console.error('DOCX Parsing Error:', error);
       throw new Error('Failed to parse DOCX file');
   }
};

/**
 * Parses text content from a plain text buffer.
 * @param textBuffer Buffer containing the TXT file content.
 * @param encoding Optional buffer encoding (default: 'utf-8').
 * @returns The extracted text content as a string.
 */
export const parseTxt = (textBuffer: Buffer, encoding: BufferEncoding = 'utf-8'): string => {
    console.log(`TXT Parsing: Decoding buffer with encoding ${encoding}...`);
    try {
        const text = textBuffer.toString(encoding);
        console.log(`TXT Parsing: Extracted ${text.length} characters.`);
        return text;
    } catch (error) {
        console.error('TXT Parsing Error:', error);
        throw new Error('Failed to parse TXT file');
    }
};

// Unified parser function (Example structure)
interface UnifiedParseResult {
    text: string;
    metadata?: Record<string, any>; // For page count, etc.
}

export const parseFileContent = async (buffer: Buffer, mimeType: string): Promise<UnifiedParseResult> => {
    console.log(`Attempting to parse file with MIME type: ${mimeType}`);
    if (mimeType === 'application/pdf') {
        const { text, numPages } = await parsePdf(buffer);
        return { text, metadata: { numPages } };
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const text = await parseDocx(buffer);
        return { text }; 
    } else if (mimeType === 'text/plain') {
        const text = parseTxt(buffer);
        return { text };
    } else {
        console.error(`Unsupported MIME type for parsing: ${mimeType}`);
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
};

// Helper function to measure elapsed time
function getElapsedTime(startTime: number): number {
  return Number((performance.now() - startTime).toFixed(2));
}

// Helper function to get memory usage in MB
function getMemoryUsageMB(): number {
  const usedMemory = process.memoryUsage().heapUsed;
  return Number((usedMemory / 1024 / 1024).toFixed(2));
}

// Helper function to get file size in MB
function getFileSizeMB(buffer: Buffer): number {
  return Number((buffer.length / 1024 / 1024).toFixed(2));
}

// Helper function to log memory and timing metrics
function logMetrics(
  context: string,
  startTime: number,
  startMemory: number,
  fileSize: number
): void {
  const elapsedTime = getElapsedTime(startTime);
  const currentMemory = getMemoryUsageMB();
  const memoryDiff = Number((currentMemory - startMemory).toFixed(2));

  console.log(`[${context}] Metrics:`);
  console.log(`  - File size: ${fileSize} MB`);
  console.log(`  - Elapsed time: ${elapsedTime} ms`);
  console.log(`  - Memory usage: ${currentMemory} MB (${memoryDiff > 0 ? '+' : ''}${memoryDiff} MB)`);
}

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const startTime = performance.now();
  const startMemory = getMemoryUsageMB();
  const fileSize = getFileSizeMB(buffer);

  console.log('[PDF Parser] Starting PDF parsing process');
  console.log(`[PDF Parser] Initial memory usage: ${startMemory} MB`);

  try {
    // Write buffer to temporary file
    const tempPath = join(process.cwd(), 'temp.pdf');
    await writeFile(tempPath, buffer);
    console.log('[PDF Parser] Temporary file written');

    // Load and parse PDF
    const loadStartTime = performance.now();
    const loader = new PDFLoader(tempPath);
    const docs = await loader.load();
    const loadTime = getElapsedTime(loadStartTime);
    console.log(`[PDF Parser] PDF loaded in ${loadTime} ms`);

    // Process documents
    const processStartTime = performance.now();
    const text = docs.map((doc: Document) => doc.pageContent).join('\n');
    const processTime = getElapsedTime(processStartTime);
    console.log(`[PDF Parser] Content processed in ${processTime} ms`);

    // Log final metrics
    logMetrics('PDF Parser', startTime, startMemory, fileSize);

    return text;
  } catch (error) {
    console.error('[PDF Parser] Error parsing PDF:');
    console.error(error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function parseDocxBuffer(buffer: Buffer): Promise<string> {
  const startTime = performance.now();
  const startMemory = getMemoryUsageMB();
  const fileSize = getFileSizeMB(buffer);

  console.log('[DOCX Parser] Starting DOCX parsing process');
  console.log(`[DOCX Parser] Initial memory usage: ${startMemory} MB`);

  try {
    // Write buffer to temporary file
    const tempPath = join(process.cwd(), 'temp.docx');
    await writeFile(tempPath, buffer);
    console.log('[DOCX Parser] Temporary file written');

    // Load and parse DOCX
    const loadStartTime = performance.now();
    const loader = new DocxLoader(tempPath);
    const docs = await loader.load();
    const loadTime = getElapsedTime(loadStartTime);
    console.log(`[DOCX Parser] DOCX loaded in ${loadTime} ms`);

    // Process documents
    const processStartTime = performance.now();
    const text = docs.map((doc: Document) => doc.pageContent).join('\n');
    const processTime = getElapsedTime(processStartTime);
    console.log(`[DOCX Parser] Content processed in ${processTime} ms`);

    // Log final metrics
    logMetrics('DOCX Parser', startTime, startMemory, fileSize);

    return text;
  } catch (error) {
    console.error('[DOCX Parser] Error parsing DOCX:');
    console.error(error);
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 