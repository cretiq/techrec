import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { company, role, description, skills, profile, letterType } = await request.json()

    const prompt = `Generate a ${letterType === "email" ? "professional email" : "concise message"} for a job application to ${company} for the ${role} position.

Company Description: ${description}

Applicant Profile:
- Name: ${profile.name}
- Title: ${profile.title}
- Skills: ${profile.skills.map((s: any) => `${s.name} (${s.level})`).join(", ")}
- Experience: ${profile.experience[0].description}

The letter should:
1. Be personalized to the specific role and company
2. Highlight relevant skills and experience
3. Show enthusiasm for the opportunity
4. Be professional and concise
5. Match the tone of a ${letterType === "email" ? "formal email" : "professional message"}

Generate the letter:`

    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional career coach helping developers write effective cover letters and application messages."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    })

    // Process the stream
    ;(async () => {
      try {
        for await (const part of completion) {
          const chunk = part.choices[0]?.delta?.content || ""
          await writer.write(encoder.encode(JSON.stringify({ delta: chunk }) + "\n"))
        }
      } catch (error) {
        console.error("Error processing stream:", error)
      } finally {
        await writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error generating letter:", error)
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    )
  }
} 