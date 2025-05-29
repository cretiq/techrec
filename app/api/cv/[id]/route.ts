import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCV, updateCV, deleteCV, CvUpdateData } from '@/utils/cvOperations';
import { getPresignedS3Url } from '@/utils/s3Storage';

// GET /api/cv/[id]?download=true
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const download = searchParams.get('download') === 'true';

  try {
    console.log(`Received GET request for CV ID: ${id}, download: ${download}`);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Authentication failed.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    const cv = await getCV(id);

    if (!cv) {
      console.log('CV not found.');
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Ensure the CV belongs to the authenticated user
    if (cv.developerId !== developerId) {
      console.log('Authorization failed: CV does not belong to user.');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let responseData: any = { ...cv };

    if (download) {
      console.log('Generating download URL...');
      const downloadUrl = await getPresignedS3Url(cv.s3Key); // Default expiry: 1 hour
      responseData.downloadUrl = downloadUrl;
      console.log('Download URL generated.');
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`Error handling GET request for CV ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve CV details' }, { status: 500 });
  }
}

// PUT /api/cv/[id]
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    console.log(`Received PUT request for CV ID: ${id}`);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Authentication failed.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    const existingCv = await getCV(id);
    if (!existingCv) {
      console.log('CV not found for update.');
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }
    if (existingCv.developerId !== developerId) {
      console.log('Authorization failed: CV does not belong to user.');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dataToUpdate: CvUpdateData = await request.json();
    console.log('Data to update:', dataToUpdate);

    // Add validation for dataToUpdate here if needed

    const updatedCv = await updateCV(id, dataToUpdate);
    console.log('CV updated successfully.');
    return NextResponse.json(updatedCv);

  } catch (error) {
    console.error(`Error handling PUT request for CV ID ${id}:`, error);
    // Handle potential JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update CV' }, { status: 500 });
  }
}

// DELETE /api/cv/[id]
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  let cvIdToDelete: string = 'unknown'; // Initialize here
  try {
    const params = await context.params;
    cvIdToDelete = params.id;
    
    // Await session check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Authentication failed.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    console.log(`Received DELETE request for CV ID: ${cvIdToDelete}`);

    const existingCv = await getCV(cvIdToDelete);
    if (!existingCv) {
      console.log('CV not found for deletion.');
      // Return 204 even if not found, as DELETE should be idempotent
      return new NextResponse(null, { status: 204 });
    }
    if (existingCv.developerId !== developerId) {
      console.log('Authorization failed: CV does not belong to user.');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteCV(cvIdToDelete);
    console.log('CV deleted successfully (DB record and S3 object).');
    return new NextResponse(null, { status: 204 }); // No content on successful delete

  } catch (error) {
    console.error(`Error handling DELETE request for CV ID ${cvIdToDelete}:`, error);
    return NextResponse.json({ error: 'Failed to delete CV' }, { status: 500 });
  }
} 