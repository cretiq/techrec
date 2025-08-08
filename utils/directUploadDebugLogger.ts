import fs from 'fs';
import path from 'path';

/**
 * Direct Gemini Upload Debug Logger
 * 
 * Captures the complete Direct Gemini Upload pipeline for analysis:
 * 1. File Upload to Gemini
 * 2. Gemini Analysis Request/Response
 * 3. Profile Sync Transformation
 * 
 * ENVIRONMENT SAFETY: Only active in development with DEBUG_CV_UPLOAD enabled
 */
export class DirectUploadDebugLogger {
  private static logDir = path.join(process.cwd(), 'logs', 'direct-gemini-upload');
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
    
    console.log(`📝 [DirectUploadDebugLogger] Session initialized: ${this.currentSessionId}`);
    return this.currentSessionId;
  }

  /**
   * Set existing session ID (for integration with upload route)
   */
  static setSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  /**
   * Log file upload to Gemini
   */
  static logFileUpload(data: {
    cvId: string;
    developerId: string;
    filename: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadResult: {
      success: boolean;
      fileUri?: string;
      fileName?: string;
      sizeBytes?: number;
      uploadDuration?: number;
      error?: string;
    };
    timestamp: string;
  }): string | null {
    if (!this.isDebugEnabled() || !this.currentSessionId) {
      return null;
    }

    // Ensure directory exists before writing
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const filename = `${this.currentSessionId}-direct-upload.json`;
    const filepath = path.join(this.logDir, filename);

    const logData = {
      sessionId: this.currentSessionId,
      type: 'DIRECT_FILE_UPLOAD',
      timestamp: data.timestamp,
      cvId: data.cvId,
      developerId: data.developerId,
      fileInfo: {
        originalFilename: data.filename,
        localFilePath: data.filePath,
        localFileSize: data.fileSize,
        mimeType: data.mimeType,
      },
      uploadToGemini: {
        success: data.uploadResult.success,
        fileUri: data.uploadResult.fileUri,
        geminiFileName: data.uploadResult.fileName,
        geminiFileSize: data.uploadResult.sizeBytes,
        uploadDuration: data.uploadResult.uploadDuration,
        error: data.uploadResult.error,
      },
      validation: {
        fileSizeValid: data.fileSize > 0 && data.fileSize <= 10 * 1024 * 1024,
        mimeTypeSupported: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(data.mimeType),
        uploadSuccessful: data.uploadResult.success,
      },
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [DirectUploadDebugLogger] File upload logged to: ${filepath}`);
    return filepath;
  }

  /**
   * Log Gemini analysis request and response
   */
  static logGeminiAnalysis(data: {
    cvId: string;
    fileUri: string;
    analysisPrompt: string;
    modelUsed: string;
    analysisResult: {
      success: boolean;
      extractedData?: any;
      analysisDuration?: number;
      rawResponse?: string;
      error?: string;
    };
    timestamp: string;
  }): string | null {
    if (!this.isDebugEnabled() || !this.currentSessionId) {
      return null;
    }

    // Ensure directory exists before writing
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const filename = `${this.currentSessionId}-direct-analysis.json`;
    const filepath = path.join(this.logDir, filename);

    const logData = {
      sessionId: this.currentSessionId,
      type: 'DIRECT_GEMINI_ANALYSIS',
      timestamp: data.timestamp,
      cvId: data.cvId,
      request: {
        fileUri: data.fileUri,
        model: data.modelUsed,
        promptLength: data.analysisPrompt.length,
        promptStructure: {
          hasJSONSchema: data.analysisPrompt.includes('JSON'),
          hasExamples: data.analysisPrompt.includes('example'),
          hasValidationRules: data.analysisPrompt.includes('CRITICAL'),
          mentionsContactInfo: data.analysisPrompt.includes('contactInfo'),
          mentionsExperience: data.analysisPrompt.includes('experience'),
          mentionsSkills: data.analysisPrompt.includes('skills'),
        },
        promptPreview: data.analysisPrompt.substring(0, 300) + '...',
      },
      response: {
        success: data.analysisResult.success,
        analysisDuration: data.analysisResult.analysisDuration,
        rawResponseLength: data.analysisResult.rawResponse?.length || 0,
        rawResponsePreview: data.analysisResult.rawResponse?.substring(0, 500) + '...',
        parsingSuccess: !!data.analysisResult.extractedData,
        error: data.analysisResult.error,
      },
      analysis: {
        dataQuality: data.analysisResult.extractedData ? {
          hasContactInfo: !!(data.analysisResult.extractedData.contactInfo?.name || data.analysisResult.extractedData.contactInfo?.email),
          hasAbout: !!(data.analysisResult.extractedData.about && data.analysisResult.extractedData.about.length > 0),
          skillsCount: data.analysisResult.extractedData.skills?.length || 0,
          experienceCount: data.analysisResult.extractedData.experience?.length || 0,
          educationCount: data.analysisResult.extractedData.education?.length || 0,
          achievementsCount: data.analysisResult.extractedData.achievements?.length || 0,
        } : null,
        responseStructure: data.analysisResult.extractedData ? Object.keys(data.analysisResult.extractedData) : [],
      },
      fullPrompt: data.analysisPrompt,
      fullRawResponse: data.analysisResult.rawResponse,
      fullExtractedData: data.analysisResult.extractedData,
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [DirectUploadDebugLogger] Gemini analysis logged to: ${filepath}`);
    return filepath;
  }

  /**
   * Log profile sync transformation
   */
  static logProfileSync(data: {
    cvId: string;
    extractedData: any;
    syncResult: {
      success: boolean;
      contactInfoSynced: boolean;
      experienceItemsSynced: number;
      educationItemsSynced: number;
      skillsSynced: number;
      achievementsSynced: number;
    };
    improvementScore: number;
    syncDuration: number;
    timestamp: string;
    error?: any;
  }): string | null {
    if (!this.isDebugEnabled() || !this.currentSessionId) {
      return null;
    }

    // Ensure directory exists before writing
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const filename = `${this.currentSessionId}-direct-sync.json`;
    const filepath = path.join(this.logDir, filename);

    const logData = {
      sessionId: this.currentSessionId,
      type: 'DIRECT_PROFILE_SYNC',
      timestamp: data.timestamp,
      cvId: data.cvId,
      sync: {
        duration: data.syncDuration,
        success: data.syncResult.success,
        improvementScore: data.improvementScore,
        itemsSynced: {
          contactInfo: data.syncResult.contactInfoSynced,
          experience: data.syncResult.experienceItemsSynced,
          education: data.syncResult.educationItemsSynced,
          skills: data.syncResult.skillsSynced,
          achievements: data.syncResult.achievementsSynced,
        },
      },
      dataTransformation: {
        inputDataStructure: data.extractedData ? Object.keys(data.extractedData) : [],
        contactInfoFields: data.extractedData?.contactInfo ? Object.keys(data.extractedData.contactInfo).filter(key => data.extractedData.contactInfo[key]) : [],
        experienceFields: ['title', 'company', 'startDate', 'endDate', 'responsibilities'],
        skillsStructure: data.extractedData?.skills?.slice(0, 3) || [],
        experiencePreview: data.extractedData?.experience?.slice(0, 2)?.map((exp: any) => ({
          title: exp.title,
          company: exp.company,
          responsibilitiesCount: exp.responsibilities?.length || 0,
        })) || [],
      },
      error: data.error,
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [DirectUploadDebugLogger] Profile sync logged to: ${filepath}`);
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

    const filename = `${analysis.sessionId}-direct-summary.json`;
    const filepath = path.join(this.logDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
    console.log(`📝 [DirectUploadDebugLogger] Analysis summary logged to: ${filepath}`);
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
    const uploadFiles = files.filter(f => f.endsWith('-direct-upload.json'));

    if (uploadFiles.length === 0) return null;

    // Sort by timestamp in filename
    uploadFiles.sort((a, b) => b.localeCompare(a));
    const latestUpload = uploadFiles[0];
    const sessionId = latestUpload.replace('-direct-upload.json', '');

    return {
      sessionId,
      uploadFile: path.join(this.logDir, latestUpload),
      analysisFile: path.join(this.logDir, `${sessionId}-direct-analysis.json`),
      syncFile: path.join(this.logDir, `${sessionId}-direct-sync.json`),
      summaryFile: path.join(this.logDir, `${sessionId}-direct-summary.json`),
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
        console.warn(`[DirectUploadDebugLogger] Failed to read ${filepath}:`, error);
        return null;
      }
    };

    return {
      upload: parseJson(path.join(this.logDir, `${sessionId}-direct-upload.json`)),
      analysis: parseJson(path.join(this.logDir, `${sessionId}-direct-analysis.json`)),
      sync: parseJson(path.join(this.logDir, `${sessionId}-direct-sync.json`)),
      summary: parseJson(path.join(this.logDir, `${sessionId}-direct-summary.json`)),
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
      const match = f.match(/^(.*?)-(direct-upload|direct-analysis|direct-sync|direct-summary)/);
      if (match) sessions.add(match[1]);
    });

    return Array.from(sessions).sort((a, b) => b.localeCompare(a));
  }
}