import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import { Buffer } from 'buffer';
import { PrismaClient, AnalysisStatus } from '@prisma/client'; // Include AnalysisStatus
import { uploadFileToS3 } from '@/utils/s3Storage'; // Reuse S3 utility
import { getCache } from '@/lib/redis'; // Import cache functions
import { processCvAnalysis } from '@/utils/analysisService';

const prisma = new PrismaClient();

// Define allowed MIME types and max size for analysis
// These might differ from the general CV storage
const ALLOWED_ANALYSIS_MIME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const MAX_ANALYSIS_FILE_SIZE_MB = 10;
const MAX_ANALYSIS_FILE_SIZE_BYTES = MAX_ANALYSIS_FILE_SIZE_MB * 1024 * 1024;
const MAX_ANALYSIS_DURATION_MINUTES = 10;

// Helper function to calculate SHA-256 hash
const calculateHash = (buffer: Buffer): string => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

const ANALYSIS_CACHE_PREFIX = 'cv_analysis:';

export async function POST(request: Request) {
  let analysisRecordId: string | null = null;
  let s3Key: string | null = null;

  try {
    console.log('Received CV analysis upload request...');
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('Authentication failed: No valid session found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;
    console.log('Authenticated developer ID for analysis:', developerId);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    // --- Validation ---
    if (!file) {
      console.log('Analysis validation failed: No file provided.');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    console.log('Analysis file details:', { name: file.name, type: file.type, size: file.size });

    if (!ALLOWED_ANALYSIS_MIME_TYPES.includes(file.type)) {
      console.log(`Analysis validation failed: Invalid file type - ${file.type}`);
      return NextResponse.json({ error: `Invalid file type. Allowed types: ${ALLOWED_ANALYSIS_MIME_TYPES.join(', ')}` }, { status: 400 });
    }

    if (file.size > MAX_ANALYSIS_FILE_SIZE_BYTES) {
      console.log(`Analysis validation failed: File too large - ${file.size} bytes (Max: ${MAX_ANALYSIS_FILE_SIZE_MB}MB)`);
      return NextResponse.json({ error: `File size must be less than ${MAX_ANALYSIS_FILE_SIZE_MB}MB` }, { status: 400 });
    }
    // --- End Validation ---

    console.log('Analysis file validation passed. Calculating hash...');
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileHash = calculateHash(fileBuffer);
    const cacheKey = `${ANALYSIS_CACHE_PREFIX}${fileHash}`;
    console.log('File hash calculated:', fileHash, 'Cache key:', cacheKey);

    // --- Cache Check (Only check for completed results here) ---
    const cachedResult = await getCache<any>(cacheKey);
    if (cachedResult) {
        console.log('Found cached analysis results for hash:', fileHash);
        
        // Create a new analysis record for the cached result
        const newAnalysisRecord = await prisma.cvAnalysis.create({
            data: {
                developerId,
                fileHash,
                originalName: file.name,
                mimeType: file.type,
                size: file.size,
                status: AnalysisStatus.COMPLETED,
                analysisResult: cachedResult,
                analyzedAt: new Date(),
            },
        });

        console.log('Created new analysis record for cached result:', newAnalysisRecord.id);
        
        return NextResponse.json({ 
            message: 'Analysis retrieved from cache.',
            analysis: cachedResult,
            fromCache: true,
            fileHash: fileHash,
            analysisId: newAnalysisRecord.id,
            status: AnalysisStatus.COMPLETED 
        });
    }
    console.log('No valid cache entry found.');

    // --- Deduplication Check (Database) ---
    const existingAnalysis = await prisma.cvAnalysis.findFirst({
      where: { fileHash },
      select: { 
        id: true, 
        status: true, 
        analysisResult: true,
        requestedAt: true // Add this field for staleness check
      }
    });
    
    if (existingAnalysis && existingAnalysis.status === AnalysisStatus.COMPLETED) {
      console.log('Found completed analysis in DB for hash:', fileHash);
      if (existingAnalysis.analysisResult) { 
          console.log('DB result found, should cache it (setCache call removed for now)'); 
      }
      return NextResponse.json({ 
          message: 'Analysis already completed for this file (result from DB).',
          analysis: existingAnalysis.analysisResult,
          fromCache: false, 
          analysisId: existingAnalysis.id,
          status: existingAnalysis.status
      });
    }

    if (existingAnalysis && (existingAnalysis.status === AnalysisStatus.PENDING || existingAnalysis.status === AnalysisStatus.ANALYZING)) {
       // Add staleness check
       const analysisAge = existingAnalysis.requestedAt 
         ? Math.floor((Date.now() - existingAnalysis.requestedAt.getTime()) / (1000 * 60))
         : 0;

       if (analysisAge > MAX_ANALYSIS_DURATION_MINUTES) {
           console.log(`Found stale analysis (${analysisAge} minutes old) for hash: ${fileHash}. Creating new record.`);
           
           // Mark the old record as failed
           await prisma.cvAnalysis.update({
               where: { id: existingAnalysis.id },
               data: {
                   status: AnalysisStatus.FAILED,
                   errorMessage: `Analysis timed out after ${analysisAge} minutes`,
                   analyzedAt: new Date()
               }
           });

           // Create new record and proceed with analysis
           s3Key = `analysis-uploads/${developerId}/${fileHash}-${file.name}`;
           console.log(`Uploading analysis file to S3 with key: ${s3Key}`);
           await uploadFileToS3(s3Key, fileBuffer, file.type);
           console.log('Analysis file successfully uploaded to S3.');

           const newAnalysisRecord = await prisma.cvAnalysis.create({
               data: {
                   developerId,
                   fileHash,
                   originalName: file.name,
                   s3Key: s3Key,
                   mimeType: file.type,
                   size: file.size,
                   status: AnalysisStatus.PENDING,
               },
           });
           analysisRecordId = newAnalysisRecord.id;

           return NextResponse.json({
               message: 'Previous analysis timed out. New analysis queued.',
               analysisId: analysisRecordId,
               status: AnalysisStatus.PENDING,
           }, { status: 202 });
       }

       // If not stale, proceed with existing behavior
       console.log(`Analysis already in progress in DB for hash: ${fileHash}, Status: ${existingAnalysis.status}`);
       return NextResponse.json({ 
           message: `Analysis already ${existingAnalysis.status.toLowerCase()} for this file.`,
           analysisId: existingAnalysis.id,
           status: existingAnalysis.status
       }, { status: 202 }); // Return 202 Accepted
    }

    console.log('No existing completed/pending analysis found in DB.');

    // --- Storage ---
    s3Key = `analysis-uploads/${developerId}/${fileHash}-${file.name}`;
    console.log(`Uploading analysis file to S3 with key: ${s3Key}`);
    await uploadFileToS3(s3Key, fileBuffer, file.type); 
    console.log('Analysis file successfully uploaded to S3.');

    // --- Create Database Record --- 
    console.log('Creating new CvAnalysis record with PENDING status...');
    const newAnalysisRecord = await prisma.cvAnalysis.create({
      data: {
        developerId,
        fileHash,
        originalName: file.name,
        s3Key: s3Key,
        mimeType: file.type,
        size: file.size,
        status: AnalysisStatus.PENDING,
      },
    });
    analysisRecordId = newAnalysisRecord.id;
    console.log('New CvAnalysis record created with ID:', analysisRecordId);

    // Trigger the analysis process
    console.log(`Triggering analysis for ID: ${analysisRecordId}`);
    // Use Promise.race to start the analysis but not wait for it
    Promise.race([
      processCvAnalysis(analysisRecordId).catch(error => {
        console.error('Background analysis process error:', error);
        // Error handling is done within processCvAnalysis
      }),
      Promise.resolve() // This resolves immediately
    ]);

    // Respond that the file has been received and analysis has started
    return NextResponse.json({
      message: 'CV received, analysis started',
      analysisId: analysisRecordId,
      status: AnalysisStatus.PENDING,
    }, { status: 202 }); // 202 Accepted

  } catch (error: any) {
    console.error('Error during CV analysis initial upload:', error);
    if (s3Key && !analysisRecordId) { 
        console.warn(`DB creation failed after S3 upload. Deleting orphaned S3 object: ${s3Key}`);
        // await deleteFileFromS3(s3Key).catch(e => console.error("S3 cleanup failed:", e));
    }
    return NextResponse.json({ error: 'Failed to process CV for analysis. Please try again.' }, { status: 500 });
  }
}

// Add GET handler to list analyses
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    // Get analyses for the authenticated user
    const analyses = await prisma.cvAnalysis.findMany({
      where: { developerId },
      orderBy: { requestedAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        status: true,
        requestedAt: true,
        analyzedAt: true,
        errorMessage: true,
        analysisResult: true,
      },
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error('Error fetching CV analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CV analyses' },
      { status: 500 }
    );
  }
} 