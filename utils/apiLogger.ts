// Comprehensive API Logging Infrastructure
// Debug logging for external API calls with structured data and monitoring

// Redis imports will be handled dynamically for server-side only

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

// API service types
export enum APIService {
  GITHUB = 'GITHUB',
  GEMINI = 'GEMINI',
  REDIS = 'REDIS',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN'
}

// Log entry structure
export interface APILogEntry {
  timestamp: number;
  requestId: string;
  service: APIService;
  operation: string;
  level: LogLevel;
  message: string;
  duration?: number;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
  };
  response?: {
    status?: number;
    headers?: Record<string, string>;
    body?: any;
  };
}

// Logger configuration
interface LoggerConfig {
  enabled: boolean;
  logLevel: LogLevel;
  includeStackTrace: boolean;
  maxLogEntries: number;
  flushInterval: number; // ms
  redisEnabled: boolean;
  consoleEnabled: boolean;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  enabled: process.env.NODE_ENV === 'development' || process.env.DEBUG_API_LOGGER === 'true',
  logLevel: LogLevel.INFO,
  includeStackTrace: process.env.NODE_ENV === 'development',
  maxLogEntries: 1000,
  flushInterval: 30000, // 30 seconds
  redisEnabled: true,
  consoleEnabled: true
};

/**
 * API Logger Class
 */
