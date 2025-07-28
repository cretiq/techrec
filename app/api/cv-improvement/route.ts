import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import crypto from 'crypto'; // For hashing input data
import { getCache, setCache } from '@/lib/redis'; // Import cache functions
// Import Zod schemas
import { CvImprovementRequestSchema, CvImprovementResponseSchema } from '@/types/cv';
import { z } from 'zod';
// Import validation utilities
import { 
  validateCvSuggestionsOutput, 
  isValidCvSuggestionsResponse, 
  sanitizeSuggestionsData 
} from '@/utils/cvSuggestionValidation';

// Initialize OpenAI client (requires OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gptModel = process.env.GPT_MODEL || "gpt-4.1-nano-2025-04-14";

const SUGGESTION_CACHE_PREFIX = 'cv_suggestion:';
const SUGGESTION_CACHE_TTL_SECONDS = 60 * 60; // 1 hour TTL

// Retry configuration
const MAX_RETRY_ATTEMPTS = 7;
const RETRY_DELAY_MS = 1000; // 1 second delay between retries

/**
 * Generates CV improvement suggestions with retry mechanism and validation
 * @param cvData - The CV data to analyze
 * @param systemPrompt - The system prompt for OpenAI
 * @param userPrompt - The user prompt for OpenAI
 * @returns Validated suggestions response
 */
