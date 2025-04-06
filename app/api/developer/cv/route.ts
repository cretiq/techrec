import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { OpenAI } from 'openai'
import PDFParser from 'pdf2json'
import { prisma } from '@/lib/prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

function extractJSON(text: string) {
  try {
    // Find the first { and last } in the text
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) {
      throw new Error('No JSON object found in text')
    }
    // Extract and parse the JSON
    const jsonStr = text.slice(start, end + 1)
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('Error extracting JSON:', error)
    throw error
  }
}

function validateCVData(data: any) {
  const requiredFields = ['name', 'profile-email', 'skills']
  const missingFields = requiredFields.filter(field => !data[field])
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }
}

export async function POST(req: Request) {
  try {
    console.log('Processing CV upload...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`)
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    console.log('Processing PDF file...')
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Parse PDF using pdf2json
    const pdfParser = new PDFParser()
    const text = await new Promise<string>((resolve, reject) => {
      let extractedText = ''
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          // Extract text from all pages
          pdfData.Pages.forEach((page: any) => {
            page.Texts.forEach((text: any) => {
              // Decode the text (it's encoded in the PDF)
              const decodedText = decodeURIComponent(text.R[0].T)
              extractedText += decodedText + ' '
            })
          })
          resolve(extractedText)
        } catch (error) {
          reject(error)
        }
      })

      pdfParser.on('pdfParser_dataError', (err) => {
        reject(err)
      })

      // Parse the PDF buffer
      pdfParser.parseBuffer(buffer)
    })

    console.log('PDF text extracted successfully')

    console.log('Analyzing CV with OpenAI...')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a CV analyzer. Extract the following information from the CV and return it as JSON:
            - name (string)
            - profile-email (string)
            - skills (array of objects with name and level)
            - experience (array of objects with title, company, description, startDate, endDate, current)
            - education (array of objects with degree, institution, year)
            
            Format dates as YYYY-MM-DD. If a date is missing, use null.
            For current positions, set current: true and endDate: null.
            Return only the JSON object, no additional text.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    console.log('Parsing OpenAI response...')
    const cvData = extractJSON(response)
    validateCVData(cvData)

    console.log('Updating developer profile with Prisma...')
    
    // Update or create developer profile
    const developer = await prisma.developer.upsert({
      where: { email: session.user.email },
      update: {
        name: cvData.name,
        profileEmail: cvData['profile-email'],
        skills: {
          deleteMany: {},
          create: cvData.skills.map((skill: any) => ({
            name: skill.name,
            level: skill.level || 'intermediate'
          }))
        },
        experience: {
          deleteMany: {},
          create: cvData.experience.map((exp: any) => ({
            title: exp.title,
            company: exp.company,
            description: exp.description,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            current: exp.current || false
          }))
        },
        education: {
          deleteMany: {},
          create: cvData.education.map((edu: any) => ({
            degree: edu.degree,
            institution: edu.institution,
            year: edu.year
          }))
        }
      },
      create: {
        email: session.user.email,
        name: cvData.name,
        profileEmail: cvData['profile-email'] || session.user.email,
        title: 'Software Developer', // Default title
        skills: {
          create: cvData.skills.map((skill: any) => ({
            name: skill.name,
            level: skill.level || 'intermediate'
          }))
        },
        experience: {
          create: cvData.experience.map((exp: any) => ({
            title: exp.title,
            company: exp.company,
            description: exp.description,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            current: exp.current || false
          }))
        },
        education: {
          create: cvData.education.map((edu: any) => ({
            degree: edu.degree,
            institution: edu.institution,
            year: edu.year
          }))
        }
      },
      include: {
        skills: true,
        experience: true,
        education: true
      }
    })

    console.log('CV processed successfully')
    return NextResponse.json({
      success: true,
      data: developer
    })
  } catch (error) {
    console.error('Error processing CV:', error)
    return NextResponse.json(
      { error: 'Failed to process CV' },
      { status: 500 }
    )
  }
} 