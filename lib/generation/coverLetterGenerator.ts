import OpenAI from "openai";
import { InternalProfile, InternalSkill } from "@/types/types";
import { Role } from "@/types/role"; // Assuming Role type is defined here or imported correctly

const openai = new OpenAI();
const gptModel = process.env.GPT_MODEL || "gpt-4o-mini-2024-07-18";

// Re-define input types needed for the generator function
interface RoleInfo {
    title: string;
    description: string;
    requirements?: string[]; // Made optional as Role type might not always have it
    skills?: string[]; // Made optional and assuming string array based on route usage
}

interface CompanyInfo {
    name: string;
    location?: string; // Made optional
    remote?: boolean; // Made optional
    attractionPoints?: string[];
}

interface JobSourceInfo {
    source?: string;
}

export interface CoverLetterGenerationParams {
    developerProfile: InternalProfile;
    roleInfo: RoleInfo;
    companyInfo: CompanyInfo;
    jobSourceInfo: JobSourceInfo;
}

/**
 * Generates a cover letter using OpenAI based on profile and role information.
 * @param params - The data required for generation.
 * @returns The generated cover letter content.
 * @throws Throws an error if generation fails.
 */
export const generateCoverLetterContent = async (params: CoverLetterGenerationParams): Promise<string> => {
    const { developerProfile, roleInfo, companyInfo, jobSourceInfo } = params;

    // Basic validation
    if (!roleInfo || !companyInfo || !developerProfile) {
        throw new Error("Missing required fields for cover letter generation.");
    }

    // Construct prompt (similar to the original API route)
    const prompt = `
Generate a professional and compelling cover letter for a software developer applying for a specific role. The goal is to capture the hiring manager's attention and secure an interview.

The letter is for the position of ${roleInfo.title} at ${companyInfo.name}.

Here is information about the company:
${companyInfo.name ? `Address the letter to ${companyInfo.name}.` : ''}
${companyInfo.location ? `The company is located in ${companyInfo.location}.` : ''}
${companyInfo.remote ? `The position is remote.` : ''} 
${companyInfo.attractionPoints ? `The company is known for ${companyInfo.attractionPoints.join(', ')}.` : ''}

Here is information about the job:
${roleInfo.title ? `The job title is: ${roleInfo.title}.` : ''}
${roleInfo.description ? `The job description includes: ${roleInfo.description}.` : ''}
${roleInfo.requirements ? `Key requirements are: ${roleInfo.requirements.join(', ')}.` : ''}
${roleInfo.skills ? `Required skills include: ${roleInfo.skills.join(', ')}.` : ''}

Here is information about the applicant, ${developerProfile.name}:
${developerProfile.profileEmail ? `Email: ${developerProfile.profileEmail}` : (developerProfile.email ? `Email: ${developerProfile.email}`: '')}
${developerProfile.contactInfo?.phone ? `Phone: ${developerProfile.contactInfo.phone}` : ''}
${developerProfile.contactInfo?.linkedin ? `LinkedIn: ${developerProfile.contactInfo.linkedin}` : ''}
${developerProfile.contactInfo?.github ? `GitHub: ${developerProfile.contactInfo.github}` : ''}
${developerProfile.contactInfo?.website ? `Website: ${developerProfile.contactInfo.website}` : ''}

Relevant Skills:
${developerProfile.skills?.map((skill: InternalSkill) => `- ${skill.name} (${skill.level})`).join('\n') || 'N/A'}

${jobSourceInfo.source ? `Mention where the applicant saw the job posting: ${jobSourceInfo.source}.` : ''}

---
Please follow these guidelines when drafting the cover letter:

1. Start with a personalized greeting addressed to a specific individual or team (e.g., "Dear [Hiring Manager Name]"). If no name is known, use a professional title or "Dear Hiring Team".
2. In the opening paragraph, mention the role title and express genuine enthusiasm for this position at ${companyInfo.name}.
3. Tailor the letter by referencing one or two specific company details (e.g., mission, recent project, or value) to demonstrate research and alignment.
4. Highlight 2–3 key achievements or experiences from the applicant's profile, using concrete metrics where possible.
5. Integrate 3–4 important keywords or requirements from the job posting.
6. Weave a concise story showing how skills solve a problem or add value, avoiding jargon.
7. Maintain an authentic, first-person voice; let personality shine professionally.
8. Keep the total length between 200–300 words.
9. Use clear, logical structure (short paragraphs).
10. Close with a strong call to action, thanking the reader and expressing eagerness to discuss contributions.

Important notes:
    - Be truthful based *only* on the provided information.
    - Do not invent skills, experience, or metrics.

Please generate only the final cover letter text, starting with the greeting.
`;

    console.log(`Generating cover letter for role ${roleInfo.title} at ${companyInfo.name}`);
    // console.log("Generated Prompt:", prompt); // Log prompt only if debugging

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: gptModel,
            temperature: 0.6, // Slightly adjusted temperature
        });

        const letterContent = completion.choices[0]?.message?.content;

        if (!letterContent) {
            throw new Error("OpenAI response did not contain letter content.");
        }

        return letterContent.trim();

    } catch (error) {
        console.error("OpenAI API call failed:", error);
        // Rethrow a more specific error
        if (error instanceof OpenAI.APIError) {
             throw new Error(`OpenAI API Error (${error.status}): ${error.message}`);
        } else {
             throw new Error("Failed to generate cover letter due to an unexpected error.");
        }
    }
}; 