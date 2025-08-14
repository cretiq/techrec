// Basic Project Ideas Generator with Skill-based Suggestions
// Generates personalized project ideas for junior developers

import { geminiCircuitBreaker } from '@/utils/circuitBreaker';
import { traceGeminiCall, logGeminiAPI, LogLevel } from '@/utils/apiLogger';
import { ServerCache } from '@/lib/serverCache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { getGeminiModel } from '@/lib/modelConfig';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Cache configuration
const IDEAS_CACHE_TTL = 3600; // 1 hour for project ideas

// Debug logging
const DEBUG_IDEAS = process.env.NODE_ENV === 'development' || process.env.DEBUG_IDEAS === 'true';

const debugLog = (message: string, data?: any) => {
  if (DEBUG_IDEAS) {
    console.log(`[ProjectIdeasGenerator] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Validation schemas
export const ProjectIdeaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedTime: z.string(),
  skills: z.array(z.string()),
  technologies: z.array(z.string()),
  why: z.object({
    problem: z.string(),
    audience: z.string(),
    value: z.string()
  }),
  what: z.object({
    overview: z.string(),
    keyFeatures: z.array(z.string()),
    deliverables: z.array(z.string())
  }),
  how: z.object({
    approach: z.string(),
    steps: z.array(z.string()),
    resources: z.array(z.string())
  }),
  cvBenefits: z.array(z.string()),
  portfolio: z.object({
    showcase: z.string(),
    metrics: z.array(z.string()),
    story: z.string()
  })
});

export const ProjectIdeasResponseSchema = z.object({
  ideas: z.array(ProjectIdeaSchema),
  summary: z.object({
    totalIdeas: z.number(),
    skillsCovered: z.array(z.string()),
    difficultyDistribution: z.object({
      beginner: z.number(),
      intermediate: z.number(),
      advanced: z.number()
    }),
    recommendedFirst: z.string()
  }),
  metadata: z.object({
    generatedAt: z.number(),
    skillsInput: z.array(z.string()),
    experienceLevel: z.string(),
    focusArea: z.string().optional()
  })
});

export type ProjectIdea = z.infer<typeof ProjectIdeaSchema>;
export type ProjectIdeasResponse = z.infer<typeof ProjectIdeasResponseSchema>;

export interface ProjectIdeasRequest {
  skills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  focusArea?: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'data' | 'devops';
  timeCommitment?: 'weekend' | 'week' | 'month' | 'longer';
  interests?: string[];
  careerGoals?: string;
}

/**
 * Project Ideas Generator
 */
export class ProjectIdeasGenerator {

  /**
   * Generate project ideas based on skills and preferences
   */
  static async generateIdeas(request: ProjectIdeasRequest): Promise<ProjectIdeasResponse> {
    const {
      skills,
      experienceLevel,
      focusArea = 'fullstack',
      timeCommitment = 'week',
      interests = [],
      careerGoals = 'Software Developer'
    } = request;

    // Generate semantic cache key using ServerCache
    const cacheKey = ServerCache.generateProjectIdeasKey({
      skills,
      experienceLevel,
      focusArea,
      timeCommitment
    });
    
    // Check cache (server-side only)
    if (typeof window === 'undefined') {
      try {
        const { getCache } = await import('@/lib/redis');
        const cached = await getCache<ProjectIdeasResponse>(cacheKey);
        if (cached) {
          debugLog('Project ideas from cache', { 
            totalIdeas: cached.ideas.length,
            skills: cached.metadata.skillsInput 
          });
          return cached;
        }
      } catch (error) {
        debugLog('Error getting project ideas from cache', error);
      }
    }

    const startTime = Date.now();
    
    debugLog('Starting project ideas generation', {
      skills: skills.length,
      experienceLevel,
      focusArea,
      timeCommitment
    });

    const responseSchema = {
      ideas: [
        {
          id: "string",
          title: "string",
          description: "string",
          difficulty: "beginner|intermediate|advanced",
          estimatedTime: "string",
          skills: ["string"],
          technologies: ["string"],
          why: {
            problem: "string",
            audience: "string", 
            value: "string"
          },
          what: {
            overview: "string",
            keyFeatures: ["string"],
            deliverables: ["string"]
          },
          how: {
            approach: "string",
            steps: ["string"],
            resources: ["string"]
          },
          cvBenefits: ["string"],
          portfolio: {
            showcase: "string",
            metrics: ["string"],
            story: "string"
          }
        }
      ],
      summary: {
        totalIdeas: "number",
        skillsCovered: ["string"],
        difficultyDistribution: {
          beginner: "number",
          intermediate: "number", 
          advanced: "number"
        },
        recommendedFirst: "string"
      },
      metadata: {
        generatedAt: "number",
        skillsInput: ["string"],
        experienceLevel: "string",
        focusArea: "string"
      }
    };

    const skillsList = skills.join(', ');
    const interestsList = interests.join(', ');

    const prompt = `
You are an expert software development mentor specializing in helping junior developers create compelling portfolio projects that enhance their CVs and demonstrate real-world problem-solving skills.

DEVELOPER PROFILE:
Skills: ${skillsList}
Experience Level: ${experienceLevel}
Focus Area: ${focusArea}
Time Commitment: ${timeCommitment}
Interests: ${interestsList || 'Not specified'}
Career Goal: ${careerGoals}

REQUIREMENTS:
Generate 5 personalized project ideas that will create strong CV entries and demonstrate practical skills to employers.

RETURN ONLY a valid JSON object matching this exact schema:
${JSON.stringify(responseSchema, null, 2)}

PROJECT GENERATION GUIDELINES:

1. **Skill Relevance**: Each project should utilize and showcase the developer's existing skills while introducing 1-2 new technologies
2. **Real-World Problems**: Focus on projects that solve actual problems people face, not just technical exercises
3. **CV Appeal**: Projects should have clear business value and measurable impact that sounds impressive to hiring managers
4. **Progressive Difficulty**: Include a mix of difficulties appropriate for the experience level
5. **Time Realistic**: Match estimated completion time to the specified time commitment
6. **Portfolio Ready**: Each project should produce tangible deliverables suitable for portfolio showcase

DIFFICULTY GUIDELINES:
- **Beginner**: CRUD applications, simple UI projects, basic API integrations
- **Intermediate**: Full-stack applications, API development, data processing, authentication
- **Advanced**: Complex systems, microservices, performance optimization, advanced algorithms

PROJECT STRUCTURE REQUIREMENTS:

For each project provide:

**WHY** (Problem & Value):
- Clear problem statement that resonates with employers
- Target audience definition 
- Business/personal value proposition

**WHAT** (Solution & Features):
- Compelling project overview
- 3-5 key features that demonstrate skills
- Specific deliverables for portfolio

**HOW** (Implementation & Approach):
- High-level technical approach
- 6-8 implementation steps
- Learning resources and tools needed

**CV Benefits**: 
- Specific skills and achievements this project demonstrates
- How to present it professionally on a CV

**Portfolio Showcase**:
- How to present the project effectively
- Key metrics to highlight (users, performance, features)
- Professional story for interviews

CRITICAL REQUIREMENTS:
- Focus on projects that solve real problems, not just demonstrate tech skills
- Include clear success metrics and measurable outcomes
- Ensure each project tells a compelling professional story
- Match technical complexity to experience level
- Provide actionable implementation guidance
- Generate unique IDs for each project (format: "proj_" + 8 random chars)
- Set generatedAt to current timestamp: ${Date.now()}

Return ONLY the JSON object, no explanatory text:`;

    try {
      const circuitResult = await geminiCircuitBreaker.execute(
        async () => {
          return await traceGeminiCall(
            'project-ideas-generation',
            async () => {
              const modelName = getGeminiModel('project-ideas');
              const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                  temperature: 0.7, // Higher temperature for creative project ideas
                  topK: 40,
                  topP: 0.9,
                  maxOutputTokens: 6144,
                },
              });

              const result = await model.generateContent(prompt);
              const response = await result.response;
              const content = response.text();

              logGeminiAPI('project-ideas-generation', LogLevel.INFO, 'Ideas generation completed', {
                contentLength: content.length,
                model: modelName,
                skills: skills.length,
                experienceLevel
              });

              return content;
            },
            {
              includeRequest: false, // Don't log request for privacy
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

      // Extract the actual string content from the response data
      const contentString = typeof content === 'string' ? content : content.data || '';

      if (!contentString) {
        throw new Error('Gemini response data is empty');
      }

      // Clean and parse the response
      let cleanedContent = contentString.trim();
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }

      let parsedData;
      try {
        parsedData = JSON.parse(cleanedContent);
      } catch (parseError) {
        logGeminiAPI('project-ideas-generation', LogLevel.ERROR, 'JSON parsing failed', {
          error: parseError instanceof Error ? parseError.message : String(parseError),
          rawContent: contentString.substring(0, 500)
        });
        throw new Error(`Failed to parse ideas response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      // Validate against schema
      const validationResult = ProjectIdeasResponseSchema.safeParse(parsedData);
      if (!validationResult.success) {
        logGeminiAPI('project-ideas-generation', LogLevel.ERROR, 'Schema validation failed', {
          errors: validationResult.error.flatten()
        });
        throw new Error(`Ideas response doesn't match expected schema: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
      }

      const ideasResponse = validationResult.data;
      
      // Cache the result (server-side only)
      if (typeof window === 'undefined') {
        try {
          const { setCache } = await import('@/lib/redis');
          await setCache(cacheKey, ideasResponse, IDEAS_CACHE_TTL);
          debugLog('Project ideas cached', { totalIdeas: ideasResponse.ideas.length });
        } catch (cacheError) {
          debugLog('Failed to cache project ideas', cacheError);
        }
      }

      const duration = Date.now() - startTime;
      debugLog('Ideas generation completed', {
        duration,
        totalIdeas: ideasResponse.ideas.length,
        skillsCovered: ideasResponse.summary.skillsCovered.length,
        difficultyDistribution: ideasResponse.summary.difficultyDistribution
      });

      return ideasResponse;

    } catch (error) {
      const duration = Date.now() - startTime;
      logGeminiAPI('project-ideas-generation', LogLevel.ERROR, 'Ideas generation failed', {
        error: error instanceof Error ? error.message : String(error),
        duration,
        skills: skills.length,
        experienceLevel
      });

      // Return fallback ideas
      return this.createFallbackIdeas(request);
    }
  }

  /**
   * Create fallback project ideas when AI generation fails
   */
  private static createFallbackIdeas(request: ProjectIdeasRequest): ProjectIdeasResponse {
    debugLog('Creating fallback project ideas');

    const { skills, experienceLevel, focusArea = 'fullstack' } = request;

    const fallbackIdeas: ProjectIdea[] = [
      {
        id: 'proj_fallback1',
        title: 'Personal Task Manager',
        description: 'A simple task management application to organize daily activities',
        difficulty: 'beginner',
        estimatedTime: '1-2 weeks',
        skills: skills.slice(0, 3),
        technologies: ['HTML', 'CSS', 'JavaScript'],
        why: {
          problem: 'Need better personal organization and productivity tracking',
          audience: 'Individuals seeking better task management',
          value: 'Improved personal productivity and time management'
        },
        what: {
          overview: 'A web-based task manager with basic CRUD operations',
          keyFeatures: ['Add/edit tasks', 'Mark as complete', 'Filter by status'],
          deliverables: ['Functional web application', 'Clean user interface', 'Local storage persistence']
        },
        how: {
          approach: 'Client-side application with local storage',
          steps: ['Design UI mockups', 'Create HTML structure', 'Add CSS styling', 'Implement JavaScript logic', 'Add local storage', 'Test functionality'],
          resources: ['MDN Web Docs', 'CSS Grid/Flexbox tutorials', 'JavaScript localStorage guide']
        },
        cvBenefits: ['Frontend development skills', 'User interface design', 'Problem-solving approach'],
        portfolio: {
          showcase: 'Live demo with source code on GitHub',
          metrics: ['Number of features implemented', 'Clean code organization', 'Responsive design'],
          story: 'Built to solve personal productivity challenges while learning web development fundamentals'
        }
      }
    ];

    return {
      ideas: fallbackIdeas,
      summary: {
        totalIdeas: fallbackIdeas.length,
        skillsCovered: skills.slice(0, 3),
        difficultyDistribution: {
          beginner: 1,
          intermediate: 0,
          advanced: 0
        },
        recommendedFirst: fallbackIdeas[0].id
      },
      metadata: {
        generatedAt: Date.now(),
        skillsInput: skills,
        experienceLevel,
        focusArea
      }
    };
  }

  /**
   * Get project idea by ID from a response
   */
  static getProjectById(response: ProjectIdeasResponse, id: string): ProjectIdea | null {
    return response.ideas.find(idea => idea.id === id) || null;
  }

  /**
   * Filter project ideas by criteria
   */
  static filterIdeas(
    response: ProjectIdeasResponse, 
    criteria: {
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      skills?: string[];
      maxTime?: string;
    }
  ): ProjectIdea[] {
    return response.ideas.filter(idea => {
      if (criteria.difficulty && idea.difficulty !== criteria.difficulty) {
        return false;
      }
      
      if (criteria.skills && criteria.skills.length > 0) {
        const hasMatchingSkill = criteria.skills.some(skill => 
          idea.skills.some(ideaSkill => 
            ideaSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!hasMatchingSkill) return false;
      }
      
      return true;
    });
  }

  /**
   * Generate quick project suggestion for specific skill
   */
  static async getQuickSuggestion(skill: string, experienceLevel: string = 'beginner'): Promise<string> {
    const cacheKey = `quick-suggestion:${skill}:${experienceLevel}`;
    
    // Check cache (server-side only)
    if (typeof window === 'undefined') {
      try {
        const { getCache } = await import('@/lib/redis');
        const cached = await getCache<string>(cacheKey);
        if (cached) {
          return cached;
        }
      } catch (error) {
        debugLog('Error getting quick suggestion from cache', error);
      }
    }

    try {
      const prompt = `Give me one quick project idea for a ${experienceLevel} developer to showcase ${skill} skills. Respond with just the project title and 1-sentence description. Keep it under 100 characters total.`;
      
      const modelName = getGeminiModel('project-ideas');
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const suggestion = result.response.text().trim();
      
      if (typeof window === 'undefined') {
        const { setCache } = await import('@/lib/redis');
        await setCache(cacheKey, suggestion, 1800); // 30 minutes cache
      }
      return suggestion;
    } catch (error) {
      debugLog('Quick suggestion generation failed', error);
      return `Build a simple ${skill} project to demonstrate your skills`;
    }
  }
}

export default ProjectIdeasGenerator;