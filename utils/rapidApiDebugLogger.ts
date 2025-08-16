import fs from 'fs';
import path from 'path';

/**
 * RapidAPI Debug Logger
 * 
 * Comprehensive logging system for RapidAPI LinkedIn Jobs integration
 * Follows the same patterns as CoverLetterDebugLogger and DirectUploadDebugLogger
 * 
 * Usage:
 * - Set DEBUG_RAPIDAPI_CALL=true to enable logging
 * - Makes real API calls with extensive logging for analysis
 * - Use scripts/analyze-rapidapi-requests.ts for post-call analysis
 * 
 * Storage Strategy:
 * - Stores COMPLETE raw response data for full debugging visibility
 * - Also stores processed sample data for quick analysis
 * - Full response enables verification of API parameters and data structure
 */
export class RapidApiDebugLogger {
  private static logDir = path.join(process.cwd(), 'logs', 'rapidapi');
  private static currentSessionId: string | null = null;
  
  // Configuration constants
  private static readonly STORE_FULL_RESPONSE = process.env.DEBUG_RAPIDAPI_STORE_FULL !== 'false'; // Default: true
  private static readonly MAX_FULL_RESPONSE_JOBS = parseInt(process.env.DEBUG_RAPIDAPI_MAX_JOBS || '100'); // Default: 100

  static initialize() {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Generate session ID with Swedish timezone (UTC+2)
    const swedishTime = new Date(Date.now() + (2 * 60 * 60 * 1000)); // Add 2 hours
    this.currentSessionId = swedishTime.toISOString().replace(/[:.]/g, '-');
    return this.currentSessionId;
  }