async function generateSuggestionsWithRetry(
  cvData: any, 
  systemPrompt: string, 
  userPrompt: string
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    console.log(`🔄 [cv-improvement] Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} - Generating suggestions...`);
    
    try {
      // --- OpenAI API Call --- 
      const completion = await openai.chat.completions.create({
        model: gptModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5 + (attempt - 1) * 0.1, // Slightly increase temperature on retries
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI response content is empty.');
      }
      
      console.log(`📥 [cv-improvement] Attempt ${attempt} - Received response (length: ${content.length})`);
      
      // Clean and parse the response
      let rawSuggestions;
      try {
        console.log('🧹 [cv-improvement] Cleaning OpenAI response...');
        let cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Remove any trailing comma or incomplete JSON elements
        cleanedContent = cleanedContent.replace(/,\s*$/, ''); // Remove trailing comma
        cleanedContent = cleanedContent.replace(/,\s*"reasoning"\s*$/, ''); // Remove malformed trailing "reasoning"
        cleanedContent = cleanedContent.replace(/,\s*]\s*}$/, ']}'); // Fix malformed array closure
        
        rawSuggestions = JSON.parse(cleanedContent);
        console.log('✅ [cv-improvement] Successfully parsed JSON response');
        
        // Additional cleanup: ensure suggestions array doesn't contain string elements
        if (rawSuggestions.suggestions && Array.isArray(rawSuggestions.suggestions)) {
          rawSuggestions.suggestions = rawSuggestions.suggestions.filter(suggestion => 
            typeof suggestion === 'object' && suggestion !== null && typeof suggestion !== 'string'
          );
        }
        
        // Sanitize the data
        rawSuggestions = sanitizeSuggestionsData(rawSuggestions);
        
      } catch (parseError) {
        console.error(`❌ [cv-improvement] Attempt ${attempt} - JSON parse failed:`, parseError);
        throw new Error(`Invalid JSON received from OpenAI: ${parseError}`);
      }

      // Validate the response using our clever validation
      console.log(`🔍 [cv-improvement] Attempt ${attempt} - Validating response quality...`);
      const validation = validateCvSuggestionsOutput(rawSuggestions);
      
      if (validation.isValid && validation.qualitySuggestions.length > 0) {
        console.log(`✅ [cv-improvement] Attempt ${attempt} - SUCCESS! Generated ${validation.qualitySuggestions.length} valid suggestions`);
        
        if (validation.warnings.length > 0) {
          console.log(`⚠️ [cv-improvement] Attempt ${attempt} - Warnings:`, validation.warnings);
        }
        
        // Return the validated and cleaned suggestions
        return {
          suggestions: validation.qualitySuggestions,
          fromCache: false,
          attempt: attempt,
          validationWarnings: validation.warnings
        };
      } else {
        const errorMessage = `Validation failed: ${validation.errors.join(', ')}`;
        console.log(`❌ [cv-improvement] Attempt ${attempt} - ${errorMessage}`);
        console.log(`📊 [cv-improvement] Attempt ${attempt} - Validation details:`, {
          suggestionCount: validation.suggestionCount,
          errors: validation.errors,
          warnings: validation.warnings
        });
        
        if (attempt === MAX_RETRY_ATTEMPTS) {
          // On final attempt, try fallback response creation
          console.log(`🔄 [cv-improvement] Final attempt - Creating fallback response...`);
          if (validation.qualitySuggestions.length > 0) {
            console.log(`✅ [cv-improvement] Using ${validation.qualitySuggestions.length} partial suggestions as fallback`);
            return {
              suggestions: validation.qualitySuggestions,
              fromCache: false,
              attempt: attempt,
              fallback: true,
              validationWarnings: validation.warnings,
              validationErrors: validation.errors
            };
          }
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error: any) {
      lastError = error;
      console.error(`❌ [cv-improvement] Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed:`, error.message);
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.log(`⏳ [cv-improvement] Waiting ${RETRY_DELAY_MS}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
  
  // If all attempts failed, throw a specific error for UI handling
  console.error(`💥 [cv-improvement] All ${MAX_RETRY_ATTEMPTS} attempts failed. Last error:`, lastError?.message);
  const error = new Error(`RETRY_EXHAUSTED: Failed to generate valid suggestions after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`);
  (error as any).code = 'RETRY_EXHAUSTED';
  throw error;
}

// Helper to create a stable hash from JSON data
const createDataHash = (data: any): string => {
    const stringifiedData = JSON.stringify(data); // Ensure consistent order if possible, though stringify isn't guaranteed
    return crypto.createHash('sha256').update(stringifiedData).digest('hex');
};

// Re-define the plain schema object locally for the prompt
const improvementSuggestionPlainSchema = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: { type: "string", description: "e.g., 'summary', 'experience[0].description', 'skills'" },
          originalText: { type: ["string", "null"], description: "The original text snippet being improved, if applicable." },
          suggestionType: { type: "string", enum: ["wording", "add_content", "remove_content", "reorder", "format"], description: "Type of suggestion." },
          suggestedText: { type: ["string", "null"], description: "The suggested replacement text, if applicable." },
          reasoning: { type: "string", description: "Explanation for the suggestion." },
        },
        required: ["section", "suggestionType", "reasoning"],
      },
    },
  },
  required: ["suggestions"],
};

export async function POST(request: Request) {
  try {
    console.log('Received CV improvement suggestion request...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Validate Request Body --- 
    let rawBody = await request.json();
    const validationResult = CvImprovementRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
       console.error('Invalid CV data for improvement request:', validationResult.error.flatten());
        return NextResponse.json(
            { error: 'Invalid CV data format', details: validationResult.error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    const cvData = validationResult.data; // Use validated data

    // --- Cache Check ---
    const dataHash = createDataHash(cvData);
    const cacheKey = `${SUGGESTION_CACHE_PREFIX}${dataHash}`;
    console.log('Calculated suggestion cache key:', cacheKey);

    const cachedSuggestions = await getCache<z.infer<typeof CvImprovementResponseSchema>>(cacheKey);
    if (cachedSuggestions) {
        console.log('Returning cached suggestions for hash:', dataHash);
        return NextResponse.json({ ...cachedSuggestions, fromCache: true });
    }
    console.log('No cached suggestions found.');

    // --- If not cached, proceed to OpenAI --- 
    console.log('Generating improvement suggestions for CV data...');

    // --- Prompt Engineering --- 
    const systemPrompt = `You are an expert career coach and CV reviewer. Analyze the provided CV data (in JSON format) and provide specific, actionable suggestions for improvement. Focus on clarity, impact, action verbs, quantifiable results, and tailoring to common job requirements (e.g., software engineering roles). Structure your response ONLY as a valid JSON object matching this schema: ${JSON.stringify(improvementSuggestionPlainSchema)}. For each suggestion, provide the section, original text (if applicable), suggestion type, suggested text (if applicable), and clear reasoning.`;

    const userPrompt = `CV Data:\n\n${JSON.stringify(cvData, null, 2)}`;

    // --- Generate suggestions with retry mechanism ---
    const validatedSuggestions = await generateSuggestionsWithRetry(cvData, systemPrompt, userPrompt);

    console.log('Successfully generated and validated improvement suggestions.');

    // --- Store successful result in Cache --- 
    await setCache(cacheKey, validatedSuggestions, SUGGESTION_CACHE_TTL_SECONDS);
    console.log('Stored suggestions in cache.');

    return NextResponse.json(validatedSuggestions);

  } catch (error: any) {
    console.error('Error generating CV improvement suggestions:', error);
    // Basic error check for API key missing
    if (error.message?.includes('OPENAI_API_KEY')) {
        return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 500 });
    }
    
    // Check if this is a retry exhaustion error
    if (error.code === 'RETRY_EXHAUSTED' || error.message?.includes('RETRY_EXHAUSTED')) {
        console.error('💥 [cv-improvement] All retry attempts exhausted');
        return NextResponse.json({ 
            error: 'RETRY_EXHAUSTED', 
            message: 'AI service is currently experiencing issues. Please try again in a few minutes.',
            userMessage: 'We apologize for the technical difficulties. Our AI service is temporarily having issues generating CV suggestions.'
        }, { status: 503 }); // Service Unavailable
    }
    
    return NextResponse.json({ error: error.message || 'Failed to get improvement suggestions.' }, { status: 500 });
  }
} 