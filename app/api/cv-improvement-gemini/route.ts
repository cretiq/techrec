import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { getCache, setCache } from '@/lib/redis';
import { CvImprovementRequestSchema, CvImprovementResponseSchema, EnhancedCvImprovementResponseSchema } from '@/types/cv';
import { z } from 'zod';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";

const SUGGESTION_CACHE_PREFIX = 'cv_suggestion_gemini:';
const SUGGESTION_CACHE_TTL_SECONDS = 60 * 60; // 1 hour TTL

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

    try {
        // Get the generative model
        console.log('🔧 [cv-improvement-gemini] Initializing Gemini model...');
        const model = genAI.getGenerativeModel({ 
            model: geminiModel,
            generationConfig: {
                temperature: 0.3, // Lower for more focused responses
                topK: 20,         // Reduce for more deterministic output
                topP: 0.6,        // Lower for more focused suggestions
                maxOutputTokens: 2048, // Reduced since we want 5-8 suggestions
            },
        });
        console.log('🔧 [cv-improvement-gemini] Model configuration:', {
            model: geminiModel,
            temperature: 0.3,
            topK: 20,
            topP: 0.6,
            maxOutputTokens: 2048,
        });

        // Prepare prompt with detailed data
        console.log('📝 [cv-improvement-gemini] Prompt length:', prompt.length, 'characters');
        console.log('📝 [cv-improvement-gemini] CV data JSON size:', JSON.stringify(cvData).length, 'bytes');

        const apiCallStartTime = Date.now();
        console.log('📞 [cv-improvement-gemini] Making API call to Gemini...');
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        const apiCallDuration = Date.now() - apiCallStartTime;
        console.log('⏱️ [cv-improvement-gemini] Gemini API call completed in:', apiCallDuration, 'ms');

        if (!content) {
            console.error('❌ [cv-improvement-gemini] Gemini response content is empty');
            throw new Error('Gemini response content is empty.');
        }
        
        console.log('📥 [cv-improvement-gemini] Received response from Gemini');
        console.log('📏 [cv-improvement-gemini] Response length:', content.length, 'characters');
        console.log('🔍 [cv-improvement-gemini] Response preview (first 300 chars):', content.substring(0, 300) + '...');
        
        let rawSuggestions;
        try {
            console.log('🧹 [cv-improvement-gemini] Cleaning response (removing markdown formatting)...');
            // Clean the response to extract JSON (Gemini sometimes includes markdown formatting)
            const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            console.log('📏 [cv-improvement-gemini] Cleaned content length:', cleanedContent.length);
            console.log('🔍 [cv-improvement-gemini] Cleaned content preview:', cleanedContent.substring(0, 200) + '...');
            
            rawSuggestions = JSON.parse(cleanedContent);
            console.log('✅ [cv-improvement-gemini] Successfully parsed JSON response');
            console.log('📊 [cv-improvement-gemini] Parsed object keys:', Object.keys(rawSuggestions));
        } catch (parseError) {
            console.error('❌ [cv-improvement-gemini] Failed to parse suggestion JSON:', parseError);
            console.error('❌ [cv-improvement-gemini] Raw content:', content);
            throw new Error('Invalid JSON received from Gemini for suggestions.');
        }

        // --- Validate Gemini Response with Enhanced Zod schema --- 
        console.log('🔍 [cv-improvement-gemini] Validating response against enhanced schema...');
        
        let validatedSuggestions;
        const suggestionValidation = EnhancedCvImprovementResponseSchema.safeParse(rawSuggestions);
        
        if (!suggestionValidation.success) {
            console.error('❌ [cv-improvement-gemini] Enhanced schema validation FAILED');
            console.error('❌ [cv-improvement-gemini] Validation errors:', suggestionValidation.error.flatten());
            console.error('❌ [cv-improvement-gemini] Raw suggestions object:', JSON.stringify(rawSuggestions, null, 2)); 
            
            // Fallback to legacy schema for backward compatibility
            console.log('🔄 [cv-improvement-gemini] Attempting legacy schema validation...');
            const legacyValidation = CvImprovementResponseSchema.safeParse(rawSuggestions);
            if (legacyValidation.success) {
                console.log('✅ [cv-improvement-gemini] Legacy schema validation PASSED - converting to enhanced format...');
                // Convert legacy format to enhanced format
                validatedSuggestions = {
                    suggestions: legacyValidation.data.suggestions.map((suggestion, index) => ({
                        id: `legacy_${Date.now()}_${index}`,
                        type: "general_improvement" as const,
                        section: suggestion.section,
                        title: `${suggestion.suggestionType} improvement`,
                        reasoning: suggestion.reasoning,
                        suggestedContent: suggestion.suggestedText || '',
                        originalContent: suggestion.originalText || null,
                        priority: "medium" as const,
                        confidence: 0.8,
                    })),
                    summary: {
                        totalSuggestions: legacyValidation.data.suggestions.length,
                        highPriority: 0,
                        categories: {
                            experienceBullets: 0,
                            educationGaps: 0,
                            missingSkills: 0,
                            summaryImprovements: 0,
                            generalImprovements: legacyValidation.data.suggestions.length,
                        }
                    },
                    fromCache: legacyValidation.data.fromCache,
                    provider: 'gemini'
                };
                console.log('✅ [cv-improvement-gemini] Legacy conversion successful');
                console.log('📊 [cv-improvement-gemini] Converted suggestions count:', validatedSuggestions.suggestions.length);
            } else {
                throw new Error(`Both enhanced and legacy schema validation failed. Errors: ${JSON.stringify(suggestionValidation.error.flatten().fieldErrors)}`);
            }
        } else {
            validatedSuggestions = suggestionValidation.data;
            console.log('✅ [cv-improvement-gemini] Enhanced schema validation PASSED');
            console.log('📊 [cv-improvement-gemini] Enhanced suggestions count:', validatedSuggestions.suggestions.length);
            console.log('📈 [cv-improvement-gemini] Suggestion breakdown:', {
                total: validatedSuggestions.summary.totalSuggestions,
                highPriority: validatedSuggestions.summary.highPriority,
                categories: validatedSuggestions.summary.categories
            });
        }
        
        // Enhanced quality filtering for structured suggestions
        const qualitySuggestions = validatedSuggestions.suggestions.filter(suggestion => {
            // Enhanced filtering criteria for structured suggestions
            return suggestion.reasoning.length > 20 && 
                   suggestion.suggestedContent.length > 5 &&
                   suggestion.confidence >= 0.5;
        });
        
        console.log('📊 [cv-improvement-gemini] Quality-filtered suggestions count:', qualitySuggestions.length);
        
        // Log each quality suggestion for debugging
        qualitySuggestions.forEach((suggestion, index) => {
            console.log(`🔍 [cv-improvement-gemini] Enhanced Suggestion ${index + 1}:`, {
                id: suggestion.id,
                type: suggestion.type,
                section: suggestion.section,
                title: suggestion.title,
                priority: suggestion.priority,
                confidence: suggestion.confidence,
                reasoningLength: suggestion.reasoning.length,
                contentLength: suggestion.suggestedContent.length
            });
        });

        // Update the suggestions in the response with enhanced structure
        const finalResponse = {
            ...validatedSuggestions,
            suggestions: qualitySuggestions,
            summary: {
                ...validatedSuggestions.summary,
                totalSuggestions: qualitySuggestions.length,
                // Recalculate category counts based on filtered suggestions
                categories: {
                    experienceBullets: qualitySuggestions.filter(s => s.type === 'experience_bullet').length,
                    educationGaps: qualitySuggestions.filter(s => s.type === 'education_gap').length,
                    missingSkills: qualitySuggestions.filter(s => s.type === 'missing_skill').length,
                    summaryImprovements: qualitySuggestions.filter(s => s.type === 'summary_improvement').length,
                    generalImprovements: qualitySuggestions.filter(s => s.type === 'general_improvement').length,
                }
            }
        };

        // --- Store successful result in Cache --- 
        console.log('💾 [cv-improvement-gemini] Storing result in cache...');
        await setCache(cacheKey, finalResponse, SUGGESTION_CACHE_TTL_SECONDS);
        console.log('✅ [cv-improvement-gemini] Cached successfully with TTL:', SUGGESTION_CACHE_TTL_SECONDS, 'seconds');

        const totalProcessingTime = Date.now() - requestStartTime;
        console.log('⏱️ [cv-improvement-gemini] Total processing time:', totalProcessingTime, 'ms');
        console.log('📊 [cv-improvement-gemini] Performance breakdown:');
        console.log(`  - Auth + validation: ~100ms`);
        console.log(`  - Cache lookup: ~${Date.now() - requestStartTime - apiCallDuration - 100}ms`);
        console.log(`  - Gemini API call: ${apiCallDuration}ms`);
        console.log(`  - Response processing: ~${totalProcessingTime - apiCallDuration - 100}ms`);
        console.log('📈 [cv-improvement-gemini] Optimization targets:');
        if (apiCallDuration > 5000) console.log('  ⚠️  Gemini API call is slow (>5s) - consider prompt optimization');
        if (totalProcessingTime > 8000) console.log('  ⚠️  Total time is slow (>8s) - review overall flow');
        console.log('🎉 [cv-improvement-gemini] ===== REQUEST SUCCESS =====');

        return NextResponse.json({ ...finalResponse, fromCache: false, provider: 'gemini' });

    } catch (geminiError: any) {
        console.error('❌ [cv-improvement-gemini] Gemini API error:', geminiError);
        console.error('❌ [cv-improvement-gemini] Error type:', geminiError.constructor.name);
        console.error('❌ [cv-improvement-gemini] Error message:', geminiError.message);
        throw new Error(`Gemini API call failed: ${geminiError.message}`);
    }

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
    return NextResponse.json({ error: error.message || 'Failed to get improvement suggestions.' }, { status: 500 });
  }
} 