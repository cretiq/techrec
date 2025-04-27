import { NextResponse } from "next/server"
import OpenAI from "openai"
// import { DeveloperProfile } from "@/types/developer" // Removed old import
import { InternalProfile, InternalSkill, InternalAchievement } from "@/types/types"; // Relative path attempt
const openai = new OpenAI()

const gptModel = process.env.GPT_MODEL || "gpt-4o-mini-2024-07-18";

interface RoleInfo {
  title: string
  description: string
  requirements: string[]
  skills: string[]
}

interface CompanyInfo {
  name: string
  location: string // Location still needed?
  remote: boolean
  attractionPoints: string[]
}

interface JobSourceInfo {
  source?: string
}

// Update to use InternalProfile
interface CoverLetterRequestData {
  developerProfile: InternalProfile 
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

    // Construct contact info string safely
    const contactString = [
        developerProfile.contactInfo?.phone,
        developerProfile.profileEmail || developerProfile.email // Use profileEmail first, fallback to main email
    ].filter(Boolean).join(' | ');
    
    // Construct optional links string
    const links = [
        developerProfile.contactInfo?.linkedin,
        developerProfile.contactInfo?.github,
        developerProfile.contactInfo?.website // Use website from contactInfo
    ].filter(Boolean);
    const optionalLinksString = links.length > 0 ? `Optional Links: ${links.join(' | ')}` : '';

    const prompt = `
Generate a professional and compelling cover letter for a software developer applying for a specific role. The goal is to capture the hiring manager's attention and secure an interview.

The letter is for the position of ${roleInfo.title} at ${companyInfo.name}.

Here is information about the company:
${companyInfo.name ? `Address the letter to ${companyInfo.name}.` : ''}
${companyInfo.location ? `The company is located in ${companyInfo.location}.` : ''}
${companyInfo.remote ? `The company is a remote position.` : ''}
${companyInfo.attractionPoints ? `The company is known for ${companyInfo.attractionPoints.join(', ')}.` : ''}

Here is information about the job:
${roleInfo.title ? `The job is for a ${roleInfo.title}.` : ''}
${roleInfo.description ? `The job description is: ${roleInfo.description}.` : ''}
${roleInfo.requirements ? `The requirements for the job are: ${roleInfo.requirements.join(', ')}.` : ''}
${roleInfo.skills ? `The skills required for the job are: ${roleInfo.skills.join(', ')}.` : ''}

Here is information about the applicant:
${developerProfile.name ? `Name: ${developerProfile.name}` : ''}
${developerProfile.profileEmail ? `Email: ${developerProfile.profileEmail}` : ''}
${developerProfile.contactInfo?.phone ? `Phone: ${developerProfile.contactInfo?.phone}` : ''}
${developerProfile.contactInfo?.linkedin ? `LinkedIn: ${developerProfile.contactInfo?.linkedin}` : ''}
${developerProfile.contactInfo?.github ? `GitHub: ${developerProfile.contactInfo?.github}` : ''}
${developerProfile.contactInfo?.website ? `Website: ${developerProfile.contactInfo?.website}` : ''}

${developerProfile.name}'s Skills:
${developerProfile.skills.map((skill: InternalSkill) => `- ${skill.name} (${skill.level})`).join('\n')} {/* Added explicit type and level */}

${jobSourceInfo.source ? `Mention where you saw the job posting: ${jobSourceInfo.source}.` : ''}

  ---
Please follow these guidelines when drafting the cover letter:

1. Start with a personalized greeting addressed to a specific individual or team (e.g., “Dear [Hiring Manager Name]”).
2. In the opening paragraph, mention the role title and express genuine enthusiasm for this position at [Company Name].
3. Tailor the letter by referencing one or two specific company details (e.g., mission, recent project, or value) to demonstrate your research and alignment.
4. Highlight 2–3 key achievements or experiences, using concrete metrics (e.g., “increased API performance by 40%”).
5. Integrate 3–4 important keywords or requirements from the job posting to pass automated screening.
6. Weave a concise story that shows how your skills directly solved a problem or added value, avoiding jargon and clichés.
7. Maintain an authentic, first‑person voice throughout; let your personality shine in a professional tone.
8. Keep the total length between 200–300 words (approximately one page) to ensure readability.
9. Use clear, logical structure—short paragraphs, one‑inch margins, and a header with your contact info.
10. Close with a strong call to action, thanking the reader and expressing your eagerness to discuss how you can contribute.

Important notes:
    - Do not lie
    - Do not make up skills
    - Do not make up experience
    - Do not make up metrics
    - Always use information that you can find and make out of information that is provided in the request

Please generate only the final cover letter text without restating these instructions.
`

    console.log("Generated Prompt:", prompt) // Log the final prompt for debugging

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: gptModel,
      temperature: 0.5,
    })

    return NextResponse.json({
      letter: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error("Cover letter generation error:", error)
    // Provide more detail in the error response if possible
    const errorMessage = error instanceof Error ? error.message : "Failed to generate cover letter";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}