import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided for analysis' },
        { status: 400 }
      );
    }

    const prompt = `Analyze this CV text and extract the following information in JSON format:
    - name (string)
    - title/position (string)
    - location (string)
    - summary/about (string)
    - phone (string)
    - email (string)
    - skills (array of objects with: name, category, level, yearsOfExperience, confidence)
    - experience (array of objects with: title, company, description, location, startDate, endDate, current)
    - education (array of objects with: degree, institution, field, startDate, endDate, description)
    - achievements (array of objects with: title, description, date)

    CV text:
    ${text}

    Return only the JSON object, no other text.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const analysis = JSON.parse(content);
    return NextResponse.json({ data: analysis });
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return NextResponse.json(
      { error: 'Failed to analyze CV' },
      { status: 500 }
    );
  }
} 