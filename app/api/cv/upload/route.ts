import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Assuming this path is correct
import { uploadFileToS3 } from '@/utils/s3Storage'; // Adjust path if needed
import { createCV, updateCV, CvCreateData } from '@/utils/cvOperations'; // Adjust path if needed
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer'; // Import Buffer
import { CvStatus } from '@prisma/client'; // Import status enum

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
    const fileExtension = file.name.split('.').pop() || 'bin'; // Default extension
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    s3Key = `cvs/${developerId}/${uniqueFilename}`; // Assign to outer scope variable

    console.log(`Uploading file to S3 with key: ${s3Key}`);
    await uploadFileToS3(s3Key, fileBuffer, file.type);
    console.log('File successfully uploaded to S3.');

    // --- Create DB Record ---
    const cvData: CvCreateData = {
      developerId,
      filename: uniqueFilename, 
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      s3Key: s3Key,
      status: CvStatus.UPLOADING, // Start with UPLOADING status
    };

    console.log('Creating CV database record...');
    const newCV = await createCV(cvData);
    cvId = newCV.id; // Assign ID for potential cleanup/update
    console.log('Database record created successfully with ID:', cvId, 'Status:', newCV.status);

    // --- Update Status to AVAILABLE ---
    console.log(`Updating status to AVAILABLE for CV ID: ${cvId}`);
    const updatedCV = await updateCV(cvId, { status: CvStatus.AVAILABLE });
    console.log('CV status updated successfully. Final status:', updatedCV.status);

    return NextResponse.json({
      message: 'CV uploaded and processed successfully',
      cvId: updatedCV.id,
      s3Key: updatedCV.s3Key,
      filename: updatedCV.filename,
      status: updatedCV.status,
    }, { status: 201 });

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