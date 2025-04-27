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
        rawSuggestions = JSON.parse(content);
    } catch (parseError) {
        console.error('Failed to parse suggestion JSON:', parseError, 'Raw:', content);
        throw new Error('Invalid JSON received from OpenAI for suggestions.');
    }

    // --- Validate OpenAI Response with Zod schema --- 
    const suggestionValidation = CvImprovementResponseSchema.safeParse(rawSuggestions);
     if (!suggestionValidation.success) {
        console.error('Suggestion response failed schema validation:', suggestionValidation.error.flatten());
        console.error('Invalid JSON:', JSON.stringify(rawSuggestions, null, 2)); 
        throw new Error(`Suggestion response did not match schema. Errors: ${JSON.stringify(suggestionValidation.error.flatten().fieldErrors)}`);
     }
    const validatedSuggestions = suggestionValidation.data;

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