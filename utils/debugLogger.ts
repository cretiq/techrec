import fs from 'fs';
import path from 'path';

// Debug logger for CV improvement API
export class CvImprovementDebugLogger {
  private static logDir = path.join(process.cwd(), 'logs', 'cv-improvement');
  private static currentSessionId: string | null = null;

  static initialize() {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Generate session ID
    this.currentSessionId = new Date().toISOString().replace(/[:.]/g, '-');
    return this.currentSessionId;
  }

  static logRequest(data: {
    userId: string;
    cvData: any;
    prompt: string;
    timestamp: string;
  }) {
    if (!this.currentSessionId) this.initialize();
    
    const filename = `${this.currentSessionId}-request.json`;
    const filepath = path.join(this.logDir, filename);
    
    const logData = {
      sessionId: this.currentSessionId,
      type: 'REQUEST',
      timestamp: data.timestamp,
      userId: data.userId,
      cvDataSummary: {
        hasContactInfo: !!data.cvData.contactInfo,
        contactInfoFields: data.cvData.contactInfo ? Object.keys(data.cvData.contactInfo) : [],
        aboutLength: data.cvData.about?.length || 0,
        skillsCount: data.cvData.skills?.length || 0,
        experienceCount: data.cvData.experience?.length || 0,
        educationCount: data.cvData.education?.length || 0,
        achievementsCount: data.cvData.achievements?.length || 0,
      },
      fullCvData: data.cvData,
      prompt: data.prompt,
      promptLength: data.prompt.length,
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [DebugLogger] Request logged to: ${filepath}`);
    return filepath;
  }

  static logResponse(data: {
    attempt: number;
    rawResponse: string;
    parsedResponse: any;
    validationResult: any;
    finalResponse: any;
    duration: number;
    error?: any;
  }) {
    if (!this.currentSessionId) this.initialize();
    
    const filename = `${this.currentSessionId}-response-attempt${data.attempt}.json`;
    const filepath = path.join(this.logDir, filename);
    
    const logData = {
      sessionId: this.currentSessionId,
      type: 'RESPONSE',
      timestamp: new Date().toISOString(),
      attempt: data.attempt,
      duration: data.duration,
      rawResponse: {
        length: data.rawResponse.length,
        content: data.rawResponse,
        preview: data.rawResponse.substring(0, 500),
      },
      parsedResponse: data.parsedResponse,
      validationResult: data.validationResult,
      finalResponse: data.finalResponse,
      error: data.error,
      analysis: {
        totalSuggestions: data.parsedResponse?.suggestions?.length || 0,
        suggestionTypes: data.parsedResponse?.suggestions?.map((s: any) => ({
          section: s.section,
          type: s.suggestionType || s.type,
          hasOriginalText: !!s.originalText,
          hasSuggestedText: !!s.suggestedText,
          reasoningLength: s.reasoning?.length || 0,
        })) || [],
      },
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [DebugLogger] Response logged to: ${filepath}`);
    return filepath;
  }

  static logAnalysis(analysis: {
    sessionId: string;
    findings: string[];
    improvements: string[];
    metrics: any;
  }) {
    const filename = `${analysis.sessionId}-analysis.json`;
    const filepath = path.join(this.logDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
    console.log(`📝 [DebugLogger] Analysis logged to: ${filepath}`);
    return filepath;
  }

  static getLatestSession() {
    if (!fs.existsSync(this.logDir)) return null;
    
    const files = fs.readdirSync(this.logDir);
    const requestFiles = files.filter(f => f.endsWith('-request.json'));
    
    if (requestFiles.length === 0) return null;
    
    // Sort by timestamp in filename
    requestFiles.sort((a, b) => b.localeCompare(a));
    const latestRequest = requestFiles[0];
    const sessionId = latestRequest.replace('-request.json', '');
    
    return {
      sessionId,
      requestFile: path.join(this.logDir, latestRequest),
      responseFiles: files
        .filter(f => f.startsWith(sessionId) && f.includes('-response-'))
        .map(f => path.join(this.logDir, f)),
    };
  }

  static readSession(sessionId: string) {
    const requestFile = path.join(this.logDir, `${sessionId}-request.json`);
    const responseFiles = fs.readdirSync(this.logDir)
      .filter(f => f.startsWith(sessionId) && f.includes('-response-'))
      .map(f => path.join(this.logDir, f));
    
    if (!fs.existsSync(requestFile)) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    return {
      request: JSON.parse(fs.readFileSync(requestFile, 'utf-8')),
      responses: responseFiles.map(f => JSON.parse(fs.readFileSync(f, 'utf-8'))),
    };
  }

  static listSessions() {
    if (!fs.existsSync(this.logDir)) return [];
    
    const files = fs.readdirSync(this.logDir);
    const sessions = new Set<string>();
    
    files.forEach(f => {
      const match = f.match(/^(.*?)-(?:request|response)/);
      if (match) sessions.add(match[1]);
    });
    
    return Array.from(sessions).sort((a, b) => b.localeCompare(a));
  }
}

// Debug logger for Cover Letter Generation API
export class CoverLetterDebugLogger {
  private static logDir = path.join(process.cwd(), 'logs', 'cover-letter-generation');
  private static currentSessionId: string | null = null;
  private static isEnabled = process.env.DEBUG_COVER_LETTER === 'true';

