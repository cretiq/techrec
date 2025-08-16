import { NextResponse } from 'next/server';

/**
 * Debug API endpoint to check server-side environment variables
 * Access at: https://your-domain.vercel.app/api/debug-env
 */
export async function GET() {
  try {
    // Server-side environment variables
    const serverEnvVars = {
      // MVP Configuration
      'NEXT_PUBLIC_ENABLE_MVP_MODE': process.env.NEXT_PUBLIC_ENABLE_MVP_MODE,
      'MVP_INITIAL_POINTS': process.env.MVP_INITIAL_POINTS,
      'MVP_POINTS_PER_RESULT': process.env.MVP_POINTS_PER_RESULT,
      'MVP_WARNING_THRESHOLD': process.env.MVP_WARNING_THRESHOLD,
      'MVP_CRITICAL_THRESHOLD': process.env.MVP_CRITICAL_THRESHOLD,
      
      // General Environment
      'NODE_ENV': process.env.NODE_ENV,
      'VERCEL': process.env.VERCEL,
      'VERCEL_ENV': process.env.VERCEL_ENV,
      
      // Check if feature flags are working
      'featureFlags_available': true,
    };

    // Import feature flags to test
    let featureFlagsResult;
    try {
      const { isInMvpMode, featureFlags, logFeatureFlags } = await import('@/utils/featureFlags');
      
      // Test the actual functions
      featureFlagsResult = {
        isInMvpMode: isInMvpMode(),
        featureFlags: featureFlags,
      };
      
      // Log for server-side debugging
      console.log('🔍 [DEBUG-ENV-API] Server-side environment check:');
      console.log('NEXT_PUBLIC_ENABLE_MVP_MODE:', process.env.NEXT_PUBLIC_ENABLE_MVP_MODE);
      console.log('isInMvpMode():', isInMvpMode());
      console.log('featureFlags:', featureFlags);
      logFeatureFlags();
      
    } catch (error) {
      console.error('❌ [DEBUG-ENV-API] Error testing feature flags:', error);
      featureFlagsResult = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    const debugData = {
      timestamp: new Date().toISOString(),
      environment: {
        server: 'vercel',
        runtime: 'nodejs',
        vercel_env: process.env.VERCEL_ENV,
      },
      environmentVariables: serverEnvVars,
      featureFlags: featureFlagsResult,
      status: {
        mvpModeEnabled: process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true',
        hasRequiredVars: !!(
          process.env.NEXT_PUBLIC_ENABLE_MVP_MODE &&
          process.env.MVP_INITIAL_POINTS &&
          process.env.MVP_POINTS_PER_RESULT
        ),
      },
      troubleshooting: {
        nextPublicVarMissing: !process.env.NEXT_PUBLIC_ENABLE_MVP_MODE,
        suggestions: [
          'Check Vercel environment variables are set for Production',
          'Trigger new deployment to rebuild with environment variables',
          'Verify NEXT_PUBLIC_ variables were available at build time',
          'Check environment scope (Production vs Preview)',
        ],
      },
    };

    return NextResponse.json(debugData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('❌ [DEBUG-ENV-API] Error in debug endpoint:', error);
    
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, 
      { status: 500 }
    );
  }
}