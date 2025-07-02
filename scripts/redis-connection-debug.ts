#!/usr/bin/env tsx

/**
 * Redis Connection Debug Script
 * 
 * This script helps diagnose Redis connection issues by:
 * 1. Testing basic connectivity
 * 2. Monitoring connection stability
 * 3. Testing read/write operations
 * 4. Monitoring for ECONNRESET errors
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { setCache, getCache, getReadyRedisClient } from '../lib/redis';

interface ConnectionTestResult {
  test: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

class RedisConnectionDebugger {
  private results: ConnectionTestResult[] = [];
  private errors: Array<{ timestamp: Date; error: any }> = [];
  
  constructor() {
    // Capture unhandled Redis errors
    process.on('uncaughtException', (error) => {
      if (error.message.includes('ECONNRESET') || error.message.includes('ioredis')) {
        this.errors.push({ timestamp: new Date(), error });
        console.error('🔴 Captured uncaught Redis error:', error.message);
      }
    });
    
    process.on('unhandledRejection', (reason) => {
      if (typeof reason === 'object' && reason && 'message' in reason) {
        const message = (reason as any).message;
        if (typeof message === 'string' && (message.includes('ECONNRESET') || message.includes('ioredis'))) {
          this.errors.push({ timestamp: new Date(), error: reason });
          console.error('🔴 Captured unhandled Redis rejection:', message);
        }
      }
    });
  }

  private async runTest(testName: string, testFn: () => Promise<any>): Promise<ConnectionTestResult> {
    console.log(`🧪 Running test: ${testName}`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      const testResult: ConnectionTestResult = {
        test: testName,
        success: true,
        duration,
        details: result
      };
      
      console.log(`✅ ${testName} - Success (${duration}ms)`);
      this.results.push(testResult);
      return testResult;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      const testResult: ConnectionTestResult = {
        test: testName,
        success: false,
        duration,
        error: error.message,
        details: error
      };
      
      console.log(`❌ ${testName} - Failed (${duration}ms): ${error.message}`);
      this.results.push(testResult);
      return testResult;
    }
  }

  async testBasicConnection() {
    return this.runTest('Basic Connection', async () => {
      const client = await getReadyRedisClient();
      return {
        status: client.status,
        options: {
          host: client.options.host,
          port: client.options.port,
          db: client.options.db,
          connectTimeout: client.options.connectTimeout,
          maxRetriesPerRequest: client.options.maxRetriesPerRequest,
        }
      };
    });
  }

  async testSetCache() {
    return this.runTest('Set Cache Operation', async () => {
      const testKey = `debug_test_${Date.now()}`;
      const testValue = { message: 'Redis debug test', timestamp: new Date().toISOString() };
      
      await setCache(testKey, testValue, 60, 'SCRIPT:redis-debug:set-test');
      return { key: testKey, value: testValue };
    });
  }

  async testGetCache() {
    return this.runTest('Get Cache Operation', async () => {
      const testKey = `debug_test_${Date.now()}`;
      const testValue = { message: 'Redis debug test', timestamp: new Date().toISOString() };
      
      // First set the value
      await setCache(testKey, testValue, 60, 'SCRIPT:redis-debug:get-test-setup');
      
      // Then get it back
      const retrieved = await getCache(testKey, 'SCRIPT:redis-debug:get-test');
      
      if (!retrieved) {
        throw new Error('Failed to retrieve cached value');
      }
      
      return { 
        original: testValue, 
        retrieved,
        match: JSON.stringify(testValue) === JSON.stringify(retrieved)
      };
    });
  }

  async testMultipleOperations() {
    return this.runTest('Multiple Rapid Operations', async () => {
      const operations = [];
      const baseKey = `rapid_test_${Date.now()}`;
      
      // Perform 10 rapid operations
      for (let i = 0; i < 10; i++) {
        const key = `${baseKey}_${i}`;
        const value = { index: i, timestamp: Date.now() };
        
        operations.push(
          setCache(key, value, 30, `SCRIPT:redis-debug:rapid-test-${i}`)
            .then(() => getCache(key, `SCRIPT:redis-debug:rapid-get-${i}`))
        );
      }
      
      const results = await Promise.all(operations);
      return {
        operationsCount: operations.length,
        successCount: results.filter(r => r !== null).length,
        results
      };
    });
  }

  async testConnectionStability(durationMs: number = 30000) {
    return this.runTest('Connection Stability Test', async () => {
      const startTime = Date.now();
      const endTime = startTime + durationMs;
      let operationCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      console.log(`📊 Running stability test for ${durationMs}ms...`);
      
      while (Date.now() < endTime) {
        try {
          const key = `stability_test_${operationCount}`;
          const value = { index: operationCount, timestamp: Date.now() };
          
          await setCache(key, value, 10, 'SCRIPT:redis-debug:stability-test');
          await getCache(key, 'SCRIPT:redis-debug:stability-test');
          
          operationCount++;
          
          // Brief pause between operations
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error: any) {
          errorCount++;
          errors.push(error.message);
          console.log(`⚠️  Operation ${operationCount} failed: ${error.message}`);
        }
      }
      
      return {
        duration: Date.now() - startTime,
        totalOperations: operationCount,
        errorCount,
        successRate: ((operationCount - errorCount) / operationCount * 100).toFixed(2) + '%',
        errors: errors.slice(-5) // Last 5 errors
      };
    });
  }

  async testEnvironmentVariables() {
    return this.runTest('Environment Variables', async () => {
      return {
        REDIS_URL: process.env.REDIS_URL ? 'Set' : 'Not set',
        REDIS_HOST: process.env.REDIS_HOST || 'Not set',
        REDIS_PORT: process.env.REDIS_PORT || 'Not set',
        REDIS_PASSWORD: process.env.REDIS_PASSWORD ? 'Set' : 'Not set',
        REDIS_USE_TLS: process.env.REDIS_USE_TLS || 'Not set',
        REDIS_TLS_STRICT: process.env.REDIS_TLS_STRICT || 'Not set',
        DISABLE_REDIS_CACHE: process.env.DISABLE_REDIS_CACHE || 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
      };
    });
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 REDIS CONNECTION DEBUG REPORT');
    console.log('='.repeat(60));
    
    console.log('\n📋 Test Results:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.duration}ms`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('\n📊 Summary:');
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (this.errors.length > 0) {
      console.log('\n🔴 Captured Errors:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.timestamp.toISOString()}] ${error.error.message}`);
      });
    }
    
    console.log('\n💡 Recommendations:');
    
    if (failedTests > 0) {
      console.log('   • Check Redis server status and accessibility');
      console.log('   • Verify environment variables are correctly set');
      console.log('   • Check network connectivity to Redis instance');
      
      if (this.errors.some(e => e.error.message.includes('ECONNRESET'))) {
        console.log('   • ECONNRESET detected - possible network instability or Redis timeout');
        console.log('   • Consider increasing connection timeout values');
        console.log('   • Check if Redis instance is behind a load balancer or proxy');
      }
    } else {
      console.log('   • All tests passed! Redis connection appears stable');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

async function main() {
  console.log('🚀 Starting Redis Connection Debug Script...\n');
  
  const redisDebugger = new RedisConnectionDebugger();
  
  // Run all tests
  await redisDebugger.testEnvironmentVariables();
  await redisDebugger.testBasicConnection();
  await redisDebugger.testSetCache();
  await redisDebugger.testGetCache();
  await redisDebugger.testMultipleOperations();
  
  // Run stability test (10 seconds by default, can be increased)
  await redisDebugger.testConnectionStability(10000);
  
  // Generate final report
  redisDebugger.generateReport();
  
  process.exit(0);
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n⏹️  Script interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Script terminated');
  process.exit(0);
});

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 