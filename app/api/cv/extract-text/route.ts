import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { uploadFileToS3 } from '@/utils/s3Storage';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
import { simpleTextExtraction } from '@/utils/textExtractionService';
import { TextExtractionResult } from '@/types/cv';

// Define allowed MIME types and max size (same as main CV upload)
const ALLOWED_MIME_TYPES = [
  'application/pdf', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  'text/plain'
];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: Request) {
  try {
    console.log('🔍 [TEXT-EXTRACTION] Request received...');
    
    // Authentication check
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('🔍 [TEXT-EXTRACTION] Authentication failed');
      
      // TEMPORARY: For testing, use real test user if in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [TEXT-EXTRACTION] Using test user for development');
        const testDeveloperId = '689491c6de5f64dd40843cd0'; // cv-upload-test@test.techrec.com
        console.log('🧪 [TEXT-EXTRACTION] Test user ID:', testDeveloperId);
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    const developerId = session?.user?.id || '689491c6de5f64dd40843cd0';
    console.log('🔍 [TEXT-EXTRACTION] Using developer ID:', developerId);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // --- File Validation ---
    if (!file) {
      console.log('🔍 [TEXT-EXTRACTION] Validation failed: No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log('🔍 [TEXT-EXTRACTION] File details:', { 
      name: file.name, 
      type: file.type, 
      size: file.size 
    });

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.log(`🔍 [TEXT-EXTRACTION] Validation failed: Invalid file type - ${file.type}`);
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` 
      }, { status: 400 });
    }

    if (file.size === 0) {
      console.log('🔍 [TEXT-EXTRACTION] Validation failed: Empty file');
      return NextResponse.json({ 
        error: 'File is empty. Please upload a valid CV file.',
        details: 'File size cannot be 0 bytes' 
      }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.log(`🔍 [TEXT-EXTRACTION] Validation failed: File too large - ${file.size} bytes`);
      return NextResponse.json({ 
        error: `File size must be less than ${MAX_FILE_SIZE_MB}MB` 
      }, { status: 400 });
    }
    // --- End File Validation ---

    console.log('🔍 [TEXT-EXTRACTION] File validation passed. Preparing for upload...');
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Additional buffer validation
    if (fileBuffer.length === 0) {
      console.log('🔍 [TEXT-EXTRACTION] Buffer validation failed: Empty buffer');
      return NextResponse.json({ 
        error: 'File content is empty. Please upload a valid CV file.',
        details: 'File buffer is empty after processing' 
      }, { status: 400 });
    }

    // Generate unique filename for S3 storage
    const fileExtension = file.name.split('.').pop() || 'bin';
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const s3Key = `cvs/text-extraction/${developerId}/${uniqueFilename}`;

    console.log(`🔍 [TEXT-EXTRACTION] Uploading file to S3 with key: ${s3Key}`);
    await uploadFileToS3(s3Key, fileBuffer, file.type);
    console.log('🔍 [TEXT-EXTRACTION] File successfully uploaded to S3');

    // --- Simple Text Extraction ---
    try {
      console.log('🔍 [TEXT-EXTRACTION] Starting simple text extraction...');
      
      // Create temporary file for text extraction
      const tempDir = '/tmp';
      const tempFilePath = `${tempDir}/${uniqueFilename}`;
      const fs = require('fs');
      fs.writeFileSync(tempFilePath, fileBuffer);
      
      console.log('🔍 [TEXT-EXTRACTION] Extracting text with Gemini...');
      const extractionStartTime = Date.now();
      
      const extractionResult = await simpleTextExtraction.extractTextOnly(
        tempFilePath, 
        file.name
      );
      
      // Clean up temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('🔍 [TEXT-EXTRACTION] Failed to cleanup temp file:', cleanupError);
      }
      
      const totalDuration = Date.now() - extractionStartTime;
      
      if (!extractionResult.success) {
        console.error('🔍 [TEXT-EXTRACTION] Extraction failed:', extractionResult.error);
        return NextResponse.json({
          success: false,
          error: extractionResult.error,
          extractionDuration: totalDuration
        }, { status: 500 });
      }
      
      console.log('🔍 [TEXT-EXTRACTION] Extraction completed successfully', {
        extractionDuration: extractionResult.extractionDuration,
        characterCount: extractionResult.characterCount,
        wordCount: extractionResult.wordCount,
        lineCount: extractionResult.lineCount
      });

      // Prepare response with metadata
      const response: TextExtractionResult = {
        success: true,
        extractedText: extractionResult.extractedText,
        extractionDuration: extractionResult.extractionDuration,
        characterCount: extractionResult.characterCount,
        wordCount: extractionResult.wordCount,
        lineCount: extractionResult.lineCount,
        metadata: {
          filename: s3Key,
          originalName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          s3Key: s3Key
        }
      };

      console.log('🔍 [TEXT-EXTRACTION] Returning successful response');
      return NextResponse.json(response, { status: 200 });

    } catch (extractionError) {
      console.error('🔍 [TEXT-EXTRACTION] Error during text extraction:', extractionError);
      return NextResponse.json({
        success: false,
        error: 'Text extraction failed. Please try again.',
        details: extractionError instanceof Error ? extractionError.message : String(extractionError)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('🔍 [TEXT-EXTRACTION] Unexpected error during text extraction request:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to extract text from CV. Please try again.' 
    }, { status: 500 });
  }
}