export class APILogger {
  private config: LoggerConfig;
  private logBuffer: APILogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private static instance: APILogger;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupFlushTimer();
  }

  static getInstance(): APILogger {
    if (!APILogger.instance) {
      APILogger.instance = new APILogger();
    }
    return APILogger.instance;
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Check if log level should be recorded
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentIndex = levels.indexOf(this.config.logLevel);
    const logIndex = levels.indexOf(level);
    
    return logIndex >= currentIndex;
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    service: APIService,
    operation: string,
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): APILogEntry {
    const entry: APILogEntry = {
      timestamp: Date.now(),
      requestId: this.generateRequestId(),
      service,
      operation,
      level,
      message,
      metadata
    };

    // Add stack trace for errors if enabled
    if (this.config.includeStackTrace && (level === LogLevel.ERROR || level === LogLevel.FATAL)) {
      const error = new Error();
      entry.error = {
        name: 'LogTrace',
        message: 'Stack trace for debugging',
        stack: error.stack
      };
    }

    return entry;
  }

  /**
   * Log a message
   */
  log(
    service: APIService,
    operation: string,
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): string {
    if (!this.shouldLog(level)) return '';

    const entry = this.createLogEntry(service, operation, level, message, metadata);
    
    // Add to buffer
    this.logBuffer.push(entry);
    
    // Console logging
    if (this.config.consoleEnabled) {
      this.logToConsole(entry);
    }

    // Flush if buffer is full
    if (this.logBuffer.length >= this.config.maxLogEntries) {
      this.flush();
    }

    return entry.requestId;
  }

  /**
   * Log to console with formatted output
   */
  private logToConsole(entry: APILogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.service}:${entry.operation}] [${entry.level}]`;
    
    const message = `${prefix} ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.metadata);
        break;
      case LogLevel.INFO:
        console.info(message, entry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.metadata);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.metadata, entry.error);
        break;
    }
  }

  /**
   * Setup flush timer
   */
  private setupFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Flush logs to Redis
   */
  async flush(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.config.redisEnabled) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Only cache logs on server-side
      if (typeof window === 'undefined') {
        try {
          const { setCache } = await import('@/lib/redis');
          const cacheKey = `api-logs:${Date.now()}`;
          await setCache(cacheKey, logsToFlush, 3600); // 1 hour TTL
          
          if (this.config.consoleEnabled) {
            console.info(`[APILogger] Flushed ${logsToFlush.length} log entries to Redis`);
          }
        } catch (redisError) {
          if (this.config.consoleEnabled) {
            console.warn('[APILogger] Failed to cache logs to Redis:', redisError);
          }
        }
      }
    } catch (error) {
      if (this.config.consoleEnabled) {
        console.error('[APILogger] Failed to flush logs to Redis:', error);
      }
      // Re-add logs to buffer
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  /**
   * API Call Tracer - tracks complete API call lifecycle
   */
  async traceAPICall<T>(
    service: APIService,
    operation: string,
    apiCall: () => Promise<T>,
    options: {
      includeRequest?: boolean;
      includeResponse?: boolean;
      requestData?: any;
      timeout?: number;
    } = {}
  ): Promise<{
    success: boolean;
    data?: T;
    error?: Error;
    requestId: string;
    duration: number;
  }> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    // Log start
    this.log(service, operation, LogLevel.INFO, `API call started`, {
      requestId,
      requestData: options.includeRequest ? options.requestData : undefined,
      timeout: options.timeout
    });

    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;

      // Log success
      this.log(service, operation, LogLevel.INFO, `API call completed successfully`, {
        requestId,
        duration,
        responseData: options.includeResponse ? result : undefined
      });

      return {
        success: true,
        data: result,
        requestId,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const apiError = error as Error;

      // Log error
      this.log(service, operation, LogLevel.ERROR, `API call failed: ${apiError.message}`, {
        requestId,
        duration,
        error: {
          name: apiError.name,
          message: apiError.message,
          stack: this.config.includeStackTrace ? apiError.stack : undefined
        }
      });

      return {
        success: false,
        error: apiError,
        requestId,
        duration
      };
    }
  }

  /**
   * Get recent logs (for debugging)
   */
  getRecentLogs(count: number = 50): APILogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Get logs by service
   */
  getLogsByService(service: APIService, count: number = 50): APILogEntry[] {
    return this.logBuffer
      .filter(entry => entry.service === service)
      .slice(-count);
  }

  /**
   * Get error logs
   */
  getErrorLogs(count: number = 50): APILogEntry[] {
    return this.logBuffer
      .filter(entry => entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL)
      .slice(-count);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logBuffer = [];
    if (this.config.consoleEnabled) {
      console.info('[APILogger] Log buffer cleared');
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupFlushTimer();
  }

  /**
   * Destroy logger
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Global logger instance
export const apiLogger = APILogger.getInstance();

// Convenience functions
export const logGitHubAPI = (operation: string, level: LogLevel, message: string, metadata?: Record<string, any>) => {
  return apiLogger.log(APIService.GITHUB, operation, level, message, metadata);
};

export const logGeminiAPI = (operation: string, level: LogLevel, message: string, metadata?: Record<string, any>) => {
  return apiLogger.log(APIService.GEMINI, operation, level, message, metadata);
};

export const logRedisAPI = (operation: string, level: LogLevel, message: string, metadata?: Record<string, any>) => {
  return apiLogger.log(APIService.REDIS, operation, level, message, metadata);
};

export const logDatabaseAPI = (operation: string, level: LogLevel, message: string, metadata?: Record<string, any>) => {
  return apiLogger.log(APIService.DATABASE, operation, level, message, metadata);
};

// API call tracers
export const traceGitHubCall = <T>(
  operation: string,
  apiCall: () => Promise<T>,
  options?: { includeRequest?: boolean; includeResponse?: boolean; requestData?: any; timeout?: number }
) => {
  return apiLogger.traceAPICall(APIService.GITHUB, operation, apiCall, options);
};

export const traceGeminiCall = <T>(
  operation: string,
  apiCall: () => Promise<T>,
  options?: { includeRequest?: boolean; includeResponse?: boolean; requestData?: any; timeout?: number }
) => {
  return apiLogger.traceAPICall(APIService.GEMINI, operation, apiCall, options);
};

// Health check for logger
export const getAPILoggerHealth = () => {
  const recentLogs = apiLogger.getRecentLogs(100);
  const errorLogs = apiLogger.getErrorLogs(50);
  
  return {
    enabled: DEFAULT_CONFIG.enabled,
    bufferSize: recentLogs.length,
    errorCount: errorLogs.length,
    lastLogTime: recentLogs.length > 0 ? recentLogs[recentLogs.length - 1].timestamp : null,
    services: {
      github: recentLogs.filter(log => log.service === APIService.GITHUB).length,
      gemini: recentLogs.filter(log => log.service === APIService.GEMINI).length,
      redis: recentLogs.filter(log => log.service === APIService.REDIS).length,
      database: recentLogs.filter(log => log.service === APIService.DATABASE).length
    }
  };
};