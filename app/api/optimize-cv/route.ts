import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";

export async function POST(req: Request) {
  try {
    const { cv, jobDescription } = await req.json()

    if (!cv || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const prompt = `
      As an expert resume reviewer, analyze the following CV and job description.
      Provide specific suggestions to optimize the CV for this role.
      Focus on:
      1. Keyword alignment with job requirements
      2. Achievement quantification
      3. Technical skills highlighting
      4. Role-specific experience emphasis

      CV:
      ${cv}

      Job Description:
      ${jobDescription}

      Provide suggestions in the following JSON format:
      {
        "suggestions": [
          {
            "original": "original text",
            "suggested": "improved text",
            "reason": "explanation"
          }
        ]
      }

      Return ONLY a valid JSON object. Do not include any explanatory text before or after the JSON.
    `

    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({ 
            model: geminiModel,
            generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 4096,
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        if (!content) {
            throw new Error("Gemini response did not contain content.");
        }

        // Clean the response to extract JSON
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const suggestions = JSON.parse(cleanedContent);

        return NextResponse.json({
            ...suggestions,
            provider: 'gemini'
        });
    } catch (geminiError) {
        console.error("Gemini API call failed:", geminiError);
        throw new Error(`Gemini API Error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
    }

  } catch (error) {
    console.error("CV optimization error (Gemini):", error)
    return NextResponse.json(
      { error: "Failed to optimize CV" },
      { status: 500 }
    )
  }
} 