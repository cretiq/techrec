import { NextResponse } from "next/server"
import OpenAI from "openai"
import { DeveloperProfile } from "@/types/developer"
const openai = new OpenAI()

interface RoleInfo {
  title: string
  description: string
  requirements: string[]
  skills: string[]
}

interface CompanyInfo {
  name: string
  location: string
  remote: boolean
  attractionPoints: string[]
}

interface JobSourceInfo {
  source?: string
}

interface CoverLetterRequestData {
  developerProfile: DeveloperProfile
  roleInfo: RoleInfo
  companyInfo: CompanyInfo
  jobSourceInfo: JobSourceInfo
}

export async function POST(req: Request) {
    console.log("Generating cover letter")
  try {
    const data: CoverLetterRequestData = await req.json()
    console.log("Data received:", JSON.stringify(data, null, 2))
    const { developerProfile, roleInfo, companyInfo, jobSourceInfo } = data

    console.log("developerProfile", developerProfile)
    console.log("roleInfo", roleInfo)
    console.log("companyInfo", companyInfo)
    console.log("jobSourceInfo", jobSourceInfo)

    if (!roleInfo || !companyInfo || !developerProfile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const prompt = `
        Generate a professional and compelling cover letter for a software developer applying for a specific role. The goal is to capture the hiring manager's attention and secure an interview.

        The letter is for the position of ${roleInfo.title} at ${companyInfo.name}.

        ${companyInfo.name ? `Address the letter to ${companyInfo.name}.` : ''}

        Applicant Information:
        Name: ${developerProfile.name}
        Contact: ${developerProfile.phone} | ${developerProfile.email}
        ${developerProfile.linkedin || developerProfile.github || developerProfile.portfolio ? `Optional Links: ${developerProfile.linkedin || ''} ${developerProfile.github ? `| ${developerProfile.github}` : ''} ${developerProfile.portfolio ? `| ${developerProfile.portfolio}` : '' }` : ''}

        ${jobSourceInfo.source ? `Mention where you saw the job posting: ${jobSourceInfo.source}.` : ''}

        These are ${developerProfile.name}'s skills:
        ${developerProfile.skills.map(skill => `- ${skill}`).join('\n')}
        Highlight the skills that are most relevant to the role. Look at the job description.

        Relevant Experience (Tailor to Job Description):
        Briefly showcase key ${developerProfile.name}'s experiences or projects that directly relate to the requirements of the ${roleInfo.title} role. Quantify achievements where possible.
        ${developerProfile.achievements.map((achievement, index) => `Example ${index + 1}: ${achievement.title}${achievement.description ? ` - ${achievement.description}` : ''}${achievement.date ? ` (${achievement.date})` : ''}`).join('\n')}
        ${developerProfile.totalExperience ? `Mention total relevant experience: ${developerProfile.totalExperience}` : ''}

        Enthusiasm & Company Fit:
        Express genuine interest in ${companyInfo.name}. Mention specific attractions:
        ${companyInfo.attractionPoints.map((point, index) => `Reason ${index + 1}: ${point}`).join('\n')}
        ${roleInfo.title} Reason: The specific challenges outlined in the job description for the ${roleInfo.title} role.

        Explain why you believe ${developerProfile.name}'s skills and experience make you a strong candidate for this specific role (${roleInfo.title}) and how you can contribute to ${companyInfo.name}'s goals.

        Tone: Maintain a professional, confident, and enthusiastic tone. Avoid generic statements.

        Structure:
        - Introduction: State the ${roleInfo.title} position you're applying for and ${jobSourceInfo.source} where you saw it (if applicable). Briefly express enthusiasm.
        - Body Paragraph(s): Connect ${developerProfile.name} key skills and specific experiences directly to the ${roleInfo.title} requirements. Explain your interest in the ${companyInfo.name} company. Show, don't just tell.
        - Conclusion: Reiterate your strong interest and suitability. Include a clear call to action, expressing your desire for an interview.

        Format: Use standard professional letter formatting. Ensure it is concise, ideally fitting on one page.
        `

    console.log(prompt)

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