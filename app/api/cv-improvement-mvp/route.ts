import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authOptions } from '@/lib/auth';
import { getGeminiModel } from '@/lib/modelConfig';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

/**
 * MVP CV Improvement API Route
 * 
 * Provides simple, actionable improvement suggestions for CVs processed through the MVP flow.
 * Uses the "Resume Mastery for Developers" approach with focused, practical advice.
 */

export async function POST(request: NextRequest) {
  const debugSessionId = new Date().toISOString();
  console.log('🚀 [cv-improvement-mvp] ===== MVP REQUEST START =====');
  console.log('🔍 [cv-improvement-mvp] Debug session ID:', debugSessionId);

  try {
    // Check authentication
    console.log('🔐 [cv-improvement-mvp] Checking authentication...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ [cv-improvement-mvp] No valid session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ [cv-improvement-mvp] Authenticated user:', session.user.id);

    // Parse request body
    console.log('📥 [cv-improvement-mvp] Parsing request body...');
    const rawData = await request.json();
    
    console.log('📊 [cv-improvement-mvp] Raw data keys:', Object.keys(rawData));
    console.log('📊 [cv-improvement-mvp] Data structure:', Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [
        key, 
        Array.isArray(value) ? `Array with ${value.length} items` : `${typeof value} (length: ${String(value).length})`
      ])
    ));

    // No caching for now - direct generation

    // Create formatted CV text from the raw data
    const formattedCV = formatCVForAnalysis(rawData);
    const wordCount = formattedCV.split(/\s+/).filter(word => word.length > 0).length;
    console.log('📄 [cv-improvement-mvp] Formatted CV length:', formattedCV.length, 'characters');
    console.log('📄 [cv-improvement-mvp] Formatted CV word count:', wordCount, 'words');

    // Create the improvement prompt using the formatted text (not raw JSON)
    const improvementPrompt = createImprovementPrompt(formattedCV);
    
    console.log('🤖 [cv-improvement-mvp] Sending to Gemini for analysis...');
    const model = genAI.getGenerativeModel({ 
      model: getGeminiModel('cv-improvement'),
      generationConfig: {
        temperature: 0.3,
        topK: 10,
        topP: 0.4,
        maxOutputTokens: 2048,
        candidateCount: 1,
      }
    });

    const startTime = Date.now();
    const result = await model.generateContent(improvementPrompt);
    const analysisTime = Date.now() - startTime;
    
    console.log('⏱️ [cv-improvement-mvp] Analysis completed in:', analysisTime + 'ms');

    if (!result.response) {
      throw new Error('No response from Gemini');
    }

    const suggestions = result.response.text();
    console.log('📝 [cv-improvement-mvp] Suggestions length:', suggestions.length);

    // Structure the response
    const response = {
      suggestions,
      analysisTime,
      wordCount: formattedCV.split(' ').length,
      debugSessionId,
      fromCache: false
    };

    // TODO: Add caching later

    console.log('✅ [cv-improvement-mvp] ===== MVP REQUEST COMPLETE =====');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ [cv-improvement-mvp] Error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to analyze CV',
      debugSessionId
    }, { status: 500 });
  }
}

/**
 * Format raw CV data into readable text for analysis
 */
function formatCVForAnalysis(data: any): string {
  let formatted = '';

  // Contact Information
  if (data.name) formatted += `Name: ${data.name}\n`;
  if (data.email) formatted += `Email: ${data.email}\n`;
  if (data.phone) formatted += `Phone: ${data.phone}\n`;
  if (data.location) formatted += `Location: ${data.location}\n`;
  formatted += '\n';

  // About/Summary
  if (data.about) {
    formatted += `SUMMARY:\n${data.about}\n\n`;
  }

  // Skills
  if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
    formatted += `SKILLS:\n`;
    data.skills.forEach((skill: any) => {
      if (typeof skill === 'string') {
        formatted += `- ${skill}\n`;
      } else if (skill && typeof skill === 'object') {
        formatted += `- ${skill.name || skill.skill || JSON.stringify(skill)}\n`;
      }
    });
    formatted += '\n';
  }

  // Experience
  if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
    formatted += `WORK EXPERIENCE:\n`;
    data.experience.forEach((exp: any, index: number) => {
      formatted += `${index + 1}. ${exp.title || 'Position'} at ${exp.company || 'Company'}\n`;
      if (exp.duration || exp.startDate) {
        formatted += `   Duration: ${exp.duration || exp.startDate}\n`;
      }
      if (exp.description) {
        formatted += `   ${exp.description}\n`;
      }
      if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
        exp.responsibilities.forEach((resp: string) => {
          formatted += `   - ${resp}\n`;
        });
      }
      formatted += '\n';
    });
  }

  // Education
  if (data.education && Array.isArray(data.education) && data.education.length > 0) {
    formatted += `EDUCATION:\n`;
    data.education.forEach((edu: any, index: number) => {
      formatted += `${index + 1}. ${edu.degree || 'Degree'} from ${edu.institution || 'Institution'}\n`;
      if (edu.year || edu.graduation) {
        formatted += `   Year: ${edu.year || edu.graduation}\n`;
      }
      if (edu.gpa) {
        formatted += `   GPA: ${edu.gpa}\n`;
      }
      formatted += '\n';
    });
  }

  // Projects
  if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
    formatted += `PROJECTS:\n`;
    data.projects.forEach((project: any, index: number) => {
      formatted += `${index + 1}. ${project.name || project.title || 'Project'}\n`;
      if (project.description) {
        formatted += `   ${project.description}\n`;
      }
      if (project.technologies && Array.isArray(project.technologies)) {
        formatted += `   Technologies: ${project.technologies.join(', ')}\n`;
      }
      formatted += '\n';
    });
  }

  // Languages
  if (data.languages && Array.isArray(data.languages) && data.languages.length > 0) {
    formatted += `LANGUAGES:\n`;
    data.languages.forEach((lang: any) => {
      if (typeof lang === 'string') {
        formatted += `- ${lang}\n`;
      } else if (lang && typeof lang === 'object') {
        formatted += `- ${lang.language || lang.name || JSON.stringify(lang)}\n`;
      }
    });
    formatted += '\n';
  }

  return formatted;
}

