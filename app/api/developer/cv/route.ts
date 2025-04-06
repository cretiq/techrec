import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Developer from '@/lib/models/Developer'
import { connectToDatabase } from '@/lib/db'
import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    console.log('Starting CV processing...')
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('Unauthorized: No session or email found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      console.log('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size)
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    try {
      console.log('Extracting text from file...')
      if (file.name.endsWith('.pdf')) {
        console.log('Processing PDF file...')
        try {
          const pdfData = await pdfParse(buffer)
          text = pdfData.text
          console.log('PDF text extracted:', text.substring(0, 100) + '...')
          if (!text.trim()) {
            throw new Error('No text could be extracted from the PDF')
          }
        } catch (pdfError) {
          console.error('Error parsing PDF:', pdfError)
          // If PDF parsing fails, try to extract text using a simpler approach
          text = buffer.toString('utf-8')
          if (!text.trim()) {
            throw new Error('Failed to extract text from PDF. Please ensure the file is not corrupted.')
          }
        }
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        console.log('Processing DOC/DOCX file...')
        const result = await mammoth.extractRawText({ buffer })
        text = result.value
        console.log('Document text extracted:', text.substring(0, 100) + '...')
        if (!text.trim()) {
          throw new Error('No text could be extracted from the document')
        }
      } else {
        console.log('Unsupported file format:', file.name)
        return NextResponse.json(
          { error: 'Unsupported file format. Please upload a PDF or DOCX file.' },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Error extracting text from file:', error)
      return NextResponse.json(
        { error: 'Failed to extract text from file. Please ensure the file is not corrupted and try again.' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    try {
      console.log('Processing text with OpenAI...')
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Extract the following information from the CV in JSON format:
              {
                "skills": ["array of technical skills"],
                "experience": [{
                  "title": "job title",
                  "company": "company name",
                  "description": "job description",
                  "startDate": "start date",
                  "endDate": "end date or null if current"
                }],
                "education": [{
                  "degree": "degree name",
                  "institution": "institution name",
                  "year": "graduation year"
                }],
                "achievements": ["array of notable achievements"]
              }`
          },
          {
            role: 'user',
            content: text
          }
        ],
        response_format: { type: 'json_object' }
      })

      console.log('OpenAI response received')
      const parsedData = JSON.parse(completion.choices[0].message.content || '{}')
      console.log('Parsed data:', JSON.stringify(parsedData, null, 2))

      console.log('Connecting to database...')
      await connectToDatabase()
      const developer = await Developer.findOne({ email: session.user.email })

      if (!developer) {
        console.log('Developer not found:', session.user.email)
        return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
      }

      console.log('Updating developer profile...')
      developer.skills = parsedData.skills?.map((skill: string) => ({
        name: skill,
        level: 'intermediate'
      })) || []
      developer.experience = parsedData.experience || []
      developer.education = parsedData.education || []
      developer.achievements = parsedData.achievements || []

      await developer.save()
      console.log('Developer profile updated successfully')

      return NextResponse.json(developer)
    } catch (error) {
      console.error('Error processing CV with OpenAI:', error)
      return NextResponse.json(
        { error: 'Failed to process CV with AI. Please try again later.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error processing CV:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your CV' },
      { status: 500 }
    )
  }
} 