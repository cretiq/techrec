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
// Import debug logger
import { CvImprovementDebugLogger } from '@/utils/debugLogger';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
async function generateSuggestionsWithRetryGemini(cvData: any, prompt: string, sessionId?: string): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    console.log(`🔄 [cv-improvement] Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} - Generating suggestions...`);
    console.log(`🤖 [cv-improvement] Using model: ${geminiModel}`);
    
    const apiCallStartTime = Date.now(); // Move to broader scope
    
    try {
      // Get the generative model with optimized settings for structured output
      const model = genAI.getGenerativeModel({ 
        model: geminiModel,
        generationConfig: {
          temperature: 0.2, // Lower temperature for more consistent, structured output
          topK: 10, // Reduce randomness in token selection
          topP: 0.4, // More focused probability distribution
          maxOutputTokens: 1200, // Further reduce to prevent truncation
          candidateCount: 1, // Only generate one candidate to avoid inconsistency
        },
      });
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
      let cleanedContent; // Move declaration to broader scope
      try {
        console.log('🧹 [cv-improvement] Cleaning Gemini response...');
        console.log(`📏 [cv-improvement] Raw content preview: ${content.substring(0, 200)}...`);
        
        // Enhanced cleaning for common Gemini formatting issues
        cleanedContent = content
          // Remove markdown code blocks
          .replace(/```json\s*\n?/gi, '')
          .replace(/```\s*\n?/gi, '')
          // Remove any leading/trailing explanatory text
          .replace(/^[^{]*({.*})[^}]*$/s, '$1')
          // Remove any trailing commas before closing brackets (multiple passes)
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/,(\s*[}\]])/g, '$1') // Second pass for nested cases
          // Fix common JSON issues
          .replace(/(['"])\s*:\s*\n\s*/g, '$1: ')
          // Remove trailing commas at end of arrays/objects more aggressively
          .replace(/,(\s*$)/g, '')
          // Ensure proper JSON structure end
          .replace(/[^}\]]*$/, '') // Remove any trailing text after last brace/bracket
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
        
        // Try to complete malformed JSON if it looks like it's truncated
        if (cleanedContent.includes('"suggestions":') && !cleanedContent.trim().endsWith('}')) {
          console.log(`🔧 [cv-improvement] Attempting to complete malformed JSON...`);
          // Find the last complete suggestion object
          const lastCompleteMatch = cleanedContent.match(/.*"reasoning":\s*"[^"]*"\s*}/);
          if (lastCompleteMatch) {
            cleanedContent = lastCompleteMatch[0] + '\n  ]\n}';
            console.log(`🔧 [cv-improvement] Completed JSON structure`);
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
        console.error(`❌ [cv-improvement] Attempt ${attempt} - Raw content (last 500 chars):`, content.substring(Math.max(0, content.length - 500)));
        console.error(`❌ [cv-improvement] Attempt ${attempt} - Cleaned content (first 500 chars):`, cleanedContent?.substring(0, 500));
        console.error(`❌ [cv-improvement] Attempt ${attempt} - Cleaned content (last 500 chars):`, cleanedContent?.substring(Math.max(0, (cleanedContent?.length || 0) - 500)));
        console.error(`❌ [cv-improvement] Attempt ${attempt} - Cleaned content length:`, cleanedContent?.length);
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
        
        // Filter out contactInfo suggestions before building response
        const filteredSuggestions = validation.qualitySuggestions.filter(s => (s as any).section !== 'contactInfo');
        console.log(`🚫 [cv-improvement] Filtered out ${validation.qualitySuggestions.length - filteredSuggestions.length} contactInfo suggestions`);
        console.log(`✅ [cv-improvement] Returning ${filteredSuggestions.length} suggestions (excluding contactInfo)`);
        
        // Build the final response
        const finalResponse = {
          suggestions: filteredSuggestions,
          summary: {
            totalSuggestions: filteredSuggestions.length,
            highPriority: filteredSuggestions.filter(s => (s as any).priority === 'high').length,
            categories: {
              experienceBullets: filteredSuggestions.filter(s => (s as any).type === 'experience_bullet').length,
              educationGaps: filteredSuggestions.filter(s => (s as any).type === 'education_gap').length,
              missingSkills: filteredSuggestions.filter(s => (s as any).type === 'missing_skill').length,
              summaryImprovements: filteredSuggestions.filter(s => (s as any).type === 'summary_improvement').length,
              generalImprovements: filteredSuggestions.filter(s => (s as any).type === 'general_improvement').length,
            }
          },
          fromCache: false,
          provider: 'gemini',
          attempt: attempt,
          validationWarnings: validation.warnings
        };
        
        // Log the successful response
        if (sessionId) {
          CvImprovementDebugLogger.logResponse({
            attempt,
            rawResponse: content,
            parsedResponse: rawSuggestions,
            validationResult: validation,
            finalResponse,
            duration: Date.now() - apiCallStartTime,
          });
        }
        
        return finalResponse;
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
            // Filter out contactInfo suggestions from fallback response too
            const fallbackFilteredSuggestions = validation.qualitySuggestions.filter(s => (s as any).section !== 'contactInfo');
            console.log(`🚫 [cv-improvement] Fallback: Filtered out ${validation.qualitySuggestions.length - fallbackFilteredSuggestions.length} contactInfo suggestions`);
            console.log(`✅ [cv-improvement] Using ${fallbackFilteredSuggestions.length} partial suggestions as fallback (excluding contactInfo)`);
            return {
              suggestions: fallbackFilteredSuggestions,
              summary: {
                totalSuggestions: fallbackFilteredSuggestions.length,
                highPriority: 0,
                categories: {
                  experienceBullets: 0,
                  educationGaps: 0,
                  missingSkills: 0,
                  summaryImprovements: 0,
                  generalImprovements: fallbackFilteredSuggestions.length,
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
      
      // Log the error response
      if (sessionId) {
        CvImprovementDebugLogger.logResponse({
          attempt,
          rawResponse: '',
          parsedResponse: null,
          validationResult: null,
          finalResponse: null,
          duration: Date.now() - apiCallStartTime,
          error: {
            message: error.message,
            stack: error.stack,
            type: error.constructor.name,
          },
        });
      }
      
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
  
  // Initialize debug logger for this session
  const sessionId = CvImprovementDebugLogger.initialize();
  console.log(`🔍 [cv-improvement] Debug session ID: ${sessionId}`);
  
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

**IMPORTANT SECTION RULES**:
- For general sections, use ONLY these exact names: contactInfo, about, skills, experience, education, achievements
- For specific items within arrays, still use the general section name (e.g., use "experience" not "experience[0]")
- The UI will handle targeting specific items based on context

**VALID SECTIONS** (use ONLY these):
- contactInfo (for any contact-related suggestions including adding LinkedIn/GitHub)
- about (for summary/about section improvements)
- skills (for skill-related suggestions)
- experience (for ANY experience-related suggestions, regardless of which job)
- education (for ANY education-related suggestions)
- achievements (for achievement/certification suggestions)

**VALID SUGGESTION TYPES** (use exactly one of these):
- wording (improve existing text)
- add_content (add new information)
- remove_content (remove unnecessary content)
- reorder (change order of items)
- format (improve formatting/structure)

**FOCUS AREAS:**
1. **Missing Information** - Identify and suggest adding:
   - Contact completeness (suggest adding LinkedIn, GitHub, phone if missing - NO placeholder URLs)
   - Key skills that are mentioned in experience but not in skills section
   - Quantifiable achievements and metrics in experience
   - Relevant coursework for education

2. **Content Quality** - Improve existing content:
   - Replace weak verbs with strong action verbs
   - Add quantifiable results and metrics
   - Make descriptions more concise and impactful
   - Ensure consistency in tone and style
   - Optimize for ATS keywords

3. **Structure & Format**:
   - Suggest better organization of information
   - Recommend formatting improvements
   - Identify redundant or unnecessary content

4. **General Experience Quality**:
   - Identify experiences with insufficient detail (< 2 responsibilities)
   - Suggest overall improvements for brief or weak experience descriptions
   - Recommend adding more impact-focused content

**CV DATA:**
${JSON.stringify(cvData, null, 2)}

**EXACT OUTPUT FORMAT** (return ONLY this valid JSON):
{
  "suggestions": [
    {
      "section": "exact section name from list above",
      "targetId": "optional: specific item ID for experience/education items",
      "targetField": "optional: specific field like title, company, responsibilities[0]",
      "originalText": "current text being improved or null for new content",
      "suggestionType": "exact type from valid list above", 
      "suggestedText": "improved/new text or null if removing",
      "reasoning": "detailed explanation (20-300 characters)"
    }
  ]
}

REQUIREMENTS:
- Provide 6-8 diverse suggestions covering multiple sections
- Include at least 1-2 suggestions for missing information (completion suggestions only - NO URLs)
- Include at least 2-3 wording improvements for experience bullets  
- Include at least 1 suggestion for skills or education
- Include 1 general experience quality suggestion (using targetField: "general")
- Ensure reasoning is concise (20-150 characters)
- For contact info: Only suggest ADDING missing fields, never provide example URLs

**TARGETING SPECIFIC ITEMS**:
- For experience suggestions: ALWAYS include targetId matching the experience item's id field
- For specific fields within experience items, use these targetField values:
  * "title" - for job title improvements
  * "company" - for company name improvements  
  * "location" - for location improvements
  * "responsibilities[0]", "responsibilities[1]", etc. - for specific responsibility bullets
  * "general" - for overall experience quality (too short, needs more impact, etc.)
- For contact info: Use targetField values like "email", "phone", "linkedin", "github"
- For general section improvements: Leave targetField empty
- Examples:
  * Improve job title: targetId: "exp_123", targetField: "title"
  * Improve 2nd responsibility: targetId: "exp_123", targetField: "responsibilities[1]"  
  * General experience improvement: targetId: "exp_123", targetField: "general"
  * Add LinkedIn: section: "contactInfo", targetField: "linkedin"

Return ONLY the JSON object above. Do not include any explanatory text, markdown formatting, or additional content.`;

    // --- Log the request data ---
    CvImprovementDebugLogger.logRequest({
      userId: session.user.id,
      cvData: cvData,
      prompt: prompt,
      timestamp: new Date().toISOString(),
    });

    // --- Generate suggestions with retry mechanism ---
    console.log("Gemini Prompt:", prompt)
    const finalResponse = await generateSuggestionsWithRetryGemini(cvData, prompt, sessionId);

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