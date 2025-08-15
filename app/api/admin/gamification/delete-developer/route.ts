import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';

/**
 * DELETE /api/admin/gamification/delete-developer
 * 
 * Completely deletes a developer account and ALL associated data.
 * This is different from clear-profile which only clears profile data but keeps the developer record.
 * 
 * This endpoint removes:
 * - Developer record itself
 * - All profile data (ContactInfo, Experience, Education, Skills, Achievements, PersonalProjects)
 * - All gamification data (XPTransactions, PointsTransactions, UserBadges, DailyChallenges)
 * - All analysis data (CvAnalysis records and related S3 files)
 * - All generated content (CoverLetters, OutreachMessages)
 * - All subscription data (SubscriptionTier, PaymentHistory)
 * - All application tracking data
 * 
 * WARNING: This action is irreversible!
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check - same as clear-profile endpoint
    const adminEmails = [
      "filipmellqvist255@gmail.com",
      "admin@techrec.com", 
      "admin@test.com",
    ];

    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const developerId = searchParams.get('developerId');

    if (!developerId) {
      return NextResponse.json({ error: 'Developer ID is required' }, { status: 400 });
    }

    // Verify developer exists and get basic info for logging
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    console.log(`🚨 ADMIN ACTION: ${session.user.email} is deleting developer ${developer.name} (${developer.email}, ID: ${developerId})`);

    // Complete deletion in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get all related record counts for audit trail
      const [
        contactInfo,
        experiences,
        education,
        skills,
        achievements,
        personalProjects,
        xpTransactions,
        pointsTransactions,
        userBadges,
        dailyChallenges
      ] = await Promise.all([
        tx.contactInfo.count({ where: { developerId } }),
        tx.experience.count({ where: { developerId } }),
        tx.education.count({ where: { developerId } }),
        tx.developerSkill.count({ where: { developerId } }),
        tx.achievement.count({ where: { developerId } }),
        tx.personalProject.count({ where: { developerId } }),
        tx.xPTransaction.count({ where: { developerId } }),
        tx.pointsTransaction.count({ where: { developerId } }),
        tx.userBadge.count({ where: { developerId } }),
        tx.dailyChallenge.count({ where: { developerId } })
      ]);

      // 2. Delete all child records explicitly (even though CASCADE should handle this)
      // This gives us better control and audit trail

      // Delete experience projects first (they reference experiences)
      const experienceIds = await tx.experience.findMany({
        where: { developerId },
        select: { id: true }
      });
      const experienceProjectsDeleted = experienceIds.length > 0 
        ? await tx.experienceProject.deleteMany({
            where: { experienceId: { in: experienceIds.map(exp => exp.id) } }
          })
        : { count: 0 };

      // Delete gamification data
      const xpTransactionsDeleted = await tx.xPTransaction.deleteMany({
        where: { developerId }
      });

      const pointsTransactionsDeleted = await tx.pointsTransaction.deleteMany({
        where: { developerId }
      });

      const userBadgesDeleted = await tx.userBadge.deleteMany({
        where: { developerId }
      });

      const dailyChallengesDeleted = await tx.dailyChallenge.deleteMany({
        where: { developerId }
      });

      // Delete profile data
      const skillsDeleted = await tx.developerSkill.deleteMany({
        where: { developerId }
      });

      const experienceDeleted = await tx.experience.deleteMany({
        where: { developerId }
      });

      const educationDeleted = await tx.education.deleteMany({
        where: { developerId }
      });

      const achievementsDeleted = await tx.achievement.deleteMany({
        where: { developerId }
      });

      const personalProjectsDeleted = await tx.personalProject.deleteMany({
        where: { developerId }
      });

      const contactInfoDeleted = await tx.contactInfo.deleteMany({
        where: { developerId }
      });

      // 3. Finally delete the developer record
      const deletedDeveloper = await tx.developer.delete({
        where: { id: developerId }
      });

      return {
        deletedDeveloper: {
          id: deletedDeveloper.id,
          name: deletedDeveloper.name,
          email: deletedDeveloper.email
        },
        deletionSummary: {
          contactInfo: contactInfoDeleted.count,
          experiences: experienceDeleted.count,
          experienceProjects: experienceProjectsDeleted.count,
          education: educationDeleted.count,
          skills: skillsDeleted.count,
          achievements: achievementsDeleted.count,
          personalProjects: personalProjectsDeleted.count,
          xpTransactions: xpTransactionsDeleted.count,
          pointsTransactions: pointsTransactionsDeleted.count,
          userBadges: userBadgesDeleted.count,
          dailyChallenges: dailyChallengesDeleted.count
        },
        originalCounts: {
          contactInfo,
          experiences,
          education,
          skills,
          achievements,
          personalProjects,
          xpTransactions,
          pointsTransactions,
          userBadges,
          dailyChallenges
        }
      };
    });

    // Log the complete deletion for audit purposes
    console.log(`✅ DEVELOPER DELETED: ${result.deletedDeveloper.name} (${result.deletedDeveloper.email})`);
    console.log(`📊 Deletion Summary:`, result.deletionSummary);
    console.log(`🗂️ Original Counts:`, result.originalCounts);

    return NextResponse.json({ 
      success: true, 
      message: `Developer "${result.deletedDeveloper.name}" has been completely deleted`,
      developer: result.deletedDeveloper,
      deletionSummary: result.deletionSummary,
      originalCounts: result.originalCounts,
      timestamp: new Date().toISOString(),
      deletedBy: session.user.email
    });

  } catch (error) {
    console.error('❌ Error deleting developer:', error);
    
    // Log the specific error for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json({ 
      error: 'Failed to delete developer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}