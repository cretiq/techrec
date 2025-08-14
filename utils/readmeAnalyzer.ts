// README Analysis Engine with AI-powered gap identification
// Analyzes README files to extract "Why, How, What" elements for CV presentation

import { geminiCircuitBreaker } from '@/utils/circuitBreaker';
import { traceGeminiCall, logGeminiAPI, LogLevel } from '@/utils/apiLogger';
import { ServerCache } from '@/lib/serverCache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { getGeminiModel } from '@/lib/modelConfig';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Cache configuration
const README_CACHE_TTL = 7200; // 2 hours for README analysis

// Debug logging
const DEBUG_README = process.env.NODE_ENV === 'development' || process.env.DEBUG_README === 'true';

const debugLog = (message: string, data?: any) => {
  if (DEBUG_README) {
    console.log(`[ReadmeAnalyzer] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Validation schemas
export const ReadmeAnalysisSchema = z.object({
  projectName: z.string(),
  confidence: z.number().min(0).max(100),
  why: z.object({
    problemStatement: z.string().nullable(),
    motivation: z.string().nullable(),
    targetAudience: z.string().nullable(),
    businessValue: z.string().nullable(),
    confidence: z.number().min(0).max(100)
  }),
  what: z.object({
    description: z.string().nullable(),
    keyFeatures: z.array(z.string()),
    technologies: z.array(z.string()),
    architecture: z.string().nullable(),
    confidence: z.number().min(0).max(100)
  }),
  how: z.object({
    implementation: z.string().nullable(),
    setup: z.string().nullable(),
    deployment: z.string().nullable(),
    usage: z.string().nullable(),
    confidence: z.number().min(0).max(100)
  }),
  gaps: z.object({
    missing: z.array(z.string()),
    weak: z.array(z.string()),
    suggestions: z.array(z.string()),
    priority: z.enum(['high', 'medium', 'low'])
  }),
  cvRelevance: z.object({
    technicalSkills: z.array(z.string()),
    problemSolving: z.array(z.string()),
    impact: z.array(z.string()),
    leadership: z.array(z.string()),
    score: z.number().min(0).max(100)
  }),
  enhancementOpportunities: z.array(z.object({
    area: z.string(),
    suggestion: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    effort: z.enum(['low', 'medium', 'high'])
  }))
});

export type ReadmeAnalysis = z.infer<typeof ReadmeAnalysisSchema>;

export interface ReadmeAnalyzerOptions {
  includeCodeAnalysis?: boolean;
  focusOnCVRelevance?: boolean;
  targetRole?: string;
  skipCache?: boolean;
}

/**
 * README Analyzer Engine
 */
export class ReadmeAnalyzer {
  
  /**
   * Analyze README content and extract structured information
   */
  static async analyzeReadme(
    readmeContent: string,
    repositoryInfo: {
      name: string;
      description?: string;
      language?: string;
      topics?: string[];
    },
    options: ReadmeAnalyzerOptions = {}
  ): Promise<ReadmeAnalysis> {
    const {
      includeCodeAnalysis = false,
      focusOnCVRelevance = true,
      targetRole = 'Software Developer',
      skipCache = false
    } = options;

    // Generate semantic cache key using ServerCache
    const cacheKey = ServerCache.generateReadmeAnalysisKey(
      repositoryInfo.name,
      repositoryInfo.description || 'no-description',
      readmeContent
    );
    
    // Check cache (server-side only)
    if (!skipCache && typeof window === 'undefined') {
      try {
        const { getCache } = await import('@/lib/redis');
        const cached = await getCache<ReadmeAnalysis>(cacheKey);
        if (cached) {
          debugLog(`Analysis from cache for ${repositoryInfo.name}`, { confidence: cached.confidence });
          return cached;
        }
      } catch (error) {
        debugLog(`Error getting analysis from cache for ${repositoryInfo.name}`, error);
      }
    }

    const startTime = Date.now();
    
    debugLog(`Starting README analysis for ${repositoryInfo.name}`, {
      contentLength: readmeContent.length,
      language: repositoryInfo.language,
      topics: repositoryInfo.topics?.length || 0
    });

    const analysisSchema = {
      projectName: "string",
      confidence: "number (0-100)",
      why: {
        problemStatement: "string or null",
        motivation: "string or null", 
        targetAudience: "string or null",
        businessValue: "string or null",
        confidence: "number (0-100)"
      },
      what: {
        description: "string or null",
        keyFeatures: ["string"],
        technologies: ["string"],
        architecture: "string or null",
        confidence: "number (0-100)"
      },
      how: {
        implementation: "string or null",
        setup: "string or null",
        deployment: "string or null",
        usage: "string or null",
        confidence: "number (0-100)"
      },
      gaps: {
        missing: ["string"],
        weak: ["string"],
        suggestions: ["string"],
        priority: "high|medium|low"
      },
      cvRelevance: {
        technicalSkills: ["string"],
        problemSolving: ["string"],
        impact: ["string"],
        leadership: ["string"],
        score: "number (0-100)"
      },
      enhancementOpportunities: [
        {
          area: "string",
          suggestion: "string",
          impact: "high|medium|low",
          effort: "low|medium|high"
        }
      ]
    };

    const prompt = `
You are an expert technical writer and CV consultant analyzing a GitHub README file to help developers create compelling project descriptions for their CVs.

REPOSITORY INFORMATION:
Name: ${repositoryInfo.name}
Description: ${repositoryInfo.description || 'Not provided'}
Primary Language: ${repositoryInfo.language || 'Not specified'}
Topics: ${repositoryInfo.topics?.join(', ') || 'None'}
Target Role: ${targetRole}

ANALYSIS REQUIREMENTS:
Analyze the README content and extract information following the WHY-WHAT-HOW framework for CV presentation.

RETURN ONLY a valid JSON object matching this exact schema:
${JSON.stringify(analysisSchema, null, 2)}

ANALYSIS GUIDELINES:

1. WHY Analysis (Problem & Motivation):
   - What problem does this project solve?
   - Why was it built?
   - Who is the target audience?
   - What business/personal value does it provide?

2. WHAT Analysis (Solution & Features):
   - What does the project do?
   - Key features and capabilities
   - Technologies and tools used
   - System architecture or approach

3. HOW Analysis (Implementation & Usage):
   - How was it implemented?
   - Setup and installation process
   - Deployment approach
   - How to use it

4. GAP Analysis:
   - What information is missing that would strengthen a CV presentation?
   - What areas are weakly described?
   - Suggestions for improvement
   - Priority level for addressing gaps

5. CV Relevance Assessment:
   - Technical skills demonstrated
   - Problem-solving approaches shown
   - Impact and results achieved
   - Leadership or collaboration aspects
   - Overall CV relevance score (0-100)

6. Enhancement Opportunities:
   - Specific areas for improvement
   - Suggestions for better CV presentation
   - Impact vs effort assessment

CRITICAL REQUIREMENTS:
- Focus on CV presentation value, not code quality
- Identify quantifiable impacts and achievements
- Look for transferable skills and technologies
- Assess professional presentation quality
- Suggest improvements for hiring manager appeal
- Be specific and actionable in suggestions
- Assign realistic confidence scores based on information availability

README CONTENT:
${readmeContent}

Return ONLY the JSON object, no explanatory text:`;

    try {
      const circuitResult = await geminiCircuitBreaker.execute(
        async () => {
          return await traceGeminiCall(
            'readme-analysis',
            async () => {
              const modelName = getGeminiModel('readme-analysis');
              const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                  temperature: 0.2, // Low temperature for consistent analysis
                  topK: 40,
                  topP: 0.8,
                  maxOutputTokens: 4096,
                },
              });

              const result = await model.generateContent(prompt);
              const response = await result.response;
              const content = response.text();

              logGeminiAPI('readme-analysis', LogLevel.INFO, `Analysis completed for ${repositoryInfo.name}`, {
                contentLength: content.length,
                model: modelName,
                repositoryName: repositoryInfo.name
              });

              return content;
            },
            {
              includeRequest: false, // Don't log README content for privacy
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
        logGeminiAPI('readme-analysis', LogLevel.ERROR, 'JSON parsing failed', {
          error: parseError instanceof Error ? parseError.message : String(parseError),
          repositoryName: repositoryInfo.name,
          rawContent: contentString.substring(0, 500)
        });
        throw new Error(`Failed to parse analysis response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      // Validate against schema
      const validationResult = ReadmeAnalysisSchema.safeParse(parsedData);
      if (!validationResult.success) {
        logGeminiAPI('readme-analysis', LogLevel.ERROR, 'Schema validation failed', {
          errors: validationResult.error.flatten(),
          repositoryName: repositoryInfo.name
        });
        throw new Error(`Analysis response doesn't match expected schema: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
      }

      const analysis = validationResult.data;
      
      // Cache the result (server-side only)
      if (!skipCache && typeof window === 'undefined') {
        try {
          const { setCache } = await import('@/lib/redis');
          await setCache(cacheKey, analysis, README_CACHE_TTL);
          debugLog(`Analysis cached for ${repositoryInfo.name}`, { confidence: analysis.confidence });
        } catch (cacheError) {
          debugLog(`Failed to cache analysis for ${repositoryInfo.name}`, cacheError);
        }
      }

      const duration = Date.now() - startTime;
      debugLog(`Analysis completed for ${repositoryInfo.name}`, {
        duration,
        confidence: analysis.confidence,
        cvRelevanceScore: analysis.cvRelevance.score,
        gapsFound: analysis.gaps.missing.length + analysis.gaps.weak.length,
        enhancementOpportunities: analysis.enhancementOpportunities.length
      });

      return analysis;

    } catch (error) {
      const duration = Date.now() - startTime;
      logGeminiAPI('readme-analysis', LogLevel.ERROR, 'Analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        repositoryName: repositoryInfo.name,
        duration
      });

      // Return fallback analysis
      return this.createFallbackAnalysis(repositoryInfo, readmeContent);
    }
  }

  /**
   * Create fallback analysis when AI analysis fails
   */
  private static createFallbackAnalysis(
    repositoryInfo: {
      name: string;
      description?: string;
      language?: string;
      topics?: string[];
    },
    readmeContent: string
  ): ReadmeAnalysis {
    debugLog(`Creating fallback analysis for ${repositoryInfo.name}`);

    const basicTechnologies = [
      repositoryInfo.language,
      ...(repositoryInfo.topics || [])
    ].filter(Boolean) as string[];

    return {
      projectName: repositoryInfo.name,
      confidence: 30, // Low confidence for fallback
      why: {
        problemStatement: repositoryInfo.description || null,
        motivation: null,
        targetAudience: null,
        businessValue: null,
        confidence: 20
      },
      what: {
        description: repositoryInfo.description || null,
        keyFeatures: [],
        technologies: basicTechnologies,
        architecture: null,
        confidence: 40
      },
      how: {
        implementation: null,
        setup: null,
        deployment: null,
        usage: null,
        confidence: 10
      },
      gaps: {
        missing: ['Problem statement', 'Feature description', 'Implementation details', 'Usage examples'],
        weak: ['Project motivation', 'Technical architecture'],
        suggestions: [
          'Add clear problem statement',
          'Describe key features and benefits',
          'Include setup and usage instructions',
          'Add technical implementation details'
        ],
        priority: 'high'
      },
      cvRelevance: {
        technicalSkills: basicTechnologies,
        problemSolving: [],
        impact: [],
        leadership: [],
        score: 25
      },
      enhancementOpportunities: [
        {
          area: 'Project Description',
          suggestion: 'Add comprehensive project overview and problem context',
          impact: 'high',
          effort: 'low'
        },
        {
          area: 'Technical Details',
          suggestion: 'Include architecture and implementation approach',
          impact: 'medium',
          effort: 'medium'
        }
      ]
    };
  }

  /**
   * Batch analyze multiple README files
   */
  static async batchAnalyze(
    readmeData: Array<{
      content: string;
      repository: {
        name: string;
        description?: string;
        language?: string;
        topics?: string[];
      };
    }>,
    options: ReadmeAnalyzerOptions = {}
  ): Promise<ReadmeAnalysis[]> {
    debugLog(`Starting batch analysis for ${readmeData.length} repositories`);

    const analyses = await Promise.allSettled(
      readmeData.map(({ content, repository }) =>
        this.analyzeReadme(content, repository, options)
      )
    );

    const results = analyses.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        logGeminiAPI('batch-analysis', LogLevel.ERROR, 'Individual analysis failed', {
          repositoryName: readmeData[index].repository.name,
          error: result.reason
        });
        return this.createFallbackAnalysis(readmeData[index].repository, readmeData[index].content);
      }
    });

    debugLog(`Batch analysis completed`, {
      total: readmeData.length,
      successful: results.filter(r => r.confidence > 50).length,
      averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    });

    return results;
  }

  /**
   * Get CV-optimized summary from analysis
   */
  static generateCVSummary(analysis: ReadmeAnalysis): {
    title: string;
    description: string;
    technologies: string[];
    achievements: string[];
    impact: string[];
  } {
    const { projectName, why, what, cvRelevance } = analysis;

    return {
      title: projectName,
      description: [
        why.problemStatement,
        what.description
      ].filter(Boolean).join(' ') || `${projectName} project`,
      technologies: what.technologies,
      achievements: [
        ...cvRelevance.problemSolving,
        ...cvRelevance.impact
      ].filter(Boolean),
      impact: cvRelevance.impact
    };
  }
}

export default ReadmeAnalyzer;