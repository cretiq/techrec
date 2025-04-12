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
  achievements: string[]
  totalExperience?: string
}

interface JobInfo {
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
  jobInfo: JobInfo
  companyInfo: CompanyInfo
  jobSourceInfo: JobSourceInfo
  relevantSkills: string[]
}

export async function POST(req: Request) {
  try {
    const data: CoverLetterRequestData = await req.json()
    const { userInfo, jobInfo, companyInfo, jobSourceInfo, relevantSkills } = data

    if (!jobInfo || !companyInfo || !userInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const prompt = `
Generate a professional and compelling cover letter for a software developer applying for a specific role. The goal is to capture the hiring manager's attention and secure an interview.

Role & Company:
The letter is for the position of [Job Info] ${jobInfo.title}
at [Company Info] ${companyInfo.name}.

Recipient:
Address the letter to [Hiring Manager] at [Company Info] ${companyInfo.name}.

Applicant Information:
[Your Info] Name: ${userInfo.name}
[Your Info] Contact: ${userInfo.phone} | ${userInfo.email}
[Your Info] Optional Links: ${userInfo.linkedin || ''} ${userInfo.github ? `| ${userInfo.github}` : ''} ${userInfo.portfolio ? `| ${userInfo.portfolio}` : ''}

Source (Optional but Recommended):
${jobSourceInfo.source ? `Mention where you saw the job posting: [Job Source Info] ${jobSourceInfo.source}.` : ''}

Key Skills & Technologies (Tailor to Job Description):
Highlight [Your Info] proficiency in skills relevant to the job description. Focus on:
${relevantSkills.map(skill => `- ${skill}`).join('\n')}

Relevant Experience (Tailor to Job Description):
Briefly showcase key [Your Info] experiences or projects that directly relate to the requirements of the [Job Info] ${jobInfo.title} role. Quantify achievements where possible.
${userInfo.achievements.map((achievement, index) => `Example ${index + 1}: [Your Info] ${achievement}`).join('\n')}
${userInfo.totalExperience ? `Mention total relevant experience: [Your Info] ${userInfo.totalExperience}` : ''}

Enthusiasm & Company Fit:
Express genuine interest in [Company Info] ${companyInfo.name}. Mention specific attractions:
${companyInfo.attractionPoints.map((point, index) => `[Company Info] Reason ${index + 1}: ${point}`).join('\n')}
[Job Info] Reason: The specific challenges outlined in the job description for the ${jobInfo.title} role.

Explain why you believe [Your Info] your skills and experience make you a strong candidate for this specific role ([Job Info]) and how you can contribute to [Company Info] ${companyInfo.name}'s goals.

Tone: Maintain a professional, confident, and enthusiastic tone. Avoid generic statements.

Structure:
- Introduction: State the [Job Info] position you're applying for and [Job Source Info] where you saw it (if applicable). Briefly express enthusiasm.
- Body Paragraph(s): Connect [Your Info] key skills and specific experiences directly to the [Job Info] requirements. Explain your interest in the [Company Info] company. Show, don't just tell.
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