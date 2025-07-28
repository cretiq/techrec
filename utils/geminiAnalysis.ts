import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { CvAnalysisDataSchema } from '@/types/cv';
import { geminiCircuitBreaker } from '@/utils/circuitBreaker';
import { traceGeminiCall, logGeminiAPI, LogLevel } from '@/utils/apiLogger';
import { calculateTotalExperience } from '@/utils/experienceCalculator';

// Initialize Google AI client (requires GOOGLE_AI_API_KEY environment variable)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '', );

const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";

// Helper to measure elapsed time
const getElapsedTime = (start: [number, number]) => {
  const [seconds, nanoseconds] = process.hrtime(start);
  return seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
};

// Helper to estimate tokens in text (Gemini uses similar token estimation)
const estimateTokenCount = (text: string): number => {
  // Gemini tokens are roughly 4 characters on average, similar to GPT
  return Math.ceil(text.length / 4);
};

/**
 * Analyzes a CV using Google Gemini and returns structured data.
 * @param cvText - The raw text content of the CV
 * @returns Promise<CvAnalysisData> - Structured CV data
 * @throws Error if analysis fails
 */
export const analyzeCvWithGemini = async (cvText: string): Promise<z.infer<typeof CvAnalysisDataSchema>> => {
  const startTime = process.hrtime();
  const estimatedTokens = estimateTokenCount(cvText);
  
  console.log(`[Gemini Analysis] Starting analysis. Estimated tokens: ${estimatedTokens}`);

  if (!cvText || cvText.trim().length === 0) {
    throw new Error('CV text is empty or invalid');
  }

  if (estimatedTokens > 100000) { // Gemini 1.5 Pro has a large context window
    console.warn(`[Gemini Analysis] Large CV detected (${estimatedTokens} tokens). This may take longer.`);
  }

  // Define the expected JSON schema for Gemini
  const analysisSchema = {
    contactInfo: {
      name: "string or null",
      email: "string or null", 
      phone: "string or null",
      location: "string or null",
      linkedin: "string or null",
      github: "string or null",
      website: "string or null"
    },
    about: "string or null",
    skills: [
      {
        name: "string",
        level: "Beginner|Intermediate|Advanced|Expert",
        category: "string or null"
      }
    ],
    experience: [
      {
        title: "string",
        company: "string", 
        location: "string or null",
        startDate: "string or null",
        endDate: "string or null",
        current: "boolean",
        description: "string or null",
        achievements: ["string"]
      }
    ],
    education: [
      {
        degree: "string",
        institution: "string",
        location: "string or null", 
        startDate: "string or null",
        endDate: "string or null",
        gpa: "string or null",
        description: "string or null"
      }
    ],
    achievements: [
      {
        title: "string",
        description: "string or null",
        date: "string or null"
      }
    ],
    languages: [
      {
        name: "string",
        proficiency: "Basic|Conversational|Fluent|Native"
      }
    ],
    // Experience calculation fields for project enhancement recommendations
    totalYearsExperience: "number",
    isJuniorDeveloper: "boolean",
    experienceCalculation: {
      calculatedAt: "number",
      experienceItems: "number",
      method: "ai_analysis"
    }
  };

  const prompt = `
You are an expert CV parser and analyzer. Parse the following CV text and extract structured information.

IMPORTANT: Return ONLY a valid JSON object that matches this exact schema:
${JSON.stringify(analysisSchema, null, 2)}

Guidelines:
1. Extract contact information from headers, footers, or contact sections
2. Identify skills and categorize them (e.g., "Programming Languages", "Frameworks", "Tools")
3. Parse work experience with dates, companies, and achievements
4. Extract education details including degrees and institutions
5. Find notable achievements, certifications, or awards
6. Identify language skills if mentioned
7. Use null for missing information
8. For skill levels, infer from context (years of experience, project complexity, etc.)
9. For dates, use formats like "2023-01" or "2023" or "Present"
10. Be conservative with skill level assessment - default to "Intermediate" if unclear

CRITICAL: Experience Calculation Requirements:
11. Calculate totalYearsExperience by analyzing all work experience dates
12. For date ranges, calculate duration between start and end dates
13. For "current" positions, calculate from start date to present (${new Date().toISOString().slice(0, 7)})
14. Handle overlapping experiences by merging date ranges to avoid double-counting
15. Convert total experience to years as a decimal (e.g., 2.5 years)
16. Set isJuniorDeveloper to true if totalYearsExperience <= 2, false otherwise
17. Fill experienceCalculation with current timestamp (${Date.now()}), count of experience items, and method "ai_analysis"

CV Text:
${cvText}

Return ONLY the JSON object, no explanatory text:`;

  try {
    console.log(`[Gemini Analysis] Sending request to Gemini model: ${geminiModel}`);
    
    // Use circuit breaker protection for Gemini API call
    const circuitResult = await geminiCircuitBreaker.execute(
      async () => {
        return await traceGeminiCall(
          'cv-analysis',
          async () => {
            // Get the generative model
            const model = genAI.getGenerativeModel({ 
              model: geminiModel,
              generationConfig: {
                temperature: 0.1, // Low temperature for consistent parsing
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 8192,
              },
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const content = response.text();
            
            logGeminiAPI('cv-analysis', LogLevel.INFO, `Received response from Gemini model`, {
              contentLength: content.length,
              model: geminiModel,
              estimatedTokens
            });
            
            return content;
          },
          { 
            includeRequest: false, // Don't log CV content for privacy
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

    console.log(`[Gemini Analysis] Received response. Type: ${typeof content}, Length: ${typeof content === 'string' ? (content as string).length : 'N/A'} characters`);

    // Ensure content is a string before processing
    if (typeof content !== 'string') {
      console.error('[Gemini Analysis] Response content is not a string:', content);
      throw new Error(`Expected string response from Gemini API, got ${typeof content}`);
    }

    // Now we know content is a string, cast it for TypeScript
    const contentString = content as string;

    // Clean the response to extract JSON (Gemini sometimes includes markdown formatting)
    let cleanedContent = contentString.trim();
    
    // Remove markdown code blocks if present
    cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON object if there's extra text
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[Gemini Analysis] JSON parsing failed:', parseError);
      console.error('[Gemini Analysis] Raw content:', contentString.substring(0, 500) + '...');
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate the parsed data against our schema
    const validationResult = CvAnalysisDataSchema.safeParse(parsedData);
    if (!validationResult.success) {
      console.error('[Gemini Analysis] Schema validation failed:', validationResult.error.flatten());
      console.error('[Gemini Analysis] Parsed data:', JSON.stringify(parsedData, null, 2));
      throw new Error(`Gemini response doesn't match expected schema: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
    }

    const result = validationResult.data;

    // Fallback experience calculation if AI didn't provide it or provided incorrect data
    if (!result.totalYearsExperience || typeof result.totalYearsExperience !== 'number') {
      logGeminiAPI('cv-analysis', LogLevel.WARN, 'AI did not provide experience calculation, using fallback', {
        aiProvidedValue: result.totalYearsExperience,
        experienceCount: result.experience?.length || 0
      });

      if (result.experience && result.experience.length > 0) {
        try {
          // Convert experience items to the format expected by calculateTotalExperience
          const experienceItems = result.experience.map(exp => ({
            startDate: new Date(exp.startDate || Date.now()),
            endDate: exp.endDate ? new Date(exp.endDate) : (exp.current ? new Date() : new Date()),
            current: exp.current || false,
            title: exp.title || 'Unknown',
            company: exp.company || 'Unknown',
            description: exp.description || '',
            location: exp.location || null,
            responsibilities: [],
            achievements: exp.achievements || [],
            teamSize: null,
            techStack: [],
            id: '',
            developerId: '',
            createdAt: new Date(),
            updatedAt: new Date()
          }));

          const calculatedYears = calculateTotalExperience(experienceItems);
          
          result.totalYearsExperience = calculatedYears;
          result.isJuniorDeveloper = calculatedYears <= 2;
          result.experienceCalculation = {
            calculatedAt: Date.now(),
            experienceItems: experienceItems.length,
            method: 'manual_calculation'
          };

          logGeminiAPI('cv-analysis', LogLevel.INFO, 'Fallback experience calculation completed', {
            calculatedYears,
            isJuniorDeveloper: result.isJuniorDeveloper,
            experienceItems: experienceItems.length
          });
        } catch (calcError) {
          logGeminiAPI('cv-analysis', LogLevel.ERROR, 'Fallback experience calculation failed', {
            error: calcError instanceof Error ? calcError.message : String(calcError),
            experienceCount: result.experience?.length || 0
          });
          
          // Set safe defaults
          result.totalYearsExperience = 0;
          result.isJuniorDeveloper = true;
          result.experienceCalculation = {
            calculatedAt: Date.now(),
            experienceItems: result.experience?.length || 0,
            method: 'manual_calculation'
          };
        }
      }
    }

    const elapsedTime = getElapsedTime(startTime);
    console.log(`[Gemini Analysis] Analysis completed successfully in ${elapsedTime.toFixed(2)}ms`);
    console.log(`[Gemini Analysis] Extracted: ${result.skills?.length || 0} skills, ${result.experience?.length || 0} experiences, ${result.education?.length || 0} education entries`);
    console.log(`[Gemini Analysis] Experience calculation: ${result.totalYearsExperience} years, junior developer: ${result.isJuniorDeveloper}`);

    return result;

  } catch (error) {
    const elapsedTime = getElapsedTime(startTime);
    console.error(`[Gemini Analysis] Analysis failed after ${elapsedTime.toFixed(2)}ms:`, error);
    
    if (error instanceof Error) {
      // Check for specific Gemini API errors
      if (error.message.includes('API key')) {
        throw new Error('Google AI API key is missing or invalid. Please check your GOOGLE_AI_API_KEY environment variable.');
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new Error('Google AI API quota exceeded or rate limited. Please try again later.');
      } else if (error.message.includes('model')) {
        throw new Error(`Gemini model "${geminiModel}" is not available. Please check your model configuration.`);
      }
      throw error;
    } else {
      throw new Error('An unexpected error occurred during Gemini CV analysis');
    }
  }
}; 