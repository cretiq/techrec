import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InternalProfile } from "@/types/types";

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";

interface RoleInfo {
  title: string
  description: string
  requirements: string[]
  skills: string[]
}

interface CompanyInfo {
  name: string
  location?: string
  remote?: boolean
  attractionPoints?: string[]
}

interface JobSourceInfo {
  source?: string
}

type RequestType = "coverLetter" | "outreach"

interface CoverLetterRequestData {
  developerProfile: InternalProfile
  roleInfo: RoleInfo
  companyInfo: CompanyInfo
  jobSourceInfo?: JobSourceInfo
  hiringManager?: string
  achievements?: string[]
  requestType?: RequestType
  tone?: "formal" | "friendly" | "enthusiastic"
}

export async function POST(req: Request) {
    console.log("Generating cover letter with Gemini")
  try {
    const data: CoverLetterRequestData = await req.json()

    // Destructure with defaults
    const {
      developerProfile,
      roleInfo,
      companyInfo,
      jobSourceInfo = {},
      hiringManager,
      achievements: providedAchievements,
      requestType = "coverLetter",
      tone = "formal",
    } = data

    // Import helper utils dynamically (avoids circular in edge runtimes)
    const { pickCoreSkills, rankRoleKeywords, deriveAchievements } = await import("@/utils/coverLetter")

    const keywords = rankRoleKeywords(roleInfo)
    const coreSkills = pickCoreSkills(developerProfile.skills)
    const achievements = deriveAchievements(developerProfile, providedAchievements)

    console.log("-".repeat(40));
    console.log("DEVELOPER PROFILE DATA");
    console.log("-".repeat(40));
    console.log("DeveloperProfile:", developerProfile)

    console.log("-".repeat(40));
    console.log("ROLE INFORMATION");
    console.log("-".repeat(40));
    console.log("RoleInfo:", roleInfo)

    console.log("-".repeat(40));
    console.log("COMPANY INFORMATION");
    console.log("-".repeat(40));
    console.log("CompanyInfo:", companyInfo)

    console.log("-".repeat(40));
    console.log("JOB SOURCE INFORMATION");
    console.log("-".repeat(40));
    console.log("JobSourceInfo:", jobSourceInfo)

    if (!roleInfo || !companyInfo || !developerProfile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const prompt = `SYSTEM:
You are an elite career-coach copywriter who crafts concise, metrics-driven ${requestType === "coverLetter" ? "cover letters" : "outreach messages"} with a ${tone} yet professional voice.

USER:
<HEADER>
Name: ${developerProfile.name} | Email: ${developerProfile.profileEmail ?? developerProfile.email} | Phone: ${developerProfile.contactInfo?.phone ?? "N/A"}

<COMPANY>
Name: ${companyInfo.name}
Location: ${companyInfo.location ?? "N/A"}
Fact: "${companyInfo.attractionPoints?.[0] ?? ""}"

<ROLE>
Title: ${roleInfo.title}
TopKeywords: ${keywords.join(", ")}

<APPLICANT SNAPSHOT>
Professional Title: ${developerProfile.title ?? "Software Developer"}
CoreSkills: ${coreSkills.join(", ")}
KeyAchievements:
${achievements.map((a) => `- ${a}`).join("\n")}

<TASK>
Write a ${requestType === "coverLetter" ? "200-250-word cover letter" : "120-150-word outreach message"} that follows this structure:
1. Greeting: "Dear ${hiringManager ?? "Hiring Team"},".
2. Hook: cite role title + single company fact.
3. Proof: weave achievements & 3 keywords naturally.
4. Alignment: explain how skills solve company need.
5. CTA & sign-off.

Rules:
• First-person, no clichés, no invented data.
• Address the named person exactly.
• Within specified word count.
• Output ONLY the final letter text (no markdown, no extra commentary).
`

    console.log("=".repeat(80));
    console.log("COVER LETTER GENERATION REQUEST");
    console.log("=".repeat(80));
    console.log("Generated Prompt:", prompt)

    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({ 
            model: geminiModel,
            generationConfig: {
                temperature: 0.5,
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 512,
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let letterContent = response.text();

        // Basic guard: trim to ~260 words for cover letters
        if (requestType === "coverLetter") {
          const words = letterContent.split(/\s+/);
          if (words.length > 260) {
            letterContent = words.slice(0, 260).join(" ") + "...";
          }
        }

        if (!letterContent) {
            throw new Error("Gemini response did not contain letter content.");
        }

        return NextResponse.json({
            letter: letterContent.trim(),
            provider: 'gemini'
        })
    } catch (geminiError) {
        console.error("Gemini API call failed:", geminiError);
        throw new Error(`Gemini API Error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
    }

  } catch (error) {
    console.error("Cover letter generation error (Gemini):", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate cover letter";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 