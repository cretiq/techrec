// API Route for Project Enhancement System
// Handles the complete project enhancement workflow

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { z } from 'zod';
import { CVDescriptionGenerator, CVGenerationRequest } from '@/utils/cvDescriptionGenerator';
import { createGitHubRepositoryService } from '@/lib/github/repositoryService';
import { ReadmeAnalyzer } from '@/utils/readmeAnalyzer';
import { ProjectIdeasGenerator } from '@/utils/projectIdeasGenerator';

// Request validation schemas
export const ProjectEnhancementRequestSchema = z.object({
  action: z.enum(['generate-cv-description', 'fetch-github-repos', 'analyze-readme', 'generate-project-ideas']),
  data: z.record(z.any())
});

export const CVGenerationRequestSchema = z.object({
  projectInput: z.object({
    type: z.enum(['github', 'idea', 'manual']),
    repository: z.object({
      id: z.number(),
      name: z.string(),
      description: z.string().nullable(),
      language: z.string().nullable(),
      topics: z.array(z.string()).optional()
    }).optional(),
    projectIdea: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      technologies: z.array(z.string())
    }).optional(),
    projectData: z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string())
    }).optional(),
    userContext: z.object({
      personalRole: z.string().optional(),
      teamSize: z.string().optional(),
      duration: z.string().optional(),
      challenges: z.string().optional(),
      achievements: z.string().optional(),
      impact: z.string().optional()
    }).optional()
  }),
  userProfile: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    experienceLevel: z.string().optional(),
    targetRole: z.string().optional()
  }).optional(),
  options: z.object({
    style: z.enum(['professional', 'technical', 'startup', 'academic']).optional(),
    length: z.enum(['concise', 'detailed', 'comprehensive']).optional(),
    focus: z.enum(['technical', 'leadership', 'impact', 'innovation']).optional()
  }).optional()
});

export const GitHubReposRequestSchema = z.object({
  includePrivate: z.boolean().optional(),
  includeForks: z.boolean().optional(),
  sortBy: z.enum(['updated', 'created', 'pushed']).optional(),
  limit: z.number().min(1).max(100).optional()
});

export const ReadmeAnalysisRequestSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  repositoryInfo: z.object({
    name: z.string(),
    description: z.string().optional(),
    language: z.string().optional(),
    topics: z.array(z.string()).optional()
  })
});

export const ProjectIdeasRequestSchema = z.object({
  skills: z.array(z.string()),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  focusArea: z.enum(['frontend', 'backend', 'fullstack', 'mobile', 'data', 'devops']).optional(),
  timeCommitment: z.enum(['weekend', 'week', 'month', 'longer']).optional(),
  interests: z.array(z.string()).optional(),
  careerGoals: z.string().optional()
});

/**
 * POST /api/project-enhancement
 * Main endpoint for project enhancement operations
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse and validate request
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const requestValidation = ProjectEnhancementRequestSchema.safeParse(body);
    if (!requestValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: requestValidation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { action, data } = requestValidation.data;

    // Route to appropriate handler
    switch (action) {
      case 'generate-cv-description':
        return await handleCVGeneration(userId, data);
      
      case 'fetch-github-repos':
        return await handleGitHubRepos(session, data);
      
      case 'analyze-readme':
        return await handleReadmeAnalysis(session, data);
      
      case 'generate-project-ideas':
        return await handleProjectIdeas(data);
      
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Project enhancement API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle CV description generation
 */
