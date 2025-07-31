import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * User Data Cleanup API Endpoint for Testing
 * 
 * This endpoint cleans all CV and analysis data for a specific user.
 * It should only be available in non-production environments.
 */

export async function POST(request: Request) {
  // Only allow in development/testing environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('🧹 [CLEAN-USER-DATA] Starting cleanup for user:', email);

    // Find the user
    const developer = await prisma.developer.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    if (!developer) {
      console.log('ℹ️ [CLEAN-USER-DATA] User not found:', email);
      return NextResponse.json({
        message: 'User not found - nothing to clean',
        email,
        cleaned: false
      }, { status: 200 });
    }

    console.log('👤 [CLEAN-USER-DATA] Found developer:', { id: developer.id, name: developer.name });

    // Delete CV analyses first (due to foreign key constraints)
    const deletedAnalyses = await prisma.cvAnalysis.deleteMany({
      where: { developerId: developer.id }
    });

    // Delete CV records
    const deletedCVs = await prisma.cV.deleteMany({
      where: { developerId: developer.id }
    });

    console.log('✅ [CLEAN-USER-DATA] Cleanup complete:', {
      developerId: developer.id,
      deletedAnalyses: deletedAnalyses.count,
      deletedCVs: deletedCVs.count
    });

    return NextResponse.json({
      message: 'User data cleaned successfully',
      email,
      developerId: developer.id,
      cleaned: true,
      deletedRecords: {
        cvAnalyses: deletedAnalyses.count,
        cvs: deletedCVs.count
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ [CLEAN-USER-DATA] Cleanup failed:', error);
    return NextResponse.json({
      error: 'User data cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}