/**
 * CV Flow Monitoring & Health Checks
 * 
 * Monitors the critical CV upload → analysis → storage pipeline
 * to detect issues before they affect users
 */

interface CVFlowCheckpoint {
  timestamp: number;
  cvId: string;
  developerId: string;
  checkpoint: string;
  success: boolean;
  data?: any;
  error?: string;
}

interface CVFlowHealth {
  isHealthy: boolean;
  issues: string[];
  metrics: {
    uploadSuccess: boolean;
    s3Success: boolean;
    parsingSuccess: boolean;
    geminiSuccess: boolean;
    profileSyncSuccess: boolean;
    totalDuration: number;
  };
}

export class CVFlowMonitor {
  private checkpoints: CVFlowCheckpoint[] = [];
  private readonly MAX_CHECKPOINTS = 100;
  
  /**
   * Log a checkpoint in the CV flow
   */
  logCheckpoint(
    cvId: string, 
    developerId: string, 
    checkpoint: string, 
    success: boolean, 
    data?: any, 
    error?: string
  ) {
    const checkpointData: CVFlowCheckpoint = {
      timestamp: Date.now(),
      cvId,
      developerId,
      checkpoint,
      success,
      data,
      error
    };
    
    this.checkpoints.push(checkpointData);
    
    // Keep only recent checkpoints
    if (this.checkpoints.length > this.MAX_CHECKPOINTS) {
      this.checkpoints.shift();
    }
    
    // Log critical failures immediately
    if (!success) {
      console.error(`🚨 [CV-FLOW-MONITOR] FAILURE at ${checkpoint}:`, {
        cvId,
        developerId,
        error,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`📋 [CV-FLOW-MONITOR] ${checkpoint}: ${success ? '✅' : '❌'}`, {
      cvId: cvId.slice(-8),
      checkpoint,
      duration: data?.duration
    });
  }
  
  /**
   * Validate complete CV flow health
   */
  validateFlowHealth(cvId: string): CVFlowHealth {
    const cvCheckpoints = this.checkpoints.filter(c => c.cvId === cvId);
    const issues: string[] = [];
    
    // Required checkpoints in order
    const requiredCheckpoints = [
      'FILE_UPLOAD',
      'S3_STORAGE', 
      'PDF_PARSING',
      'GEMINI_ANALYSIS',
      'PROFILE_SYNC',
      'CV_STATUS_UPDATE'
    ];
    
    const metrics = {
      uploadSuccess: false,
      s3Success: false,
      parsingSuccess: false,
      geminiSuccess: false,
      profileSyncSuccess: false,
      totalDuration: 0
    };
    
    // Check each required checkpoint
    requiredCheckpoints.forEach(checkpoint => {
      const checkpointData = cvCheckpoints.find(c => c.checkpoint === checkpoint);
      
      if (!checkpointData) {
        issues.push(`Missing checkpoint: ${checkpoint}`);
      } else if (!checkpointData.success) {
        issues.push(`Failed checkpoint: ${checkpoint} - ${checkpointData.error}`);
      } else {
        // Update metrics
        switch (checkpoint) {
          case 'FILE_UPLOAD':
            metrics.uploadSuccess = true;
            break;
          case 'S3_STORAGE':
            metrics.s3Success = true;
            break;
          case 'PDF_PARSING':
            metrics.parsingSuccess = true;
            break;
          case 'GEMINI_ANALYSIS':
            metrics.geminiSuccess = true;
            break;
          case 'PROFILE_SYNC':
            metrics.profileSyncSuccess = true;
            break;
        }
      }
    });
    
    // Calculate total duration
    if (cvCheckpoints.length > 0) {
      const firstCheckpoint = cvCheckpoints[0];
      const lastCheckpoint = cvCheckpoints[cvCheckpoints.length - 1];
      metrics.totalDuration = lastCheckpoint.timestamp - firstCheckpoint.timestamp;
    }
    
    return {
      isHealthy: issues.length === 0,
      issues,
      metrics
    };
  }
  
  /**
   * Get recent flow statistics
   */
  getFlowStats(timeWindowMs: number = 3600000): {
    totalFlows: number;
    successfulFlows: number;
    failedFlows: number;
    averageDuration: number;
    commonFailures: string[];
  } {
    const cutoff = Date.now() - timeWindowMs;
    const recentCheckpoints = this.checkpoints.filter(c => c.timestamp > cutoff);
    
    const flowIds = [...new Set(recentCheckpoints.map(c => c.cvId))];
    const successfulFlows = flowIds.filter(id => {
      const health = this.validateFlowHealth(id);
      return health.isHealthy;
    });
    
    const failures = recentCheckpoints
      .filter(c => !c.success)
      .map(c => c.checkpoint);
    
    const failureCounts = failures.reduce((acc, failure) => {
      acc[failure] = (acc[failure] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const commonFailures = Object.entries(failureCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([failure, count]) => `${failure} (${count}x)`);
    
    return {
      totalFlows: flowIds.length,
      successfulFlows: successfulFlows.length,
      failedFlows: flowIds.length - successfulFlows.length,
      averageDuration: 0, // TODO: Calculate from successful flows
      commonFailures
    };
  }
}

// Singleton instance
export const cvFlowMonitor = new CVFlowMonitor();

/**
 * Health check middleware for CV endpoints
 */
export const withCVFlowMonitoring = (
  handler: any,
  checkpointName: string
) => {
  return async (req: any, res: any) => {
    const startTime = Date.now();
    let cvId: string | undefined;
    let developerId: string | undefined;
    
    try {
      // Extract identifiers from request
      cvId = req.body?.cvId || req.query?.cvId || req.params?.id;
      developerId = req.session?.user?.id;
      
      const result = await handler(req, res);
      
      // Log successful checkpoint
      if (cvId && developerId) {
        cvFlowMonitor.logCheckpoint(
          cvId,
          developerId,
          checkpointName,
          true,
          { duration: Date.now() - startTime }
        );
      }
      
      return result;
      
    } catch (error) {
      // Log failed checkpoint
      if (cvId && developerId) {
        cvFlowMonitor.logCheckpoint(
          cvId,
          developerId,
          checkpointName,
          false,
          { duration: Date.now() - startTime },
          error instanceof Error ? error.message : String(error)
        );
      }
      
      throw error;
    }
  };
};

/**
 * Data integrity validator
 */
export const validateDataIntegrity = async (cvId: string, developerId: string): Promise<{
  isValid: boolean;
  issues: string[];
}> => {
  const issues: string[] = [];
  
  try {
    // Check CV record exists and is COMPLETED
    const cv = await prisma.cv.findUnique({
      where: { id: cvId }
    });
    
    if (!cv) {
      issues.push('CV record not found');
      return { isValid: false, issues };
    }
    
    if (cv.status !== 'COMPLETED') {
      issues.push(`CV status is ${cv.status}, expected COMPLETED`);
    }
    
    if (!cv.extractedText) {
      issues.push('CV missing extracted text');
    }
    
    if (!cv.improvementScore) {
      issues.push('CV missing improvement score');
    }
    
    // Check profile data exists
    const profile = await prisma.developer.findUnique({
      where: { id: developerId },
      include: {
        experience: true,
        skills: true,
        education: true,
        achievements: true
      }
    });
    
    if (!profile) {
      issues.push('Developer profile not found');
      return { isValid: false, issues };
    }
    
    // Validate experience data has new fields
    if (profile.experience.length === 0) {
      issues.push('No experience data found in profile');
    } else {
      const expWithNewFields = profile.experience.filter(exp => 
        exp.responsibilities && exp.responsibilities.length > 0 ||
        exp.achievements && exp.achievements.length > 0 ||
        exp.techStack && exp.techStack.length > 0
      );
      
      if (expWithNewFields.length === 0) {
        issues.push('Experience entries missing new fields (responsibilities, achievements, techStack)');
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
    
  } catch (error) {
    issues.push(`Data integrity check failed: ${error}`);
    return { isValid: false, issues };
  }
};