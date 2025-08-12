import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient, AnalysisStatus } from '@prisma/client';
import { downloadS3FileAsBuffer } from '@/utils/s3Storage';
import { DirectGeminiUploadService } from '@/utils/directGeminiUpload';
import { syncCvDataToProfile } from '@/utils/backgroundProfileSync';
import { clearCachePattern } from '@/lib/redis';
import { z } from 'zod';
import { getGeminiModel } from '@/lib/modelConfig';

const prisma = new PrismaClient();

// Request validation schema
const reanalyzeRequestSchema = z.object({
  cvId: z.string(),
  model: z.enum(['gemini-2.5-flash', 'gemini-2.5-pro']).optional(),
  customPrompt: z.string().optional(),
});

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
  return Math.min(100, Math.max(0, score));
}

// Get next version number for a CV
async function getNextVersionNumber(cvId: string): Promise<number> {
  const lastVersion = await prisma.cvAnalysisVersion.findFirst({
    where: { cvId },
    orderBy: { versionNumber: 'desc' },
    select: { versionNumber: true },
  });
  return (lastVersion?.versionNumber || 0) + 1;
}

export async function POST(request: Request) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = reanalyzeRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { cvId, model = 'gemini-2.5-flash', customPrompt } = validationResult.data;

    // Verify CV ownership
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: { developer: true },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    if (cv.developerId !== developerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update CV status to ANALYZING
    await prisma.cV.update({
      where: { id: cvId },
      data: { status: AnalysisStatus.ANALYZING },
    });

    // Download file from S3
    console.log(`[Reanalyze] Downloading CV file from S3: ${cv.s3Key}`);
    const fileBuffer = await downloadS3FileAsBuffer(cv.s3Key);
    
    if (!fileBuffer) {
      throw new Error('Failed to download CV file from S3');
    }

    // Create temporary file for Gemini upload
    const tempDir = '/tmp';
    const tempFilePath = `${tempDir}/${cv.filename}`;
    const fs = require('fs');
    fs.writeFileSync(tempFilePath, fileBuffer);

    try {
      // Initialize Direct Gemini upload service
      const directUploadService = new DirectGeminiUploadService();
      directUploadService.setDebugContext(cvId, developerId);
      
      // Configure model and prompt
      const analysisModel = model || getGeminiModel('cv-analysis');
      
      // Perform re-analysis with custom prompt if provided
      console.log(`[Reanalyze] Starting re-analysis with model: ${analysisModel}`);
      const analysisResult = await directUploadService.uploadAndAnalyze(
        tempFilePath,
        cv.originalName,
        {
          model: analysisModel,
          customPrompt: customPrompt,
        }
      );

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      if (!analysisResult.analysis?.success) {
        throw new Error(`Re-analysis failed: ${analysisResult.analysis?.error}`);
      }

      const extractedData = analysisResult.analysis.extractedData;
      const improvementScore = calculateImprovementScore(extractedData);

      // Get next version number
      const versionNumber = await getNextVersionNumber(cvId);

      // Deactivate all previous versions
      await prisma.cvAnalysisVersion.updateMany({
        where: { cvId },
        data: { isActive: false },
      });

      // Create new analysis version
      const newVersion = await prisma.cvAnalysisVersion.create({
        data: {
          cvId,
          versionNumber,
          modelUsed: analysisModel,
          prompt: customPrompt || null,
          extractedData: extractedData,
          improvementScore,
          isActive: true,
        },
      });

      // Sync to profile
      console.log(`[Reanalyze] Syncing to profile for developer: ${developerId}`);
      await syncCvDataToProfile(developerId, extractedData);

      // Update CV status and improvement score
      await prisma.cV.update({
        where: { id: cvId },
        data: {
          status: AnalysisStatus.COMPLETED,
          improvementScore,
        },
      });

      // Clear cache
      await clearCachePattern(`cv:${developerId}:*`);
      await clearCachePattern(`analysis:${developerId}:*`);

      console.log(`[Reanalyze] Re-analysis completed successfully. Version: ${versionNumber}`);

      return NextResponse.json({
        success: true,
        versionId: newVersion.id,
        versionNumber,
        improvementScore,
        extractedData,
      });
      
    } catch (error) {
      // Clean up temp file in case of error
      const fs = require('fs');
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }

  } catch (error: any) {
    console.error('[Reanalyze] Error:', error);
    
    // Update CV status to FAILED if cvId exists
    if (request.method === 'POST') {
      try {
        const body = await request.json().catch(() => ({}));
        if (body.cvId) {
          await prisma.cV.update({
            where: { id: body.cvId },
            data: { status: AnalysisStatus.FAILED },
          });
        }
      } catch (updateError) {
        console.error('[Reanalyze] Failed to update CV status:', updateError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to re-analyze CV', details: error.message },
      { status: 500 }
    );
  }
}