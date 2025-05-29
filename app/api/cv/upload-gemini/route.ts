import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFileToS3, downloadS3FileAsBuffer } from '@/utils/s3Storage';
import { createCV, updateCV } from '@/utils/cvOperations';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
import { AnalysisStatus, PrismaClient } from '@prisma/client';
import { parseFileContent } from '@/utils/fileParsers';
import { analyzeCvWithGemini } from '@/utils/geminiAnalysis'; // Import our new Gemini analyzer
import crypto from 'crypto';

const prisma = new PrismaClient();

// Define allowed MIME types and max size
const ALLOWED_MIME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: Request) {
  let cvId: string | null = null;

  try {
    console.log('Received CV upload request (Gemini analysis)');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Authentication failed.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ 
        error: `File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB` 
      }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique S3 key
    const fileExtension = file.name.split('.').pop() || 'bin';
    const uniqueId = uuidv4();
    const s3Key = `cvs/${developerId}/${uniqueId}.${fileExtension}`;

    // Upload to S3
    console.log(`Uploading to S3 with key: ${s3Key}`);
    await uploadFileToS3(s3Key, buffer, file.type);
    console.log('File uploaded to S3 successfully.');

    // Create CV record in database
    const newCV = await createCV({
      developerId,
      filename: s3Key, // Use s3Key as filename
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      s3Key,
      status: AnalysisStatus.PENDING,
    });
    cvId = newCV.id;
    console.log(`Created CV record with ID: ${newCV.id}`);

    // --- Analysis Process (Run synchronously for now) ---
    // For production, this should be moved to a background job
    try {
      console.log(`Starting Gemini analysis process for CV ID: ${newCV.id}...`);
      // 1. Update status to ANALYZING
      await updateCV(newCV.id, { status: AnalysisStatus.ANALYZING });
      console.log(`[Analysis ${newCV.id}] Status updated to ANALYZING.`);

      // 2. Download file from S3
      const fileBuffer = await downloadS3FileAsBuffer(newCV.s3Key);
      console.log(`[Analysis ${newCV.id}] Downloaded ${newCV.mimeType} file from S3.`);

      // 3. Parse file content
      const parsedContent = await parseFileContent(fileBuffer, newCV.mimeType);
      console.log(`[Analysis ${newCV.id}] Parsed file content, text length: ${parsedContent.text.length}.`);

      // 4. Analyze with Gemini
      const analysisResult = await analyzeCvWithGemini(parsedContent.text);
      console.log(`[Analysis ${newCV.id}] Gemini analysis completed.`);

      // 5. Calculate Improvement Score (Example: based on completeness)
      let score = 0;
      if (analysisResult.contactInfo?.name) score += 10;
      if (analysisResult.contactInfo?.email) score += 5;
      if (analysisResult.about && analysisResult.about.length > 50) score += 15;
      score += (analysisResult.skills?.length || 0) * 2;
      score += (analysisResult.experience?.length || 0) * 5;
      score += (analysisResult.education?.length || 0) * 3;
      score += (analysisResult.achievements?.length || 0) * 2;
      const improvementScore = Math.min(100, Math.max(0, score)); // Clamp between 0-100

      console.log(`[Analysis ${newCV.id}] Calculated improvement score: ${improvementScore}`);

      // 6. Create CvAnalysis record
      const cvAnalysis = await prisma.cvAnalysis.create({
        data: {
          developerId: newCV.developerId,
          cvId: newCV.id,
          originalName: newCV.originalName,
          s3Key: newCV.s3Key,
          mimeType: newCV.mimeType,
          size: newCV.size,
          status: AnalysisStatus.COMPLETED,
          analysisResult: analysisResult as any, // Prisma Json type
          analyzedAt: new Date(),
        },
      });
      console.log(`[Analysis ${newCV.id}] Created CvAnalysis record with ID: ${cvAnalysis.id}`);

      // 7. Update CV with completion status and link to analysis
      await updateCV(newCV.id, {
        status: AnalysisStatus.COMPLETED,
        analysisId: cvAnalysis.id,
        improvementScore,
      });
      console.log(`[Analysis ${newCV.id}] Updated CV status to COMPLETED with analysis ID: ${cvAnalysis.id}`);

    } catch (analysisError) {
      console.error(`[Analysis ${newCV.id}] Analysis failed:`, analysisError);
      // Update CV status to FAILED
      await updateCV(newCV.id, { status: AnalysisStatus.FAILED });
      console.log(`[Analysis ${newCV.id}] Updated CV status to FAILED due to analysis error.`);
      
      // Don't fail the upload, just log the analysis failure
      console.warn(`CV uploaded successfully but analysis failed: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`);
    }

    return NextResponse.json({
      message: 'CV uploaded successfully',
      cvId: newCV.id,
      status: 'uploaded',
      analysisStatus: 'pending',
      provider: 'gemini'
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading CV:', error);
    
    // Cleanup: Delete CV record if it was created but upload failed
    if (cvId) {
      try {
        await prisma.cV.delete({ where: { id: cvId } });
        console.log(`Cleaned up CV record ${cvId} due to upload failure.`);
      } catch (cleanupError) {
        console.error(`Failed to cleanup CV record ${cvId}:`, cleanupError);
      }
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload CV' 
    }, { status: 500 });
  }
} 