import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PDFParser from 'pdf2json';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(request: Request) {
  try {
    console.log('Starting CV parsing process...');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('Authentication failed: No session found');
      return NextResponse.json(
        { error: 'You must be signed in to upload a CV' },
        { status: 401 }
      );
    }

    if (!session.user?.id) {
      console.log('Authentication failed: No user ID in session');
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    console.log('Attempting to parse form data...');
    const formData = await request.formData();
    console.log('Form data keys:', Array.from(formData.keys()));
    
    const file = formData.get('file') as File;
    console.log('File details:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      lastModified: file?.lastModified
    });

    if (!file) {
      console.log('Validation failed: No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      console.log(`Validation failed: Invalid file type - ${file.type}`);
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log(`Validation failed: File too large - ${file.size} bytes`);
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    console.log(`Processing PDF file: ${file.name} (${file.size} bytes)`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`Buffer size: ${buffer.length} bytes`);

    const pdfParser = new PDFParser();

    return new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataReady', async (pdfData) => {
        try {
          console.log(`Processing PDF with ${pdfData.Pages.length} pages`);
          const text = decodeURIComponent(pdfData.Pages.map(page => 
            page.Texts.map(text => text.R.map(r => r.T).join(' ')).join(' ')
          ).join('\n\n'));

          console.log('Successfully parsed PDF content:');
          console.log('----------------------------------------');
          console.log(text.substring(0, 500) + (text.length > 500 ? '...' : '')); // Log first 500 chars
          console.log('----------------------------------------');
          console.log(`Total content length: ${text.length} characters`);
          console.log(`Number of pages processed: ${pdfData.Pages.length}`);

          resolve(NextResponse.json({ data: { text } }));
        } catch (error) {
          console.error('Error during PDF parsing:', error);
          reject(error);
        }
      });

      pdfParser.on('pdfParser_dataError', (error) => {
        console.error('Error during PDF parsing:', error);
        reject(error);
      });

      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error('Error during CV parsing:', error);
    return NextResponse.json({ error: 'Failed to parse CV' }, { status: 500 });
  }
}