  static initialize() {
    if (!this.isEnabled) return null;
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Generate session ID
    this.currentSessionId = new Date().toISOString().replace(/[:.]/g, '-');
    return this.currentSessionId;
  }

  static logRequest(data: {
    userId?: string;
    developerProfile: any;
    roleInfo: any;
    companyInfo: any;
    personalization: {
      tone?: string;
      hiringManager?: string;
      jobSource?: string;
      attractionPoints?: string[];
    };
    processedData: {
      keywords: string[];
      coreSkills: string[];
      achievements: string[];
    };
    prompt: string;
    cacheKey: string;
    cacheHit: boolean;
    timestamp: string;
  }) {
    if (!this.isEnabled) return null;
    if (!this.currentSessionId) this.initialize();
    
    const filename = `${this.currentSessionId}-request.json`;
    const filepath = path.join(this.logDir, filename);
    
    // Create profile summary for privacy/analysis
    const profileSummary = {
      hasContactInfo: !!data.developerProfile.contactInfo,
      hasEmail: !!data.developerProfile.profileEmail || !!data.developerProfile.email,
      hasAbout: !!data.developerProfile.about,
      aboutLength: data.developerProfile.about?.length || 0,
      skillsCount: data.developerProfile.skills?.length || 0,
      experienceCount: data.developerProfile.experience?.length || 0,
      educationCount: data.developerProfile.education?.length || 0,
      achievementsCount: data.developerProfile.achievements?.length || 0,
      projectsCount: data.developerProfile.projects?.length || 0,
      hasMvpCvContent: !!data.developerProfile.mvpContent
    };
    
    const logData = {
      sessionId: this.currentSessionId,
      type: 'REQUEST',
      timestamp: data.timestamp,
      userId: data.userId || 'unknown',
      cacheInfo: {
        key: data.cacheKey,
        hit: data.cacheHit
      },
      requestData: {
        roleInfo: {
          title: data.roleInfo.title,
          company: data.companyInfo.name,
          location: data.companyInfo.location,
          requirementsCount: data.roleInfo.requirements?.length || 0,
          skillsCount: data.roleInfo.skills?.length || 0,
          descriptionLength: data.roleInfo.description?.length || 0
        },
        developerProfileSummary: profileSummary,
        personalization: data.personalization,
        processedData: data.processedData
      },
      promptInfo: {
        promptLength: data.prompt.length,
        promptPreview: data.prompt.substring(0, 500) + '...',
        fullPrompt: data.prompt
      },
      fullDeveloperProfile: data.developerProfile,
      fullRoleInfo: data.roleInfo,
      fullCompanyInfo: data.companyInfo
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [CoverLetterDebugLogger] Request logged to: ${filepath}`);
    return filepath;
  }

  static logResponse(data: {
    attempt: number;
    modelName: string;
    generationConfig: any;
    rawResponse: string;
    validationResult: any;
    duration: number;
    cached?: boolean;
    provider?: string;
    error?: any;
  }) {
    if (!this.isEnabled) return null;
    if (!this.currentSessionId) this.initialize();
    
    const filename = `${this.currentSessionId}-response-attempt${data.attempt}.json`;
    const filepath = path.join(this.logDir, filename);
    
    // Calculate quality metrics
    const wordCount = data.rawResponse ? data.rawResponse.split(/\s+/).filter(w => w.length > 0).length : 0;
    const paragraphCount = data.rawResponse ? data.rawResponse.split(/\n\n+/).filter(p => p.trim().length > 0).length : 0;
    const sentenceCount = data.rawResponse ? data.rawResponse.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
    
    const logData = {
      sessionId: this.currentSessionId,
      type: 'RESPONSE',
      timestamp: new Date().toISOString(),
      attempt: data.attempt,
      duration: data.duration,
      cached: data.cached || false,
      provider: data.provider || 'gemini',
      modelInfo: {
        name: data.modelName,
        config: data.generationConfig
      },
      aiResponse: {
        rawLength: data.rawResponse?.length || 0,
        rawContent: data.rawResponse,
        preview: data.rawResponse?.substring(0, 500) || ''
      },
      qualityMetrics: {
        wordCount,
        paragraphCount,
        sentenceCount,
        avgWordsPerSentence: sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0,
        hasGreeting: data.rawResponse?.toLowerCase().includes('dear ') || false,
        hasClosing: /\b(sincerely|best regards|regards|thank you)\b/i.test(data.rawResponse || ''),
        hasMarkdown: data.rawResponse?.includes('**') || data.rawResponse?.includes('*') || false
      },
      validation: data.validationResult,
      error: data.error,
      analysis: {
        responseQuality: data.validationResult?.isValid ? 'VALID' : 'INVALID',
        errorCount: data.validationResult?.errors?.length || 0,
        warningCount: data.validationResult?.warnings?.length || 0,
        issues: [
          ...(data.validationResult?.errors || []),
          ...(data.validationResult?.warnings || [])
        ]
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    console.log(`📝 [CoverLetterDebugLogger] Response logged to: ${filepath}`);
    return filepath;
  }

  static logAnalysis(analysis: {
    sessionId: string;
    findings: string[];
    improvements: string[];
    metrics: any;
    recommendations: string[];
  }) {
    if (!this.isEnabled) return null;
    
    const filename = `${analysis.sessionId}-analysis.json`;
    const filepath = path.join(this.logDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
    console.log(`📝 [CoverLetterDebugLogger] Analysis logged to: ${filepath}`);
    return filepath;
  }

  static getLatestSession() {
    if (!fs.existsSync(this.logDir)) return null;
    
    const files = fs.readdirSync(this.logDir);
    const requestFiles = files.filter(f => f.endsWith('-request.json'));
    
    if (requestFiles.length === 0) return null;
    
    // Sort by timestamp in filename
    requestFiles.sort((a, b) => b.localeCompare(a));
    const latestRequest = requestFiles[0];
    const sessionId = latestRequest.replace('-request.json', '');
    
    return {
      sessionId,
      requestFile: path.join(this.logDir, latestRequest),
      responseFiles: files
        .filter(f => f.startsWith(sessionId) && f.includes('-response-'))
        .map(f => path.join(this.logDir, f))
    };
  }

  static readSession(sessionId: string) {
    const requestFile = path.join(this.logDir, `${sessionId}-request.json`);
    const responseFiles = fs.readdirSync(this.logDir)
      .filter(f => f.startsWith(sessionId) && f.includes('-response-'))
      .map(f => path.join(this.logDir, f));
    
    if (!fs.existsSync(requestFile)) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    return {
      request: JSON.parse(fs.readFileSync(requestFile, 'utf-8')),
      responses: responseFiles.map(f => JSON.parse(fs.readFileSync(f, 'utf-8')))
    };
  }

  static listSessions() {
    if (!fs.existsSync(this.logDir)) return [];
    
    const files = fs.readdirSync(this.logDir);
    const sessions = new Set<string>();
    
    files.forEach(f => {
      const match = f.match(/^(.*?)-(?:request|response|analysis)/);
      if (match) sessions.add(match[1]);
    });
    
    return Array.from(sessions).sort((a, b) => b.localeCompare(a));
  }
}