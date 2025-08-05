// app/api/roles/batch-match/route.ts
// API endpoint for calculating match scores for multiple roles in batch

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/prisma/prisma';
import { 
  calculateBatchMatchScores,
  calculateRoleMatchScore 
} from '@/utils/matching/skillMatchingService';
import { 
  BatchMatchRequest, 
  BatchMatchResponse, 
  UserSkill, 
  RoleMatchScore,
  MatchError,
  MatchErrorCode
} from '@/types/matching';
import { SkillLevel } from '@prisma/client';
import { Role } from '@/types/role';
import { RapidApiJob } from '@/types/rapidapi';

// Validation schema
const BatchMatchRequestSchema = z.object({
  roleIds: z.array(z.string()).min(1).max(100), // Limit to 100 roles per batch
  rolesData: z.array(z.any()).optional(), // Array of role data objects
  userSkills: z.array(z.object({
    name: z.string(),
    level: z.nativeEnum(SkillLevel),
    categoryId: z.string().optional(),
    normalized: z.string()
  })).optional(),
});

// POST /api/roles/batch-match
export async function POST(request: NextRequest) {
  try {
    console.log('[API_DEBUG] POST /api/roles/batch-match called')
    
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('[API_DEBUG] Authentication failed - no session')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const startTime = Date.now();
    
    console.log('[API_DEBUG] User authenticated:', userId)

    // Parse and validate request body
    const body = await request.json();
    console.log('[API_DEBUG] Request body:', {
      roleIdsCount: body.roleIds?.length,
      rolesDataCount: body.rolesData?.length,
      userSkillsProvided: !!body.userSkills,
      firstRoleId: body.roleIds?.[0],
      firstRoleTitle: body.rolesData?.[0]?.title
    })
    
    const validation = BatchMatchRequestSchema.safeParse(body);
    
    if (!validation.success) {
      console.log('[API_DEBUG] Validation failed:', validation.error.issues)
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    console.log('[API_DEBUG] Validation passed')
    const { roleIds, rolesData, userSkills: providedUserSkills } = validation.data;

    // Get user skills - either from request or database
    let userSkills: UserSkill[] = [];
    
    if (providedUserSkills) {
      userSkills = providedUserSkills;
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

    // If user has no skills, return zero scores for all roles
    if (userSkills.length === 0) {
      const zeroScores: RoleMatchScore[] = roleIds.map(roleId => ({
        roleId,
        overallScore: 0,
        skillsMatched: 0,
        totalSkills: 0,
        matchedSkills: [],
        hasSkillsListed: false,
        breakdown: {
          skillsScore: 0
        }
      }));

      return NextResponse.json<BatchMatchResponse>({
        userId,
        roleScores: zeroScores,
        totalProcessed: roleIds.length,
        processingTime: Date.now() - startTime,
        errors: []
      });
    }

    // Validate that rolesData is provided and matches roleIds
    if (!rolesData || rolesData.length !== roleIds.length) {
      return NextResponse.json(
        { 
          error: 'Role data must be provided for all role IDs',
          details: `Expected ${roleIds.length} role data objects, got ${rolesData?.length || 0}`
        },
        { status: 400 }
      );
    }

    // Create role data provider function
    const roleDataMap = new Map<string, Role | RapidApiJob>();
    rolesData.forEach((roleData, index) => {
      if (roleData && roleData.id) {
        roleDataMap.set(roleData.id, roleData);
      } else {
        roleDataMap.set(roleIds[index], roleData);
      }
    });

    const roleDataProvider = async (roleId: string): Promise<Role | RapidApiJob | null> => {
      return roleDataMap.get(roleId) || null;
    };

    // Calculate batch match scores
    const batchRequest: BatchMatchRequest = {
      userId,
      roleIds,
      userSkills
    };

    console.log('[API_DEBUG] Starting batch calculation:', {
      userSkillsCount: userSkills.length,
      roleIdsCount: roleIds.length,
      userSkillSample: userSkills.slice(0, 3).map(s => ({ name: s.name, level: s.level })),
      rolesSample: rolesData.slice(0, 2).map(r => ({
        id: r.id,
        title: r.title,
        hasAiSkills: Boolean(r.ai_key_skills?.length),
        hasRequirements: Boolean(r.requirements?.length),
        hasSkills: Boolean(r.skills?.length),
        hasSpecialties: Boolean(r.linkedin_org_specialties?.length),
        hasDescription: Boolean(r.description?.length)
      }))
    });

    const result = await calculateBatchMatchScores(batchRequest, roleDataProvider);

    console.log('[API_DEBUG] Batch calculation completed:', {
      totalProcessed: result.totalProcessed,
      processingTime: result.processingTime,
      scoresGenerated: result.roleScores.length,
      errorsCount: result.errors.length,
      scoresSample: result.roleScores.slice(0, 3).map(s => ({
        roleId: s.roleId,
        overallScore: s.overallScore,
        skillsMatched: s.skillsMatched,
        totalSkills: s.totalSkills,
        hasSkillsListed: s.hasSkillsListed
      })),
      avgScore: Math.round(result.roleScores.reduce((sum, s) => sum + s.overallScore, 0) / Math.max(1, result.roleScores.length))
    });

    // Return successful response
    return NextResponse.json<BatchMatchResponse>(result);

  } catch (error) {
    console.error('Error calculating batch match scores:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error calculating batch match scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/roles/batch-match - Get matching statistics and configuration
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's skill count for statistics
    const developer = await prisma.developer.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            developerSkills: true
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

    // Return matching configuration and user stats
    return NextResponse.json({
      userId,
      userSkillsCount: developer._count.developerSkills,
      batchLimits: {
        maxRolesPerBatch: 100,
        maxBatchesPerMinute: 10
      },
      matchingConfig: {
        skillsWeight: 1.0,
        minimumConfidence: 0.7,
        fuzzyMatchThreshold: 0.8,
        minimumScoreThreshold: 0,
        bonusForHighLevelSkills: 1.2
      },
      scoreRanges: {
        excellent: { min: 70, max: 100, color: 'green' },
        good: { min: 40, max: 69, color: 'yellow' },
        limited: { min: 0, max: 39, color: 'red' }
      }
    });

  } catch (error) {
    console.error('Error getting batch match configuration:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error getting configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}