/**
 * Create the Resume Mastery for Developers improvement prompt
 */
function createImprovementPrompt(cvText: string): string {
  return `You are a resume helper for software developers. Your goal is to give clear and simple advice based on the rules from "Resume Mastery for Developers".

Review the CV below. Create a list of only the things that need to be improved.

Follow these rules for your response:

1. Simple English Only: Use easy-to-understand language.

2. Only Give Suggestions: Do not say what is already good. Only list the problems and how to fix them.

3. Give Specific Examples: For each suggestion, show an example of the problem from the CV.

4. Use Markdown Formatting: Format your response with proper markdown for readability:
   - Use ## for main section headers
   - Use ### for subsection headers  
   - Use **bold** for emphasis and labels
   - Use bullet points (-) for lists
   - Use proper spacing between sections

5. Structure Your Output: Organize suggestions clearly with:
   - Clear problem identification
   - Specific examples from the CV
   - Actionable solutions

6. No Introduction: Start directly with the first improvement suggestion. Do not include introductory phrases like "Here are the things that need to be improved" or similar.

---

Your Resume Improvement Plan

For each of the following points, check the resume. If you find a problem, add it to your list of suggestions with a specific example from the text.

- Add Keywords: Tell the user to add keywords from the job description so their resume can pass automated filters.
    
    Example Suggestion: "## Missing Keywords\n**Problem**: Your resume lacks important job-specific keywords.\n**Solution**: Add keywords from job descriptions. For instance, if the job lists 'Azure DevOps', make sure you include it in your skills or experience."
        
- Use Numbers to Show Achievements: Tell the user to add numbers to their accomplishments.
    
    Example Suggestion: "## Add Metrics to Achievements\n**Current text**: 'responsible for increasing revenue'\n**Better version**: 'Increased company revenue by $50,000,000'"
        
- Fix Resume Length: If the resume is not between 475 and 600 words, suggest making it shorter or longer.
    
    Example Suggestion: "## Resume Length Issue\nYour resume is 700 words long. Try to shorten it to the recommended 475-600 word range by:\n- Removing redundant information\n- Combining similar bullet points\n- Focusing on most relevant achievements"
        
- Remove Buzzwords: Tell the user to remove cliché words.
    
    Example Suggestion: "## Remove Buzzwords\n**Problem**: Your resume contains cliché terms that add no value.\n**Example**: Remove phrases like 'A highly innovative developer' or 'Team-Player'\n**Better approach**: Use specific, measurable accomplishments instead."
        
- Add Important Links: If a link to LinkedIn or a personal portfolio is missing, recommend adding it.
    
    Example Suggestion: "## Missing Professional Links\n**Problem**: No LinkedIn or portfolio links found.\n**Solution**: Add your LinkedIn profile and portfolio website to your contact information section."
        
- Improve the Summary: If the summary is weak, tell the user to start it with their professional title and years of experience.
    
    Example Suggestion: "## Weak Summary Section\n**Current approach**: Generic introduction\n**Better format**: Start with 'Full-stack Developer with 6 years of experience in...' followed by key achievements."
        
- Organize Skills: If the skills section is just one list, recommend organizing it into categories: "Programming Languages/Frameworks," "Technologies," and "Tools".
    
    Example Suggestion: "## Unorganized Skills Section\n**Problem**: Skills are listed in one flat list.\n**Solution**: Organize into categories:\n- **Programming Languages/Frameworks**: React, Node.js\n- **Technologies**: Docker, AWS\n- **Tools**: Git, VS Code"
        
- Analyze Experience and Projects: Analyze the quality and quantity of the work experience. If the resume shows less than 3 years of professional experience, OR if the experience listed seems generic or lacks technical depth, you must recommend adding a 'Projects' section.
    
    When you suggest this, you must also explain why it's so important. Tell the user that a strong project is the best way to prove their technical skills, show passion for their craft, and give the hiring manager a concrete example of their work to discuss during an interview. Explain that it's especially critical if their professional experience is limited.
        
- Use Strong Action Words: If descriptions don't start with strong verbs, tell the user to add them.
    
    Example Suggestion: "## Weak Action Verbs\\n**Problem**: Job descriptions don't start with strong action words.\\n**Current example**: 'I was responsible for the new feature'\\n**Better version**: 'Engineered a new feature that improved user engagement by 25%'"
        
- Make Bullet Points Consistent: If the number of bullet points for each job is different, recommend making it consistent, like 3-5 for each one.
    
    Example Suggestion: "## Inconsistent Bullet Points\\n**Problem**: Uneven number of bullet points across jobs.\\n**Issue**: Your first job has 6 bullet points and your second has 3.\\n**Solution**: Standardize to 3-5 bullet points per position for better readability."
        
- Check the GPA: If the GPA is 3.75 or lower, recommend removing it. If it's higher than 3.75 and missing, recommend adding it.
    
    Example Suggestion: "## Low GPA Removal\\n**Problem**: Your GPA of 3.2 may hurt your application.\\n**Solution**: Remove the GPA from your education section since it's below 3.75. Focus on relevant coursework and projects instead."

---

Now, review the following CV and provide the improvement plan:

${cvText}`;
}