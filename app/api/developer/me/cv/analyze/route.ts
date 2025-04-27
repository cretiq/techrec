import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gptModel = process.env.GPT_MODEL || "gpt-4o-mini-2024-07-18";

// Define the expected response structure
interface CVAnalysis {
  name: string;
  title: string;
  location: string;
  summary: string;
  phone: string;
  email: string;
  skills: Array<{
    name: string;
    category: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    yearsOfExperience: number;
    confidence: number;
  }>;
  experience: Array<{
    title: string;
    company: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    field: string;
    startDate: string;
    endDate: string | null;
    description: string;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    date: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to analyze a CV' },
        { status: 401 }
      );
    }

    if (!session.user?.id) {
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No text provided for analysis' },
        { status: 400 }
      );
    }

    const analysis = await extractDataFromCV(text);
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return NextResponse.json(
      { error: 'Failed to analyze CV' },
      { status: 500 }
    );
  }
}

// Function to extract data from CV
async function extractDataFromCV(cvText: string) {
  // Prepare prompt for OpenAI
  const prompt = `
    Analyze the following CV/resume text and extract structured information. Be as comprehensive and accurate as possible. 
    Format the response in JSON with the following structure:

    {
      "name": "Full name of the person",
      "about": "If there is a summary section, extract it here. If not, create a summary based on the information provided.",
      "title": "Current professional title",
      "location": "City, Country",
      "summary": "Brief professional summary",
      "phone": "Phone number",
      "email": "Email address",
      "linkedin": "LinkedIn URL if present",
      "github": "GitHub URL if present",
      "portfolio": "Portfolio URL if present",
      
      "skills": [
        {
          "name": "Skill name",
          "category": "Appropriate category (Programming, Database, Framework, Cloud, Testing, etc.)",
          "level": "BEGINNER, INTERMEDIATE, ADVANCED, or EXPERT based on context",
          "yearsOfExperience": "Years of experience if mentioned"
        }
      ],
      
      "experience": [
        {
          "title": "Job title",
          "company": "Company name",
          "description": "Job description",
          "location": "Job location",
          "startDate": "Start date in YYYY-MM-DD format",
          "endDate": "End date in YYYY-MM-DD format or null if current",
          "current": "true/false whether this is the current job",
          "responsibilities": ["List of key responsibilities"],
          "achievements": ["List of key achievements"],
          "teamSize": "Team size if mentioned",
          "techStack": ["List of technologies used"]
        }
      ],
      
      "education": [
        {
          "degree": "Degree name",
          "institution": "School/university name",
          "field": "Field of study",
          "year": "Graduation year",
          "location": "Institution location",
          "startDate": "Start date in YYYY-MM-DD format",
          "endDate": "End date in YYYY-MM-DD format",
          "gpa": "GPA if mentioned",
          "honors": ["List of honors/awards received during education"],
          "activities": ["List of extracurricular activities"]
        }
      ],
      
      "achievements": [
        {
          "title": "Achievement title",
          "description": "Achievement description",
          "date": "Date in YYYY-MM-DD format",
          "issuer": "Organization that issued the achievement",
          "url": "URL related to the achievement if any"
        }
      ]
    }

    CV Text:
    ${cvText}

    Return only a valid JSON object. Ensure dates are in YYYY-MM-DD format when provided and skill levels are one of the specified values. If information is missing or uncertain, it's better to omit the field rather than make up information.`;

  try {
    console.log('Calling OpenAI for CV analysis...');
    
    // Call OpenAI to analyze the CV
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: gptModel,
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }
    
    console.log('Parsing JSON response from OpenAI...');
    const parsedData = JSON.parse(content);
    console.log('Successfully parsed JSON data from OpenAI response');
    
    return parsedData;
  } catch (error) {
    console.error('Error during CV data extraction:', error);
    throw new Error('Failed to extract data from CV');
  }
} 