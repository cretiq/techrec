import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming this path is correct
import { uploadFileToS3, downloadS3FileAsBuffer } from '@/utils/s3Storage'; // Import download
import { createCV, updateCV } from '@/utils/cvOperations'; // Import updateCV
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer'; // Import Buffer
import { AnalysisStatus, PrismaClient } from '@prisma/client'; // Import PrismaClient
import { parseFileContent } from '@/utils/fileParsers'; // Import parser
import { analyzeCvWithGemini } from '@/utils/geminiAnalysis'; // Import analyser
import crypto from 'crypto'; // Import crypto for hashing
import { syncCvDataToProfile } from '@/utils/backgroundProfileSync'; // Import background sync
import { clearCachePattern } from '@/lib/redis'; // Import cache invalidation
import { CvUploadDebugLogger } from '@/utils/cvUploadDebugLogger'; // Import CV upload debug logger
import { DirectGeminiUploadService, directGeminiUpload } from '@/utils/directGeminiUpload'; // Import direct Gemini upload service
import { DirectUploadDebugLogger } from '@/utils/directUploadDebugLogger'; // Import direct upload debug logger

const prisma = new PrismaClient(); // Instantiate Prisma client

// CV Upload Flow Configuration
const USE_DIRECT_GEMINI_UPLOAD = process.env.ENABLE_DIRECT_GEMINI_UPLOAD === 'true';

// Helper function to calculate improvement score
function calculateImprovementScore(analysisResult: any): number {
  let score = 0;
  if (analysisResult.contactInfo?.name) score += 10;
  if (analysisResult.contactInfo?.email) score += 5;
  if (analysisResult.about && analysisResult.about.length > 50) score += 15;
  score += (analysisResult.skills?.length || 0) * 2;
  score += (analysisResult.experience?.length || 0) * 5;
  score += (analysisResult.education?.length || 0) * 3;
  score += (analysisResult.achievements?.length || 0) * 2;
  return Math.min(100, Math.max(0, score)); // Clamp between 0-100
}

