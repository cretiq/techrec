import { GoogleGenerativeAI } from '@google/generative-ai';
import { InternalProfile, InternalSkill } from "@/types/types";
import { Role } from "@/types/role";
import { getGeminiModel } from '@/lib/modelConfig';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Re-use the same interfaces from the OpenAI version for compatibility
interface RoleInfo {
    title: string;
    description: string;
    requirements?: string[];
    skills?: string[];
}

interface CompanyInfo {
    name: string;
    location?: string;
    remote?: boolean;
    attractionPoints?: string[];
}

interface JobSourceInfo {
    source?: string;
}

export interface GeminiCoverLetterGenerationParams {
    developerProfile: InternalProfile;
    roleInfo: RoleInfo;
    companyInfo: CompanyInfo;
    jobSourceInfo: JobSourceInfo;
}

/**
 * Generates a cover letter using Google Gemini based on profile and role information.
 * @param params - The data required for generation.
 * @returns The generated cover letter content.
 * @throws Throws an error if generation fails.
 */
export const generateCoverLetterContentWithGemini = async (params: GeminiCoverLetterGenerationParams): Promise<string> => {
    const { developerProfile, roleInfo, companyInfo, jobSourceInfo } = params;

    // Basic validation
    if (!roleInfo || !companyInfo || !developerProfile) {
        throw new Error("Missing required fields for cover letter generation.");
    }

    // Construct prompt (similar to the original OpenAI version)
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

    console.log(`Generating cover letter with Gemini for role ${roleInfo.title} at ${companyInfo.name}`);

    try {
        // Get the generative model
        const modelName = getGeminiModel('cover-letter');
        const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
                temperature: 0.6,
                topK: 40,
                topP: 0.8,
                maxOutputTokens: 2048,
            },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const letterContent = response.text();

        if (!letterContent) {
            throw new Error("Gemini response did not contain letter content.");
        }

        return letterContent.trim();

    } catch (error) {
        console.error("Gemini API call failed:", error);
        // Rethrow a more specific error
        if (error instanceof Error) {
             throw new Error(`Gemini API Error: ${error.message}`);
        } else {
             throw new Error("Failed to generate cover letter due to an unexpected error.");
        }
    }
}; 