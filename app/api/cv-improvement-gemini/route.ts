import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { getCache, setCache } from '@/lib/redis';
import { CvImprovementRequestSchema, CvImprovementResponseSchema, EnhancedCvImprovementResponseSchema } from '@/types/cv';
import { z } from 'zod';
// Import validation utilities
import { 
  validateCvSuggestionsOutput, 
  isValidCvSuggestionsResponse, 
  sanitizeSuggestionsData 
} from '@/utils/cvSuggestionValidation';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";

const SUGGESTION_CACHE_PREFIX = 'cv_suggestion_gemini:';
const SUGGESTION_CACHE_TTL_SECONDS = 60 * 60; // 1 hour TTL

// Retry configuration
const MAX_RETRY_ATTEMPTS = 7;
const RETRY_DELAY_MS = 1000; // 1 second delay between retries

/**
 * Generates CV improvement suggestions with retry mechanism and validation for Gemini
 * @param cvData - The CV data to analyze
 * @param prompt - The prompt for Gemini
 * @returns Validated suggestions response
 */
async function generateSuggestionsWithRetryGemini(cvData: any, prompt: string): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    console.log(`🔄 [cv-improvement-gemini] Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} - Generating suggestions...`);
    
    try {
      // Get the generative model
      const model = genAI.getGenerativeModel({ 
        model: geminiModel,
        generationConfig: {
          temperature: 0.3 + (attempt - 1) * 0.1, // Slightly increase temperature on retries
          topK: 20,
          topP: 0.6,
          maxOutputTokens: 2048,
        },
      });

      const apiCallStartTime = Date.now();
      console.log(`📞 [cv-improvement-gemini] Attempt ${attempt} - Making API call to Gemini...`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      const apiCallDuration = Date.now() - apiCallStartTime;
      console.log(`⏱️ [cv-improvement-gemini] Attempt ${attempt} - Gemini API call completed in: ${apiCallDuration}ms`);

      if (!content) {
        console.error(`❌ [cv-improvement-gemini] Attempt ${attempt} - Gemini response content is empty`);
        throw new Error('Gemini response content is empty.');
      }
      
      console.log(`📥 [cv-improvement-gemini] Attempt ${attempt} - Received response (length: ${content.length})`);
      
      // Clean and parse the response
      let rawSuggestions;
      try {
        console.log('🧹 [cv-improvement-gemini] Cleaning Gemini response...');
        // Clean the response to extract JSON (Gemini sometimes includes markdown formatting)
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        console.log(`📏 [cv-improvement-gemini] Attempt ${attempt} - Cleaned content length: ${cleanedContent.length}`);
        
        rawSuggestions = JSON.parse(cleanedContent);
        console.log(`✅ [cv-improvement-gemini] Attempt ${attempt} - Successfully parsed JSON response`);
        console.log(`📊 [cv-improvement-gemini] Attempt ${attempt} - Parsed object keys: ${Object.keys(rawSuggestions)}`);
        
        // Sanitize the data
        rawSuggestions = sanitizeSuggestionsData(rawSuggestions);
        
      } catch (parseError) {
        console.error(`❌ [cv-improvement-gemini] Attempt ${attempt} - JSON parse failed:`, parseError);
        console.error(`❌ [cv-improvement-gemini] Attempt ${attempt} - Raw content:`, content);
        throw new Error(`Invalid JSON received from Gemini: ${parseError}`);
      }

      // Validate the response using our clever validation
      console.log(`🔍 [cv-improvement-gemini] Attempt ${attempt} - Validating response quality...`);
      const validation = validateCvSuggestionsOutput(rawSuggestions);
      
      if (validation.isValid && validation.qualitySuggestions.length > 0) {
        console.log(`✅ [cv-improvement-gemini] Attempt ${attempt} - SUCCESS! Generated ${validation.qualitySuggestions.length} valid suggestions`);
        
        if (validation.warnings.length > 0) {
          console.log(`⚠️ [cv-improvement-gemini] Attempt ${attempt} - Warnings:`, validation.warnings);
        }
        
        // Return the validated and cleaned suggestions (using enhanced format)
        return {
          suggestions: validation.qualitySuggestions,
          summary: {
            totalSuggestions: validation.qualitySuggestions.length,
            highPriority: validation.qualitySuggestions.filter(s => (s as any).priority === 'high').length,
            categories: {
              experienceBullets: validation.qualitySuggestions.filter(s => (s as any).type === 'experience_bullet').length,
              educationGaps: validation.qualitySuggestions.filter(s => (s as any).type === 'education_gap').length,
              missingSkills: validation.qualitySuggestions.filter(s => (s as any).type === 'missing_skill').length,
              summaryImprovements: validation.qualitySuggestions.filter(s => (s as any).type === 'summary_improvement').length,
              generalImprovements: validation.qualitySuggestions.filter(s => (s as any).type === 'general_improvement').length,
            }
          },
          fromCache: false,
          provider: 'gemini',
          attempt: attempt,
          validationWarnings: validation.warnings
        };
      } else {
        const errorMessage = `Validation failed: ${validation.errors.join(', ')}`;
        console.log(`❌ [cv-improvement-gemini] Attempt ${attempt} - ${errorMessage}`);
        console.log(`📊 [cv-improvement-gemini] Attempt ${attempt} - Validation details:`, {
          suggestionCount: validation.suggestionCount,
          errors: validation.errors,
          warnings: validation.warnings
        });
        
        if (attempt === MAX_RETRY_ATTEMPTS) {
          // On final attempt, try fallback response creation
          console.log(`🔄 [cv-improvement-gemini] Final attempt - Creating fallback response...`);
          if (validation.qualitySuggestions.length > 0) {
            console.log(`✅ [cv-improvement-gemini] Using ${validation.qualitySuggestions.length} partial suggestions as fallback`);
            return {
              suggestions: validation.qualitySuggestions,
              summary: {
                totalSuggestions: validation.qualitySuggestions.length,
                highPriority: 0,
                categories: {
                  experienceBullets: 0,
                  educationGaps: 0,
                  missingSkills: 0,
                  summaryImprovements: 0,
                  generalImprovements: validation.qualitySuggestions.length,
                }
              },
              fromCache: false,
              provider: 'gemini',
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
      console.error(`❌ [cv-improvement-gemini] Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed:`, error.message);
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.log(`⏳ [cv-improvement-gemini] Waiting ${RETRY_DELAY_MS}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
  
  // If all attempts failed, throw a specific error for UI handling
  console.error(`💥 [cv-improvement-gemini] All ${MAX_RETRY_ATTEMPTS} attempts failed. Last error:`, lastError?.message);
  const error = new Error(`RETRY_EXHAUSTED: Failed to generate valid suggestions after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`);
  (error as any).code = 'RETRY_EXHAUSTED';
  throw error;
}

// Helper to create a stable hash from JSON data
const createDataHash = (data: any): string => {
    const stringifiedData = JSON.stringify(data);
    return crypto.createHash('sha256').update(stringifiedData).digest('hex');
};

// Define the improvement suggestion schema for Gemini
const improvementSuggestionPlainSchema = {
    suggestions: [
        {
            section: "string",
            originalText: "string or null",
            suggestionType: "wording|add_content|remove_content|reorder|format",
            suggestedText: "string or null",
            reasoning: "string"
        }
    ]
};

export async function POST(request: Request) {
  const requestStartTime = Date.now();
  console.log('🚀 [cv-improvement-gemini] ===== REQUEST START =====');
  
  try {
    // --- Authentication ---
    console.log('🔐 [cv-improvement-gemini] Checking authentication...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ [cv-improvement-gemini] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ [cv-improvement-gemini] Authenticated user:', session.user.id);

    // --- Parse Request Body ---
    console.log('📥 [cv-improvement-gemini] Parsing request body...');
    let rawBody;
    try {
      rawBody = await request.json();
      console.log('📊 [cv-improvement-gemini] Raw request body keys:', Object.keys(rawBody));
      console.log('📊 [cv-improvement-gemini] Request body structure:');
      Object.entries(rawBody).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          console.log(`  - ${key}: Array with ${value.length} items`);
        } else if (typeof value === 'object' && value !== null) {
          console.log(`  - ${key}: Object with keys [${Object.keys(value).join(', ')}]`);
        } else {
          console.log(`  - ${key}: ${typeof value} (length: ${value?.toString?.()?.length || 0})`);
        }
      });
    } catch (parseError) {
      console.error('❌ [cv-improvement-gemini] Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // --- Validate Request Body ---
    console.log('🔍 [cv-improvement-gemini] Validating request schema...');
    const validationResult = CvImprovementRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
       console.error('❌ [cv-improvement-gemini] Schema validation failed:', validationResult.error.flatten());
       console.error('❌ [cv-improvement-gemini] Field errors:', JSON.stringify(validationResult.error.flatten().fieldErrors, null, 2));
        return NextResponse.json(
            { error: 'Invalid CV data format', details: validationResult.error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    const cvData = validationResult.data;
    console.log('✅ [cv-improvement-gemini] Schema validation passed');

    // --- Cache Check ---
    console.log('💾 [cv-improvement-gemini] Checking cache...');
    const dataHash = createDataHash(cvData);
    const cacheKey = `${SUGGESTION_CACHE_PREFIX}${dataHash}`;
    console.log('💾 [cv-improvement-gemini] Data hash:', dataHash);
    console.log('💾 [cv-improvement-gemini] Cache key:', cacheKey);

    const cachedSuggestions = await getCache<z.infer<typeof CvImprovementResponseSchema>>(cacheKey);
    if (cachedSuggestions) {
        const cacheHitTime = Date.now() - requestStartTime;
        console.log('🎯 [cv-improvement-gemini] Cache HIT! Returning cached suggestions');
        console.log('⏱️ [cv-improvement-gemini] Cache lookup time:', cacheHitTime, 'ms');
        console.log('📊 [cv-improvement-gemini] Cached suggestions count:', cachedSuggestions.suggestions?.length || 0);
        return NextResponse.json({ ...cachedSuggestions, fromCache: true, provider: 'gemini' });
    }
    console.log('❌ [cv-improvement-gemini] Cache MISS - proceeding with Gemini API call');

    // --- If not cached, proceed to Gemini --- 
    console.log('🤖 [cv-improvement-gemini] Generating suggestions with Gemini...');
    console.log('🤖 [cv-improvement-gemini] Model:', geminiModel);
    console.log('🤖 [cv-improvement-gemini] CV data summary:');
    console.log(`  - Contact Info: ${cvData.contactInfo ? 'Present' : 'Missing'}`);
    console.log(`  - About: ${cvData.about ? `${cvData.about.length} chars` : 'Missing'}`);
    console.log(`  - Skills: ${cvData.skills ? `${cvData.skills.length} items` : 'Missing'}`);
    console.log(`  - Experience: ${cvData.experience ? `${cvData.experience.length} items` : 'Missing'}`);
    console.log(`  - Education: ${cvData.education ? `${cvData.education.length} items` : 'Missing'}`);
    console.log(`  - Achievements: ${cvData.achievements ? `${cvData.achievements.length} items` : 'Missing'}`);

    // --- Enhanced Prompt Engineering for Structured Suggestions ---
    const prompt = `Expert CV coach: Analyze this CV comprehensively and provide actionable, structured improvement suggestions.

**CRITICAL: Return ONLY valid JSON in this exact format:**

{
  "suggestions": [
    {
      "id": "unique_string_id",
      "type": "experience_bullet|education_gap|missing_skill|summary_improvement|general_improvement",
      "section": "experience|education|skills|about|contactInfo",
      "targetId": "item_id_if_applicable",
      "title": "Short descriptive title",
      "reasoning": "Why this improvement is valuable",
      "suggestedContent": "Exact content to add/replace",
      "originalContent": "Current content being improved (if any)",
      "priority": "high|medium|low",
      "confidence": 0.9,
      "metadata": {
        "position": 1,
        "skillCategory": "Technical",
        "fieldName": "startDate"
      }
    }
  ],
  "summary": {
    "totalSuggestions": 6,
    "highPriority": 2,
    "categories": {
      "experienceBullets": 2,
      "educationGaps": 1,
      "missingSkills": 2,
      "summaryImprovements": 1,
      "generalImprovements": 0
    }
  }
}

**SPECIFIC ANALYSIS TARGETS:**

1. **Experience Bullets** (type: "experience_bullet"):
   - Look for experience entries with few/weak bullet points
   - Suggest specific, quantified achievements
   - Focus on impact, metrics, technologies used
   - Use action verbs and concrete results

2. **Education Gaps** (type: "education_gap"):
   - Missing dates, locations, degree details
   - Incomplete institution information
   - Missing relevant coursework or honors

3. **Missing Skills** (type: "missing_skill"):
   - Skills mentioned in experience/summary but not in skills section
   - Technologies, methodologies, soft skills evident but unlisted
   - Industry-relevant skills for their field

4. **Summary Improvements** (type: "summary_improvement"):
   - Weak or missing professional summary
   - Lack of value proposition
   - Missing key achievements or specializations

5. **General Improvements** (type: "general_improvement"):
   - Contact info gaps, formatting issues, other improvements

**CV DATA:**
${JSON.stringify(cvData)}

Return ONLY the JSON object above - no markdown formatting, no explanations.`;

    // --- Generate suggestions with retry mechanism ---
    const finalResponse = await generateSuggestionsWithRetryGemini(cvData, prompt);

    // --- Store successful result in Cache --- 
    console.log('💾 [cv-improvement-gemini] Storing result in cache...');
    await setCache(cacheKey, finalResponse, SUGGESTION_CACHE_TTL_SECONDS);
    console.log('✅ [cv-improvement-gemini] Cached successfully with TTL:', SUGGESTION_CACHE_TTL_SECONDS, 'seconds');

    const totalProcessingTime = Date.now() - requestStartTime;
    console.log('⏱️ [cv-improvement-gemini] Total processing time:', totalProcessingTime, 'ms');
    console.log('🎉 [cv-improvement-gemini] ===== REQUEST SUCCESS =====');

    return NextResponse.json(finalResponse);

  } catch (error: any) {
    const totalErrorTime = Date.now() - requestStartTime;
    console.error('💥 [cv-improvement-gemini] ===== REQUEST FAILED =====');
    console.error('💥 [cv-improvement-gemini] Error after:', totalErrorTime, 'ms');
    console.error('💥 [cv-improvement-gemini] Error type:', error.constructor.name);
    console.error('💥 [cv-improvement-gemini] Error message:', error.message);
    console.error('💥 [cv-improvement-gemini] Error stack:', error.stack);
    
    // Basic error check for API key missing
    if (error.message?.includes('GOOGLE_AI_API_KEY')) {
        console.error('💥 [cv-improvement-gemini] Missing Google AI API key');
        return NextResponse.json({ error: 'Google AI API key not configured.' }, { status: 500 });
    }
    
    // Check if this is a retry exhaustion error
    if (error.code === 'RETRY_EXHAUSTED' || error.message?.includes('RETRY_EXHAUSTED')) {
        console.error('💥 [cv-improvement-gemini] All retry attempts exhausted');
        return NextResponse.json({ 
            error: 'RETRY_EXHAUSTED', 
            message: 'AI service is currently experiencing issues. Please try again in a few minutes.',
            userMessage: 'We apologize for the technical difficulties. Our AI service is temporarily having issues generating CV suggestions.'
        }, { status: 503 }); // Service Unavailable
    }
    
    return NextResponse.json({ error: error.message || 'Failed to get improvement suggestions.' }, { status: 500 });
  }
} 