// Logging helper for cleaner flow separation
function logUploadFlow(flow: 'DIRECT' | 'TRADITIONAL', message: string, data?: any) {
  const prefix = flow === 'DIRECT' ? '🚀 [DIRECT-GEMINI]' : '📄 [TRADITIONAL]';
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// Define allowed MIME types and max size
const ALLOWED_MIME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: Request) {
  let cvId: string | null = null; // Variable to hold CV ID for potential cleanup
  let s3Key: string | null = null; // Variable to hold S3 key for potential cleanup

  try {
    console.log('Received CV upload request...');
    
    // For Next.js 13+ App Router with NextAuth 4.21+
    const session = await getServerSession(authOptions);
    
    console.log('Session object:', JSON.stringify(session, null, 2));
    
    // Alternative: Check for session via cookie/headers
    const cookies = request.headers.get('cookie');
    console.log('Request cookies:', cookies ? 'Present' : 'None');
    
    if (!session?.user?.id) {
      console.log('Authentication failed: No valid session found.');
      console.log('Session details:', { 
        sessionExists: !!session, 
        userExists: !!session?.user,
        userId: session?.user?.id 
      });
      
      // Try to get more debug info
      const authHeader = request.headers.get('authorization');
      console.log('Authorization header:', authHeader ? 'Present' : 'None');
      
      // TEMPORARY: For testing, create a mock session if in development
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ DEVELOPMENT: Using mock developer ID for testing');
        const developerId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectID format
        
        // Continue with mock session for testing
        console.log('🧪 Mock developer ID:', developerId);
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      const developerId = session.user.id;
      console.log('Authenticated developer ID:', developerId);
    }
    
    // Set developerId for use throughout the function
    const developerId = session?.user?.id || '507f1f77bcf86cd799439011';
    console.log('Using developer ID:', developerId);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    // --- Validation ---
    if (!file) {
      console.log('Validation failed: No file provided.');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    console.log('File details:', { name: file.name, type: file.type, size: file.size });

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.log(`Validation failed: Invalid file type - ${file.type}`);
      return NextResponse.json({ error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` }, { status: 400 });
    }

    if (file.size === 0) {
      console.log(`Validation failed: Empty file - ${file.size} bytes`);
      return NextResponse.json({ 
        error: 'File is empty. Please upload a valid CV file.',
        details: 'File size cannot be 0 bytes' 
      }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.log(`Validation failed: File too large - ${file.size} bytes (Max: ${MAX_FILE_SIZE_MB}MB)`);
      return NextResponse.json({ error: `File size must be less than ${MAX_FILE_SIZE_MB}MB` }, { status: 400 });
    }
    // --- End Validation ---

    console.log('File validation passed. Preparing for upload...');
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Additional validation: Check if buffer is actually empty
    if (fileBuffer.length === 0) {
      console.log(`Buffer validation failed: Empty buffer despite file.size = ${file.size}`);
      return NextResponse.json({ 
        error: 'File content is empty. Please upload a valid CV file.',
        details: 'File buffer is empty after processing' 
      }, { status: 400 });
    }
    
    // Calculate file hash
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    console.log(`[Upload Route] Calculated file hash: ${fileHash}, buffer size: ${fileBuffer.length}`);

    const fileExtension = file.name.split('.').pop() || 'bin'; // Default extension
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    s3Key = `cvs/${developerId}/${uniqueFilename}`; // Assign to outer scope variable

    console.log(`Uploading file to S3 with key: ${s3Key}`);
    await uploadFileToS3(s3Key, fileBuffer, file.type);
    console.log('File successfully uploaded to S3.');

    // --- Create DB Record with PENDING status ---
    const cvData = {
      developerId,
      filename: s3Key, // Use the full S3 key as the unique filename/identifier
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      s3Key: s3Key,
      status: AnalysisStatus.PENDING, // Start with PENDING status
      // analysisId and improvementScore will be updated by the background task
    };
    console.log('[Upload Route] Data for createCV:', cvData);
    const newCV = await createCV(cvData);
    cvId = newCV.id;
    console.log('[Upload Route] Created CV record:', newCV);

    // --- Analysis Process (Run synchronously for now) ---
    // For production, this should be moved to a background job
    try {
      console.log(`Starting analysis process for CV ID: ${newCV.id}...`);
      
      // Initialize debug logging session (development only)
      const debugSessionId = CvUploadDebugLogger.initialize();
      if (debugSessionId) {
        console.log(`🔍 [CV-DEBUG] Debug session initialized: ${debugSessionId}`);
      }

      // Determine which upload method to use
      const shouldUseDirectUpload = USE_DIRECT_GEMINI_UPLOAD && directGeminiUpload.isAvailable();
      
      // Create debug-enabled direct upload service if debug session exists
      const debugDirectUpload = debugSessionId ? new DirectGeminiUploadService(debugSessionId) : directGeminiUpload;
      let directUploadSuccessful = false;
      
      console.log(`\n🎯 [CV-UPLOAD] === UPLOAD METHOD SELECTION ===`);
      console.log(`Configuration: ENABLE_DIRECT_GEMINI_UPLOAD=${process.env.ENABLE_DIRECT_GEMINI_UPLOAD}`);
      console.log(`Service Available: ${directGeminiUpload.isAvailable()}`);
      console.log(`Selected Method: ${shouldUseDirectUpload ? 'DIRECT GEMINI' : 'TRADITIONAL'}`);
      console.log(`========================================\n`);

      if (shouldUseDirectUpload) {
        // === DIRECT GEMINI UPLOAD FLOW ===
        logUploadFlow('DIRECT', 'Starting workflow...', {
          cvId: newCV.id,
          filename: newCV.originalName,
          model: 'gemini-2.5-flash'
        });
        
        // Create temporary file for direct upload
        const tempDir = '/tmp';
        const tempFilePath = `${tempDir}/${uniqueFilename}`;
        const fs = require('fs');
        fs.writeFileSync(tempFilePath, fileBuffer);
        
        try {
          logUploadFlow('DIRECT', 'Uploading PDF directly to Gemini API...');
          
          // Set debug context for the service
          debugDirectUpload.setDebugContext(newCV.id, developerId);
          
          const directResult = await debugDirectUpload.uploadAndAnalyze(tempFilePath, newCV.originalName);
          
          // Clean up temp file
          fs.unlinkSync(tempFilePath);
          
          if (!directResult.upload.success) {
            throw new Error(`Upload failed: ${directResult.upload.error}`);
          }
          
          if (!directResult.analysis?.success) {
            throw new Error(`Analysis failed: ${directResult.analysis?.error}`);
          }
          
          logUploadFlow('DIRECT', 'Analysis completed successfully', {
            uploadDuration: directResult.upload.uploadDuration,
            analysisDuration: directResult.analysis.analysisDuration,
            extractedDataKeys: Object.keys(directResult.analysis.extractedData || {})
          });
          
          // Process results
          const analysisResult = directResult.analysis.extractedData;
          const improvementScore = calculateImprovementScore(analysisResult);
          
          logUploadFlow('DIRECT', 'Syncing to profile tables...');
          const syncStartTime = Date.now();
          
          let syncDuration = 0;
          try {
            await syncCvDataToProfile(developerId, analysisResult);
            syncDuration = Date.now() - syncStartTime;

            // Debug logging for profile sync success
            if (debugSessionId) {
              DirectUploadDebugLogger.logProfileSync({
                cvId: newCV.id,
                extractedData: analysisResult,
                syncResult: {
                  success: true,
                  contactInfoSynced: !!(analysisResult?.contactInfo?.name || analysisResult?.contactInfo?.email),
                  experienceItemsSynced: analysisResult?.experience?.length || 0,
                  educationItemsSynced: analysisResult?.education?.length || 0,
                  skillsSynced: analysisResult?.skills?.length || 0,
                  achievementsSynced: analysisResult?.achievements?.length || 0,
                },
                improvementScore: improvementScore,
                syncDuration: syncDuration,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (syncError) {
            syncDuration = Date.now() - syncStartTime;
            logUploadFlow('DIRECT', 'Profile sync failed', { 
              syncDuration, 
              error: syncError.message 
            });

            // Debug logging for profile sync failure
            if (debugSessionId) {
              DirectUploadDebugLogger.logProfileSync({
                cvId: newCV.id,
                extractedData: analysisResult,
                syncResult: {
                  success: false,
                  contactInfoSynced: false,
                  experienceItemsSynced: 0,
                  educationItemsSynced: 0,
                  skillsSynced: 0,
                  achievementsSynced: 0,
                },
                improvementScore: improvementScore,
                syncDuration: syncDuration,
                timestamp: new Date().toISOString(),
                error: {
                  message: syncError.message,
                  stack: syncError.stack,
                },
              });
            }
            
            throw new Error('Failed to save CV data to profile. Please try again.');
          }
          
          // Update CV record
          await updateCV(newCV.id, {
            status: AnalysisStatus.COMPLETED,
            improvementScore: improvementScore,
            extractedText: 'Direct upload - content preserved in original format',
          });
          
          logUploadFlow('DIRECT', 'Workflow completed successfully', {
            improvementScore,
            syncDuration,
            finalStatus: AnalysisStatus.COMPLETED
          });
          
          // Mark as successful to skip traditional method
          directUploadSuccessful = true;
          
        } catch (directError) {
          logUploadFlow('DIRECT', 'Failed - will fallback to traditional method', {
            error: directError.message
          });
          // Clean up temp file if it still exists
          try { fs.unlinkSync(tempFilePath); } catch {}
          directUploadSuccessful = false;
        }
      }
      
      // === TRADITIONAL UPLOAD FLOW === 
      // COMMENTED OUT - Focus only on Direct Upload debugging
      /*
      // Only run if direct upload was not attempted OR if it failed
      if (!shouldUseDirectUpload) {
        logUploadFlow('TRADITIONAL', 'Starting workflow (direct upload disabled)...');
      } else if (!directUploadSuccessful) {
        logUploadFlow('TRADITIONAL', 'Starting fallback workflow (direct upload failed)...');
      } else {
        logUploadFlow('DIRECT', 'Direct upload successful - skipping traditional method');
      }
      
      // Only execute traditional flow if needed
      if ((!shouldUseDirectUpload) || (shouldUseDirectUpload && !directUploadSuccessful)) {
      
        // 1. Update status to ANALYZING
        await updateCV(newCV.id, { status: AnalysisStatus.ANALYZING });
        logUploadFlow('TRADITIONAL', 'Status updated to ANALYZING');

        // 2. Download file from S3
        const fileBuffer = await downloadS3FileAsBuffer(newCV.s3Key);
        logUploadFlow('TRADITIONAL', 'Downloaded file from S3', {
          mimeType: newCV.mimeType,
          s3Key: newCV.s3Key
        });

        // 3. Parse file content using pdf2json
        const parsingStartTime = Date.now();
        const parsedContent = await parseFileContent(fileBuffer, newCV.mimeType);
        const parsingDuration = Date.now() - parsingStartTime;
        
        logUploadFlow('TRADITIONAL', 'PDF parsing completed', {
          textLength: parsedContent.text.length,
          textPreview: parsedContent.text.substring(0, 100) + '...',
          estimatedWords: parsedContent.text.split(/\s+/).length,
          parsingDuration,
          hasCharacterSpacing: parsedContent.text.includes('   ') // Detect spacing issues
        });

      // Debug: Log PDF parsing results (development only)
      CvUploadDebugLogger.logPdfParsing({
        cvId: newCV.id,
        developerId: newCV.developerId,
        filename: newCV.originalName,
        mimeType: newCV.mimeType,
        fileSize: newCV.size,
        parsedContent: {
          text: parsedContent.text,
          textLength: parsedContent.text.length,
          estimatedWords: parsedContent.text.split(/\s+/).length,
          estimatedLines: parsedContent.text.split('\n').length,
        },
        parsingDuration,
        timestamp: new Date().toISOString(),
      });

        // 4. Analyze with Gemini (using parsed text)
        logUploadFlow('TRADITIONAL', 'Starting Gemini analysis with parsed text', {
          inputTextLength: parsedContent.text.length,
          estimatedTokens: Math.ceil(parsedContent.text.length / 4),
          model: 'gemini-2.5-flash'
        });

        const geminiStartTime = Date.now();
        const analysisResult = await analyzeCvWithGemini(parsedContent.text);
        const geminiDuration = Date.now() - geminiStartTime;
      
        const dataQualityMetrics = {
          hasContactInfo: !!(analysisResult?.contactInfo?.name || analysisResult?.contactInfo?.email),
          hasAbout: !!(analysisResult?.about && analysisResult.about.length > 0),
          skillsCount: analysisResult?.skills?.length || 0,
          experienceCount: analysisResult?.experience?.length || 0,
          educationCount: analysisResult?.education?.length || 0,
          achievementsCount: analysisResult?.achievements?.length || 0,
          languagesCount: analysisResult?.languages?.length || 0,
          totalYearsExperience: analysisResult?.totalYearsExperience || 0
        };

        logUploadFlow('TRADITIONAL', 'Gemini analysis completed', {
          success: !!analysisResult,
          geminiDuration,
          dataQualityMetrics,
          responseSize: JSON.stringify(analysisResult).length
        });

      // Debug: Log Gemini response and validation (development only)
      CvUploadDebugLogger.logGeminiResponse({
        cvId: newCV.id,
        rawResponse: JSON.stringify(analysisResult),
        parsedResponse: analysisResult,
        validationResult: {
          isValid: !!analysisResult,
          errors: analysisResult ? [] : ['Failed to parse CV with Gemini'],
          warnings: [],
        },
        extractedData: dataQualityMetrics,
        duration: geminiDuration,
        timestamp: new Date().toISOString(),
      });

        // 5. Calculate Improvement Score and sync to profile
        const improvementScore = calculateImprovementScore(analysisResult);
        logUploadFlow('TRADITIONAL', 'Calculated improvement score', { improvementScore });

        // 6. Background sync to profile tables
        logUploadFlow('TRADITIONAL', 'Syncing to profile tables...');
        const syncStartTime = Date.now();
        try {
          await syncCvDataToProfile(developerId, analysisResult);
          const syncDuration = Date.now() - syncStartTime;
          logUploadFlow('TRADITIONAL', 'Profile sync completed', { syncDuration });

        // Debug: Log profile sync results (development only)
        CvUploadDebugLogger.logProfileSync({
          cvId: newCV.id,
          syncResult: {
            success: true,
            contactInfoSynced: !!(analysisResult?.contactInfo?.name || analysisResult?.contactInfo?.email),
            experienceItemsSynced: analysisResult?.experience?.length || 0,
            educationItemsSynced: analysisResult?.education?.length || 0,
            skillsSynced: analysisResult?.skills?.length || 0,
            achievementsSynced: analysisResult?.achievements?.length || 0,
          },
          transformedData: {
            contactInfoFields: Object.keys(analysisResult?.contactInfo || {}),
            experienceFields: ['title', 'company', 'startDate', 'endDate', 'responsibilities'],
            skillsStructure: analysisResult?.skills?.slice(0, 3) || [],
          },
          syncDuration,
          timestamp: new Date().toISOString(),
        });
        } catch (syncError) {
          const syncDuration = Date.now() - syncStartTime;
          logUploadFlow('TRADITIONAL', 'Profile sync failed', { 
            syncDuration, 
            error: syncError.message 
          });
        
        // Debug: Log profile sync failure (development only)
        CvUploadDebugLogger.logProfileSync({
          cvId: newCV.id,
          syncResult: {
            success: false,
            contactInfoSynced: false,
            experienceItemsSynced: 0,
            educationItemsSynced: 0,
            skillsSynced: 0,
            achievementsSynced: 0,
          },
          transformedData: {
            contactInfoFields: [],
            experienceFields: [],
            skillsStructure: [],
          },
          syncDuration,
          timestamp: new Date().toISOString(),
          error: {
            message: syncError.message,
            stack: syncError.stack,
          },
        });
        
          throw new Error('Failed to save CV data to profile. Please try again.');
        }

        // 7. Update original CV record with final status and score
        const cvUpdateData = {
          status: AnalysisStatus.COMPLETED,
          improvementScore: improvementScore,
          extractedText: parsedContent.text,
        };
        
        await updateCV(newCV.id, cvUpdateData);
        
        logUploadFlow('TRADITIONAL', 'Workflow completed successfully', {
          finalStatus: AnalysisStatus.COMPLETED,
          improvementScore,
          extractedTextLength: parsedContent.text.length
        });
        
      } else {
        logUploadFlow('DIRECT', 'Traditional method skipped - direct upload completed successfully');
      } // End traditional method conditional
      */
      
      // Direct Upload Only Mode - No Traditional Fallback
      if (!shouldUseDirectUpload || !directUploadSuccessful) {
        throw new Error('Direct upload failed and traditional method is disabled for debugging');
      }

    } catch (analysisError) {
      console.error(`[Analysis ${newCV.id}] Error during analysis process:`, analysisError);
      try {
        // Update CV status to FAILED if analysis fails
        await updateCV(newCV.id, { status: AnalysisStatus.FAILED });
        console.log(`[Analysis ${newCV.id}] Updated CV status to FAILED.`);
        
        // Cache invalidation when analysis fails - clear any cached analysis data for this user
        try {
          console.log(`[Analysis ${newCV.id}] Clearing cached analysis data for developer: ${developerId}`);
          const clearedCount = await clearCachePattern(`cv_analysis:*`);
          console.log(`[Analysis ${newCV.id}] Cache invalidation completed. Cleared ${clearedCount} cache entries.`);
        } catch (cacheError) {
          console.error(`[Analysis ${newCV.id}] Cache invalidation failed (non-critical):`, cacheError);
        }
        
      } catch (updateError) {
        console.error(`[Analysis ${newCV.id}] CRITICAL: Failed to update CV status to FAILED after analysis error:`, updateError);
      }
      // Note: We still return 201 CREATED below, as the upload itself succeeded.
      // The client should check the status from the list view.
    }

    // Fetch the potentially updated CV record to return the latest status
    const finalCV = await prisma.cV.findUnique({ where: { id: newCV.id } });
    console.log('[Upload Route] Returning final CV state:', finalCV);

    return NextResponse.json({
      message: 'CV uploaded. Analysis initiated (check status).', // Updated message
      cvId: finalCV?.id ?? newCV.id,
      s3Key: finalCV?.s3Key ?? newCV.s3Key,
      filename: finalCV?.originalName ?? newCV.originalName,
      status: finalCV?.status ?? AnalysisStatus.PENDING, // Return latest status
    }, { status: 201 }); // Add missing comma here

  } catch (error) {
    console.error('Error during CV upload:', error);
    // Attempt cleanup if necessary (e.g., delete S3 object if DB operation failed after upload)
    // This is simplified; a more robust approach might use transactions or a queue
    if (s3Key && !cvId) { // S3 upload succeeded, but DB create failed
        console.warn(`DB creation failed after S3 upload. Attempting to delete orphaned S3 object: ${s3Key}`);
        // Consider adding await deleteFileFromS3(s3Key).catch(...) - fire and forget or handle error
    }
    return NextResponse.json({ error: 'Failed to upload CV. Please try again.' }, { status: 500 });
  }
} 