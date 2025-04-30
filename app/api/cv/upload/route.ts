import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Assuming this path is correct
import { uploadFileToS3, downloadS3FileAsBuffer } from '@/utils/s3Storage'; // Import download
import { createCV, updateCV } from '@/utils/cvOperations'; // Import updateCV
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer'; // Import Buffer
import { AnalysisStatus, PrismaClient } from '@prisma/client'; // Import PrismaClient
import { parseFileContent } from '@/utils/fileParsers'; // Import parser
import { analyzeCvWithGPT } from '@/utils/gptAnalysis'; // Import analyser
import crypto from 'crypto'; // Import crypto for hashing

const prisma = new PrismaClient(); // Instantiate Prisma client

// Define allowed MIME types and max size
const ALLOWED_MIME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: Request) {
  let cvId: string | null = null; // Variable to hold CV ID for potential cleanup
  let s3Key: string | null = null; // Variable to hold S3 key for potential cleanup

  try {
    console.log('Received CV upload request...');
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('Authentication failed: No valid session found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;
    console.log('Authenticated developer ID:', developerId);

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

    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.log(`Validation failed: File too large - ${file.size} bytes (Max: ${MAX_FILE_SIZE_MB}MB)`);
      return NextResponse.json({ error: `File size must be less than ${MAX_FILE_SIZE_MB}MB` }, { status: 400 });
    }
    // --- End Validation ---

    console.log('File validation passed. Preparing for upload...');
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // Calculate file hash
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    console.log(`[Upload Route] Calculated file hash: ${fileHash}`);

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
      // 1. Update status to ANALYZING
      await updateCV(newCV.id, { status: AnalysisStatus.ANALYZING });
      console.log(`[Analysis ${newCV.id}] Status updated to ANALYZING.`);

      // 2. Download file from S3
      const fileBuffer = await downloadS3FileAsBuffer(newCV.s3Key);
      console.log(`[Analysis ${newCV.id}] Downloaded ${newCV.mimeType} file from S3.`);

      // 3. Parse file content
      const parsedContent = await parseFileContent(fileBuffer, newCV.mimeType);
      console.log(`[Analysis ${newCV.id}] Parsed file content, text length: ${parsedContent.text.length}.`);
      console.log('[Upload Route] Parsed Text Length:', parsedContent?.text?.length);

      // 4. Analyze with GPT
      const analysisResult = await analyzeCvWithGPT(parsedContent.text);
      console.log(`[Analysis ${newCV.id}] GPT analysis completed.`);
      console.log('[Upload Route] GPT Analysis Result (structure check):', analysisResult ? Object.keys(analysisResult) : 'null');

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

      // 6. Save analysis result to CvAnalysis collection
      const cvAnalysisCreateData = {
          developerId: newCV.developerId,
          cvId: newCV.id,
          originalName: newCV.originalName,
          mimeType: newCV.mimeType,
          size: newCV.size,
          s3Key: newCV.s3Key,
          fileHash: fileHash, // Save the calculated hash
          status: AnalysisStatus.COMPLETED,
          analysisResult: analysisResult as any,
          analyzedAt: new Date(),
      };
      console.log('[Upload Route] Data for prisma.cvAnalysis.create:', cvAnalysisCreateData);
      const savedAnalysis = await prisma.cvAnalysis.create({ data: cvAnalysisCreateData });
      console.log(`[Upload Route] Saved CvAnalysis record ID: ${savedAnalysis.id}`);

      // 7. Update original CV record with final status, score, and analysis link
      const cvUpdateData = {
        status: AnalysisStatus.COMPLETED,
        analysisId: savedAnalysis.id, 
        improvementScore: improvementScore,
        extractedText: parsedContent.text,
      };
      console.log(`[Upload Route] Data for updateCV (ID: ${newCV.id}):`, cvUpdateData);
      await updateCV(newCV.id, cvUpdateData);
      console.log(`[Upload Route] Updated CV record ID: ${newCV.id}`);

    } catch (analysisError) {
      console.error(`[Analysis ${newCV.id}] Error during analysis process:`, analysisError);
      try {
        // Update CV status to FAILED if analysis fails
        await updateCV(newCV.id, { status: AnalysisStatus.FAILED });
        console.log(`[Analysis ${newCV.id}] Updated CV status to FAILED.`);
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