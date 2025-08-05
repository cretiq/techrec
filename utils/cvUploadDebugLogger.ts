import fs from 'fs';
import path from 'path';

/**
 * CV Upload Debug Logger
 * 
 * Captures the complete CV upload pipeline for analysis:
 * 1. PDF Parsing Results
 * 2. Gemini Request Formation
 * 3. Gemini Response Analysis
 * 4. Profile Sync Transformation
 * 
 * ENVIRONMENT SAFETY: Only active in development with DEBUG_CV_UPLOAD enabled
 */
export class CvUploadDebugLogger {
  private static logDir = path.join(process.cwd(), 'logs', 'cv-upload-parse-request-response');
  private static currentSessionId: string | null = null;

  /**
   * Check if debug logging is enabled (development-only safety)
   */
  private static isDebugEnabled(): boolean {
    return process.env.NODE_ENV === 'development' && 
           process.env.DEBUG_CV_UPLOAD !== 'false';
  }

  /**
   * Initialize a new debug session if logging is enabled
   */
  static initialize(): string | null {
    if (!this.isDebugEnabled()) {
      return null;
    }

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Generate session ID based on timestamp
    this.currentSessionId = new Date().toISOString().replace(/[:.]/g, '-');
    
    console.log(`📝 [CvUploadDebugLogger] Session initialized: ${this.currentSessionId}`);
    return this.currentSessionId;
  }

  /**
   * Log PDF parsing results
   */
  static logPdfParsing(data: {
    cvId: string;
    developerId: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    parsedContent: {
      text: string;
      textLength: number;
      estimatedWords: number;
      estimatedLines: number;
    };
    parsingDuration: number;
    timestamp: string;
  }): string | null {
    if (!this.isDebugEnabled() || !this.currentSessionId) {
      return null;
    }

    const filename = `${this.currentSessionId}-pdf-parsing.json`;
    const filepath = path.join(this.logDir, filename);

    const logData = {
      sessionId: this.currentSessionId,
      type: 'PDF_PARSING',
      timestamp: data.timestamp,
      cvId: data.cvId,
      developerId: data.developerId,
      fileInfo: {
        filename: data.filename,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
      },
      parsing: {
        textLength: data.parsedContent.textLength,
        estimatedWords: data.parsedContent.estimatedWords,
        estimatedLines: data.parsedContent.estimatedLines,
        hasContent: data.parsedContent.textLength > 0,
        textPreview: data.parsedContent.text.substring(0, 500) + '...',
        textSample: {
          firstLines: data.parsedContent.text.split('\n').slice(0, 10),
          lastLines: data.parsedContent.text.split('\n').slice(-5),
        },
        duration: data.parsingDuration,
      },
      fullText: data.parsedContent.text, // Store full text for analysis
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [CvUploadDebugLogger] PDF parsing logged to: ${filepath}`);
    return filepath;
  }

  /**
   * Log Gemini request formation
   */
  static logGeminiRequest(data: {
    cvId: string;
    inputText: string;
    prompt: string;
    estimatedTokens: number;
    model: string;
    timestamp: string;
  }): string | null {
    if (!this.isDebugEnabled() || !this.currentSessionId) {
      return null;
    }

    const filename = `${this.currentSessionId}-gemini-request.json`;
    const filepath = path.join(this.logDir, filename);

    const logData = {
      sessionId: this.currentSessionId,
      type: 'GEMINI_REQUEST',
      timestamp: data.timestamp,
      cvId: data.cvId,
      request: {
        model: data.model,
        estimatedTokens: data.estimatedTokens,
        inputTextLength: data.inputText.length,
        inputTextPreview: data.inputText.substring(0, 300) + '...',
        promptLength: data.prompt.length,
        promptStructure: {
          hasJsonSchema: data.prompt.includes('JSON'),
          hasExamples: data.prompt.includes('example'),
          hasValidationRules: data.prompt.includes('required'),
        },
      },
      fullPrompt: data.prompt,
      fullInputText: data.inputText,
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [CvUploadDebugLogger] Gemini request logged to: ${filepath}`);
    return filepath;
  }

