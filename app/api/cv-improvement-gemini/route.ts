import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { getCache, setCache } from '@/lib/redis';
import { CvImprovementRequestSchema, CvImprovementResponseSchema } from '@/types/cv';
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
  try {
    console.log('Received CV improvement suggestion request (Gemini)...');
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
    const cvData = validationResult.data;

    // --- Cache Check ---
    const dataHash = createDataHash(cvData);
    const cacheKey = `${SUGGESTION_CACHE_PREFIX}${dataHash}`;
    console.log('Calculated suggestion cache key (Gemini):', cacheKey);

    const cachedSuggestions = await getCache<z.infer<typeof CvImprovementResponseSchema>>(cacheKey);
    if (cachedSuggestions) {
        console.log('Returning cached suggestions for hash:', dataHash);
        return NextResponse.json({ ...cachedSuggestions, fromCache: true, provider: 'gemini' });
    }
    console.log('No cached suggestions found.');

    // --- If not cached, proceed to Gemini --- 
    console.log('Generating improvement suggestions with Gemini for CV data...');

    // --- Prompt Engineering for Gemini --- 
    const prompt = `You are an expert career coach and CV reviewer. Analyze the provided CV data (in JSON format) and provide specific, actionable suggestions for improvement. Focus on clarity, impact, action verbs, quantifiable results, and tailoring to common job requirements (e.g., software engineering roles).

Structure your response ONLY as a valid JSON object matching this schema:
${JSON.stringify(improvementSuggestionPlainSchema, null, 2)}

For each suggestion, provide:
- section: The CV section being addressed
- originalText: The original text (if applicable)
- suggestionType: One of "wording", "add_content", "remove_content", "reorder", "format"
- suggestedText: The improved text (if applicable)
- reasoning: Clear explanation of why this improvement helps

CV Data:
${JSON.stringify(cvData, null, 2)}

Return ONLY a valid JSON object. Do not include any explanatory text before or after the JSON.`;

    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({ 
            model: geminiModel,
            generationConfig: {
                temperature: 0.5,
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 4096,
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        if (!content) {
            throw new Error('Gemini response content is empty.');
        }
        
        console.log('Received raw suggestion JSON from Gemini:', content.substring(0, 200) + '...');
        
        let rawSuggestions;
        try {
            // Clean the response to extract JSON (Gemini sometimes includes markdown formatting)
            const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            rawSuggestions = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error('Failed to parse suggestion JSON:', parseError, 'Raw:', content);
            throw new Error('Invalid JSON received from Gemini for suggestions.');
        }

        // --- Validate Gemini Response with Zod schema --- 
        const suggestionValidation = CvImprovementResponseSchema.safeParse(rawSuggestions);
        if (!suggestionValidation.success) {
            console.error('Suggestion response failed schema validation:', suggestionValidation.error.flatten());
            console.error('Invalid JSON:', JSON.stringify(rawSuggestions, null, 2)); 
            throw new Error(`Suggestion response did not match schema. Errors: ${JSON.stringify(suggestionValidation.error.flatten().fieldErrors)}`);
        }
        const validatedSuggestions = suggestionValidation.data;

        console.log('Successfully generated and validated improvement suggestions with Gemini.');

        // --- Store successful result in Cache --- 
        await setCache(cacheKey, validatedSuggestions, SUGGESTION_CACHE_TTL_SECONDS);
        console.log('Stored suggestions in cache.');

        return NextResponse.json({ ...validatedSuggestions, fromCache: false, provider: 'gemini' });

    } catch (error: any) {
        console.error('Error calling Gemini API:', error);
        throw new Error(`Gemini API call failed: ${error.message}`);
    }

  } catch (error: any) {
    console.error('Error generating CV improvement suggestions with Gemini:', error);
    // Basic error check for API key missing
    if (error.message?.includes('GOOGLE_AI_API_KEY')) {
        return NextResponse.json({ error: 'Google AI API key not configured.' }, { status: 500 });
    }
    return NextResponse.json({ error: error.message || 'Failed to get improvement suggestions.' }, { status: 500 });
  }
} 