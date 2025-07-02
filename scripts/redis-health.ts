#!/usr/bin/env npx tsx

/**
 * Redis Health Check Script
 * 
 * This script performs a comprehensive health check of the Redis connection
 * and reports the circuit breaker status. Can be used for monitoring and CI.
 * 
 * Usage:
 *   npx tsx scripts/redis-health.ts
 *   node -r ts-node/register scripts/redis-health.ts
 * 
 * Exit codes:
 *   0 - Redis is healthy
 *   1 - Redis is unhealthy or disabled
 *   2 - Script error
 */

import { checkRedisHealth, getCircuitBreakerStatus } from '../lib/redis';

interface HealthCheckResult {
  timestamp: string;
  isHealthy: boolean;
  cacheDisabled: boolean;
  circuitBreaker: {
    isOpen: boolean;
    failures: number;
    lastFailureTime: number;
    nextHealthCheck: number;
  };
  environment: {
    nodeEnv: string;
    redisUrl: string | undefined;
    useRedisCache: boolean;
  };
}

async function performHealthCheck(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();
  const cacheDisabled = process.env.DISABLE_REDIS_CACHE === 'true';
  
  let isHealthy = false;
  try {
    isHealthy = await checkRedisHealth();
  } catch (error) {
    console.error('Health check failed with error:', error);
    isHealthy = false;
  }

  const circuitBreaker = getCircuitBreakerStatus();
  
  return {
    timestamp,
    isHealthy,
    cacheDisabled,
    circuitBreaker,
    environment: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured',
      useRedisCache: !cacheDisabled,
    },
  };
}

function formatHealthReport(result: HealthCheckResult): string {
  const { isHealthy, cacheDisabled, circuitBreaker, environment } = result;
  
  let report = `\n🔍 Redis Health Check Report - ${result.timestamp}\n`;
  report += `═══════════════════════════════════════════════════\n\n`;
  
  // Overall status
  if (cacheDisabled) {
    report += `🔕 Cache Status: DISABLED\n`;
    report += `   Redis caching is disabled via DISABLE_REDIS_CACHE=true\n\n`;
  } else if (isHealthy) {
    report += `✅ Cache Status: HEALTHY\n`;
    report += `   Redis is connected and responding to ping\n\n`;
  } else {
    report += `❌ Cache Status: UNHEALTHY\n`;
    report += `   Redis connection failed or circuit breaker is open\n\n`;
  }
  
  // Circuit breaker status
  report += `🔧 Circuit Breaker Status:\n`;
  if (circuitBreaker.isOpen) {
    const nextCheck = new Date(circuitBreaker.nextHealthCheck).toISOString();
    report += `   ❌ State: OPEN (blocking connections)\n`;
    report += `   💥 Failures: ${circuitBreaker.failures}\n`;
    report += `   ⏰ Next health check: ${nextCheck}\n`;
  } else {
    report += `   ✅ State: CLOSED (allowing connections)\n`;
    report += `   💥 Recent failures: ${circuitBreaker.failures}\n`;
  }
  
  if (circuitBreaker.lastFailureTime > 0) {
    const lastFailure = new Date(circuitBreaker.lastFailureTime).toISOString();
    report += `   🕐 Last failure: ${lastFailure}\n`;
  }
  
  report += `\n`;
  
  // Environment info
  report += `🌍 Environment:\n`;
  report += `   Node.js ENV: ${environment.nodeEnv}\n`;
  report += `   Redis URL: ${environment.redisUrl}\n`;
  report += `   Cache enabled: ${environment.useRedisCache ? 'Yes' : 'No'}\n\n`;
  
  // Recommendations
  if (!isHealthy && !cacheDisabled) {
    report += `🔧 Troubleshooting:\n`;
    if (circuitBreaker.isOpen) {
      report += `   • Circuit breaker is open - wait for automatic retry\n`;
      report += `   • Check Redis server connectivity and TLS configuration\n`;
    }
    report += `   • Verify REDIS_URL and TLS settings\n`;
    report += `   • Check network connectivity to Redis server\n`;
    report += `   • Review server logs for connection errors\n\n`;
  }
  
  return report;
}

async function main() {
  try {
    console.log('Starting Redis health check...');
    
    const result = await performHealthCheck();
    const report = formatHealthReport(result);
    
    console.log(report);
    
    // Output JSON for programmatic consumption if requested
    if (process.argv.includes('--json')) {
      console.log('JSON Output:');
      console.log(JSON.stringify(result, null, 2));
    }
    
    // Exit with appropriate code
    if (result.cacheDisabled) {
      console.log('🔕 Exiting with code 0 (cache disabled)');
      process.exit(0);
    } else if (result.isHealthy) {
      console.log('✅ Exiting with code 0 (healthy)');
      process.exit(0);
    } else {
      console.log('❌ Exiting with code 1 (unhealthy)');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Health check script failed:', error);
    process.exit(2);
  }
}

// Run if called directly (ES module compatible check)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { performHealthCheck, formatHealthReport };