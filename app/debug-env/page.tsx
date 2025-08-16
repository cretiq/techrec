'use client';

import { useEffect, useState } from 'react';

/**
 * Debug page to verify environment variables in production
 * Access at: https://your-domain.vercel.app/debug-env
 */
export default function DebugEnvPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    // Client-side environment variables
    const clientEnvVars = {
      'NEXT_PUBLIC_ENABLE_MVP_MODE': process.env.NEXT_PUBLIC_ENABLE_MVP_MODE,
      'NODE_ENV': process.env.NODE_ENV,
      // Check if any other NEXT_PUBLIC_ vars exist
      ...(typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.props?.pageProps?.env || {} : {})
    };

    setEnvVars(clientEnvVars);

    // Log to console for debugging
    console.log('🔍 [DEBUG-ENV] Client-side environment variables:');
    console.log('NEXT_PUBLIC_ENABLE_MVP_MODE:', process.env.NEXT_PUBLIC_ENABLE_MVP_MODE);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('All client env vars:', clientEnvVars);
    
    // Check build time vs runtime
    console.log('🔍 [DEBUG-ENV] Build info:');
    console.log('Build timestamp:', (window as any).__NEXT_DATA__?.buildId);
    console.log('Build env at build time:', clientEnvVars);
  }, []);

  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Environment Variables Debug</h1>
        
        <div className="grid gap-6">
          {/* Current Values */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📊 Current Environment Variables</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(envVars).map(([key, value]) => (
                      <tr key={key}>
                        <td className="font-mono">{key}</td>
                        <td className="font-mono">
                          {value ? (
                            <span className="text-success">{value}</span>
                          ) : (
                            <span className="text-error">undefined</span>
                          )}
                        </td>
                        <td>
                          {value ? (
                            <div className="badge badge-success">✅ Available</div>
                          ) : (
                            <div className="badge badge-error">❌ Missing</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* MVP Mode Status */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">🚀 MVP Mode Status</h2>
              <div className="space-y-4">
                <div className="alert alert-info">
                  <h3 className="font-semibold">Expected Behavior:</h3>
                  <p>NEXT_PUBLIC_ENABLE_MVP_MODE should be "true" for MVP features to work</p>
                </div>
                
                <div className={`alert ${envVars.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true' ? 'alert-success' : 'alert-error'}`}>
                  <h3 className="font-semibold">Current Status:</h3>
                  <p>
                    MVP Mode is {envVars.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true' ? '✅ ENABLED' : '❌ DISABLED'}
                  </p>
                  <p className="font-mono">
                    NEXT_PUBLIC_ENABLE_MVP_MODE = "{envVars.NEXT_PUBLIC_ENABLE_MVP_MODE || 'undefined'}"
                  </p>
                </div>

                {envVars.NEXT_PUBLIC_ENABLE_MVP_MODE !== 'true' && (
                  <div className="alert alert-warning">
                    <h3 className="font-semibold">🔧 Troubleshooting:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Environment variable was added after last build</li>
                      <li>Variable is not set for current environment</li>
                      <li>Build cache needs to be cleared</li>
                      <li>New deployment needed to pick up changes</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Build Information */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">🏗️ Build Information</h2>
              <div className="space-y-2">
                <p><strong>Environment:</strong> {envVars.NODE_ENV}</p>
                <p><strong>Build ID:</strong> <span className="font-mono">{(typeof window !== 'undefined') ? (window as any).__NEXT_DATA__?.buildId : 'Loading...'}</span></p>
                <p className="text-sm text-gray-600">
                  NEXT_PUBLIC_ variables are embedded at build time. If this shows "undefined", 
                  the variable wasn't available during the build process.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">⚡ Next Steps</h2>
              <div className="space-y-2">
                <p>If NEXT_PUBLIC_ENABLE_MVP_MODE is undefined:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Verify environment variable is set in Vercel dashboard</li>
                  <li>Trigger a new deployment to rebuild with environment variables</li>
                  <li>Clear build cache if needed</li>
                  <li>Check environment scope (Production vs Preview vs Development)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <button 
            className="btn btn-primary mr-4"
            onClick={() => window.location.reload()}
          >
            🔄 Refresh Page
          </button>
          <a 
            href="/" 
            className="btn btn-secondary"
          >
            🏠 Back to App
          </a>
        </div>
      </div>
    </div>
  );
}