import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI()

const gptModel = process.env.GPT_MODEL || "gpt-4o-mini-2024-07-18";

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

      Provide suggestions in the following format:
      {
        "suggestions": [
          {
            "original": "original text",
            "suggested": "improved text",
            "reason": "explanation"
          }
        ]
      }
    `

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: gptModel,
      response_format: { type: "json_object" },
    })

    const suggestions = JSON.parse(completion.choices[0].message.content || "[]")

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("CV optimization error:", error)
    return NextResponse.json(
      { error: "Failed to optimize CV" },
      { status: 500 }
    )
  }
} 