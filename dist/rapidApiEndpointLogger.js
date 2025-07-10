// Debug logging infrastructure for RapidAPI Endpoint Selection Feature
// FR #4: Multiple RapidAPI Endpoint Selection Implementation
/**
 * Centralized debug logging for RapidAPI Endpoint Selection feature
 * Only logs in development mode or when explicitly enabled
 */
export class RapidApiEndpointLogger {
    static isDebugEnabled() {
        return process.env.NODE_ENV === 'development' ||
            process.env.RAPIDAPI_ENDPOINT_DEBUG === 'true';
    }
    static log(level, context, data) {
        if (!this.isDebugEnabled())
            return;
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            context: `[RapidAPI-Endpoint-FR4] ${context}`,
            data,
            stackTrace: level === 'error' ? new Error().stack : undefined
        };
        switch (level) {
            case 'error':
                console.error(`🚨 ${logEntry.context}`, logEntry);
                break;
            case 'warn':
                console.warn(`⚠️ ${logEntry.context}`, logEntry);
                break;
            default:
                console.log(`ℹ️ ${logEntry.context}`, logEntry);
        }
    }
    /**
     * Log endpoint selection and premium detection
     */
    static logEndpointSelection(context) {
        this.log('info', 'Endpoint Selection', {
            endpoint: context.endpoint,
            isPremium: context.isPremium,
            userId: context.userId?.substring(0, 8) + '...',
            subscriptionTier: context.subscriptionTier,
            pointsBalance: context.pointsBalance,
            requestId: context.requestId,
            message: `User selected ${context.endpoint} endpoint (premium: ${context.isPremium})`
        });
    }
    /**
     * Log premium feature validation process
     */
    static logPremiumValidation(context) {
        const level = context.validationResult === 'success' ? 'info' : 'warn';
        this.log(level, 'Premium Validation', {
            userId: context.userId.substring(0, 8) + '...',
            endpoint: context.endpoint,
            subscriptionTier: context.subscriptionTier,
            pointsAvailable: context.pointsAvailable,
            pointsRequired: context.pointsRequired,
            validationResult: context.validationResult,
            error: context.error,
            message: `Premium validation ${context.validationResult} for ${context.endpoint}`
        });
    }
    /**
     * Log points deduction transaction
     */
    static logPointsDeduction(context) {
        const level = context.success ? 'info' : 'error';
        this.log(level, 'Points Deduction', {
            userId: context.userId.substring(0, 8) + '...',
            pointsBefore: context.pointsBefore,
            pointsAfter: context.pointsAfter,
            pointsDeducted: context.pointsDeducted,
            transactionId: context.transactionId,
            success: context.success,
            error: context.error,
            message: `Points deduction ${context.success ? 'successful' : 'failed'}: ${context.pointsDeducted} points`
        });
    }
    /**
     * Log API endpoint construction and call
     */
    static logApiCall(context) {
        const level = context.success ? 'info' : 'error';
        this.log(level, 'API Call', {
            endpoint: context.endpoint,
            originalUrl: context.originalUrl,
            constructedUrl: context.constructedUrl,
            parameters: context.parameters,
            success: context.success,
            responseStatus: context.responseStatus,
            responseTime: context.responseTime,
            error: context.error,
            message: `API call to ${context.endpoint} ${context.success ? 'successful' : 'failed'}`
        });
    }
    /**
     * Log database enum validation
     */
    static logEnumValidation(enumName, value, isValid) {
        const level = isValid ? 'info' : 'error';
        this.log(level, 'Enum Validation', {
            enumName,
            value,
            isValid,
            message: `Enum validation for ${enumName}.${value}: ${isValid ? 'valid' : 'invalid'}`
        });
    }
    /**
     * Log configuration system interactions
     */
    static logConfigAccess(configKey, success, value, error) {
        const level = success ? 'info' : 'error';
        this.log(level, 'Config Access', {
            configKey,
            success,
            value: success ? value : undefined,
            error,
            message: `Config access for ${configKey}: ${success ? 'successful' : 'failed'}`
        });
    }
    /**
     * Log cache operations with endpoint awareness
     */
    static logCacheOperation(operation, cacheKey, endpoint) {
        this.log('info', 'Cache Operation', {
            operation,
            cacheKey: cacheKey.substring(0, 20) + '...',
            endpoint,
            message: `Cache ${operation} for endpoint ${endpoint || 'unknown'}`
        });
    }
    /**
     * Log development mode vs production mode behavior
     */
    static logModeDetection(isDevelopment, hasApiKey, forceDevMode) {
        this.log('warn', 'Mode Detection', {
            isDevelopment,
            hasApiKey,
            forceDevMode,
            message: `Running in ${isDevelopment || forceDevMode ? 'DEVELOPMENT' : 'PRODUCTION'} mode`
        });
    }
    /**
     * Log comprehensive error context for troubleshooting
     */
    static logError(context, error, additionalData) {
        this.log('error', context, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            additionalData,
            message: `Error in ${context}`
        });
    }
    /**
     * Generate request ID for tracing across the system
     */
    static generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
/**
 * Type guard for validating endpoint parameter
 */
export function isValidEndpoint(endpoint) {
    const validEndpoints = ['7d', '24h', '1h'];
    return typeof endpoint === 'string' && validEndpoints.includes(endpoint);
}
/**
 * Type guard for checking if endpoint is premium
 */
export function isPremiumEndpoint(endpoint) {
    return endpoint === '24h' || endpoint === '1h';
}
/**
 * Validation function for subscription tier eligibility
 */
export function isEligibleSubscriptionTier(tier) {
    const eligibleTiers = ['STARTER', 'PRO', 'EXPERT'];
    return eligibleTiers.includes(tier);
}
