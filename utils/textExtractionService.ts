import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { getGeminiModel } from '@/lib/modelConfig';
import { TextExtractionResult } from '@/types/cv';

// Environment validation
const envSchema = z.object({
  GOOGLE_AI_API_KEY: z.string().min(1, 'GOOGLE_AI_API_KEY is required'),
});

// Text extraction configuration
const TEXT_EXTRACTION_CONFIG = {
  SUPPORTED_MIME_TYPES: {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.txt': 'text/plain',
  },
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB limit
  EXTRACTION_TIMEOUT: 30000, // 30 seconds
};

/**
 * Simple text extraction service for CV verification
 * Returns raw text exactly as Gemini reads it - no parsing, no structure
 */
export class SimpleTextExtractionService {
  private ai: GoogleGenAI;
  private isEnabled: boolean;

  constructor() {
    try {
      const env = envSchema.parse(process.env);
      this.ai = new GoogleGenAI({ apiKey: env.GOOGLE_AI_API_KEY });
      this.isEnabled = true;
    } catch (error) {
      console.error('SimpleTextExtractionService initialization failed:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Check if text extraction is available and enabled
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }

  /**
   * Validate file for text extraction
   */
  private validateFile(filePath: string): { valid: boolean; error?: string; mimeType?: string } {
    try {
      if (!fs.existsSync(filePath)) {
        return { valid: false, error: 'File does not exist' };
      }

      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        return { valid: false, error: 'File is empty' };
      }

      if (stats.size > TEXT_EXTRACTION_CONFIG.MAX_FILE_SIZE) {
        return { 
          valid: false, 
          error: `File size ${stats.size} exceeds maximum ${TEXT_EXTRACTION_CONFIG.MAX_FILE_SIZE} bytes` 
        };
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeType = TEXT_EXTRACTION_CONFIG.SUPPORTED_MIME_TYPES[ext as keyof typeof TEXT_EXTRACTION_CONFIG.SUPPORTED_MIME_TYPES];
      
      if (!mimeType) {
        return { 
          valid: false, 
          error: `Unsupported file type: ${ext}. Supported: ${Object.keys(TEXT_EXTRACTION_CONFIG.SUPPORTED_MIME_TYPES).join(', ')}` 
        };
      }

      return { valid: true, mimeType };
    } catch (error) {
      return { valid: false, error: `File validation error: ${error}` };
    }
  }

  /**
   * Extract text from file using simple Gemini prompt
   * No parsing, no structure - just pure text extraction
   */
  async extractTextOnly(filePath: string, displayName?: string): Promise<TextExtractionResult> {
    if (!this.isAvailable()) {
      return { 
        success: false, 
        error: 'Text extraction service is not available or disabled',
        extractionDuration: 0
      };
    }

    const startTime = Date.now();
    
    // Validate file
    const validation = this.validateFile(filePath);
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.error, 
        extractionDuration: Date.now() - startTime 
      };
    }

    try {
      // Upload file to Gemini first
      const uploadResult = await this.ai.files.upload({
        file: filePath,
        config: {
          mimeType: validation.mimeType,
          displayName: displayName || path.basename(filePath),
        }
      });

      if (!uploadResult.uri) {
        return {
          success: false,
          error: 'Failed to upload file to Gemini',
          extractionDuration: Date.now() - startTime
        };
      }

      // Extract text using ultra-simple prompt
      const prompt = this.buildTextExtractionPrompt();
      
      const modelName = getGeminiModel('direct-upload');
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { fileData: { fileUri: uploadResult.uri, mimeType: validation.mimeType! } }
            ]
          }
        ],
        config: {
          maxOutputTokens: 8192,
          temperature: 0.0, // Lowest temperature for exact text extraction
        }
      });

      const extractionDuration = Date.now() - startTime;
      const extractedText = response.text;

      if (!extractedText) {
        return {
          success: false,
          error: 'No text extracted from document',
          extractionDuration,
        };
      }

      // Calculate text statistics
      const characterCount = extractedText.length;
      const wordCount = extractedText.trim().split(/\s+/).filter(word => word.length > 0).length;
      const lineCount = extractedText.split('\n').length;

      // Clean up uploaded file (optional - files auto-expire)
      try {
        await this.ai.files.delete({ name: uploadResult.name });
      } catch (deleteError) {
        console.warn('Failed to delete uploaded file from Gemini:', deleteError);
      }

      return {
        success: true,
        extractedText,
        extractionDuration,
        characterCount,
        wordCount,
        lineCount,
      };

    } catch (error) {
      const extractionDuration = Date.now() - startTime;
      return {
        success: false,
        error: `Text extraction failed: ${error instanceof Error ? error.message : String(error)}`,
        extractionDuration,
      };
    }
  }

  /**
   * Ultra-simple prompt for raw text extraction only
   */
  private buildTextExtractionPrompt(): string {
    return `
Read this document and return ALL the text you can see exactly as it appears.

CRITICAL INSTRUCTIONS:
1. Extract EVERY piece of text visible in the document
2. Preserve formatting, spacing, and line breaks where possible
3. Include ALL content: headers, body text, contact info, dates, bullet points, etc.
4. Do NOT skip any text, no matter how small or seemingly unimportant
5. Do NOT interpret, analyze, or structure the content
6. Do NOT return JSON or any structured format
7. Return ONLY the raw text content as you read it

Simply return all the text from the document exactly as you see it, preserving the original structure and formatting as much as possible.
`;
  }
}

// Export singleton instance
export const simpleTextExtraction = new SimpleTextExtractionService();