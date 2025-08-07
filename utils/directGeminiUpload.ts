import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { getGeminiModel } from '@/lib/modelConfig';

// Environment validation
const envSchema = z.object({
  GOOGLE_AI_API_KEY: z.string().min(1, 'GOOGLE_AI_API_KEY is required'),
});

// Direct upload configuration
const DIRECT_UPLOAD_CONFIG = {
  SUPPORTED_MIME_TYPES: {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.txt': 'text/plain',
  },
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB limit
  UPLOAD_TIMEOUT: 30000, // 30 seconds
};

// Types
export interface DirectUploadResult {
  success: boolean;
  fileUri?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  error?: string;
  uploadDuration?: number;
}

export interface DirectAnalysisResult {
  success: boolean;
  extractedData?: any;
  analysisDuration?: number;
  error?: string;
  rawResponse?: string;
}

/**
 * Service for direct PDF/DOCX upload to Gemini API
 * Bypasses local PDF parsing to preserve document structure
 */
export class DirectGeminiUploadService {
  private ai: GoogleGenAI;
  private isEnabled: boolean;

  constructor() {
    try {
      const env = envSchema.parse(process.env);
      this.ai = new GoogleGenAI({ apiKey: env.GOOGLE_AI_API_KEY });
      this.isEnabled = true;
    } catch (error) {
      console.error('DirectGeminiUploadService initialization failed:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Check if direct upload is available and enabled
   */
  isAvailable(): boolean {
    return this.isEnabled && process.env.ENABLE_DIRECT_GEMINI_UPLOAD !== 'false';
  }

  /**
   * Validate file for direct upload
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

      if (stats.size > DIRECT_UPLOAD_CONFIG.MAX_FILE_SIZE) {
        return { 
          valid: false, 
          error: `File size ${stats.size} exceeds maximum ${DIRECT_UPLOAD_CONFIG.MAX_FILE_SIZE} bytes` 
        };
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeType = DIRECT_UPLOAD_CONFIG.SUPPORTED_MIME_TYPES[ext as keyof typeof DIRECT_UPLOAD_CONFIG.SUPPORTED_MIME_TYPES];
      
      if (!mimeType) {
        return { 
          valid: false, 
          error: `Unsupported file type: ${ext}. Supported: ${Object.keys(DIRECT_UPLOAD_CONFIG.SUPPORTED_MIME_TYPES).join(', ')}` 
        };
      }

      return { valid: true, mimeType };
    } catch (error) {
      return { valid: false, error: `File validation error: ${error}` };
    }
  }

  /**
   * Upload file directly to Gemini API
   */
  async uploadFile(filePath: string, displayName?: string): Promise<DirectUploadResult> {
    if (!this.isAvailable()) {
      return { 
        success: false, 
        error: 'Direct Gemini upload is not available or disabled' 
      };
    }

    const startTime = Date.now();

    try {
      // Validate file
      const validation = this.validateFile(filePath);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Upload file to Gemini
      const uploadResult = await this.ai.files.upload({
        file: filePath,
        config: {
          mimeType: validation.mimeType,
          displayName: displayName || path.basename(filePath),
        }
      });

      const uploadDuration = Date.now() - startTime;

      return {
        success: true,
        fileUri: uploadResult.uri,
        fileName: uploadResult.name,
        mimeType: uploadResult.mimeType,
        sizeBytes: uploadResult.sizeBytes ? parseInt(uploadResult.sizeBytes) : undefined,
        uploadDuration,
      };

    } catch (error) {
      const uploadDuration = Date.now() - startTime;
      return {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
        uploadDuration,
      };
    }
  }

  /**
   * Analyze uploaded file with enhanced prompt for CV extraction
   */
  async analyzeUploadedFile(fileUri: string): Promise<DirectAnalysisResult> {
    if (!this.isAvailable()) {
      return { 
        success: false, 
        error: 'Direct Gemini upload is not available or disabled' 
      };
    }

    const startTime = Date.now();

    try {
      const prompt = this.buildAnalysisPrompt();
      
      const modelName = getGeminiModel('direct-upload');
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { fileData: { fileUri, mimeType: 'application/pdf' } }
            ]
          }
        ],
        config: {
          maxOutputTokens: 8192,
          temperature: 0.1, // Low temperature for consistent extraction
        }
      });

      const analysisDuration = Date.now() - startTime;
      const rawResponse = response.text;

      if (!rawResponse) {
        return {
          success: false,
          error: 'No response received from Gemini',
          analysisDuration,
        };
      }