async function handleCVGeneration(userId: string, data: any) {
  try {
    // Validate CV generation request
    const validation = CVGenerationRequestSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid CV generation request',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { projectInput, userProfile, options } = validation.data;

    // Create CV generation request
    const cvRequest: CVGenerationRequest = {
      userId,
      projectInput: projectInput as any,
      userProfile,
      options
    };

    // Validate the request structure
    const requestValidation = CVDescriptionGenerator.validateRequest(cvRequest);
    if (!requestValidation.isValid) {
      return NextResponse.json(
        { error: requestValidation.reason },
        { status: 400 }
      );
    }

    // Generate CV description with points deduction
    const result = await CVDescriptionGenerator.generateCVDescription(prisma, cvRequest);

    return NextResponse.json(result);

  } catch (error) {
    console.error('CV generation error:', error);
    return NextResponse.json(
      { 
        error: 'CV generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GitHub repositories fetching
 */
async function handleGitHubRepos(session: any, data: any) {
  try {
    // Check GitHub access token
    if (!session.user?.githubAccessToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found. Please reconnect your GitHub account.' },
        { status: 401 }
      );
    }

    // Validate request
    const validation = GitHubReposRequestSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid GitHub repos request',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const options = validation.data;

    // Create GitHub service and fetch repositories
    const githubService = createGitHubRepositoryService(
      session.user.githubAccessToken,
      session.user.id
    );

    const result = await githubService.fetchRepositories({
      includePrivate: options.includePrivate || false,
      includeForks: options.includeForks || false,
      sortBy: options.sortBy || 'updated',
      direction: 'desc',
      limit: options.limit || 30
    });

    return NextResponse.json({
      success: true,
      repositories: result.repositories,
      user: result.user,
      rateLimitStatus: result.rateLimitStatus,
      totalCount: result.totalCount,
      hasMore: result.hasMore
    });

  } catch (error) {
    console.error('GitHub repos fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch GitHub repositories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle README analysis
 */
async function handleReadmeAnalysis(session: any, data: any) {
  try {
    // Check GitHub access token
    if (!session.user?.githubAccessToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found. Please reconnect your GitHub account.' },
        { status: 401 }
      );
    }

    // Validate request
    const validation = ReadmeAnalysisRequestSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid README analysis request',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { owner, repo, repositoryInfo } = validation.data;

    // Create GitHub service and get README content
    const githubService = createGitHubRepositoryService(
      session.user.githubAccessToken,
      session.user.id
    );

    const readmeContent = await githubService.getReadmeContent(owner, repo);
    
    if (!readmeContent) {
      return NextResponse.json(
        { error: 'README not found or inaccessible' },
        { status: 404 }
      );
    }

    // Analyze README content
    const analysis = await ReadmeAnalyzer.analyzeReadme(
      readmeContent,
      repositoryInfo,
      {
        includeCodeAnalysis: false,
        focusOnCVRelevance: true,
        targetRole: 'Software Developer'
      }
    );

    return NextResponse.json({
      success: true,
      analysis,
      readmeLength: readmeContent.length
    });

  } catch (error) {
    console.error('README analysis error:', error);
    return NextResponse.json(
      { 
        error: 'README analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle project ideas generation
 */
async function handleProjectIdeas(data: any) {
  try {
    // Validate request
    const validation = ProjectIdeasRequestSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid project ideas request',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const request = validation.data;

    // Generate project ideas
    const result = await ProjectIdeasGenerator.generateIdeas(request);

    return NextResponse.json({
      success: true,
      ideas: result.ideas,
      summary: result.summary,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Project ideas generation error:', error);
    return NextResponse.json(
      { 
        error: 'Project ideas generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/project-enhancement
 * Get user's project enhancement history and capabilities
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's current points balance and subscription info
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        monthlyPoints: true,
        pointsUsed: true,
        pointsEarned: true,
        totalXP: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate available points
    const availablePoints = Math.max(0, user.monthlyPoints + user.pointsEarned - user.pointsUsed);

    // Get recent project enhancement transactions
    const recentTransactions = await prisma.pointsTransaction.findMany({
      where: {
        developerId: userId,
        spendType: 'PREMIUM_ANALYSIS'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        amount: true,
        sourceId: true,
        description: true,
        createdAt: true,
        metadata: true
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        subscriptionTier: user.subscriptionTier,
        totalXP: user.totalXP,
        points: {
          monthly: user.monthlyPoints,
          used: user.pointsUsed,
          earned: user.pointsEarned,
          available: availablePoints
        }
      },
      capabilities: {
        cvGenerationCost: 5, // PREMIUM_ANALYSIS cost
        githubIntegration: !!session.user?.githubAccessToken,
        canGenerateCV: availablePoints >= 5
      },
      recentActivity: recentTransactions
    });

  } catch (error) {
    console.error('Project enhancement status error:', error);
    return NextResponse.json(
      { error: 'Failed to get project enhancement status' },
      { status: 500 }
    );
  }
}