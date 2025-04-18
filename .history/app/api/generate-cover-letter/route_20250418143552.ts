import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI()

interface UserInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin?: string
  github?: string
  portfolio?: string
  achievements: {
    id: string
    title: string
    description: string
    date: string
    url?: string
    issuer?: string
  }[]
  totalExperience?: string
  skills: string[]
}

interface RoleInfo {
  title: string
  description: string
  requirements: string[]
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
  userInfo: UserInfo
  roleInfo: RoleInfo
  companyInfo: CompanyInfo
  jobSourceInfo: JobSourceInfo
  developerSkills: string[]
}

export async function POST(req: Request) {
  try {
    const data: CoverLetterRequestData = await req.json()
    const { userInfo, roleInfo: roleInfo, companyInfo, jobSourceInfo, developerSkills } = data

    if (!roleInfo || !companyInfo || !userInfo) {
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
Name: ${userInfo.name}
Contact: ${userInfo.phone} | ${userInfo.email}
${userInfo.linkedin || userInfo.github || userInfo.portfolio ? `Optional Links: ${userInfo.linkedin || ''} ${userInfo.github ? `| ${userInfo.github}` : ''} ${userInfo.portfolio ? `| ${userInfo.portfolio}` : '' }` : ''}

${jobSourceInfo.source ? `Mention where you saw the job posting: ${jobSourceInfo.source}.` : ''}

These are ${userInfo.name}'s skills:
${userInfo.skills.map(skill => `- ${skill}`).join('\n')}
Highlight the skills that are most relevant to the role. Look at the job description.

Relevant Experience (Tailor to Job Description):
Briefly showcase key ${userInfo.name}'s experiences or projects that directly relate to the requirements of the ${roleInfo.title} role. Quantify achievements where possible.
${userInfo.achievements.map((achievement, index) => `Example ${index + 1}: ${achievement.title}${achievement.description ? ` - ${achievement.description}` : ''}${achievement.date ? ` (${achievement.date})` : ''}`).join('\n')}
${userInfo.totalExperience ? `Mention total relevant experience: ${userInfo.totalExperience}` : ''}

Enthusiasm & Company Fit:
Express genuine interest in ${companyInfo.name}. Mention specific attractions:
${companyInfo.attractionPoints.map((point, index) => `Reason ${index + 1}: ${point}`).join('\n')}
${roleInfo.title} Reason: The specific challenges outlined in the job description for the ${roleInfo.title} role.

Explain why you believe ${userInfo.name}'s skills and experience make you a strong candidate for this specific role (${roleInfo.title}) and how you can contribute to ${companyInfo.name}'s goals.

Tone: Maintain a professional, confident, and enthusiastic tone. Avoid generic statements.

Structure:
- Introduction: State the ${roleInfo.title} position you're applying for and ${jobSourceInfo.source} where you saw it (if applicable). Briefly express enthusiasm.
- Body Paragraph(s): Connect ${userInfo.name} key skills and specific experiences directly to the ${roleInfo.title} requirements. Explain your interest in the ${companyInfo.name} company. Show, don't just tell.
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