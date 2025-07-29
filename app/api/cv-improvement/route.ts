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
    console.log(`🔄 [cv-improvement] Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} - Generating suggestions...`);
    console.log(`🤖 [cv-improvement] Using model: ${geminiModel}`);
    
    try {
      // Get the generative model with optimized settings for structured output
      const model = genAI.getGenerativeModel({ 
        model: geminiModel,
        generationConfig: {
          temperature: 0.2, // Lower temperature for more consistent, structured output
          topK: 10, // Reduce randomness in token selection
          topP: 0.4, // More focused probability distribution
          maxOutputTokens: 1500, // Reduce to encourage concise responses
          candidateCount: 1, // Only generate one candidate to avoid inconsistency
        },
      });

      const apiCallStartTime = Date.now();
      console.log(`📞 [cv-improvement] Attempt ${attempt} - Making API call to Gemini...`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      const apiCallDuration = Date.now() - apiCallStartTime;
      console.log(`⏱️ [cv-improvement] Attempt ${attempt} - Gemini API call completed in: ${apiCallDuration}ms`);

      if (!content) {
        console.error(`❌ [cv-improvement] Attempt ${attempt} - Gemini response content is empty`);
        throw new Error('Gemini response content is empty.');
      }
      
      console.log(`📥 [cv-improvement] Attempt ${attempt} - Received response (length: ${content.length})`);
      
      // Clean and parse the response with enhanced cleaning
      let rawSuggestions;
      try {
        console.log('🧹 [cv-improvement] Cleaning Gemini response...');
        console.log(`📏 [cv-improvement] Raw content preview: ${content.substring(0, 200)}...`);
        
        // Enhanced cleaning for common Gemini formatting issues
        let cleanedContent = content
          // Remove markdown code blocks
          .replace(/```json\s*\n?/gi, '')
          .replace(/```\s*\n?/gi, '')
          // Remove any leading/trailing explanatory text
          .replace(/^[^{]*({.*})[^}]*$/s, '$1')
          // Remove any trailing commas before closing brackets
          .replace(/,(\s*[}\]])/g, '$1')
          // Fix common JSON issues
          .replace(/(['"])\s*:\s*\n\s*/g, '$1: ')
          .trim();
        
        console.log(`📏 [cv-improvement] Attempt ${attempt} - Cleaned content length: ${cleanedContent.length}`);
        console.log(`📏 [cv-improvement] Cleaned content preview: ${cleanedContent.substring(0, 200)}...`);
        
        // Attempt to find valid JSON if cleaning didn't work
        if (!cleanedContent.startsWith('{')) {
          const jsonMatch = cleanedContent.match(/{[\s\S]*}/);
          if (jsonMatch) {
            cleanedContent = jsonMatch[0];
            console.log(`🔍 [cv-improvement] Extracted JSON from content: ${cleanedContent.substring(0, 100)}...`);
          }
        }
        
        rawSuggestions = JSON.parse(cleanedContent);
        console.log(`✅ [cv-improvement] Attempt ${attempt} - Successfully parsed JSON response`);
        console.log(`📊 [cv-improvement] Attempt ${attempt} - Parsed object keys: ${Object.keys(rawSuggestions)}`);
        
        // Log suggestion array details before sanitization
        if (rawSuggestions.suggestions && Array.isArray(rawSuggestions.suggestions)) {
          console.log(`📊 [cv-improvement] Suggestions array length: ${rawSuggestions.suggestions.length}`);
          rawSuggestions.suggestions.forEach((item, index) => {
            console.log(`📊 [cv-improvement] Item ${index}: ${typeof item} ${typeof item === 'object' ? JSON.stringify(Object.keys(item)) : `"${item}"`}`);
          });
        }
        
        // Sanitize the data
        rawSuggestions = sanitizeSuggestionsData(rawSuggestions);
        
      } catch (parseError) {
        console.error(`❌ [cv-improvement] Attempt ${attempt} - JSON parse failed:`, parseError);
        console.error(`❌ [cv-improvement] Attempt ${attempt} - Raw content (first 500 chars):`, content.substring(0, 500));
        console.error(`❌ [cv-improvement] Attempt ${attempt} - Cleaned content (first 500 chars):`, cleanedContent?.substring(0, 500));
        throw new Error(`Invalid JSON received from Gemini: ${parseError}`);
      }

      // Validate the response using our clever validation
      console.log(`🔍 [cv-improvement] Attempt ${attempt} - Validating response quality...`);
      const validation = validateCvSuggestionsOutput(rawSuggestions);
      
      if (validation.isValid && validation.qualitySuggestions.length > 0) {
        console.log(`✅ [cv-improvement] Attempt ${attempt} - SUCCESS! Generated ${validation.qualitySuggestions.length} valid suggestions`);
        
        if (validation.warnings.length > 0) {
          console.log(`⚠️ [cv-improvement] Attempt ${attempt} - Warnings:`, validation.warnings);
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
  console.log('🚀 [cv-improvement] ===== REQUEST START =====');
  
  try {
    // --- Authentication ---
    console.log('🔐 [cv-improvement] Checking authentication...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ [cv-improvement] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ [cv-improvement] Authenticated user:', session.user.id);

    // --- Parse Request Body ---
    console.log('📥 [cv-improvement] Parsing request body...');
    let rawBody;
    try {
      rawBody = await request.json();
      console.log('📊 [cv-improvement] Raw request body keys:', Object.keys(rawBody));
      console.log('📊 [cv-improvement] Request body structure:');
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
      console.error('❌ [cv-improvement] Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // --- Validate Request Body ---
    console.log('🔍 [cv-improvement] Validating request schema...');
    const validationResult = CvImprovementRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
       console.error('❌ [cv-improvement] Schema validation failed:', validationResult.error.flatten());
       console.error('❌ [cv-improvement] Field errors:', JSON.stringify(validationResult.error.flatten().fieldErrors, null, 2));
        return NextResponse.json(
            { error: 'Invalid CV data format', details: validationResult.error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    const cvData = validationResult.data;
    console.log('✅ [cv-improvement] Schema validation passed');

    // --- Generate suggestions (no caching) ---
    console.log('🤖 [cv-improvement] Generating suggestions with Gemini...');
    console.log('🤖 [cv-improvement] Model:', geminiModel);
    console.log('🤖 [cv-improvement] CV data summary:');
    console.log(`  - Contact Info: ${cvData.contactInfo ? 'Present' : 'Missing'}`);
    console.log(`  - About: ${cvData.about ? `${cvData.about.length} chars` : 'Missing'}`);
    console.log(`  - Skills: ${cvData.skills ? `${cvData.skills.length} items` : 'Missing'}`);
    console.log(`  - Experience: ${cvData.experience ? `${cvData.experience.length} items` : 'Missing'}`);
    console.log(`  - Education: ${cvData.education ? `${cvData.education.length} items` : 'Missing'}`);
    console.log(`  - Achievements: ${cvData.achievements ? `${cvData.achievements.length} items` : 'Missing'}`);

    // --- Enhanced prompt for Gemini with stricter formatting ---
    const prompt = `You are an expert career coach and CV reviewer. Analyze the provided CV data and provide specific, actionable suggestions for improvement.

CRITICAL FORMATTING REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no code blocks, no additional text
2. Each suggestion MUST be a complete JSON object with all required fields
3. Do NOT include any trailing commas, strings, or malformed elements
4. The "suggestions" array must contain ONLY properly formatted objects

**VALID SECTIONS** (use exactly as written):
- contactInfo, contactInfo.email, contactInfo.phone, contactInfo.name
- about, summary
- skills, experience, education, achievements, certificates
- experience[0], experience[1], experience[2] (for specific experience items)
- experience[0].description, experience[1].description (for experience descriptions)
- experience[0].responsibilities, experience[1].responsibilities (for experience bullets)
- education[0], education[1], education[2] (for specific education items)
- general (for overall CV improvements)

**VALID SUGGESTION TYPES** (use exactly one of these):
- wording (improve existing text)
- add_content (add new information)
- remove_content (remove unnecessary content)
- reorder (change order of items)
- format (improve formatting/structure)

**FOCUS AREAS:**
- Clarity and readability
- Impact and action verbs  
- Quantifiable results and achievements
- Professional terminology
- ATS optimization
- Tailoring to software engineering/tech roles

**CV DATA:**
${JSON.stringify(cvData, null, 2)}

**EXACT OUTPUT FORMAT** (return ONLY this valid JSON):
{
  "suggestions": [
    {
      "section": "exact section name from valid list above",
      "originalText": "current text being improved or null",
      "suggestionType": "exact type from valid list above", 
      "suggestedText": "improved text or null if removing",
      "reasoning": "detailed explanation (20-300 characters)"
    }
  ]
}

VALIDATION RULES:
- Each suggestion must have exactly these 5 fields: section, originalText, suggestionType, suggestedText, reasoning
- All values must be strings or null (no nested objects or arrays)
- The suggestions array must contain only suggestion objects, no strings or other data types
- Reasoning must be between 20-300 characters
- Return 3-8 high-quality suggestions maximum

Return ONLY the JSON object above. Do not include any explanatory text, markdown formatting, or additional content.`;

    // --- Generate suggestions with retry mechanism ---
    console.log("Gemini Prompt:", prompt)
    const finalResponse = await generateSuggestionsWithRetryGemini(cvData, prompt);

    const totalProcessingTime = Date.now() - requestStartTime;
    console.log('⏱️ [cv-improvement] Total processing time:', totalProcessingTime, 'ms');
    console.log('🎉 [cv-improvement] ===== REQUEST SUCCESS =====');

    return NextResponse.json(finalResponse);

  } catch (error: any) {
    const totalErrorTime = Date.now() - requestStartTime;
    console.error('💥 [cv-improvement] ===== REQUEST FAILED =====');
    console.error('💥 [cv-improvement] Error after:', totalErrorTime, 'ms');
    console.error('💥 [cv-improvement] Error type:', error.constructor.name);
    console.error('💥 [cv-improvement] Error message:', error.message);
    console.error('💥 [cv-improvement] Error stack:', error.stack);

    // Basic error check for API key missing
    if (error.message?.includes('Google AI API key')) {
      console.error('💥 [cv-improvement] Missing Google AI API key');
      return NextResponse.json({ error: 'Google AI API key not configured.' }, { status: 500 });
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