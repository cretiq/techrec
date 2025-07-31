import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cv-analysis/latest
// Fetches the latest analysis version for the authenticated developer
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('[Latest Analysis] Session object:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('[Latest Analysis] Authentication failed - no valid session');
      console.log('[Latest Analysis] Session details:', { 
        sessionExists: !!session, 
        userExists: !!session?.user,
        userId: session?.user?.id 
      });
      
      // TEMPORARY: For testing, use mock session in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Latest Analysis] ⚠️ DEVELOPMENT: Using mock developer ID for testing');
        const developerId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectID format
        console.log('[Latest Analysis] 🧪 Mock developer ID:', developerId);
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    const developerId = session?.user?.id || '507f1f77bcf86cd799439011';
    console.log('[Latest Analysis] Using developer ID:', developerId);

    console.log(`[GET /cv-analysis/latest] ⚠️ ARCHITECTURAL CHANGE: Fetching from proper profile tables instead of CvAnalysis`);

    // Get the developer's profile data from proper single source of truth tables
    const developerProfile = await prisma.developer.findUnique({
      where: { id: developerId },
      include: {
        contactInfo: true,
        developerSkills: {
          include: {
            skill: {
              include: {
                category: true
              }
            }
          }
        },
        experience: {
          orderBy: { startDate: 'desc' }
        },
        education: {
          orderBy: { startDate: 'desc' }
        },
        achievements: {
          orderBy: { date: 'desc' }
        },
        cvs: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { extractedText: true, improvementScore: true, createdAt: true }
        }
      }
    });

    if (!developerProfile || developerProfile.cvs.length === 0) {
      console.log(`[GET /cv-analysis/latest] No profile data or completed CV found for developer: ${developerId}`);
      return NextResponse.json({ error: 'No analysis found' }, { status: 404 });
    }

    console.log(`[GET /cv-analysis/latest] Found profile data for developer: ${developerId}`, {
      hasContactInfo: !!developerProfile.contactInfo,
      skillsCount: developerProfile.developerSkills.length,
      experienceCount: developerProfile.experience.length,
      educationCount: developerProfile.education.length,
    });

    // Transform profile data to match expected CvAnalysis format for UI compatibility
    const latestCV = developerProfile.cvs[0];
    const transformedData = {
      id: `profile-${developerId}`, // Synthetic ID for compatibility
      developerId: developerId,
      status: 'COMPLETED',
      analysisResult: {
        // Contact Info
        contactInfo: developerProfile.contactInfo ? {
          name: developerProfile.name,
          email: developerProfile.profileEmail || developerProfile.email,
          phone: developerProfile.contactInfo.phone,
          location: developerProfile.contactInfo.address,
          linkedin: developerProfile.contactInfo.linkedin,
          github: developerProfile.contactInfo.github,
          website: developerProfile.contactInfo.website,
        } : {
          name: developerProfile.name,
          email: developerProfile.profileEmail || developerProfile.email,
        },
        
        // About/Summary
        about: developerProfile.about,
        
        // Skills - transform from junction table format
        skills: developerProfile.developerSkills.map(ds => ({
          name: ds.skill.name,
          category: ds.skill.category.name,
          level: ds.level,
        })),
        
        // Experience - transform from proper Experience table
        experience: developerProfile.experience.map(exp => ({
          title: exp.title,
          company: exp.company,
          description: exp.description,
          location: exp.location,
          startDate: exp.startDate.toISOString(),
          endDate: exp.endDate?.toISOString() || null,
          current: exp.current,
          responsibilities: exp.responsibilities,
          achievements: exp.achievements,
        })),
        
        // Education - transform from proper Education table
        education: developerProfile.education.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          location: edu.location,
          startDate: edu.startDate.toISOString(),
          endDate: edu.endDate?.toISOString() || null,
        })),
        
        // Achievements - transform from proper Achievement table
        achievements: developerProfile.achievements.map(ach => ({
          title: ach.title,
          description: ach.description,
          date: ach.date.toISOString(),
          url: ach.url,
          issuer: ach.issuer,
        })),
        
        // Add CV metadata
        cv: {
          extractedText: latestCV.extractedText,
        },
        
        // Add score
        improvementScore: latestCV.improvementScore,
      },
      analyzedAt: latestCV.createdAt,
      createdAt: latestCV.createdAt,
      cv: {
        extractedText: latestCV.extractedText
      }
    };

    console.log(`[GET /cv-analysis/latest] Transformed profile data to analysis format`, {
      syntheticId: transformedData.id,
      hasAnalysisResult: !!transformedData.analysisResult,
      skillsCount: transformedData.analysisResult.skills.length,
      experienceCount: transformedData.analysisResult.experience.length,
    });

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('[GET /cv-analysis/latest] Error fetching latest analysis:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 