      // Parse JSON response (with markdown cleanup fallback)
      let extractedData;
      try {
        extractedData = JSON.parse(rawResponse);
      } catch (parseError) {
        // Try to clean up markdown-formatted JSON
        let cleanedResponse = rawResponse.trim();
        
        // Remove markdown code blocks
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try parsing the cleaned response
        try {
          extractedData = JSON.parse(cleanedResponse);
        } catch (secondParseError) {
          return {
            success: false,
            error: `Failed to parse JSON response after cleanup: ${secondParseError}`,
            analysisDuration,
            rawResponse,
          };
        }
      }

      return {
        success: true,
        extractedData,
        analysisDuration,
        rawResponse,
      };

    } catch (error) {
      const analysisDuration = Date.now() - startTime;
      return {
        success: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        analysisDuration,
      };
    }
  }

  /**
   * Enhanced prompt for CV extraction with better structure preservation
   */
  private buildAnalysisPrompt(): string {
    return `
Extract comprehensive information from this CV/resume document and return it as valid JSON. Pay special attention to preserving the relationship between work experience and associated projects.

CRITICAL: When a job/position mentions "client projects" or lists specific projects within the experience description, those projects should be included as nested objects within that experience entry, NOT as separate achievements.

Return JSON with this exact structure:

{
  "contactInfo": {
    "name": "string | null",
    "email": "string | null", 
    "phone": "string | null",
    "location": "string | null",
    "linkedin": "string | null",
    "github": "string | null",
    "website": "string | null"
  },
  "about": "string - professional summary",
  "skills": [
    {
      "name": "string",
      "category": "Programming Languages | Frameworks | Tools | Databases | Soft Skills | etc.",
      "level": "BEGINNER | INTERMEDIATE | ADVANCED | EXPERT"
    }
  ],
  "experience": [
    {
      "title": "string",
      "company": "string", 
      "description": "string",
      "location": "string | null",
      "startDate": "YYYY-MM | null",
      "endDate": "YYYY-MM | null", 
      "current": boolean,
      "responsibilities": ["string"],
      "achievements": ["string"],
      "projects": [
        {
          "name": "string",
          "description": "string", 
          "technologies": ["string"],
          "teamSize": "number | null",
          "role": "string | null"
        }
      ],
      "teamSize": "number | null",
      "techStack": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string | null",
      "field": "string | null", 
      "location": "string | null",
      "startDate": "YYYY-MM | null",
      "endDate": "YYYY-MM | null",
      "gpa": "string | null"
    }
  ],
  "achievements": [
    {
      "title": "string",
      "description": "string",
      "date": "YYYY-MM | null",
      "type": "certification | award | publication | other"
    }
  ],
  "totalYearsExperience": number,
  "isJuniorDeveloper": boolean,
  "experienceCalculation": {
    "calculatedAt": unix_timestamp,
    "experienceItems": number,
    "method": "direct_upload_analysis"
  }
}

IMPORTANT EXTRACTION RULES:
1. If experience mentions "client projects" or "following projects", extract those as nested "projects" array within that experience
2. Only use "achievements" for certifications, awards, publications, or other standalone accomplishments
3. Preserve project-to-company relationships - don't separate them
4. Extract all technical skills mentioned, categorize appropriately  
5. Calculate total experience accurately from date ranges
6. Set isJuniorDeveloper to true if total experience < 3 years
7. Use null for missing information, don't guess
8. Be precise with date formats (YYYY-MM)

CRITICAL: Return ONLY the raw JSON object, no markdown formatting, no code blocks, no explanatory text. Just the pure JSON structure starting with { and ending with }.
`;
  }

  /**
   * Complete workflow: upload file and analyze in one call
   */
  async uploadAndAnalyze(filePath: string, displayName?: string): Promise<{
    upload: DirectUploadResult;
    analysis?: DirectAnalysisResult;
  }> {
    const uploadResult = await this.uploadFile(filePath, displayName);
    
    if (!uploadResult.success || !uploadResult.fileUri) {
      return { upload: uploadResult };
    }

    const analysisResult = await this.analyzeUploadedFile(uploadResult.fileUri);
    
    return {
      upload: uploadResult,
      analysis: analysisResult,
    };
  }

  /**
   * Clean up uploaded file (optional - files auto-expire)
   */
  async deleteFile(fileName: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Direct Gemini upload is not available' };
    }

    try {
      await this.ai.files.delete({ name: fileName });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Delete failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

// Export singleton instance
export const directGeminiUpload = new DirectGeminiUploadService();