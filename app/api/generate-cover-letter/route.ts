import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI()

interface CoverLetterOptions {
  tone: string
  length: string
  focusPoints: string[]
  achievements: string[]
  technologies: string[]
  profile: {
    name: string
    email: string
    phone: string
    location: string
    linkedin?: string
    github?: string
    portfolio?: string
  }
}

export async function POST(req: Request) {
  try {
    const { jobDescription, companyInfo, options } = await req.json()

    if (!jobDescription || !companyInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const prompt = `
      As an expert cover letter writer, create a compelling cover letter with the following specifications:
      
      Profile Information:
      Name: ${options.profile.name}
      Email: ${options.profile.email}
      Phone: ${options.profile.phone}
      Location: ${options.profile.location}
      ${options.profile.linkedin ? `LinkedIn: ${options.profile.linkedin}` : ''}
      ${options.profile.github ? `GitHub: ${options.profile.github}` : ''}
      ${options.profile.portfolio ? `Portfolio: ${options.profile.portfolio}` : ''}
      
      Tone: ${options.tone}
      Target Length: ${options.length} words
      
      Focus Points:
      ${options.focusPoints.map((point: string) => `- ${point}`).join("\n")}
      
      Key Achievements:
      ${options.achievements.map((achievement: string) => `- ${achievement}`).join("\n")}
      
      Technologies:
      ${options.technologies.map((tech: string) => `- ${tech}`).join("\n")}
      
      Job Description:
      ${jobDescription}
      
      Company Information:
      ${companyInfo}
      
      Create a personalized cover letter that:
      1. Demonstrates understanding of the company and role
      2. Highlights relevant achievements and skills
      3. Shows enthusiasm and cultural fit
      4. Maintains the specified tone and length
      5. Includes a strong call to action
      6. Incorporates the profile information appropriately
      
      Return the cover letter as plain text.
    `

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini-2024-07-18",
      temperature: 0.5,
    })

    return NextResponse.json({
      letter: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error("Cover letter generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    )
  }
} 