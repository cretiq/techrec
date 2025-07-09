// Enhanced Gamification Dashboard API Endpoint
// Provides comprehensive dashboard data including profile completeness, 
// roadmap progress, recent badges, streak data, and activity stats

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { gamificationEvents } from '@/lib/gamification/eventManager';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🏠 [Dashboard API] Fetching dashboard data for user:', session.user.email);

    // Get user with comprehensive data
    const user = await prisma.developer.findUnique({
      where: { email: session.user.email },
      include: {
        userBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
          take: 5
        },
        cvAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            analysisResult: true,
            status: true,
            createdAt: true
          }
        },
        pointsTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            amount: true,
            source: true,
            spendType: true,
            description: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get gamification profile
    const gamificationProfile = await gamificationEvents.getUserProfile(user.id);
    
    if (!gamificationProfile) {
      return NextResponse.json({ error: 'Failed to get gamification profile' }, { status: 500 });
    }

    // Calculate profile completeness score (reusing ProfileScoringSidebar logic)
    const calculateProfileCompleteness = () => {
      const latestAnalysis = user.cvAnalyses[0];
      if (!latestAnalysis || !latestAnalysis.analysisResult) {
        return { score: 0, sections: [] };
      }

      // Extract analysis data from JSON field
      const analysisData = latestAnalysis.analysisResult as any;
      const sections = [];
      let totalScore = 0;
      let sectionCount = 0;

      // Contact Info
      if (analysisData.contactInfo) {
        const contactFields = Object.values(analysisData.contactInfo).filter(Boolean).length;
        const contactScore = Math.round((contactFields / 7) * 100);
        sections.push({ name: 'Contact Info', score: contactScore });
        totalScore += contactScore;
        sectionCount++;
      }

      // About/Summary
      if (analysisData.about !== undefined) {
        const aboutLength = analysisData.about?.length || 0;
        const aboutScore = aboutLength > 200 ? 100 : Math.round((aboutLength / 200) * 100);
        sections.push({ name: 'Summary', score: aboutScore });
        totalScore += aboutScore;
        sectionCount++;
      }

      // Skills
      if (analysisData.skills && Array.isArray(analysisData.skills)) {
        const skillCount = analysisData.skills.length;
        const skillScore = skillCount >= 10 ? 100 : Math.round((skillCount / 10) * 100);
        sections.push({ name: 'Skills', score: skillScore });
        totalScore += skillScore;
        sectionCount++;
      }

      // Experience
      if (analysisData.experience && Array.isArray(analysisData.experience)) {
        const expCount = analysisData.experience.length;
        const hasDetails = analysisData.experience.some((exp: any) => 
          exp.responsibilities?.length > 0
        );
        const expScore = expCount > 0 ? (hasDetails ? 100 : 70) : 0;
        sections.push({ name: 'Experience', score: expScore });
        totalScore += expScore;
        sectionCount++;
      }

      // Education
      if (analysisData.education && Array.isArray(analysisData.education)) {
        const eduCount = analysisData.education.length;
        const eduScore = eduCount > 0 ? 100 : 0;
        sections.push({ name: 'Education', score: eduScore });
        totalScore += eduScore;
        sectionCount++;
      }

      const overallScore = sectionCount > 0 ? Math.round(totalScore / sectionCount) : 0;
      return { score: overallScore, sections };
    };

    // Calculate onboarding roadmap progress
    const calculateRoadmapProgress = () => {
      const hasCompletedAnalysis = user.cvAnalyses.length > 0 && user.cvAnalyses[0]?.status === 'COMPLETED';
      
      const milestones = [
        {
          id: 'cv-upload',
          title: 'Upload Your CV',
          isCompleted: user.cvAnalyses.length > 0,
          completedAt: user.cvAnalyses[0]?.createdAt || null
        },
        {
          id: 'first-analysis',
          title: 'Get AI Feedback',
          isCompleted: hasCompletedAnalysis,
          completedAt: hasCompletedAnalysis ? user.cvAnalyses[0]?.createdAt || null : null
        },
        {
          id: 'profile-improvement',
          title: 'Improve Your Profile',
          isCompleted: calculateProfileCompleteness().score >= 90,
          completedAt: null
        },
        {
          id: 'role-search',
          title: 'Search for Roles',
          isCompleted: false, // TODO: Track role search activity
          completedAt: null
        },
        {
          id: 'cover-letter',
          title: 'Write AI Cover Letter',
          isCompleted: false, // TODO: Track cover letter generation
          completedAt: null
        }
      ];

      const completedCount = milestones.filter(m => m.isCompleted).length;
      const progress = (completedCount / milestones.length) * 100;

      return { milestones, completedCount, progress };
    };

    // Get activity stats
    const getActivityStats = () => {
      // TODO: Implement actual activity tracking
      return {
        cvsAnalyzed: user.cvAnalyses.length,
        rolesSearched: 0, // TODO: Track from search history
        applicationsSubmitted: 0, // TODO: Track from application history
        coverLettersGenerated: 0, // TODO: Track from cover letter generation
        weeklyActivity: [
          { day: 'Mon', activities: 2 },
          { day: 'Tue', activities: 5 },
          { day: 'Wed', activities: 3 },
          { day: 'Thu', activities: 7 },
          { day: 'Fri', activities: 4 },
          { day: 'Sat', activities: 1 },
          { day: 'Sun', activities: 2 }
        ],
        monthlyGoal: {
          target: 20,
          current: 0, // TODO: Track applications
          label: 'Applications Goal'
        }
      };
    };

    // Get daily streak data
    const getStreakData = () => {
      const now = new Date();
      const lastActivity = user.lastActivityDate;
      
      let currentStreak = user.streak || 0;
      let isStreakActive = false;
      
      if (lastActivity) {
        const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        isStreakActive = daysSinceActivity <= 1;
        
        if (daysSinceActivity > 1) {
          currentStreak = 0; // Streak broken
        }
      }

      return {
        currentStreak,
        bestStreak: 12, // TODO: Track best streak
        lastActivityDate: lastActivity,
        isStreakActive,
        nextMilestone: currentStreak < 7 ? {
          target: 7,
          reward: 'Consistency King Badge',
          daysLeft: 7 - currentStreak
        } : null
      };
    };

    // Get points data
    const getPointsData = () => {
      const pointsData = {
        available: user.monthlyPoints - user.pointsUsed,
        monthly: user.monthlyPoints,
        used: user.pointsUsed,
        earned: user.pointsEarned,
        resetDate: user.pointsResetDate,
        subscriptionTier: user.subscriptionTier,
        efficiency: user.pointsUsed > 0 ? Math.round((user.pointsEarned / user.pointsUsed) * 100) : 100,
        transactions: user.pointsTransactions
      };

      return pointsData;
    };

    const profileCompleteness = calculateProfileCompleteness();
    const roadmapProgress = calculateRoadmapProgress();
    const activityStats = getActivityStats();
    const streakData = getStreakData();
    const pointsData = getPointsData();

    console.log('🏠 [Dashboard API] Dashboard data calculated:', {
      profileScore: profileCompleteness.score,
      roadmapProgress: roadmapProgress.progress,
      currentStreak: streakData.currentStreak,
      recentBadges: user.userBadges.length
    });

    return NextResponse.json({
      // Core gamification profile
      profile: gamificationProfile,
      
      // Profile completeness
      profileCompleteness,
      
      // Onboarding roadmap
      roadmapProgress,
      
      // Activity statistics
      activityStats,
      
      // Streak data
      streakData,
      
      // Points data
      pointsData,
      
      // Recent badges (top 3)
      recentBadges: user.userBadges.slice(0, 3),
      
      // Dashboard metadata
      dashboardMetadata: {
        lastUpdated: new Date().toISOString(),
        dataVersion: '1.0'
      }
    });

  } catch (error) {
    console.error('🏠 [Dashboard API] Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}