/**
 * Centralized logging utility for authentication operations
 * Provides consistent logging patterns across auth-related endpoints
 */

interface LogContext {
  userId?: string;
  operation?: string;
  timestamp?: string;
  duration?: number;
  [key: string]: unknown;
}

class AuthLogger {
  private static readonly PREFIX = '[Auth]';
  
  static info(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${this.PREFIX} ${message}`, context ? this.formatContext(context) : '');
    }
  }
  
  static warn(message: string, context?: LogContext) {
    console.warn(`${this.PREFIX} ${message}`, context ? this.formatContext(context) : '');
  }
  
  static error(message: string, error?: unknown, context?: LogContext) {
    console.error(`${this.PREFIX} ${message}`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context
    });
  }
  
  static success(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${this.PREFIX} ✅ ${message}`, context ? this.formatContext(context) : '');
    }
  }
  
  private static formatContext(context: LogContext): LogContext {
    return {
      timestamp: new Date().toISOString(),
      ...context
    };
  }
}

export { AuthLogger };