  static logRequest(data: {
    userId?: string;
    sessionId?: string;
    originalParams: any;
    normalizedParams: any;
    apiUrl: string;
    headers: Record<string, string>;
    estimatedCredits: { jobs: number; requests: number };
    cacheInfo: { key: string; hit: boolean };
    endpoint: string;
    timestamp: string;
  }) {
    if (!this.currentSessionId) this.initialize();
    
    const filename = `${this.currentSessionId}-request.json`;
    const filepath = path.join(this.logDir, filename);
    
    const logData = {
      sessionId: this.currentSessionId,
      type: 'REQUEST',
      timestamp: data.timestamp,
      userId: data.userId || 'unknown',
      
      // Request parameters analysis
      parameterAnalysis: {
        originalParamsCount: Object.keys(data.originalParams).length,
        normalizedParamsCount: Object.keys(data.normalizedParams).length,
        highFidelityDefaults: this.extractHighFidelityDefaults(data.normalizedParams),
        userOverrides: this.extractUserOverrides(data.originalParams, data.normalizedParams),
        endpoint: data.endpoint,
      },
      
      // Full parameter data
      originalParameters: data.originalParams,
      normalizedParameters: data.normalizedParams,
      
      // API call details
      apiCall: {
        url: data.apiUrl,
        method: 'GET',
        headers: this.sanitizeHeaders(data.headers),
        endpoint: data.endpoint,
        estimatedCredits: data.estimatedCredits,
      },
      
      // Cache information
      cache: data.cacheInfo,
      
      // Request metadata
      metadata: {
        urlLength: data.apiUrl.length,
        parameterString: data.apiUrl.split('?')[1] || '',
        requestTimestamp: data.timestamp,
        debugMode: true,
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    
    if (process.env.DEBUG_RAPIDAPI_CALL === 'true') {
      console.log(`📝 [RapidApiDebugLogger] Request logged to: ${filepath}`);
      console.log(`🔍 Session ID: ${this.currentSessionId}`);
    }
    
    return filepath;
  }

  static logResponse(data: {
    duration: number;
    statusCode: number;
    success: boolean;
    responseHeaders: Record<string, string>;
    responseData?: any[];
    error?: any;
    cacheStored: boolean;
    dataQuality?: {
      jobCount: number;
      aiFieldsCoverage: number;
      linkedInOrgCoverage: number;
      descriptionCoverage: number;
      avgSkillsPerJob: number;
      salaryDataCoverage: number;
    };
  }) {
    if (!this.currentSessionId) this.initialize();
    
    const filename = `${this.currentSessionId}-response.json`;
    const filepath = path.join(this.logDir, filename);
    
    const logData = {
      sessionId: this.currentSessionId,
      type: 'RESPONSE',
      timestamp: new Date().toISOString(),
      
      // Response timing and status
      performance: {
        duration: data.duration,
        statusCode: data.statusCode,
        success: data.success,
      },
      
      // Rate limiting and credit information
      rateLimitInfo: this.extractRateLimitInfo(data.responseHeaders),
      
      // Response data analysis
      responseAnalysis: {
        jobCount: data.responseData?.length || 0,
        dataSize: JSON.stringify(data.responseData || {}).length,
        dataQuality: data.dataQuality,
        hasError: !!data.error,
        errorDetails: data.error ? {
          message: data.error.message,
          status: data.error.status,
          type: typeof data.error
        } : null,
      },
      
      // Cache information
      cache: {
        stored: data.cacheStored,
        timestamp: new Date().toISOString(),
      },
      
      // Raw headers (sanitized)
      responseHeaders: this.sanitizeResponseHeaders(data.responseHeaders),
      
      // Full raw response data for complete analysis (configurable)
      fullResponseData: this.STORE_FULL_RESPONSE ? 
        (data.responseData ? data.responseData.slice(0, this.MAX_FULL_RESPONSE_JOBS) : []) : 
        null,
      
      // Sample data for analysis (first 2 jobs only for file size)
      sampleData: data.responseData ? data.responseData.slice(0, 2).map(job => ({
        id: job.id,
        title: job.title,
        organization: job.organization,
        hasAiFields: !!(job.ai_key_skills || job.ai_work_arrangement || job.ai_salary_currency),
        hasLinkedInOrg: !!(job.linkedin_org_industry || job.linkedin_org_type),
        hasDescription: !!job.description_text,
        fieldCounts: {
          aiFields: Object.keys(job).filter(k => k.startsWith('ai_')).length,
          linkedInFields: Object.keys(job).filter(k => k.startsWith('linkedin_org_')).length,
          totalFields: Object.keys(job).length,
        }
      })) : [],
      
      // Debug metadata
      metadata: {
        responseTimestamp: new Date().toISOString(),
        debugMode: true,
        logFileSize: 0, // Will be updated after writing
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    
    // Update file size in metadata
    const stats = fs.statSync(filepath);
    logData.metadata.logFileSize = stats.size;
    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    
    if (process.env.DEBUG_RAPIDAPI_CALL === 'true') {
      console.log(`📝 [RapidApiDebugLogger] Response logged to: ${filepath}`);
      console.log(`📊 Jobs returned: ${data.responseData?.length || 0}, Duration: ${data.duration}ms`);
      
      if (this.STORE_FULL_RESPONSE) {
        const storedCount = Math.min(data.responseData?.length || 0, this.MAX_FULL_RESPONSE_JOBS);
        const totalCount = data.responseData?.length || 0;
        console.log(`🗄️ Full response data stored: ${storedCount}/${totalCount} complete job records`);
        
        if (totalCount > this.MAX_FULL_RESPONSE_JOBS) {
          console.log(`⚠️ Response truncated to ${this.MAX_FULL_RESPONSE_JOBS} jobs (set DEBUG_RAPIDAPI_MAX_JOBS to increase)`);
        }
      } else {
        console.log(`🗄️ Full response data storage disabled (set DEBUG_RAPIDAPI_STORE_FULL=true to enable)`);
      }
    }
    
    return filepath;
  }

  static logAnalysis(analysis: {
    sessionId: string;
    findings: string[];
    improvements: string[];
    metrics: any;
    recommendations: string[];
  }) {
    const filename = `${analysis.sessionId}-analysis.json`;
    const filepath = path.join(this.logDir, filename);
    
    const logData = {
      ...analysis,
      type: 'ANALYSIS',
      timestamp: new Date().toISOString(),
      analysisVersion: '1.0',
    };

    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    
    if (process.env.DEBUG_RAPIDAPI_CALL === 'true') {
      console.log(`📈 [RapidApiDebugLogger] Analysis saved to: ${filepath}`);
    }
    
    return filepath;
  }

  // Helper methods
  private static extractHighFidelityDefaults(params: any): string[] {
    const defaults = [];
    
    if (params.agency === 'FALSE') defaults.push('agency=FALSE (direct employers)');
    if (params.include_ai === 'true') defaults.push('include_ai=true (AI enrichment)');  
    if (params.description_type === 'text') defaults.push('description_type=text (full descriptions)');
    
    return defaults;
  }
  
  private static extractUserOverrides(original: any, normalized: any): string[] {
    const overrides = [];
    
    // Parameters that came from user input (not defaults)
    if (original.title_filter) overrides.push('title_filter');
    if (original.location_filter) overrides.push('location_filter');
    if (original.type_filter) overrides.push('type_filter');
    if (original.seniority_filter) overrides.push('seniority_filter');
    if (original.remote) overrides.push('remote');
    if (original.limit) overrides.push('limit');
    if (original.offset) overrides.push('offset');
    
    return overrides;
  }
  
  private static sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    
    // Redact API key but keep length info
    if (sanitized['x-rapidapi-key']) {
      const key = sanitized['x-rapidapi-key'];
      sanitized['x-rapidapi-key'] = `${key.substring(0, 8)}...${key.substring(key.length - 4)} (${key.length} chars)`;
    }
    
    return sanitized;
  }
  
  private static sanitizeResponseHeaders(headers: Record<string, string>): Record<string, string> {
    // Keep all response headers as-is (no sensitive data in responses)
    return { ...headers };
  }
  
  private static extractRateLimitInfo(headers: Record<string, string>) {
    return {
      jobsLimit: headers['x-ratelimit-jobs-limit'] ? parseInt(headers['x-ratelimit-jobs-limit']) : null,
      jobsRemaining: headers['x-ratelimit-jobs-remaining'] ? parseInt(headers['x-ratelimit-jobs-remaining']) : null,
      requestsLimit: headers['x-ratelimit-requests-limit'] ? parseInt(headers['x-ratelimit-requests-limit']) : null,
      requestsRemaining: headers['x-ratelimit-requests-remaining'] ? parseInt(headers['x-ratelimit-requests-remaining']) : null,
      resetSeconds: headers['x-ratelimit-jobs-reset'] ? parseInt(headers['x-ratelimit-jobs-reset']) : null,
      resetTime: headers['x-ratelimit-jobs-reset'] ? 
        new Date(Date.now() + parseInt(headers['x-ratelimit-jobs-reset']) * 1000).toISOString() : null,
    };
  }

  // Session management (following existing patterns)
  static getLatestSession(): { sessionId: string; requestFile: string; responseFile: string; analysisFile?: string } | null {
    if (!fs.existsSync(this.logDir)) {
      return null;
    }

    const files = fs.readdirSync(this.logDir);
    const requestFiles = files.filter(f => f.endsWith('-request.json')).sort().reverse();
    
    if (requestFiles.length === 0) {
      return null;
    }

    const latestRequestFile = requestFiles[0];
    const sessionId = latestRequestFile.replace('-request.json', '');
    const responseFile = `${sessionId}-response.json`;
    const analysisFile = `${sessionId}-analysis.json`;
    
    return {
      sessionId,
      requestFile: path.join(this.logDir, latestRequestFile),
      responseFile: path.join(this.logDir, responseFile),
      analysisFile: fs.existsSync(path.join(this.logDir, analysisFile)) ? 
        path.join(this.logDir, analysisFile) : undefined,
    };
  }

  static readSession(sessionId: string) {
    const requestFile = path.join(this.logDir, `${sessionId}-request.json`);
    const responseFile = path.join(this.logDir, `${sessionId}-response.json`);
    
    let requestData = null;
    let responseData = null;
    
    try {
      if (fs.existsSync(requestFile)) {
        requestData = JSON.parse(fs.readFileSync(requestFile, 'utf8'));
      }
    } catch (error) {
      console.error(`Error reading request file: ${error}`);
    }
    
    try {
      if (fs.existsSync(responseFile)) {
        responseData = JSON.parse(fs.readFileSync(responseFile, 'utf8'));
      }
    } catch (error) {
      console.error(`Error reading response file: ${error}`);
    }
    
    return {
      request: requestData,
      response: responseData,
    };
  }
}