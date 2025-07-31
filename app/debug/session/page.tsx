'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { Loader2, User, Mail, Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface SessionDebugData {
  authenticated: boolean;
  session?: {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
    expires: string;
  };
  databaseLookup?: {
    byId: any;
    byEmail: any;
    isConsistent: boolean;
  };
  cvData?: {
    bySessionId: any[];
    bySessionEmail: any[];
  };
  analysis?: {
    sessionIdMatchesEmailId: boolean;
    potentialIssue: string | null;
  };
  error?: string;
}

export default function SessionDebugPage() {
  const [debugData, setDebugData] = useState<SessionDebugData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSessionDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/session');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Failed to fetch session debug data:', error);
      setDebugData({
        authenticated: false,
        error: 'Failed to fetch session debug data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDebugData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading session debug data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!debugData) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p>Failed to load session debug data</p>
              <Button onClick={fetchSessionDebugData} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Session Debug</h1>
        <p className="text-base-content/70">Debugging authentication and session consistency</p>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {debugData.authenticated ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <Badge variant="default">Authenticated</Badge>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <Badge variant="destructive">Not Authenticated</Badge>
              </>
            )}
          </div>

          {debugData.session && (
            <div className="space-y-2">
              <div>
                <strong>Session User ID:</strong> {debugData.session.user.id}
              </div>
              <div>
                <strong>Session Email:</strong> {debugData.session.user.email}
              </div>
              <div>
                <strong>Session Name:</strong> {debugData.session.user.name}
              </div>
              <div>
                <strong>Session Expires:</strong> {new Date(debugData.session.expires).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Consistency Check */}
      {debugData.databaseLookup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Consistency Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              {debugData.databaseLookup.isConsistent ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <Badge variant="default">Consistent</Badge>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <Badge variant="destructive">Inconsistent</Badge>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Lookup by Session ID</h4>
                {debugData.databaseLookup.byId ? (
                  <div className="text-sm space-y-1">
                    <div><strong>ID:</strong> {debugData.databaseLookup.byId.id}</div>
                    <div><strong>Email:</strong> {debugData.databaseLookup.byId.email}</div>
                    <div><strong>Name:</strong> {debugData.databaseLookup.byId.name}</div>
                    <div><strong>Profile Email:</strong> {debugData.databaseLookup.byId.profileEmail}</div>
                  </div>
                ) : (
                  <Badge variant="destructive">Not Found</Badge>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Lookup by Session Email</h4>
                {debugData.databaseLookup.byEmail ? (
                  <div className="text-sm space-y-1">
                    <div><strong>ID:</strong> {debugData.databaseLookup.byEmail.id}</div>
                    <div><strong>Email:</strong> {debugData.databaseLookup.byEmail.email}</div>
                    <div><strong>Name:</strong> {debugData.databaseLookup.byEmail.name}</div>
                    <div><strong>Profile Email:</strong> {debugData.databaseLookup.byEmail.profileEmail}</div>
                  </div>
                ) : (
                  <Badge variant="destructive">Not Found</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CV Data Comparison */}
      {debugData.cvData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              CV Data Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">CVs by Session ID ({debugData.cvData.bySessionId.length})</h4>
                {debugData.cvData.bySessionId.length > 0 ? (
                  <div className="space-y-2">
                    {debugData.cvData.bySessionId.map((cv, index) => (
                      <div key={cv.id} className="text-sm bg-base-200 p-2 rounded">
                        <div><strong>File:</strong> {cv.originalName}</div>
                        <div><strong>Status:</strong> {cv.status}</div>
                        <div><strong>Uploaded:</strong> {new Date(cv.uploadDate).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Badge variant="secondary">No CVs Found</Badge>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">CVs by Session Email ({debugData.cvData.bySessionEmail.length})</h4>
                {debugData.cvData.bySessionEmail.length > 0 ? (
                  <div className="space-y-2">
                    {debugData.cvData.bySessionEmail.map((cv, index) => (
                      <div key={cv.id} className="text-sm bg-base-200 p-2 rounded">
                        <div><strong>File:</strong> {cv.originalName}</div>
                        <div><strong>Status:</strong> {cv.status}</div>
                        <div><strong>Uploaded:</strong> {new Date(cv.uploadDate).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Badge variant="secondary">No CVs Found</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Summary */}
      {debugData.analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <strong>Session ID matches Email ID:</strong>
                {debugData.analysis.sessionIdMatchesEmailId ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="destructive">No</Badge>
                )}
              </div>

              {debugData.analysis.potentialIssue && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <strong className="text-red-800">Issue Detected:</strong>
                  </div>
                  <p className="text-red-700 mt-1">{debugData.analysis.potentialIssue}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {debugData.error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <strong>Error:</strong> {debugData.error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <Button onClick={fetchSessionDebugData} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Refresh Debug Data
        </Button>
      </div>
    </div>
  );
}