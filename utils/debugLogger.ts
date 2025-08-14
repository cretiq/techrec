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
  private static sessionData: any = null;

  static initialize() {
    if (!this.isEnabled) return null;
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Generate session ID with Swedish timezone (UTC+2)
    const swedishTime = new Date(Date.now() + (2 * 60 * 60 * 1000)); // Add 2 hours
    this.currentSessionId = swedishTime.toISOString().replace(/[:.]/g, '-');
    
    // Initialize session data
    this.sessionData = {
      sessionId: this.currentSessionId,
      timestamp: swedishTime.toISOString(),
      request: null,
      responses: []
    };
    
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
    rawPromptTemplate?: string;
    cacheKey: string;
    cacheHit: boolean;
    timestamp: string;
  }) {
    if (!this.isEnabled) return null;
    if (!this.currentSessionId) this.initialize();
    
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
    
    // Store request data in memory
    this.sessionData.request = {
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
        fullPrompt: data.prompt,
        rawTemplate: data.rawPromptTemplate,
        rawTemplateLength: data.rawPromptTemplate?.length || 0,
        rawTemplatePreview: data.rawPromptTemplate ? data.rawPromptTemplate.substring(0, 500) + '...' : null
      },
      fullDeveloperProfile: data.developerProfile,
      fullRoleInfo: data.roleInfo,
      fullCompanyInfo: data.companyInfo
    };

    console.log(`📝 [CoverLetterDebugLogger] Request data stored in memory for session: ${this.currentSessionId}`);
    return this.currentSessionId;
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
    
    // Calculate quality metrics
    const wordCount = data.rawResponse ? data.rawResponse.split(/\s+/).filter(w => w.length > 0).length : 0;
    const paragraphCount = data.rawResponse ? data.rawResponse.split(/\n\n+/).filter(p => p.trim().length > 0).length : 0;
    const sentenceCount = data.rawResponse ? data.rawResponse.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
    
    const responseData = {
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

    // Add response to session data
    this.sessionData.responses.push(responseData);

    // Create unified debug file
    this._writeUnifiedDebugFile();

    console.log(`📝 [CoverLetterDebugLogger] Response logged and unified file created for session: ${this.currentSessionId}`);
    return this.currentSessionId;
  }

  private static _writeUnifiedDebugFile() {
    if (!this.sessionData || !this.sessionData.request) return;

    const request = this.sessionData.request;
    const response = this.sessionData.responses[this.sessionData.responses.length - 1]; // Latest response
    
    // Helper function to format content for better readability
    const formatPrompt = (prompt: string) => {
      if (!prompt) return '';
      return prompt
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    };

    const unifiedData = {
      // Session metadata
      sessionId: this.sessionData.sessionId,
      timestamp: this.sessionData.timestamp,
      cached: request.cacheInfo?.hit || false,
      
      // ===== RAW CONTENT SECTION (The three main fields you requested) =====
      rawPromptTemplate: request.promptInfo?.rawTemplate || null,
      fullPrompt: request.promptInfo?.fullPrompt || null,
      aiResponse: response?.aiResponse?.rawContent || null,

      // ===== METADATA & ANALYSIS =====
      metadata: {
        templateInfo: {
          rawTemplateLength: request.promptInfo?.rawTemplateLength || 0,
          finalPromptLength: request.promptInfo?.promptLength || 0,
          expansionRatio: request.promptInfo?.rawTemplateLength > 0 ? 
            (request.promptInfo.promptLength / request.promptInfo.rawTemplateLength).toFixed(2) : null,
          templateType: request.promptInfo?.rawTemplate?.includes('FULL CV CONTENT') ? 
            'MVP Content Template' : 'Structured Data Template',
          variableCount: request.promptInfo?.rawTemplate ? 
            (request.promptInfo.rawTemplate.match(/\$\{[^}]+\}/g) || []).length : 0
        },
        responseInfo: {
          duration: response?.duration || 0,
          provider: response?.provider || 'unknown',
          model: response?.modelInfo?.name || 'unknown',
          wordCount: response?.qualityMetrics?.wordCount || 0,
          paragraphCount: response?.qualityMetrics?.paragraphCount || 0,
          hasGreeting: response?.qualityMetrics?.hasGreeting || false,
          hasClosing: response?.qualityMetrics?.hasClosing || false,
          hasMarkdown: response?.qualityMetrics?.hasMarkdown || false,
          validationPassed: response?.validation?.isValid || false,
          errorCount: response?.validation?.errors?.length || 0
        },
        requestInfo: {
          roleTitle: request.requestData?.roleInfo?.title || 'Unknown',
          company: request.requestData?.roleInfo?.company || 'Unknown',
          hasMvpContent: request.requestData?.developerProfileSummary?.hasMvpCvContent || false,
          skillsCount: request.requestData?.developerProfileSummary?.skillsCount || 0,
          experienceCount: request.requestData?.developerProfileSummary?.experienceCount || 0,
          tone: request.requestData?.personalization?.tone || 'formal',
          cacheKey: request.cacheInfo?.key || 'unknown'
        }
      },

      // ===== FULL CONTEXT DATA (for analysis scripts) =====
      fullContext: {
        request: request,
        responses: this.sessionData.responses
      }
    };

    // Write unified debug file
    const filename = `${this.currentSessionId}-unified-debug.json`;
    const filepath = path.join(this.logDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(unifiedData, null, 2));
    console.log(`📝 [CoverLetterDebugLogger] Unified debug file created: ${filepath}`);
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
    const unifiedFiles = files.filter(f => f.endsWith('-unified-debug.json'));
    
    if (unifiedFiles.length === 0) {
      // Fallback to old format for backward compatibility
      const requestFiles = files.filter(f => f.endsWith('-request.json'));
      if (requestFiles.length === 0) return null;
      
      requestFiles.sort((a, b) => b.localeCompare(a));
      const latestRequest = requestFiles[0];
      const sessionId = latestRequest.replace('-request.json', '');
      
      return {
        sessionId,
        requestFile: path.join(this.logDir, latestRequest),
        responseFiles: files
          .filter(f => f.startsWith(sessionId) && f.includes('-response-'))
          .map(f => path.join(this.logDir, f)),
        unifiedFile: null
      };
    }
    
    // Sort by timestamp in filename
    unifiedFiles.sort((a, b) => b.localeCompare(a));
    const latestUnified = unifiedFiles[0];
    const sessionId = latestUnified.replace('-unified-debug.json', '');
    
    return {
      sessionId,
      unifiedFile: path.join(this.logDir, latestUnified),
      requestFile: null, // Unified file contains all data
      responseFiles: []   // Unified file contains all data
    };
  }

  static readSession(sessionId: string) {
    // Try unified file first
    const unifiedFile = path.join(this.logDir, `${sessionId}-unified-debug.json`);
    if (fs.existsSync(unifiedFile)) {
      const unifiedData = JSON.parse(fs.readFileSync(unifiedFile, 'utf-8'));
      return {
        request: unifiedData.fullContext.request,
        responses: unifiedData.fullContext.responses,
        unified: unifiedData // Include the unified structure
      };
    }
    
    // Fallback to old format
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
      unified: null
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