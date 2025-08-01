/**
 * CV Flow Health Check Endpoint
 * 
 * Provides real-time health status of the CV processing pipeline
 * Use this for monitoring and alerting
 */

import { NextRequest, NextResponse } from 'next/server';
import { cvFlowMonitor, validateDataIntegrity } from '@/utils/cvFlowMonitor';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeWindow = parseInt(searchParams.get('timeWindow') || '3600000'); // 1 hour default
    const includeDetails = searchParams.get('details') === 'true';
    
    // Get flow statistics
    const stats = cvFlowMonitor.getFlowStats(timeWindow);
    
    // Check recent CVs for data integrity
    const recentCVs = await prisma.cv.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - timeWindow)
        },
        status: 'COMPLETED'
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    let dataIntegrityIssues: string[] = [];
    
    if (includeDetails && recentCVs.length > 0) {
      // Check data integrity for recent CVs
      for (const cv of recentCVs.slice(0, 3)) { // Check latest 3
        const integrity = await validateDataIntegrity(cv.id, cv.developerId);
        if (!integrity.isValid) {
          dataIntegrityIssues.push(`CV ${cv.id.slice(-8)}: ${integrity.issues.join(', ')}`);
        }
      }
    }
    
    // Determine overall health
    const successRate = stats.totalFlows > 0 ? 
      (stats.successfulFlows / stats.totalFlows) * 100 : 100;
    
    const isHealthy = successRate >= 95 && dataIntegrityIssues.length === 0;
    
    const healthStatus = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      metrics: {
        successRate: Math.round(successRate * 100) / 100,
        totalFlows: stats.totalFlows,
        successfulFlows: stats.successfulFlows,
        failedFlows: stats.failedFlows,
        timeWindowMs: timeWindow
      },
      issues: [
        ...stats.commonFailures.map(f => `Common failure: ${f}`),
        ...dataIntegrityIssues
      ],
      recentActivity: {
        completedCVs: recentCVs.length,
        latestCV: recentCVs[0] ? {
          id: recentCVs[0].id.slice(-8),
          uploadedAt: recentCVs[0].createdAt,
          developerId: recentCVs[0].developerId.slice(-8)
        } : null
      }
    };
    
    console.log('🏥 [CV-FLOW-HEALTH]', {
      status: healthStatus.status,
      successRate: healthStatus.metrics.successRate,
      totalFlows: healthStatus.metrics.totalFlows,
      issuesCount: healthStatus.issues.length
    });
    
    return NextResponse.json(healthStatus, {
      status: isHealthy ? 200 : 503 // Service Unavailable if unhealthy
    });
    
  } catch (error) {
    console.error('🚨 [CV-FLOW-HEALTH] Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}