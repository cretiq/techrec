import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Database Verification API Endpoint for Testing
 * 
 * This endpoint provides comprehensive database state verification for testing purposes.
 * It should only be available in non-production environments.
 */

export async function POST(request: Request) {
  // Only allow in development/testing environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    console.log('🔍 [DB-VERIFICATION] Starting database verification for user:', userEmail);

    // Find the user
    const developer = await prisma.developer.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        totalXP: true,
        subscriptionTier: true
      }
    });

    if (!developer) {
      return NextResponse.json({
        error: 'User not found',
        userEmail,
        exists: false
      }, { status: 404 });
    }

    console.log('👤 [DB-VERIFICATION] Found developer:', { id: developer.id, name: developer.name });

    // Get CV records for this user
    const cvRecords = await prisma.cV.findMany({
      where: { developerId: developer.id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        status: true,
        analysisId: true,
        improvementScore: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get analysis records for this user
    const analysisRecords = await prisma.cvAnalysis.findMany({
      where: { developerId: developer.id },
      select: {
        id: true,
        cvId: true,
        originalName: true,
        status: true,
        analysisResult: true,
        createdAt: true,
        analyzedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📊 [DB-VERIFICATION] Found records:', {
      cvCount: cvRecords.length,
      analysisCount: analysisRecords.length
    });

    // Analyze data completeness and quality
    const dataAnalysis = {
      developer: {
        exists: true,
        hasValidId: !!developer.id,
        hasName: !!developer.name,
        hasEmail: !!developer.email
      },
      cvRecords: {
        count: cvRecords.length,
        hasRecords: cvRecords.length > 0,
        latestStatus: cvRecords[0]?.status,
        allCompleted: cvRecords.every(cv => cv.status === 'COMPLETED'),
        hasLinkedAnalysis: cvRecords.every(cv => !!cv.analysisId),
        hasImprovementScores: cvRecords.every(cv => cv.improvementScore !== null)
      },
      analysisRecords: {
        count: analysisRecords.length,
        hasRecords: analysisRecords.length > 0,
        latestStatus: analysisRecords[0]?.status,
        allCompleted: analysisRecords.every(analysis => analysis.status === 'COMPLETED'),
        hasAnalysisData: analysisRecords.every(analysis => !!analysis.analysisResult),
        analysisDataQuality: analysisRecords.length > 0 ? analyzeLatestAnalysisQuality(analysisRecords[0]) : null
      },
      dataIntegrity: {
        cvAnalysisCountMatch: cvRecords.length === analysisRecords.length,
        allCvHaveAnalysis: cvRecords.every(cv => 
          analysisRecords.some(analysis => analysis.cvId === cv.id)
        ),
        allAnalysisHaveCV: analysisRecords.every(analysis => 
          cvRecords.some(cv => cv.id === analysis.cvId)
        )
      }
    };

    // Overall data completeness score
    const completenessScore = calculateDataCompletenessScore(dataAnalysis);

    const verificationResult = {
      timestamp: new Date().toISOString(),
      user: {
        email: developer.email,
        name: developer.name,
        id: developer.id,
        exists: true
      },
      cvCount: cvRecords.length,
      analysisCount: analysisRecords.length,
      dataComplete: completenessScore > 0.8,
      completenessScore,
      dataAnalysis,
      records: {
        cvRecords: cvRecords.map(cv => ({
          id: cv.id,
          filename: cv.originalName,
          status: cv.status,
          hasAnalysis: !!cv.analysisId,
          improvementScore: cv.improvementScore,
          createdAt: cv.createdAt
        })),
        analysisRecords: analysisRecords.map(analysis => ({
          id: analysis.id,
          cvId: analysis.cvId,
          filename: analysis.originalName,
          status: analysis.status,
          hasData: !!analysis.analysisResult,
          analyzedAt: analysis.analyzedAt,
          createdAt: analysis.createdAt
        }))
      }
    };

    console.log('✅ [DB-VERIFICATION] Verification complete:', {
      completenessScore,
      dataComplete: verificationResult.dataComplete,
      cvCount: cvRecords.length,
      analysisCount: analysisRecords.length
    });

    return NextResponse.json(verificationResult, { status: 200 });

  } catch (error) {
    console.error('❌ [DB-VERIFICATION] Verification failed:', error);
    return NextResponse.json({
      error: 'Database verification failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  // Only allow in development/testing environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    console.log('🧹 [DB-CLEANUP] Starting user data cleanup for:', userEmail);

    // Find the user
    const developer = await prisma.developer.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true }
    });

    if (!developer) {
      return NextResponse.json({
        message: 'User not found - nothing to clean',
        userEmail,
        cleaned: false
      }, { status: 200 });
    }

    // Delete CV analyses first (due to foreign key constraints)
    const deletedAnalyses = await prisma.cvAnalysis.deleteMany({
      where: { developerId: developer.id }
    });

    // Delete CV records
    const deletedCVs = await prisma.cV.deleteMany({
      where: { developerId: developer.id }
    });

    console.log('✅ [DB-CLEANUP] Cleanup complete:', {
      developerId: developer.id,
      deletedAnalyses: deletedAnalyses.count,
      deletedCVs: deletedCVs.count
    });

    return NextResponse.json({
      message: 'User CV data cleaned successfully',
      userEmail,
      developerId: developer.id,
      cleaned: true,
      deletedRecords: {
        cvAnalyses: deletedAnalyses.count,
        cvs: deletedCVs.count
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ [DB-CLEANUP] Cleanup failed:', error);
    return NextResponse.json({
      error: 'Database cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to analyze analysis data quality
function analyzeLatestAnalysisQuality(analysis: any) {
  if (!analysis.analysisResult) {
    return { quality: 'no_data', score: 0 };
  }

  const data = analysis.analysisResult;
  let qualityScore = 0;
  const issues = [];

  // Check for essential fields
  if (data.contactInfo?.name) qualityScore += 10;
  else issues.push('missing_name');

  if (data.contactInfo?.email) qualityScore += 10;
  else issues.push('missing_email');

  if (data.about && data.about.length > 50) qualityScore += 20;
  else issues.push('insufficient_about');

  if (data.skills && data.skills.length >= 3) qualityScore += 20;
  else issues.push('insufficient_skills');

  if (data.experience && data.experience.length >= 1) qualityScore += 20;
  else issues.push('no_experience');

  if (data.education && data.education.length >= 1) qualityScore += 10;
  else issues.push('no_education');

  if (data.totalYearsExperience && data.totalYearsExperience > 0) qualityScore += 10;
  else issues.push('no_experience_calculation');

  return {
    quality: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'good' : qualityScore >= 40 ? 'fair' : 'poor',
    score: qualityScore,
    maxScore: 100,
    issues,
    fieldCounts: {
      skills: data.skills?.length || 0,
      experience: data.experience?.length || 0,
      education: data.education?.length || 0,
      achievements: data.achievements?.length || 0,
      languages: data.languages?.length || 0
    }
  };
}

// Helper function to calculate overall data completeness
function calculateDataCompletenessScore(analysis: any): number {
  let score = 0;
  let maxScore = 0;

  // Developer data (20%)
  maxScore += 20;
  if (analysis.developer.exists) score += 10;
  if (analysis.developer.hasName) score += 5;
  if (analysis.developer.hasEmail) score += 5;

  // CV records (40%)
  maxScore += 40;
  if (analysis.cvRecords.hasRecords) score += 10;
  if (analysis.cvRecords.allCompleted) score += 15;
  if (analysis.cvRecords.hasLinkedAnalysis) score += 10;
  if (analysis.cvRecords.hasImprovementScores) score += 5;

  // Analysis records (30%)
  maxScore += 30;
  if (analysis.analysisRecords.hasRecords) score += 10;
  if (analysis.analysisRecords.allCompleted) score += 10;
  if (analysis.analysisRecords.hasAnalysisData) score += 10;

  // Data integrity (10%)
  maxScore += 10;
  if (analysis.dataIntegrity.cvAnalysisCountMatch) score += 3;
  if (analysis.dataIntegrity.allCvHaveAnalysis) score += 4;
  if (analysis.dataIntegrity.allAnalysisHaveCV) score += 3;

  return score / maxScore;
}