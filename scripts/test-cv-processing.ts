import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import OpenAI from 'openai'
import pdfParse from 'pdf-parse'

// Load environment variables
config({ path: '.env.local' })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function testPDFProcessing() {
  try {
    console.log('Testing PDF processing...')
    
    // Read test PDF file
    const pdfPath = join(process.cwd(), 'test.pdf')
    const pdfBuffer = readFileSync(pdfPath)
    
    // Extract text from PDF
    const pdfData = await pdfParse(pdfBuffer)
    const text = pdfData.text
    
    console.log('Extracted text:', text.substring(0, 100) + '...')
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured')
    }

    // Process with OpenAI
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

    const parsedData = JSON.parse(completion.choices[0].message.content || '{}')
    console.log('Parsed data:', JSON.stringify(parsedData, null, 2))
    console.log('Test completed successfully!')

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testPDFProcessing() 