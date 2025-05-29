import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";

const PLATFORM_CONSTRAINTS = {
  linkedin: {
    maxLength: 300,
    style: "professional and concise",
  },
  email: {
    maxLength: 500,
    style: "formal but personable",
  },
  twitter: {
    maxLength: 280,
    style: "casual and engaging",
  },
  github: {
    maxLength: 400,
    style: "technical and straightforward",
  },
}

export async function POST(req: Request) {
  try {
    const { recipientInfo, context, platform } = await req.json()

    if (!recipientInfo || !context || !platform) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const constraints = PLATFORM_CONSTRAINTS[platform as keyof typeof PLATFORM_CONSTRAINTS]

    const prompt = `
      As an expert in professional networking, create 3 variations of an outreach message with the following specifications:
      
      Platform: ${platform}
      Maximum Length: ${constraints.maxLength} characters
      Style: ${constraints.style}
      
      Recipient Information:
      ${recipientInfo}
      
      Context/Purpose:
      ${context}
      
      Create 3 unique message variations that:
      1. Are appropriate for the platform
      2. Show personalization based on recipient info
      3. Clearly communicate the purpose
      4. Include a specific call to action
      5. Stay within character limit
      
      Return the messages in the following JSON format:
      {
        "variations": [
          {
            "content": "message text",
            "platform": "${platform}"
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
                temperature: 0.7,
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 2048,
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
        const variations = JSON.parse(cleanedContent);

        return NextResponse.json({
            ...variations,
            provider: 'gemini'
        });
    } catch (geminiError) {
        console.error("Gemini API call failed:", geminiError);
        throw new Error(`Gemini API Error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
    }

  } catch (error) {
    console.error("Outreach message generation error (Gemini):", error)
    return NextResponse.json(
      { error: "Failed to generate outreach messages" },
      { status: 500 }
    )
  }
} 