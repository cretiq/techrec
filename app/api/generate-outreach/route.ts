import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI()

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
      
      Return the messages in the following format:
      {
        "variations": [
          {
            "content": "message text",
            "platform": "${platform}"
          }
        ]
      }
    `

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const variations = JSON.parse(completion.choices[0].message.content || "[]")

    return NextResponse.json(variations)
  } catch (error) {
    console.error("Outreach message generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate outreach messages" },
      { status: 500 }
    )
  }
} 