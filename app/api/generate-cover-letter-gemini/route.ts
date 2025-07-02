import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  CoverLetterRequestData, 
  CoverLetterRequestSchema,
  CoverLetterValidationError,
  CoverLetterGenerationError,
  WORD_BOUNDS
} from "@/types/coverLetter";
import { validateLetterOutput, enforceWordCount, sanitizeInput } from "@/utils/coverLetterOutput";
import { getCache, setCache } from "@/lib/redis";

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-pro";

// Cache configuration
const CACHE_TTL_MINUTES = 10; // 10 minutes cache for generated letters
const CACHE_TTL_SECONDS = CACHE_TTL_MINUTES * 60;

/**
 * Generates a cache key for cover letter generation
 * Key includes essential parameters that affect generation output
 */
function generateCacheKey(data: CoverLetterRequestData): string {
  const keyParts = [
    'cover-letter',
    data.developerProfile.id,
    data.roleInfo.title,
    data.companyInfo.name,
    data.requestType || 'coverLetter',
    data.tone || 'formal',
    data.hiringManager || 'none',
    data.jobSourceInfo?.source || 'none'
  ];
  
  return keyParts.join(':').replace(/[^a-zA-Z0-9:-]/g, '_');
}

export async function POST(req: Request) {
    console.log("Generating cover letter with Gemini")
  try {
    const rawData = await req.json()
    
    // Validate request data with Zod
    const data: CoverLetterRequestData = CoverLetterRequestSchema.parse(rawData)

    // Generate cache key and check for cached result
    const cacheKey = generateCacheKey(data);
    console.log(`[Cache] Checking cache for key: ${cacheKey}`);
    
    const cachedResult = await getCache<{ letter: string; provider: string }>(cacheKey);
    if (cachedResult) {
      console.log(`[Cache] Cache HIT for key: ${cacheKey}`);
      return NextResponse.json({
        letter: cachedResult.letter,
        provider: cachedResult.provider,
        cached: true
      });
    }
    
    console.log(`[Cache] Cache MISS for key: ${cacheKey}. Proceeding with generation.`);

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
Write a ${requestType === "coverLetter" ? "250-300-word cover letter" : "150-180-word outreach message"} that follows this structure:
1. Greeting: "Dear ${hiringManager ?? "Hiring Team"},".
2. Hook: cite role title + single company fact.
3. Proof: weave achievements & 3 keywords naturally.
4. Alignment: explain how skills solve company need.
5. CTA & sign-off.

Rules:
• First-person, no clichés, no invented data.
• Address the named person exactly.
• Within specified word count.
• Do NOT use asterisks (*), bullet points, bold formatting (**), or any markdown.
• Write in plain paragraph format only.
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

        const geminiResult = await model.generateContent(prompt);
        const response = await geminiResult.response;
        let letterContent = response.text();

        if (!letterContent) {
            throw new CoverLetterGenerationError("Gemini response did not contain letter content.");
        }

        // Sanitize the output
        // letterContent = sanitizeInput(letterContent);

        // Enforce word count limits
        const maxWords = WORD_BOUNDS[requestType].max;
        // letterContent = enforceWordCount(letterContent, maxWords);

        // Validate the generated letter
        const validation = validateLetterOutput(letterContent, requestType);
        if (!validation.isValid) {
            throw new CoverLetterValidationError(
                `Generated letter failed validation: ${validation.errors.join(', ')}`,
                { 
                    errors: validation.errors,
                    warnings: validation.warnings,
                    wordCount: validation.wordCount
                }
            );
        }

        const result = {
            letter: letterContent.trim(),
            provider: 'gemini' as const
        };

        // Cache the successfully generated result
        try {
          await setCache(cacheKey, result, CACHE_TTL_SECONDS);
          console.log(`[Cache] Successfully cached result for key: ${cacheKey}`);
        } catch (cacheError) {
          console.error(`[Cache] Failed to cache result for key: ${cacheKey}`, cacheError);
          // Don't fail the request if caching fails
        }

        return NextResponse.json(result)
    } catch (geminiError) {
        console.error("Gemini API call failed:", geminiError);
        throw new CoverLetterGenerationError(
          `Gemini API Error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`,
          { provider: 'gemini', originalError: geminiError }
        );
    }

  } catch (error) {
    console.error("Cover letter generation error (Gemini):", error);
    
    // Handle validation errors specifically
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: error.errors,
          code: "VALIDATION_ERROR"
        },
        { status: 400 }
      );
    }
    
    // Handle custom cover letter errors
    if (error instanceof CoverLetterValidationError || error instanceof CoverLetterGenerationError) {
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          meta: error.meta 
        },
        { status: error instanceof CoverLetterValidationError ? 400 : 500 }
      );
    }
    
    // Handle generic errors
    const errorMessage = error instanceof Error ? error.message : "Failed to generate cover letter";
    return NextResponse.json(
      { error: errorMessage, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
} 