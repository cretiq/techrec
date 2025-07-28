import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import crypto from 'crypto'; // For hashing input data
import { getCache, setCache } from '@/lib/redis'; // Import cache functions
// Import Zod schemas
import { CvImprovementRequestSchema, CvImprovementResponseSchema } from '@/types/cv';
import { z } from 'zod';

// Initialize OpenAI client (requires OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gptModel = process.env.GPT_MODEL || "gpt-4.1-nano-2025-04-14";

const SUGGESTION_CACHE_PREFIX = 'cv_suggestion:';
const SUGGESTION_CACHE_TTL_SECONDS = 60 * 60; // 1 hour TTL

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

    // --- OpenAI API Call --- 
     // Using a different model potentially more suited for creative/suggestive tasks
    const completion = await openai.chat.completions.create({
        model: gptModel, 
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5, // Slightly higher temperature for more varied suggestions
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response content is empty.');
    }
    
    console.log('Received raw suggestion JSON from OpenAI:', content.substring(0, 200) + '...');
    
    let rawSuggestions;
    try {
        // Clean the response to extract JSON (OpenAI sometimes includes markdown formatting or malformed trailing data)
        console.log('🧹 [cv-improvement] Cleaning OpenAI response...');
        let cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Remove any trailing comma or incomplete JSON elements
        cleanedContent = cleanedContent.replace(/,\s*$/, ''); // Remove trailing comma
        cleanedContent = cleanedContent.replace(/,\s*"reasoning"\s*$/, ''); // Remove malformed trailing "reasoning"
        cleanedContent = cleanedContent.replace(/,\s*]\s*}$/, ']}'); // Fix malformed array closure
        
        console.log('📏 [cv-improvement] Cleaned content length:', cleanedContent.length);
        console.log('🔍 [cv-improvement] Cleaned content preview:', cleanedContent.substring(0, 300) + '...');
        
        rawSuggestions = JSON.parse(cleanedContent);
        console.log('✅ [cv-improvement] Successfully parsed cleaned JSON response');
        console.log('📊 [cv-improvement] Parsed object keys:', Object.keys(rawSuggestions));
        
        // Additional cleanup: ensure suggestions array doesn't contain string elements
        if (rawSuggestions.suggestions && Array.isArray(rawSuggestions.suggestions)) {
            rawSuggestions.suggestions = rawSuggestions.suggestions.filter(suggestion => 
                typeof suggestion === 'object' && suggestion !== null && typeof suggestion !== 'string'
            );
            console.log('🔍 [cv-improvement] Filtered suggestions count:', rawSuggestions.suggestions.length);
        }
        
    } catch (parseError) {
        console.error('❌ [cv-improvement] Failed to parse suggestion JSON:', parseError);
        console.error('❌ [cv-improvement] Raw content:', content);
        throw new Error('Invalid JSON received from OpenAI for suggestions.');
    }

    // --- Validate OpenAI Response with Zod schema --- 
    console.log('🔍 [cv-improvement] Validating response against schema...');
    const suggestionValidation = CvImprovementResponseSchema.safeParse(rawSuggestions);
    
    let validatedSuggestions;
    if (!suggestionValidation.success) {
        console.error('❌ [cv-improvement] Schema validation FAILED:', suggestionValidation.error.flatten());
        console.error('❌ [cv-improvement] Invalid JSON structure:', JSON.stringify(rawSuggestions, null, 2)); 
        
        // Attempt to create a minimal valid response from available data
        console.log('🔄 [cv-improvement] Attempting to create fallback response...');
        const fallbackSuggestions = [];
        
        if (rawSuggestions.suggestions && Array.isArray(rawSuggestions.suggestions)) {
            rawSuggestions.suggestions.forEach((suggestion, index) => {
                if (typeof suggestion === 'object' && suggestion !== null) {
                    // Try to create a minimal valid suggestion
                    const fallbackSuggestion = {
                        section: suggestion.section || 'general',
                        originalText: suggestion.originalText || null,
                        suggestionType: suggestion.suggestionType || 'wording',
                        suggestedText: suggestion.suggestedText || '',
                        reasoning: suggestion.reasoning || 'AI-generated improvement suggestion'
                    };
                    fallbackSuggestions.push(fallbackSuggestion);
                }
            });
        }
        
        if (fallbackSuggestions.length > 0) {
            console.log('✅ [cv-improvement] Created fallback response with', fallbackSuggestions.length, 'suggestions');
            validatedSuggestions = {
                suggestions: fallbackSuggestions,
                fromCache: false
            };
        } else {
            throw new Error(`Suggestion response did not match schema and no fallback possible. Errors: ${JSON.stringify(suggestionValidation.error.flatten().fieldErrors)}`);
        }
    } else {
        validatedSuggestions = suggestionValidation.data;
        console.log('✅ [cv-improvement] Schema validation PASSED');
        console.log('📊 [cv-improvement] Validated suggestions count:', validatedSuggestions.suggestions.length);
    }

    console.log('Successfully generated and validated improvement suggestions.');

    // --- Store successful result in Cache --- 
    await setCache(cacheKey, validatedSuggestions, SUGGESTION_CACHE_TTL_SECONDS);
    console.log('Stored suggestions in cache.');

    return NextResponse.json({ ...validatedSuggestions, fromCache: false });

  } catch (error: any) {
    console.error('Error generating CV improvement suggestions:', error);
    // Basic error check for API key missing
    if (error.message?.includes('OPENAI_API_KEY')) {
        return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 500 });
    }
    return NextResponse.json({ error: error.message || 'Failed to get improvement suggestions.' }, { status: 500 });
  }
} 