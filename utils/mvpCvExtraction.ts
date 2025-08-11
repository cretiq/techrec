/**
 * MVP CV Extraction Service
 * Simplified dual-format extraction for rapid deployment
 * 
 * Extracts CV content in two formats:
 * 1. Formatted markdown text (for full-context AI operations)
 * 2. Basic JSON structure (best-effort, no validation)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiModel } from '@/lib/modelConfig';
import { isDebugEnabled } from './featureFlags';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

/**
 * Response interface for dual-format extraction
 */
export interface MvpExtractionResult {
  success: boolean;
  formattedText?: string;
  basicJson?: Record<string, any>;
  extractionDuration: number;
  characterCount?: number;
  wordCount?: number;
  error?: string;
  metadata?: {
    model: string;
    timestamp: string;
    processingSteps: string[];
  };
}

/**
 * MVP extraction prompt - designed for dual output format
 * Requests both formatted text and basic JSON in a single response
 */
const MVP_EXTRACTION_PROMPT = `
Extract this CV content in TWO formats within a single response:

FORMAT 1 - FORMATTED_TEXT:
Clean, readable markdown with proper headers, lists, and formatting.
Preserve all sections and content exactly as presented in the document.
Use appropriate markdown syntax (##, -, *, etc.) for structure.

FORMAT 2 - BASIC_JSON:
Best-effort JSON structure (don't worry about validation errors):
{
  "name": "Full Name",
  "email": "email@domain.com",
  "phone": "phone number",
  "location": "city, country",
  "title": "professional title", 
  "about": "summary/objective text",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name", 
      "startDate": "YYYY-MM", 
      "endDate": "YYYY-MM or Present",
      "description": "job description",
      "achievements": ["achievement1", "achievement2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "year": "YYYY",
      "gpa": "3.x"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "project description",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "languages": ["English", "Spanish"],
  "certifications": ["cert1", "cert2"]
}

RESPONSE FORMAT:
Please structure your response exactly like this:

=== FORMATTED_TEXT ===
[Your markdown formatted text here]

=== BASIC_JSON ===
[Your JSON structure here]

Extract all information you can find. For missing fields, omit them rather than adding null values.
Focus on completeness and accuracy over perfect formatting.
`;

/**
 * Main extraction service class
 */
