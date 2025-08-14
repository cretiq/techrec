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
import { getGeminiModel } from '@/lib/modelConfig';
import { CoverLetterDebugLogger } from '@/utils/debugLogger';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

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
    data.jobSourceInfo?.source || 'none',
    data.regenerationCount || 0
  ];
  
  return keyParts.join(':').replace(/[^a-zA-Z0-9:-]/g, '_');
}

export async function POST(req: Request) {
    console.log("Generating cover letter with Gemini")
    
    // Initialize debug logging session if enabled
    const debugSessionId = CoverLetterDebugLogger.initialize();
    const startTime = Date.now();
    
  try {
    const rawData = await req.json()
    
    // Validate request data with Zod
    const data: CoverLetterRequestData = CoverLetterRequestSchema.parse(rawData)

    // Generate cache key and check for cached result
    const cacheKey = generateCacheKey(data);
    console.log(`[Cache] Checking cache for key: ${cacheKey}`);
    
    const cachedResult = await getCache<{ letter: string; provider: string }>(cacheKey);
    const cacheHit = !!cachedResult;
    
    if (cachedResult) {
      console.log(`[Cache] Cache HIT for key: ${cacheKey}`);
      
      // Log cached response for debugging
      if (debugSessionId) {
        CoverLetterDebugLogger.logResponse({
          attempt: 1,
          modelName: 'cached',
          generationConfig: {},
          rawResponse: cachedResult.letter,
          validationResult: { isValid: true, cached: true },
          duration: Date.now() - startTime,
          cached: true,
          provider: cachedResult.provider
        });
      }
      
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

    // Use MVP content as primary source if available, fallback to structured data
    const hasMvpContent = developerProfile.mvpContent && developerProfile.mvpContent.trim().length > 0;
    
    // Define raw prompt templates for debugging
    const rawMvpTemplate = `SYSTEM:
You are an elite career-coach copywriter who crafts concise, metrics-driven \${requestType === "coverLetter" ? "cover letters" : "outreach messages"} with a \${tone} yet professional voice.

USER:
<HEADER>
Name: \${developerProfile.name} | Email: \${developerProfile.profileEmail ?? developerProfile.email} | Phone: \${developerProfile.contactInfo?.phone ?? "N/A"}

<COMPANY CONTEXT>
Name: \${companyInfo.name}
\${companyInfo.linkedinOrgType ? \`Organization Type: \${companyInfo.linkedinOrgType}\` : ''}
\${companyInfo.linkedinOrgIndustry ? \`Industry: \${companyInfo.linkedinOrgIndustry}\` : companyInfo.industry ? \`Industry: \${companyInfo.industry}\` : ''}
\${companyInfo.linkedinOrgSize ? \`Company Size: \${companyInfo.linkedinOrgSize}\` : companyInfo.size ? \`Company Size: \${companyInfo.size}\` : ''}
\${companyInfo.headquarters ? \`Headquarters: \${companyInfo.headquarters}\` : ''}
\${companyInfo.foundedDate ? \`Founded: \${companyInfo.foundedDate}\` : ''}
\${companyInfo.linkedinOrgDescription ? \`About: \${companyInfo.linkedinOrgDescription}\` : companyInfo.description ? \`About: \${companyInfo.description}\` : ''}
\${companyInfo.specialties && companyInfo.specialties.length > 0 ? \`Core Specialties: \${companyInfo.specialties.join(', ')}\` : ''}

Company Culture & Benefits:
\${companyInfo.attractionPoints?.map(point => \`- \${point}\`).join('\\n') ?? "- Innovative company in the tech space"}

<ROLE SPECIFICS>
Title: \${roleInfo.title}
\${roleInfo.organization ? \`Organization: \${roleInfo.organization}\` : ''}
\${roleInfo.seniority ? \`Seniority Level: \${roleInfo.seniority}\` : ''}
\${roleInfo.employmentType && roleInfo.employmentType.length > 0 ? \`Employment Type: \${roleInfo.employmentType.join(', ')}\` : ''}
\${roleInfo.remote !== undefined ? \`Remote Work: \${roleInfo.remote ? 'Yes' : 'Office-based'}\` : ''}
\${roleInfo.directApply !== undefined ? \`Application Method: \${roleInfo.directApply ? 'LinkedIn Easy Apply' : 'External Application'}\` : ''}
\${roleInfo.location ? \`Location: \${roleInfo.location}\` : ''}
\${roleInfo.aiWorkArrangement ? \`Work Arrangement: \${roleInfo.aiWorkArrangement}\` : ''}
\${roleInfo.aiWorkingHours ? \`Working Hours: \${roleInfo.aiWorkingHours} hours/week\` : ''}
\${roleInfo.salaryRaw ? \`Compensation: \${JSON.stringify(roleInfo.salaryRaw)}\` : ''}

\${roleInfo.descriptionText ? \`Full Job Description:\\n\${roleInfo.descriptionText}\\n\` : ''}

\${roleInfo.aiCoreResponsibilities ? \`Core Responsibilities:\\n\${roleInfo.aiCoreResponsibilities}\` : ''}

\${roleInfo.aiRequirementsSummary ? \`Requirements Summary:\\n\${roleInfo.aiRequirementsSummary}\` : ''}

Requirements:
\${roleInfo.requirements?.map(req => \`- \${req}\`).join('\\n') ?? '- Not specified'}

Skills Needed:
\${roleInfo.skills?.map(skill => \`- \${skill}\`).join('\\n') ?? '- Not specified'}

\${roleInfo.aiKeySkills && roleInfo.aiKeySkills.length > 0 ? \`Key Skills (AI-Extracted): \${roleInfo.aiKeySkills.join(', ')}\` : ''}

\${roleInfo.aiBenefits && roleInfo.aiBenefits.length > 0 ? \`Benefits:\\n\${roleInfo.aiBenefits.map(b => \`- \${b}\`).join('\\n')}\` : ''}

\${roleInfo.recruiterName ? \`Recruiter: \${roleInfo.recruiterName}\${roleInfo.recruiterTitle ? \` (\${roleInfo.recruiterTitle})\` : ''}\` : ''}
\${roleInfo.aiHiringManagerName ? \`Hiring Manager: \${roleInfo.aiHiringManagerName}\` : ''}
\${roleInfo.aiHiringManagerEmail ? \`HM Email: \${roleInfo.aiHiringManagerEmail}\` : ''}

Keywords: \${keywords.join(", ")}

<FULL CV CONTENT>
\${developerProfile.mvpContent}

<TASK>
Write a \${requestType === "coverLetter" ? "250-300-word cover letter" : "150-180-word outreach message"} using the FULL CV CONTENT above as your primary source of information about the applicant.

Use the detailed ROLE & JOB DETAILS including the full job description to create a highly targeted letter that addresses specific requirements and demonstrates how the candidate's CV experience aligns with the job needs.

Structure:
1. Greeting: "Dear \${hiringManager ?? roleInfo.aiHiringManagerName ?? "Hiring Team"},".
2. Hook: cite role title + most relevant company fact (organization type, industry, or mission).
3. Proof: extract relevant achievements from CV content & match with specific job requirements from the full description.
4. Alignment: use CV skills/experience to address specific job requirements, work arrangement, and company culture.
5. CTA & sign-off.

Rules:
• First-person, no clichés, no invented data.
• Use ONLY information from the CV content provided.
• Address the named person exactly.
• Match CV experience to specific job requirements listed above, especially from the full job description.
• Reference LinkedIn org details and company facts that align with candidate values.
• Within specified word count.
• Do NOT use asterisks (*), bullet points, bold formatting (**), or any markdown.
• Write in plain paragraph format only.
• Output ONLY the final letter text (no markdown, no extra commentary).
`;

    const rawStructuredTemplate = `SYSTEM:
You are an elite career-coach copywriter who crafts concise, metrics-driven \${requestType === "coverLetter" ? "cover letters" : "outreach messages"} with a \${tone} yet professional voice.

USER:
<HEADER>
Name: \${developerProfile.name} | Email: \${developerProfile.profileEmail ?? developerProfile.email} | Phone: \${developerProfile.contactInfo?.phone ?? "N/A"}

<COMPANY CONTEXT>
Name: \${companyInfo.name}
\${companyInfo.linkedinOrgType ? \`Organization Type: \${companyInfo.linkedinOrgType}\` : ''}
\${companyInfo.linkedinOrgIndustry ? \`Industry: \${companyInfo.linkedinOrgIndustry}\` : companyInfo.industry ? \`Industry: \${companyInfo.industry}\` : ''}
\${companyInfo.linkedinOrgSize ? \`Company Size: \${companyInfo.linkedinOrgSize}\` : companyInfo.size ? \`Company Size: \${companyInfo.size}\` : ''}
\${companyInfo.headquarters ? \`Headquarters: \${companyInfo.headquarters}\` : ''}
\${companyInfo.foundedDate ? \`Founded: \${companyInfo.foundedDate}\` : ''}
\${companyInfo.linkedinOrgDescription ? \`About: \${companyInfo.linkedinOrgDescription}\` : companyInfo.description ? \`About: \${companyInfo.description}\` : ''}
\${companyInfo.specialties && companyInfo.specialties.length > 0 ? \`Core Specialties: \${companyInfo.specialties.join(', ')}\` : ''}

Company Culture & Benefits:
\${companyInfo.attractionPoints?.map(point => \`- \${point}\`).join('\\n') ?? "- Innovative company in the tech space"}

<ROLE SPECIFICS>
Title: \${roleInfo.title}
\${roleInfo.organization ? \`Organization: \${roleInfo.organization}\` : ''}
\${roleInfo.seniority ? \`Seniority Level: \${roleInfo.seniority}\` : ''}
\${roleInfo.employmentType && roleInfo.employmentType.length > 0 ? \`Employment Type: \${roleInfo.employmentType.join(', ')}\` : ''}
\${roleInfo.remote !== undefined ? \`Remote Work: \${roleInfo.remote ? 'Yes' : 'Office-based'}\` : ''}
\${roleInfo.directApply !== undefined ? \`Application Method: \${roleInfo.directApply ? 'LinkedIn Easy Apply' : 'External Application'}\` : ''}
\${roleInfo.location ? \`Location: \${roleInfo.location}\` : ''}
\${roleInfo.aiWorkArrangement ? \`Work Arrangement: \${roleInfo.aiWorkArrangement}\` : ''}
\${roleInfo.aiWorkingHours ? \`Working Hours: \${roleInfo.aiWorkingHours} hours/week\` : ''}
\${roleInfo.salaryRaw ? \`Compensation: \${JSON.stringify(roleInfo.salaryRaw)}\` : ''}

\${roleInfo.descriptionText ? \`Full Job Description:\\n\${roleInfo.descriptionText}\\n\` : ''}

\${roleInfo.aiCoreResponsibilities ? \`Core Responsibilities:\\n\${roleInfo.aiCoreResponsibilities}\` : ''}

\${roleInfo.aiRequirementsSummary ? \`Requirements Summary:\\n\${roleInfo.aiRequirementsSummary}\` : ''}

Requirements:
\${roleInfo.requirements?.map(req => \`- \${req}\`).join('\\n') ?? '- Not specified'}

Skills Needed:
\${roleInfo.skills?.map(skill => \`- \${skill}\`).join('\\n') ?? '- Not specified'}

\${roleInfo.aiKeySkills && roleInfo.aiKeySkills.length > 0 ? \`Key Skills (AI-Extracted): \${roleInfo.aiKeySkills.join(', ')}\` : ''}

\${roleInfo.aiBenefits && roleInfo.aiBenefits.length > 0 ? \`Benefits:\\n\${roleInfo.aiBenefits.map(b => \`- \${b}\`).join('\\n')}\` : ''}

\${roleInfo.recruiterName ? \`Recruiter: \${roleInfo.recruiterName}\${roleInfo.recruiterTitle ? \` (\${roleInfo.recruiterTitle})\` : ''}\` : ''}
\${roleInfo.aiHiringManagerName ? \`Hiring Manager: \${roleInfo.aiHiringManagerName}\` : ''}
\${roleInfo.aiHiringManagerEmail ? \`HM Email: \${roleInfo.aiHiringManagerEmail}\` : ''}

Keywords: \${keywords.join(", ")}

<APPLICANT SNAPSHOT>
Professional Title: \${developerProfile.title ?? "Software Developer"}
CoreSkills: \${coreSkills.join(", ")}
KeyAchievements:
\${achievements.map((a) => \`- \${a}\`).join("\\n")}

<TASK>
Write a \${requestType === "coverLetter" ? "250-300-word cover letter" : "150-180-word outreach message"} using the detailed ROLE & JOB DETAILS above to create a highly targeted letter.

Match the applicant's skills and achievements to the specific job requirements from the full job description and address the company's values through the LinkedIn org details and provided facts.

Structure:
1. Greeting: "Dear \${hiringManager ?? roleInfo.aiHiringManagerName ?? "Hiring Team"},".
2. Hook: cite role title + most relevant company fact (org type, industry, or LinkedIn description).
3. Proof: weave achievements with specific job requirements from full description (not just generic keywords).
4. Alignment: explain how skills solve the specific needs outlined in the full job description, work arrangement, and organizational culture.
5. CTA & sign-off.

Rules:
• First-person, no clichés, no invented data.
• Address the named person exactly.
• Reference specific job requirements from the full description, not just generic keywords.
• Use LinkedIn org details and company facts that align with candidate values.
• Within specified word count.
• Do NOT use asterisks (*), bullet points, bold formatting (**), or any markdown.
• Write in plain paragraph format only.
• Output ONLY the final letter text (no markdown, no extra commentary).
`;

    const rawPromptTemplate = hasMvpContent ? rawMvpTemplate : rawStructuredTemplate;
    
    const prompt = hasMvpContent ? 
    `SYSTEM:
You are an elite career-coach copywriter who crafts concise, metrics-driven ${requestType === "coverLetter" ? "cover letters" : "outreach messages"} with a ${tone} yet professional voice.

USER:
<HEADER>
Name: ${developerProfile.name} | Email: ${developerProfile.profileEmail ?? developerProfile.email} | Phone: ${developerProfile.contactInfo?.phone ?? "N/A"}

<COMPANY CONTEXT>
Name: ${companyInfo.name}
${companyInfo.linkedinOrgType ? `Organization Type: ${companyInfo.linkedinOrgType}` : ''}
${companyInfo.linkedinOrgIndustry ? `Industry: ${companyInfo.linkedinOrgIndustry}` : companyInfo.industry ? `Industry: ${companyInfo.industry}` : ''}
${companyInfo.linkedinOrgSize ? `Company Size: ${companyInfo.linkedinOrgSize}` : companyInfo.size ? `Company Size: ${companyInfo.size}` : ''}
${companyInfo.headquarters ? `Headquarters: ${companyInfo.headquarters}` : ''}
${companyInfo.foundedDate ? `Founded: ${companyInfo.foundedDate}` : ''}
${companyInfo.linkedinOrgDescription ? `About: ${companyInfo.linkedinOrgDescription}` : companyInfo.description ? `About: ${companyInfo.description}` : ''}
${companyInfo.specialties && companyInfo.specialties.length > 0 ? `Core Specialties: ${companyInfo.specialties.join(', ')}` : ''}

Company Culture & Benefits:
${companyInfo.attractionPoints?.map(point => `- ${point}`).join('\n') ?? "- Innovative company in the tech space"}

<ROLE SPECIFICS>
Title: ${roleInfo.title}
${roleInfo.organization ? `Organization: ${roleInfo.organization}` : ''}
${roleInfo.seniority ? `Seniority Level: ${roleInfo.seniority}` : ''}
${roleInfo.employmentType && roleInfo.employmentType.length > 0 ? `Employment Type: ${roleInfo.employmentType.join(', ')}` : ''}
${roleInfo.remote !== undefined ? `Remote Work: ${roleInfo.remote ? 'Yes' : 'Office-based'}` : ''}
${roleInfo.directApply !== undefined ? `Application Method: ${roleInfo.directApply ? 'LinkedIn Easy Apply' : 'External Application'}` : ''}
${roleInfo.location ? `Location: ${roleInfo.location}` : ''}
${roleInfo.aiWorkArrangement ? `Work Arrangement: ${roleInfo.aiWorkArrangement}` : ''}
${roleInfo.aiWorkingHours ? `Working Hours: ${roleInfo.aiWorkingHours} hours/week` : ''}
${roleInfo.salaryRaw ? `Compensation: ${JSON.stringify(roleInfo.salaryRaw)}` : ''}

${roleInfo.descriptionText ? `Full Job Description:\n${roleInfo.descriptionText}\n` : ''}

${roleInfo.aiCoreResponsibilities ? `Core Responsibilities:\n${roleInfo.aiCoreResponsibilities}` : ''}

${roleInfo.aiRequirementsSummary ? `Requirements Summary:\n${roleInfo.aiRequirementsSummary}` : ''}

Requirements:
${roleInfo.requirements?.map(req => `- ${req}`).join('\n') ?? '- Not specified'}

Skills Needed:
${roleInfo.skills?.map(skill => `- ${skill}`).join('\n') ?? '- Not specified'}

${roleInfo.aiKeySkills && roleInfo.aiKeySkills.length > 0 ? `Key Skills (AI-Extracted): ${roleInfo.aiKeySkills.join(', ')}` : ''}

${roleInfo.aiBenefits && roleInfo.aiBenefits.length > 0 ? `Benefits:\n${roleInfo.aiBenefits.map(b => `- ${b}`).join('\n')}` : ''}

${roleInfo.recruiterName ? `Recruiter: ${roleInfo.recruiterName}${roleInfo.recruiterTitle ? ` (${roleInfo.recruiterTitle})` : ''}` : ''}
${roleInfo.aiHiringManagerName ? `Hiring Manager: ${roleInfo.aiHiringManagerName}` : ''}
${roleInfo.aiHiringManagerEmail ? `HM Email: ${roleInfo.aiHiringManagerEmail}` : ''}

Keywords: ${keywords.join(", ")}

<FULL CV CONTENT>
${developerProfile.mvpContent}

<TASK>
Write a ${requestType === "coverLetter" ? "250-300-word cover letter" : "150-180-word outreach message"} using the FULL CV CONTENT above as your primary source of information about the applicant.

Use the detailed ROLE & JOB DETAILS including the full job description to create a highly targeted letter that addresses specific requirements and demonstrates how the candidate's CV experience aligns with the job needs.

Structure:
1. Greeting: "Dear ${hiringManager ?? roleInfo.aiHiringManagerName ?? "Hiring Team"},".
2. Hook: cite role title + most relevant company fact (organization type, industry, or mission).
3. Proof: extract relevant achievements from CV content & match with specific job requirements from the full description.
4. Alignment: use CV skills/experience to address specific job requirements, work arrangement, and company culture.
5. CTA & sign-off.

Rules:
• First-person, no clichés, no invented data.
• Use ONLY information from the CV content provided.
• Address the named person exactly.
• Match CV experience to specific job requirements listed above, especially from the full job description.
• Reference LinkedIn org details and company facts that align with candidate values.
• Within specified word count.
• Do NOT use asterisks (*), bullet points, bold formatting (**), or any markdown.
• Write in plain paragraph format only.
• Output ONLY the final letter text (no markdown, no extra commentary).
`
    :
    `SYSTEM:
You are an elite career-coach copywriter who crafts concise, metrics-driven ${requestType === "coverLetter" ? "cover letters" : "outreach messages"} with a ${tone} yet professional voice.

USER:
<HEADER>
Name: ${developerProfile.name} | Email: ${developerProfile.profileEmail ?? developerProfile.email} | Phone: ${developerProfile.contactInfo?.phone ?? "N/A"}

<COMPANY CONTEXT>
Name: ${companyInfo.name}
${companyInfo.linkedinOrgType ? `Organization Type: ${companyInfo.linkedinOrgType}` : ''}
${companyInfo.linkedinOrgIndustry ? `Industry: ${companyInfo.linkedinOrgIndustry}` : companyInfo.industry ? `Industry: ${companyInfo.industry}` : ''}
${companyInfo.linkedinOrgSize ? `Company Size: ${companyInfo.linkedinOrgSize}` : companyInfo.size ? `Company Size: ${companyInfo.size}` : ''}
${companyInfo.headquarters ? `Headquarters: ${companyInfo.headquarters}` : ''}
${companyInfo.foundedDate ? `Founded: ${companyInfo.foundedDate}` : ''}
${companyInfo.linkedinOrgDescription ? `About: ${companyInfo.linkedinOrgDescription}` : companyInfo.description ? `About: ${companyInfo.description}` : ''}
${companyInfo.specialties && companyInfo.specialties.length > 0 ? `Core Specialties: ${companyInfo.specialties.join(', ')}` : ''}

Company Culture & Benefits:
${companyInfo.attractionPoints?.map(point => `- ${point}`).join('\n') ?? "- Innovative company in the tech space"}

<ROLE SPECIFICS>
Title: ${roleInfo.title}
${roleInfo.organization ? `Organization: ${roleInfo.organization}` : ''}
${roleInfo.seniority ? `Seniority Level: ${roleInfo.seniority}` : ''}
${roleInfo.employmentType && roleInfo.employmentType.length > 0 ? `Employment Type: ${roleInfo.employmentType.join(', ')}` : ''}
${roleInfo.remote !== undefined ? `Remote Work: ${roleInfo.remote ? 'Yes' : 'Office-based'}` : ''}
${roleInfo.directApply !== undefined ? `Application Method: ${roleInfo.directApply ? 'LinkedIn Easy Apply' : 'External Application'}` : ''}
${roleInfo.location ? `Location: ${roleInfo.location}` : ''}
${roleInfo.aiWorkArrangement ? `Work Arrangement: ${roleInfo.aiWorkArrangement}` : ''}
${roleInfo.aiWorkingHours ? `Working Hours: ${roleInfo.aiWorkingHours} hours/week` : ''}
${roleInfo.salaryRaw ? `Compensation: ${JSON.stringify(roleInfo.salaryRaw)}` : ''}

${roleInfo.descriptionText ? `Full Job Description:\n${roleInfo.descriptionText}\n` : ''}

${roleInfo.aiCoreResponsibilities ? `Core Responsibilities:\n${roleInfo.aiCoreResponsibilities}` : ''}

${roleInfo.aiRequirementsSummary ? `Requirements Summary:\n${roleInfo.aiRequirementsSummary}` : ''}

Requirements:
${roleInfo.requirements?.map(req => `- ${req}`).join('\n') ?? '- Not specified'}

Skills Needed:
${roleInfo.skills?.map(skill => `- ${skill}`).join('\n') ?? '- Not specified'}

${roleInfo.aiKeySkills && roleInfo.aiKeySkills.length > 0 ? `Key Skills (AI-Extracted): ${roleInfo.aiKeySkills.join(', ')}` : ''}

${roleInfo.aiBenefits && roleInfo.aiBenefits.length > 0 ? `Benefits:\n${roleInfo.aiBenefits.map(b => `- ${b}`).join('\n')}` : ''}

${roleInfo.recruiterName ? `Recruiter: ${roleInfo.recruiterName}${roleInfo.recruiterTitle ? ` (${roleInfo.recruiterTitle})` : ''}` : ''}
${roleInfo.aiHiringManagerName ? `Hiring Manager: ${roleInfo.aiHiringManagerName}` : ''}
${roleInfo.aiHiringManagerEmail ? `HM Email: ${roleInfo.aiHiringManagerEmail}` : ''}

Keywords: ${keywords.join(", ")}

<APPLICANT SNAPSHOT>
Professional Title: ${developerProfile.title ?? "Software Developer"}
CoreSkills: ${coreSkills.join(", ")}
KeyAchievements:
${achievements.map((a) => `- ${a}`).join("\n")}

<TASK>
Write a ${requestType === "coverLetter" ? "250-300-word cover letter" : "150-180-word outreach message"} using the detailed ROLE & JOB DETAILS above to create a highly targeted letter.

Match the applicant's skills and achievements to the specific job requirements from the full job description and address the company's values through the LinkedIn org details and provided facts.

Structure:
1. Greeting: "Dear ${hiringManager ?? roleInfo.aiHiringManagerName ?? "Hiring Team"},".
2. Hook: cite role title + most relevant company fact (org type, industry, or LinkedIn description).
3. Proof: weave achievements with specific job requirements from full description (not just generic keywords).
4. Alignment: explain how skills solve the specific needs outlined in the full job description, work arrangement, and organizational culture.
5. CTA & sign-off.

Rules:
• First-person, no clichés, no invented data.
• Address the named person exactly.
• Reference specific job requirements from the full description, not just generic keywords.
• Use LinkedIn org details and company facts that align with candidate values.
• Within specified word count.
• Do NOT use asterisks (*), bullet points, bold formatting (**), or any markdown.
• Write in plain paragraph format only.
• Output ONLY the final letter text (no markdown, no extra commentary).
`

    console.log("=".repeat(80));
    console.log("COVER LETTER GENERATION REQUEST");
    console.log("=".repeat(80));
    console.log(`Using ${hasMvpContent ? 'MVP CV CONTENT' : 'STRUCTURED PROFILE DATA'} as primary source`);
    if (hasMvpContent) {
      console.log(`MVP Content Length: ${developerProfile.mvpContent?.length} characters`);
    }
    console.log("Generated Prompt:", prompt)
    
    // Update request log with the actual prompt
    if (debugSessionId) {
      CoverLetterDebugLogger.logRequest({
        userId: undefined,
        developerProfile,
        roleInfo,
        companyInfo,
        personalization: {
          tone,
          hiringManager,
          jobSource: jobSourceInfo?.source,
          attractionPoints: companyInfo.attractionPoints
        },
        processedData: {
          keywords,
          coreSkills,
          achievements
        },
        prompt,
        rawPromptTemplate,
        cacheKey,
        cacheHit,
        timestamp: new Date().toISOString()
      });
    }

    try {
        // Get the generative model
        const modelName = getGeminiModel('cover-letter');
        const generationConfig = {
            temperature: 0.5,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 512,
        };
        const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig
        });

        const aiStartTime = Date.now();
        const geminiResult = await model.generateContent(prompt);
        const response = await geminiResult.response;
        let letterContent = response.text();
        const aiDuration = Date.now() - aiStartTime;

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

        // Log successful response for debugging
        if (debugSessionId) {
          CoverLetterDebugLogger.logResponse({
            attempt: 1,
            modelName,
            generationConfig,
            rawResponse: letterContent,
            validationResult: validation,
            duration: aiDuration,
            cached: false,
            provider: 'gemini'
          });
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
        
        // Log error for debugging
        if (debugSessionId) {
          CoverLetterDebugLogger.logResponse({
            attempt: 1,
            modelName: getGeminiModel('cover-letter'),
            generationConfig: {
              temperature: 0.5,
              topK: 40,
              topP: 0.8,
              maxOutputTokens: 512,
            },
            rawResponse: '',
            validationResult: { 
              isValid: false, 
              errors: [geminiError instanceof Error ? geminiError.message : 'Unknown error'],
              warnings: [],
              wordCount: 0
            },
            duration: Date.now() - aiStartTime,
            cached: false,
            provider: 'gemini',
            error: geminiError
          });
        }
        
        throw new CoverLetterGenerationError(
          `Gemini API Error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`,
          { provider: 'gemini', originalError: geminiError }
        );
    }

  } catch (error) {
    console.error("Cover letter generation error (Gemini):", error);
    
    // Log general error for debugging
    if (debugSessionId) {
      const errorType = error.name === 'ZodError' ? 'VALIDATION_ERROR' 
        : error instanceof CoverLetterValidationError ? 'LETTER_VALIDATION_ERROR'
        : error instanceof CoverLetterGenerationError ? 'GENERATION_ERROR' 
        : 'INTERNAL_ERROR';
      
      CoverLetterDebugLogger.logResponse({
        attempt: 1,
        modelName: 'error',
        generationConfig: {},
        rawResponse: '',
        validationResult: { 
          isValid: false, 
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: [],
          wordCount: 0,
          errorType
        },
        duration: Date.now() - startTime,
        cached: false,
        provider: 'error',
        error
      });
    }
    
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