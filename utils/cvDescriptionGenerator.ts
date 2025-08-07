// CV Description Generator with Points Integration
// Generates professional CV-ready project descriptions using AI

import { geminiCircuitBreaker } from '@/utils/circuitBreaker';
import { traceGeminiCall, logGeminiAPI, LogLevel } from '@/utils/apiLogger';
import { ServerCache } from '@/lib/serverCache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { PointsManager } from '@/lib/gamification/pointsManager';
import { PointsSpendType } from '@prisma/client';

// Types
import { GitHubRepository } from '@/lib/github/repositoryService';
import { ReadmeAnalysis } from '@/utils/readmeAnalyzer';
import { ProjectIdea } from '@/utils/projectIdeasGenerator';
import { getGeminiModel } from '@/lib/modelConfig';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Cache configuration
const CV_DESCRIPTION_CACHE_TTL = 3600; // 1 hour for CV descriptions

// Debug logging
const DEBUG_CV_GENERATOR = process.env.NODE_ENV === 'development' || process.env.DEBUG_CV_GENERATOR === 'true';

const debugLog = (message: string, data?: any) => {
  if (DEBUG_CV_GENERATOR) {
    console.log(`[CVDescriptionGenerator] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Validation schemas
export const CVDescriptionSchema = z.object({
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  keyAchievements: z.array(z.string()),
  technicalHighlights: z.array(z.string()),
  impactMetrics: z.array(z.string()),
  professionalNarrative: z.object({
    why: z.string(),
    what: z.string(),
    how: z.string(),
    impact: z.string()
  }),
  cvFormatted: z.object({
    bulletPoints: z.array(z.string()),
    shortDescription: z.string(),
    longDescription: z.string(),
    skillsHighlighted: z.array(z.string())
  }),
  interviewTalking: z.object({
    elevator: z.string(),
    techDeep: z.string(),
    challenges: z.string(),
    learnings: z.string()
  })
});

export const CVDescriptionResponseSchema = z.object({
  success: z.boolean(),
  cvDescription: CVDescriptionSchema,
  pointsUsed: z.number(),
  generatedAt: z.number(),
  metadata: z.object({
    sourceType: z.enum(['github', 'idea', 'manual']),
    sourceId: z.string(),
    userId: z.string(),
    confidence: z.number().min(0).max(100)
  })
});

export type CVDescription = z.infer<typeof CVDescriptionSchema>;
export type CVDescriptionResponse = z.infer<typeof CVDescriptionResponseSchema>;

// Input types for different sources
export interface GitHubProjectInput {
  type: 'github';
  repository: GitHubRepository;
  readmeAnalysis?: ReadmeAnalysis;
  userContext?: ProjectEnhancementContext;
}

export interface ProjectIdeaInput {
  type: 'idea';
  projectIdea: ProjectIdea;
  customization?: ProjectCustomization;
  userContext?: ProjectEnhancementContext;
}

export interface ManualProjectInput {
  type: 'manual';
  projectData: {
    name: string;
    description: string;
    technologies: string[];
    features?: string[];
    challenges?: string;
    achievements?: string;
    impact?: string;
  };
  userContext?: ProjectEnhancementContext;
}

export interface ProjectEnhancementContext {
  personalRole?: string;
  teamSize?: string;
  duration?: string;
  challenges?: string;
  achievements?: string;
  impact?: string;
  context?: string;
}

export interface ProjectCustomization {
  focus?: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'data';
  complexity?: 'simplified' | 'standard' | 'enhanced';
  timeline?: 'accelerated' | 'standard' | 'extended';
  personalTwist?: string;
}

export type ProjectInput = GitHubProjectInput | ProjectIdeaInput | ManualProjectInput;

export interface CVGenerationRequest {
  userId: string;
  projectInput: ProjectInput;
  userProfile?: {
    name?: string;
    title?: string;
    experienceLevel?: string;
    targetRole?: string;
    industry?: string;
  };
  options?: {
    style?: 'professional' | 'technical' | 'startup' | 'academic';
    length?: 'concise' | 'detailed' | 'comprehensive';
    focus?: 'technical' | 'leadership' | 'impact' | 'innovation';
    skipCache?: boolean;
  };
}

/**
 * CV Description Generator with Points Integration
 */
export class CVDescriptionGenerator {

  /**
   * Generate CV description with points deduction
   */
  static async generateCVDescription(
    prisma: any,
    request: CVGenerationRequest
  ): Promise<CVDescriptionResponse> {
    const {
      userId,
      projectInput,
      userProfile = {},
      options = {}
    } = request;

    const {
      style = 'professional',
      length = 'detailed',
      focus = 'technical',
      skipCache = false
    } = options;

    // Generate semantic cache key using ServerCache
    const cacheKey = ServerCache.generateCVDescriptionKey(userId, projectInput, options);
    
    if (!skipCache && typeof window === 'undefined') {
      try {
        const { getCache } = await import('@/lib/redis');
        const cached = await getCache<CVDescriptionResponse>(cacheKey);
        if (cached) {
          debugLog(`CV description from cache for user ${userId}`, { 
            sourceType: cached.metadata.sourceType,
            confidence: cached.metadata.confidence 
          });
          return cached;
        }
      } catch (error) {
        debugLog(`Error getting CV description from cache for user ${userId}`, error);
      }
    }

    const startTime = Date.now();
    
    debugLog(`Starting CV description generation for user ${userId}`, {
      sourceType: projectInput.type,
      style,
      length,
      focus
    });

    // Spend points atomically first
    const spendType: PointsSpendType = 'PREMIUM_ANALYSIS'; // 5 points for comprehensive CV generation
    const sourceId = this.getSourceId(projectInput);
    
    const pointsResult = await PointsManager.spendPointsAtomic(
      prisma,
      userId,
      spendType,
      sourceId,
      {
        action: 'cv-description-generation',
        sourceType: projectInput.type,
        style,
        length,
        focus
      }
    );

    if (!pointsResult.success) {
      debugLog(`Points spending failed for user ${userId}`, pointsResult.error);
      return {
        success: false,
        cvDescription: this.createFallbackDescription(projectInput),
        pointsUsed: 0,
        generatedAt: Date.now(),
        metadata: {
          sourceType: projectInput.type,
          sourceId,
          userId,
          confidence: 0
        }
      };
    }

    const pointsUsed = pointsResult.pointsSpent || 0;
    debugLog(`Points deducted successfully for user ${userId}`, { pointsUsed, newBalance: pointsResult.newBalance });

    // Generate CV description using AI
    try {
      const cvDescription = await this.generateWithAI(projectInput, userProfile, options);
      
      const response: CVDescriptionResponse = {
        success: true,
        cvDescription,
        pointsUsed,
        generatedAt: Date.now(),
        metadata: {
          sourceType: projectInput.type,
          sourceId,
          userId,
          confidence: 85 // High confidence for AI generation
        }
      };

      // Cache the result (server-side only)
      if (!skipCache && typeof window === 'undefined') {
        try {
          const { setCache } = await import('@/lib/redis');
          await setCache(cacheKey, response, CV_DESCRIPTION_CACHE_TTL);
          debugLog(`CV description cached for user ${userId}`, { confidence: response.metadata.confidence });
        } catch (cacheError) {
          debugLog(`Failed to cache CV description for user ${userId}`, cacheError);
        }
      }

      const duration = Date.now() - startTime;
      debugLog(`CV description generation completed for user ${userId}`, {
        duration,
        pointsUsed,
        confidence: response.metadata.confidence,
        sourceType: projectInput.type
      });

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      logGeminiAPI('cv-description-generation', LogLevel.ERROR, 'CV description generation failed', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        duration,
        pointsUsed,
        sourceType: projectInput.type
      });

      // Points were already deducted, so return fallback with points used
      return {
        success: false,
        cvDescription: this.createFallbackDescription(projectInput),
        pointsUsed,
        generatedAt: Date.now(),
        metadata: {
          sourceType: projectInput.type,
          sourceId,
          userId,
          confidence: 25 // Low confidence for fallback
        }
      };
    }
  }

  /**
   * Generate CV description using AI
   */
  private static async generateWithAI(
    projectInput: ProjectInput,
    userProfile: any,
    options: any
  ): Promise<CVDescription> {
    const { style = 'professional', length = 'detailed', focus = 'technical' } = options;

    const responseSchema = {
      title: "string",
      summary: "string", 
      description: "string",
      keyAchievements: ["string"],
      technicalHighlights: ["string"],
      impactMetrics: ["string"],
      professionalNarrative: {
        why: "string",
        what: "string", 
        how: "string",
        impact: "string"
      },
      cvFormatted: {
        bulletPoints: ["string"],
        shortDescription: "string",
        longDescription: "string",
        skillsHighlighted: ["string"]
      },
      interviewTalking: {
        elevator: "string",
        techDeep: "string",
        challenges: "string",
        learnings: "string"
      }
    };

    const projectContext = this.buildProjectContext(projectInput);
    const userContext = this.buildUserContext(userProfile);

    const prompt = `
You are an expert CV consultant and technical writer specializing in helping software developers create compelling, professional project descriptions for their CVs and interviews.

USER PROFILE:
${userContext}

PROJECT CONTEXT:
${projectContext}

GENERATION REQUIREMENTS:
Style: ${style}
Length: ${length}
Focus: ${focus}

RETURN ONLY a valid JSON object matching this exact schema:
${JSON.stringify(responseSchema, null, 2)}

CV DESCRIPTION GUIDELINES:

1. **Professional CV Title**: Create a concise, impactful project title that sounds professional on a CV

2. **Executive Summary**: 2-3 sentence overview that captures the essence and value of the project

3. **Detailed Description**: Comprehensive project description suitable for CV "Projects" section

4. **Key Achievements**: 3-5 quantifiable accomplishments that demonstrate impact and skill

5. **Technical Highlights**: Specific technologies, patterns, and technical skills demonstrated

6. **Impact Metrics**: Quantifiable results, improvements, or outcomes (even if estimated)

7. **Professional Narrative** (WHY-WHAT-HOW-IMPACT):
   - WHY: Business case and problem context
   - WHAT: Solution overview and key features
   - HOW: Technical approach and implementation
   - IMPACT: Results and value delivered

8. **CV Formatted Content**:
   - Bullet points ready for CV copy-paste
   - Short description (1-2 sentences for CV)
   - Long description (full paragraph for detailed CV)
   - Skills highlighted (specific technologies/methodologies)

9. **Interview Talking Points**:
   - Elevator pitch (30-second overview)
   - Technical deep dive (detailed technical discussion)
   - Challenges faced (problem-solving demonstration)
   - Key learnings (growth and development narrative)

CRITICAL REQUIREMENTS:
- Focus on transferable skills and technologies relevant to hiring managers
- Quantify impact wherever possible (performance improvements, time saved, features delivered)
- Use action verbs and professional language throughout
- Ensure technical accuracy while maintaining accessibility
- Create compelling narrative that demonstrates problem-solving and technical expertise
- Tailor content to ${style} style and ${focus} focus
- Match ${length} length requirements (concise = brief, detailed = comprehensive)

PROJECT DATA:
${JSON.stringify(projectInput, null, 2)}

Return ONLY the JSON object, no explanatory text:`;

    const circuitResult = await geminiCircuitBreaker.execute(
      async () => {
        return await traceGeminiCall(
          'cv-description-generation',
          async () => {
            const modelName = getGeminiModel('project-description');
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: {
                temperature: 0.3, // Lower temperature for consistent professional tone
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 4096,
              },
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const content = response.text();

            logGeminiAPI('cv-description-generation', LogLevel.INFO, 'CV description generation completed', {
              contentLength: content.length,
              model: modelName,
              sourceType: projectInput.type,
              style,
              focus
            });

            return content;
          },
          {
            includeRequest: false, // Don't log full request for privacy
            includeResponse: false // Don't log response for privacy
          }
        );
      }
    );

    if (!circuitResult.success) {
      throw circuitResult.error || new Error('Circuit breaker prevented API call');
    }

    const content = circuitResult.data;

    if (!content) {
      throw new Error('Gemini response is empty');
    }

    // Clean and parse the response
    let cleanedContent = content.trim();
    cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      logGeminiAPI('cv-description-generation', LogLevel.ERROR, 'JSON parsing failed', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        rawContent: content.substring(0, 500)
      });
      throw new Error(`Failed to parse CV description response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate against schema
    const validationResult = CVDescriptionSchema.safeParse(parsedData);
    if (!validationResult.success) {
      logGeminiAPI('cv-description-generation', LogLevel.ERROR, 'Schema validation failed', {
        errors: validationResult.error.flatten()
      });
      throw new Error(`CV description response doesn't match expected schema: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
    }

    return validationResult.data;
  }

  /**
   * Build project context string for AI prompt
   */
  private static buildProjectContext(projectInput: ProjectInput): string {
    switch (projectInput.type) {
      case 'github':
        const { repository, readmeAnalysis, userContext } = projectInput;
        return `
Type: GitHub Repository Analysis
Repository: ${repository.name}
Description: ${repository.description || 'Not provided'}
Language: ${repository.language || 'Not specified'}
Technologies: ${repository.topics?.join(', ') || 'None specified'}
${readmeAnalysis ? `
README Analysis:
- Problem: ${readmeAnalysis.why.problemStatement || 'Not identified'}
- Features: ${readmeAnalysis.what.keyFeatures.join(', ')}
- Implementation: ${readmeAnalysis.how.implementation || 'Not documented'}
- CV Relevance Score: ${readmeAnalysis.cvRelevance.score}/100
` : ''}
${userContext ? `
User Context:
- Personal Role: ${userContext.personalRole || 'Not specified'}
- Team Size: ${userContext.teamSize || 'Not specified'}
- Duration: ${userContext.duration || 'Not specified'}
- Key Challenges: ${userContext.challenges || 'Not specified'}
- Achievements: ${userContext.achievements || 'Not specified'}
- Impact: ${userContext.impact || 'Not specified'}
` : ''}`;

      case 'idea':
        const { projectIdea, customization, userContext: ideaUserContext } = projectInput;
        return `
Type: Project Idea Implementation
Title: ${projectIdea.title}
Description: ${projectIdea.description}
Difficulty: ${projectIdea.difficulty}
Technologies: ${projectIdea.technologies.join(', ')}
Skills: ${projectIdea.skills.join(', ')}
WHY: ${projectIdea.why.problem} (${projectIdea.why.value})
WHAT: ${projectIdea.what.overview}
HOW: ${projectIdea.how.approach}
${customization ? `
Customization:
- Focus: ${customization.focus || 'Not specified'}
- Complexity: ${customization.complexity || 'Standard'}
- Personal Twist: ${customization.personalTwist || 'None'}
` : ''}
${ideaUserContext ? `
User Context:
- Personal Role: ${ideaUserContext.personalRole || 'Solo developer'}
- Duration: ${ideaUserContext.duration || projectIdea.estimatedTime}
- Key Challenges: ${ideaUserContext.challenges || 'Not specified'}
- Achievements: ${ideaUserContext.achievements || 'Not specified'}
` : ''}`;

      case 'manual':
        const { projectData, userContext: manualUserContext } = projectInput;
        return `
Type: Manual Project Entry
Name: ${projectData.name}
Description: ${projectData.description}
Technologies: ${projectData.technologies.join(', ')}
Features: ${projectData.features?.join(', ') || 'Not specified'}
${manualUserContext ? `
User Context:
- Personal Role: ${manualUserContext.personalRole || 'Not specified'}
- Team Size: ${manualUserContext.teamSize || 'Not specified'}
- Duration: ${manualUserContext.duration || 'Not specified'}
- Key Challenges: ${manualUserContext.challenges || projectData.challenges || 'Not specified'}
- Achievements: ${manualUserContext.achievements || projectData.achievements || 'Not specified'}
- Impact: ${manualUserContext.impact || projectData.impact || 'Not specified'}
` : ''}`;

      default:
        return 'Unknown project type';
    }
  }

  /**
   * Build user context string for AI prompt
   */
  private static buildUserContext(userProfile: any): string {
    return `
Name: ${userProfile.name || 'Not provided'}
Title: ${userProfile.title || 'Software Developer'}
Experience Level: ${userProfile.experienceLevel || 'Not specified'}
Target Role: ${userProfile.targetRole || 'Software Developer'}
Industry: ${userProfile.industry || 'Technology'}`;
  }

  /**
   * Get source ID for points transaction
   */
  private static getSourceId(projectInput: ProjectInput): string {
    switch (projectInput.type) {
      case 'github':
        return `github:${projectInput.repository.id}`;
      case 'idea':
        return `idea:${projectInput.projectIdea.id}`;
      case 'manual':
        return `manual:${projectInput.projectData.name.toLowerCase().replace(/\s+/g, '-')}`;
      default:
        return 'unknown';
    }
  }

  /**
   * Create fallback CV description when AI generation fails
   */
  private static createFallbackDescription(projectInput: ProjectInput): CVDescription {
    debugLog('Creating fallback CV description');

    const projectName = this.getProjectName(projectInput);
    const technologies = this.getTechnologies(projectInput);

    return {
      title: projectName,
      summary: `A ${projectInput.type} project demonstrating technical skills and problem-solving abilities.`,
      description: `Developed ${projectName} to showcase technical expertise and software development capabilities. The project demonstrates proficiency in modern development practices and technology integration.`,
      keyAchievements: [
        'Successfully completed project implementation',
        'Demonstrated technical problem-solving skills',
        'Applied modern development practices'
      ],
      technicalHighlights: technologies.slice(0, 5),
      impactMetrics: [
        'Functional application delivered',
        'Clean code architecture implemented',
        'Technical documentation created'
      ],
      professionalNarrative: {
        why: 'To demonstrate technical capabilities and problem-solving approach',
        what: `A ${projectInput.type} project showcasing software development skills`,
        how: 'Implemented using modern development practices and technologies',
        impact: 'Demonstrates technical competency and development expertise'
      },
      cvFormatted: {
        bulletPoints: [
          `Developed ${projectName} using ${technologies.slice(0, 3).join(', ')}`,
          'Implemented clean code architecture and best practices',
          'Delivered functional application with comprehensive documentation'
        ],
        shortDescription: `${projectName} - Technical demonstration project`,
        longDescription: `Developed ${projectName} to showcase technical expertise in ${technologies.slice(0, 3).join(', ')} and modern software development practices.`,
        skillsHighlighted: technologies.slice(0, 5)
      },
      interviewTalking: {
        elevator: `I developed ${projectName} to demonstrate my technical skills in ${technologies.slice(0, 2).join(' and ')}.`,
        techDeep: `The project showcases my ability to work with ${technologies.join(', ')} and implement clean, maintainable code architecture.`,
        challenges: 'The main challenges involved integrating different technologies and ensuring code quality throughout development.',
        learnings: 'This project enhanced my understanding of software development best practices and technology integration patterns.'
      }
    };
  }

  /**
   * Extract project name from input
   */
  private static getProjectName(projectInput: ProjectInput): string {
    switch (projectInput.type) {
      case 'github':
        return projectInput.repository.name;
      case 'idea':
        return projectInput.projectIdea.title;
      case 'manual':
        return projectInput.projectData.name;
      default:
        return 'Project';
    }
  }

  /**
   * Extract technologies from input
   */
  private static getTechnologies(projectInput: ProjectInput): string[] {
    switch (projectInput.type) {
      case 'github':
        return [
          projectInput.repository.language,
          ...projectInput.repository.topics
        ].filter(Boolean) as string[];
      case 'idea':
        return projectInput.projectIdea.technologies;
      case 'manual':
        return projectInput.projectData.technologies;
      default:
        return ['JavaScript', 'Web Development'];
    }
  }

  /**
   * Validate CV description request
   */
  static validateRequest(request: CVGenerationRequest): { isValid: boolean; reason?: string } {
    if (!request.userId) {
      return { isValid: false, reason: 'User ID is required' };
    }

    if (!request.projectInput) {
      return { isValid: false, reason: 'Project input is required' };
    }

    switch (request.projectInput.type) {
      case 'github':
        if (!request.projectInput.repository) {
          return { isValid: false, reason: 'GitHub repository data is required' };
        }
        break;
      case 'idea':
        if (!request.projectInput.projectIdea) {
          return { isValid: false, reason: 'Project idea data is required' };
        }
        break;
      case 'manual':
        if (!request.projectInput.projectData || !request.projectInput.projectData.name) {
          return { isValid: false, reason: 'Manual project data with name is required' };
        }
        break;
      default:
        return { isValid: false, reason: 'Unknown project input type' };
    }

    return { isValid: true };
  }
}

export default CVDescriptionGenerator;