  /**
   * Log Gemini response and validation
   */
  static logGeminiResponse(data: {
    cvId: string;
    rawResponse: string;
    parsedResponse: any;
    validationResult: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    };
    extractedData: {
      hasContactInfo: boolean;
      hasAbout: boolean;
      skillsCount: number;
      experienceCount: number;
      educationCount: number;
      achievementsCount: number;
    };
    duration: number;
    timestamp: string;
    error?: any;
  }): string | null {
    if (!this.isDebugEnabled() || !this.currentSessionId) {
      return null;
    }

    const filename = `${this.currentSessionId}-gemini-response.json`;
    const filepath = path.join(this.logDir, filename);

    const logData = {
      sessionId: this.currentSessionId,
      type: 'GEMINI_RESPONSE', 
      timestamp: data.timestamp,
      cvId: data.cvId,
      response: {
        duration: data.duration,
        rawResponseLength: data.rawResponse.length,
        rawResponsePreview: data.rawResponse.substring(0, 500) + '...',
        parsingSuccess: !!data.parsedResponse,
        validationResult: data.validationResult,
        extractedDataQuality: data.extractedData,
      },
      analysis: {
        responseStructure: data.parsedResponse ? Object.keys(data.parsedResponse) : [],
        dataCompleteness: {
          totalFields: Object.values(data.extractedData).filter(Boolean).length,
          missingFields: Object.entries(data.extractedData)
            .filter(([key, value]) => !value)
            .map(([key]) => key),
        },
      },
      fullRawResponse: data.rawResponse,
      fullParsedResponse: data.parsedResponse,
      error: data.error,
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [CvUploadDebugLogger] Gemini response logged to: ${filepath}`);
    return filepath;
  }

  /**
   * Log profile sync transformation
   */
  static logProfileSync(data: {
    cvId: string;
    syncResult: {
      success: boolean;
      contactInfoSynced: boolean;
      experienceItemsSynced: number;
      educationItemsSynced: number;
      skillsSynced: number;
      achievementsSynced: number;
    };
    transformedData: {
      contactInfoFields: string[];
      experienceFields: string[];
      skillsStructure: any;
    };
    syncDuration: number;
    timestamp: string;
    error?: any;
  }): string | null {
    if (!this.isDebugEnabled() || !this.currentSessionId) {
      return null;
    }

    const filename = `${this.currentSessionId}-profile-sync.json`;
    const filepath = path.join(this.logDir, filename);

    const logData = {
      sessionId: this.currentSessionId,
      type: 'PROFILE_SYNC',
      timestamp: data.timestamp,
      cvId: data.cvId,
      sync: {
        duration: data.syncDuration,
        success: data.syncResult.success,
        itemsSynced: {
          contactInfo: data.syncResult.contactInfoSynced,
          experience: data.syncResult.experienceItemsSynced,
          education: data.syncResult.educationItemsSynced,
          skills: data.syncResult.skillsSynced,
          achievements: data.syncResult.achievementsSynced,
        },
        dataTransformation: data.transformedData,
      },
      error: data.error,
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [CvUploadDebugLogger] Profile sync logged to: ${filepath}`);
    return filepath;
  }

  /**
   * Log final analysis summary
   */
  static logAnalysisSummary(analysis: {
    sessionId: string;
    cvId: string;
    findings: string[];
    improvements: string[];
    metrics: any;
  }): string | null {
    if (!this.isDebugEnabled()) {
      return null;
    }

    const filename = `${analysis.sessionId}-analysis-summary.json`;
    const filepath = path.join(this.logDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
    console.log(`📝 [CvUploadDebugLogger] Analysis summary logged to: ${filepath}`);
    return filepath;
  }

  /**
   * Get the latest session information
   */
  static getLatestSession() {
    if (!this.isDebugEnabled() || !fs.existsSync(this.logDir)) {
      return null;
    }

    const files = fs.readdirSync(this.logDir);
    const parsingFiles = files.filter(f => f.endsWith('-pdf-parsing.json'));

    if (parsingFiles.length === 0) return null;

    // Sort by timestamp in filename
    parsingFiles.sort((a, b) => b.localeCompare(a));
    const latestParsing = parsingFiles[0];
    const sessionId = latestParsing.replace('-pdf-parsing.json', '');

    return {
      sessionId,
      parsingFile: path.join(this.logDir, latestParsing),
      requestFile: path.join(this.logDir, `${sessionId}-gemini-request.json`),
      responseFile: path.join(this.logDir, `${sessionId}-gemini-response.json`),
      syncFile: path.join(this.logDir, `${sessionId}-profile-sync.json`),
      allFiles: files
        .filter(f => f.startsWith(sessionId))
        .map(f => path.join(this.logDir, f)),
    };
  }

  /**
   * Read complete session data
   */
  static readSession(sessionId: string) {
    if (!this.isDebugEnabled()) {
      return null;
    }

    const parseJson = (filepath: string) => {
      try {
        return fs.existsSync(filepath) ? JSON.parse(fs.readFileSync(filepath, 'utf-8')) : null;
      } catch (error) {
        console.warn(`[CvUploadDebugLogger] Failed to read ${filepath}:`, error);
        return null;
      }
    };

    return {
      parsing: parseJson(path.join(this.logDir, `${sessionId}-pdf-parsing.json`)),
      request: parseJson(path.join(this.logDir, `${sessionId}-gemini-request.json`)),
      response: parseJson(path.join(this.logDir, `${sessionId}-gemini-response.json`)),
      sync: parseJson(path.join(this.logDir, `${sessionId}-profile-sync.json`)),
    };
  }

  /**
   * List all available sessions
   */
  static listSessions(): string[] {
    if (!this.isDebugEnabled() || !fs.existsSync(this.logDir)) {
      return [];
    }

    const files = fs.readdirSync(this.logDir);
    const sessions = new Set<string>();

    files.forEach(f => {
      const match = f.match(/^(.*?)-(pdf-parsing|gemini-request|gemini-response|profile-sync)/);
      if (match) sessions.add(match[1]);
    });

    return Array.from(sessions).sort((a, b) => b.localeCompare(a));
  }
}