export class MvpCvExtractionService {
  private model: any;
  private debugLogger?: (message: string, data?: any) => void;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: getGeminiModel('direct-upload') // Use centralized model config
    });
    
    // Setup debug logging if enabled
    if (isDebugEnabled()) {
      this.debugLogger = (message: string, data?: any) => {
        const prefix = '🔧 [MVP-EXTRACTION]';
        if (data) {
          console.log(`${prefix} ${message}`, data);
        } else {
          console.log(`${prefix} ${message}`);
        }
      };
    }
  }

  /**
   * Extract CV content using direct file upload to Gemini
   * @param filePath Path to the CV file (PDF, DOCX, TXT)
   * @param originalFilename Original filename for context
   * @returns MvpExtractionResult with both formats
   */
  async extractFromFile(filePath: string, originalFilename: string): Promise<MvpExtractionResult> {
    const startTime = Date.now();
    const processingSteps: string[] = [];

    try {
      this.debugLogger?.('Starting MVP extraction', {
        filePath,
        originalFilename,
        model: getGeminiModel('direct-upload')
      });

      processingSteps.push('File validation');
      
      // Validate file exists
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      processingSteps.push('Gemini file upload');

      // Upload file to Gemini Files API
      const { GoogleAIFileManager } = require('@google/generative-ai/server');
      const fileManager = new GoogleAIFileManager(process.env.GOOGLE_AI_API_KEY!);
      
      const uploadResult = await fileManager.uploadFile(filePath, {
        mimeType: this.getMimeTypeFromPath(filePath),
        displayName: originalFilename,
      });

      this.debugLogger?.('File uploaded to Gemini', {
        fileUri: uploadResult.file.uri,
        state: uploadResult.file.state,
        size: uploadResult.file.sizeBytes
      });

      processingSteps.push('Content extraction');

      // Generate content with the uploaded file
      const result = await this.model.generateContent([
        {
          fileData: {
            mimeType: uploadResult.file.mimeType,
            fileUri: uploadResult.file.uri,
          },
        },
        { text: MVP_EXTRACTION_PROMPT },
      ]);

      const responseText = result.response.text();
      processingSteps.push('Response parsing');

      // Parse the dual-format response
      const { formattedText, basicJson } = this.parseDualFormatResponse(responseText);

      const extractionDuration = Date.now() - startTime;

      this.debugLogger?.('Extraction completed successfully', {
        extractionDuration,
        formattedTextLength: formattedText?.length || 0,
        jsonKeys: basicJson ? Object.keys(basicJson) : [],
        processingSteps
      });

      // Clean up uploaded file
      try {
        await fileManager.deleteFile(uploadResult.file.name);
        processingSteps.push('Cleanup completed');
      } catch (cleanupError) {
        this.debugLogger?.('File cleanup warning (non-critical)', cleanupError);
      }

      return {
        success: true,
        formattedText,
        basicJson,
        extractionDuration,
        characterCount: formattedText?.length || 0,
        wordCount: formattedText ? formattedText.split(/\s+/).length : 0,
        metadata: {
          model: getGeminiModel('direct-upload'),
          timestamp: new Date().toISOString(),
          processingSteps
        }
      };

    } catch (error) {
      const extractionDuration = Date.now() - startTime;
      
      this.debugLogger?.('Extraction failed', {
        error: error instanceof Error ? error.message : String(error),
        extractionDuration,
        processingSteps
      });

      return {
        success: false,
        extractionDuration,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          model: getGeminiModel('direct-upload'),
          timestamp: new Date().toISOString(),
          processingSteps
        }
      };
    }
  }

  /**
   * Parse the dual-format response from Gemini
   * Splits response into formatted text and JSON sections
   */
  private parseDualFormatResponse(responseText: string): {
    formattedText?: string;
    basicJson?: Record<string, any>;
  } {
    try {
      // Split response by section markers
      const sections = responseText.split(/===\s*(FORMATTED_TEXT|BASIC_JSON)\s*===/i);
      
      let formattedText: string | undefined;
      let basicJson: Record<string, any> | undefined;

      // Parse sections
      for (let i = 1; i < sections.length; i += 2) {
        const sectionType = sections[i].trim().toUpperCase();
        const sectionContent = sections[i + 1]?.trim();

        if (sectionType === 'FORMATTED_TEXT' && sectionContent) {
          formattedText = sectionContent;
        } else if (sectionType === 'BASIC_JSON' && sectionContent) {
          try {
            // Extract JSON from potential markdown code blocks
            const jsonMatch = sectionContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                             sectionContent.match(/(\{[\s\S]*\})/);
            
            if (jsonMatch && jsonMatch[1]) {
              basicJson = JSON.parse(jsonMatch[1]);
            } else {
              // Try parsing the content directly
              basicJson = JSON.parse(sectionContent);
            }
          } catch (jsonError) {
            this.debugLogger?.('JSON parsing warning (non-critical)', {
              error: jsonError instanceof Error ? jsonError.message : String(jsonError),
              content: sectionContent.substring(0, 200) + '...'
            });
            // Don't fail the entire extraction for JSON parsing errors
            basicJson = { parsing_error: 'Could not parse JSON, but text extraction succeeded' };
          }
        }
      }

      // Fallback: if sections not found, try to extract what we can
      if (!formattedText && !basicJson) {
        formattedText = responseText; // Use entire response as formatted text
        this.debugLogger?.('Using fallback parsing - entire response as formatted text');
      }

      return { formattedText, basicJson };

    } catch (error) {
      this.debugLogger?.('Response parsing error', error);
      // Return raw response as formatted text if parsing fails
      return { 
        formattedText: responseText,
        basicJson: { parsing_error: 'Response parsing failed' }
      };
    }
  }

  /**
   * Get MIME type based on file path extension
   */
  private getMimeTypeFromPath(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }
}

/**
 * Convenience function for single-use extraction
 */
export async function extractMvpCvContent(
  filePath: string, 
  originalFilename: string
): Promise<MvpExtractionResult> {
  const service = new MvpCvExtractionService();
  return service.extractFromFile(filePath, originalFilename);
}