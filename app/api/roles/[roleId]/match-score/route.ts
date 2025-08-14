// app/api/roles/[roleId]/match-score/route.ts
// API endpoint for calculating match score for a specific role

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/prisma/prisma';
import { 
  calculateRoleMatchScore, 
  extractRoleSkills 
} from '@/utils/matching/skillMatchingService';
import { CalculateMatchRequest, CalculateMatchResponse, UserSkill } from '@/types/matching';
import { SkillLevel } from '@prisma/client';

// Validation schema
const CalculateMatchRequestSchema = z.object({
  userSkills: z.array(z.object({
    name: z.string(),
    level: z.nativeEnum(SkillLevel),
    categoryId: z.string().optional(),
    normalized: z.string()
  })).optional(),
});

// GET /api/roles/[roleId]/match-score
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { roleId } = params;
    const userId = session.user.id;

    // Get user skills from database
    const developer = await prisma.developer.findUnique({
      where: { id: userId },
      include: {
        developerSkills: {
          include: {
            skill: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer profile not found' },
        { status: 404 }
      );
    }

    // Convert developer skills to UserSkill format
    const userSkills: UserSkill[] = developer.developerSkills.map(ds => ({
      name: ds.skill.name,
      level: ds.level,
      categoryId: ds.skill.categoryId,
      normalized: ds.skill.name.toLowerCase().trim()
    }));

    // If user has no skills, return early with appropriate message
    if (userSkills.length === 0) {
      return NextResponse.json<CalculateMatchResponse>({
        matchScore: {
          roleId,
          overallScore: 0,
          skillsMatched: 0,
          totalSkills: 0,
          matchedSkills: [],
          hasSkillsListed: false,
          breakdown: {
            skillsScore: 0
          }
        },
        processingTime: 0
      });
    }

    // Get role data from the roles search cache or database
    // For now, we'll fetch from the Redux state or require it to be passed
    // In a real implementation, you might want to fetch from your role data source
    
    // TODO: Implement role data fetching
    // This is a placeholder - in the actual implementation, you would:
    // 1. Check if role data exists in Redis cache
    // 2. Fetch from external API if needed
    // 3. Or require role data to be passed in the request
    
    return NextResponse.json(
      { 
        error: 'Role data fetching not implemented yet. Use batch endpoint with role data.',
        code: 'IMPLEMENTATION_PENDING'
      },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error calculating match score:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error calculating match score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/roles/[roleId]/match-score - Calculate with provided role data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { roleId } = params;
    const userId = session.user.id;
    const startTime = Date.now();

    // Parse request body
    const body = await request.json();
    const validation = CalculateMatchRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    // Get user skills - either from request or database
    let userSkills: UserSkill[] = [];
    
    if (validation.data.userSkills) {
      userSkills = validation.data.userSkills;
    } else {
      // Fetch from database
      const developer = await prisma.developer.findUnique({
        where: { id: userId },
        include: {
          developerSkills: {
            include: {
              skill: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      if (!developer) {
        return NextResponse.json(
          { error: 'Developer profile not found' },
          { status: 404 }
        );
      }

      userSkills = developer.developerSkills.map(ds => ({
        name: ds.skill.name,
        level: ds.level,
        categoryId: ds.skill.categoryId,
        normalized: ds.skill.name.toLowerCase().trim()
      }));
    }

    // Role data must be provided in request body for now
    if (!body.roleData) {
      return NextResponse.json(
        { 
          error: 'Role data must be provided in request body',
          example: {
            roleData: {
              id: 'role-123',
              skills: ['React', 'TypeScript'],
              // ... other role fields
            },
            userSkills: [] // optional, will fetch from DB if not provided
          }
        },
        { status: 400 }
      );
    }

    // Calculate match score
    const matchScore = calculateRoleMatchScore(
      userSkills,
      body.roleData
    );

    const processingTime = Date.now() - startTime;

    return NextResponse.json<CalculateMatchResponse>({
      matchScore,
      processingTime
    });

  } catch (error) {
    console.error('Error calculating match score:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error calculating match score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}