// Temporary endpoint to simulate a background job triggering analysis
import { NextResponse } from 'next/server';
import { processCvAnalysis } from '@/utils/analysisService';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const analysisId = params.id;

  try {
    // Process the analysis asynchronously
    await processCvAnalysis(analysisId);
    
    return NextResponse.json({ 
      message: 'Analysis started successfully',
      analysisId 
    });

  } catch (error) {
    console.error('Error processing CV analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process CV analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 