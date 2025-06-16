import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { selectAIProvider } from "@/utils/aiProviderSelector"

const PLATFORM_CONSTRAINTS = {
  linkedin: {
    maxLength: 300,
    style: "professional and personable",
    tones: ["Professional", "Friendly Professional", "Enthusiastic"]
  },
  email: {
    maxLength: 500,
    style: "formal but warm",
    tones: ["Formal", "Semi-Formal", "Conversational"]
  },
  twitter: {
    maxLength: 280,
    style: "casual and engaging",
    tones: ["Casual", "Friendly", "Direct"]
  },
  github: {
    maxLength: 400,
    style: "technical and collaborative",
    tones: ["Technical", "Collaborative", "Mentorship-focused"]
  },
}

export async function POST(req: Request) {
  try {
    console.log("[Outreach API] Received request")
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log("[Outreach API] Unauthorized - no session")
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { 
      developerProfile, 
      roleInfo, 
      recipientInfo,
      context,
      connectionPoints,
      platform 
    } = await req.json()

    console.log("[Outreach API] Request data:", {
      hasProfile: !!developerProfile,
      hasRoleInfo: !!roleInfo,
      hasRecipientInfo: !!recipientInfo,
      platform,
      recipientName: recipientInfo?.name
    })

    if (!developerProfile || !roleInfo || !recipientInfo || !platform) {
      console.log("[Outreach API] Missing required fields:", {
        developerProfile: !!developerProfile,
        roleInfo: !!roleInfo,
        recipientInfo: !!recipientInfo,
        platform: !!platform
      })
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const constraints = PLATFORM_CONSTRAINTS[platform as keyof typeof PLATFORM_CONSTRAINTS]
    const { provider, model } = selectAIProvider("outreach")

    console.log("[Outreach API] AI Provider selected:", { provider, model })

    // Build a comprehensive profile summary
    const profileSummary = `
    Developer: ${developerProfile.firstName} ${developerProfile.lastName}
    Title: ${developerProfile.title || 'Software Developer'}
    Bio: ${developerProfile.bio || 'Experienced developer'}
    Years of Experience: ${developerProfile.yearsOfExperience || 'Not specified'}
    Key Skills: ${developerProfile.skills?.slice(0, 5).map((s: any) => s.name).join(', ') || 'Various technical skills'}
    Recent Achievement: ${developerProfile.achievements?.[0]?.title || 'Multiple technical achievements'}
    `

    const prompt = `
    As an expert in professional networking and relationship building, create 3 variations of personalized outreach messages.
    
    CONTEXT:
    I am a ${developerProfile.title || 'developer'} interested in the ${roleInfo.title} position at ${recipientInfo.company}.
    
    MY BACKGROUND:
    ${profileSummary}
    
    ROLE DETAILS:
    - Title: ${roleInfo.title}
    - Key Requirements: ${roleInfo.requirements?.slice(0, 3).join(', ') || 'Not specified'}
    - Skills Needed: ${roleInfo.skills?.slice(0, 5).join(', ') || 'Not specified'}
    
    RECIPIENT:
    - Name: ${recipientInfo.name}
    - Title: ${recipientInfo.title || 'Professional at ' + recipientInfo.company}
    - Company: ${recipientInfo.company}
    
    CONNECTION POINTS:
    ${connectionPoints?.map((point: string) => `- ${point}`).join('\n') || '- Professional interest in the role'}
    
    ADDITIONAL CONTEXT:
    ${context || 'No additional context provided'}
    
    PLATFORM SPECIFICATIONS:
    - Platform: ${platform}
    - Maximum Length: ${constraints.maxLength} characters
    - Style: ${constraints.style}
    - Available Tones: ${constraints.tones.join(', ')}
    
    Create 3 unique message variations that:
    1. Start with a personalized greeting using the recipient's name
    2. Establish a genuine connection based on the connection points
    3. Briefly highlight 1-2 relevant qualifications from my background
    4. Express specific interest in the role and company
    5. End with a clear, actionable next step
    6. Use a different tone for each variation (from the available tones)
    7. Stay within the character limit for ${platform}
    
    Return the messages in the following JSON format:
    {
      "variations": [
        {
          "content": "complete message text",
          "platform": "${platform}",
          "tone": "tone used (from available tones)"
        }
      ]
    }
    `

    if (provider === 'openai') {
      console.log("[Outreach API] Using OpenAI provider")
      const { default: OpenAI } = await import('openai')
      const openai = new OpenAI()
      
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: model,
        temperature: 0.8,
        response_format: { type: "json_object" },
      })

      const result = JSON.parse(completion.choices[0].message.content || '{"variations":[]}')
      console.log("[Outreach API] OpenAI result:", { variationsCount: result.variations?.length || 0 })
      return NextResponse.json(result)
    } else {
      console.log("[Outreach API] Using Gemini provider")
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
      const geminiModel = genAI.getGenerativeModel({ model: model })
      
      const result = await geminiModel.generateContent(prompt + "\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.")
      const response = await result.response
      const text = response.text()
      
      // Clean up the response if needed
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsedResult = JSON.parse(cleanedText)
      console.log("[Outreach API] Gemini result:", { variationsCount: parsedResult.variations?.length || 0 })
      
      return NextResponse.json(parsedResult)
    }
  } catch (error) {
    console.error("Outreach message generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate outreach messages" },
      { status: 500 }
    )
  }
}