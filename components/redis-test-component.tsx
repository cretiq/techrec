'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui-daisy/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { toast } from "@/components/ui-daisy/use-toast";
import { CheckCircle, XCircle, Database, Save, Eye, Info } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default function RedisTestComponent() {
  const [saveResult, setSaveResult] = useState<TestResult | null>(null);
  const [readResult, setReadResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testKey, setTestKey] = useState('test_connection');
  const [testValue, setTestValue] = useState(`Test data from ${new Date().toLocaleString()}`);
  const [cachePrefix, setCachePrefix] = useState<string>('Loading...');

  const handleSaveToRedis = async () => {
    setIsLoading(true);
    setSaveResult(null);
    
    try {
      console.log('[RedisTest] Attempting to save to Redis...');
      
      const response = await fetch('/api/redis-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: testKey,
          value: testValue,
          ttl: 300 // 5 minutes
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('[RedisTest] Save successful:', data);
        setSaveResult({
          success: true,
          message: 'Successfully saved to Redis!',
          data: data
        });
        // Update cache prefix display if available
        if (data.cachePrefix && cachePrefix === 'Loading...') {
          setCachePrefix(data.cachePrefix);
        }
        toast({
          title: "Success!",
          description: "Data saved to Redis successfully",
        });
      } else {
        console.error('[RedisTest] Save failed:', data);
        setSaveResult({
          success: false,
          message: 'Failed to save to Redis',
          error: data.error || data.details || 'Unknown error'
        });
        toast({
          title: "Error",
          description: data.error || "Failed to save to Redis",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('[RedisTest] Save error:', error);
      setSaveResult({
        success: false,
        message: 'Network error while saving to Redis',
        error: error.message
      });
      toast({
        title: "Network Error",
        description: "Failed to connect to Redis API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadFromRedis = async () => {
    setIsLoading(true);
    setReadResult(null);
    
    try {
      console.log('[RedisTest] Attempting to read from Redis...');
      
      const response = await fetch(`/api/redis-test?key=${encodeURIComponent(testKey)}`, {
        method: 'GET',
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('[RedisTest] Read result:', data);
        
        if (data.fromCache) {
          setReadResult({
            success: true,
            message: 'Successfully retrieved from Redis!',
            data: data
          });
          toast({
            title: "Success!",
            description: "Data retrieved from Redis successfully",
          });
        } else {
          setReadResult({
            success: false,
            message: 'Data not found in Redis (cache miss)',
            data: data
          });
          toast({
            title: "Cache Miss",
            description: "No data found for this key in Redis",
            variant: "destructive",
          });
        }
      } else {
        console.error('[RedisTest] Read failed:', data);
        setReadResult({
          success: false,
          message: 'Failed to read from Redis',
          error: data.error || data.details || 'Unknown error'
        });
        toast({
          title: "Error",
          description: data.error || "Failed to read from Redis",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('[RedisTest] Read error:', error);
      setReadResult({
        success: false,
        message: 'Network error while reading from Redis',
        error: error.message
      });
      toast({
        title: "Network Error",
        description: "Failed to connect to Redis API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBox = ({ result, operation }: { result: TestResult | null, operation: string }) => {
    if (!result) {
      return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          No {operation} test performed yet
        </div>
      );
    }

    return (
      <div className={`p-4 rounded-lg border-2 ${
        result.success 
          ? 'border-green-200 bg-green-50 text-green-800' 
          : 'border-red-200 bg-red-50 text-red-800'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="font-semibold">{result.message}</span>
        </div>
        
        {result.error && (
          <div className="text-sm mt-2 p-2 bg-red-100 rounded">
            <strong>Error:</strong> {result.error}
          </div>
        )}
        
        {result.data && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium">View Details</summary>
            <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Redis Connection Test
        </CardTitle>
        <CardDescription>
          Test your Redis connection by saving and retrieving test data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Test Data Configuration */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Test Key</label>
            <input
              type="text"
              value={testKey}
              onChange={(e) => setTestKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test_connection"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Test Value</label>
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Test data..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleSaveToRedis}
            disabled={isLoading || !testKey || !testValue}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save to Redis
          </Button>
          
          <Button
            onClick={handleReadFromRedis}
            disabled={isLoading || !testKey}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Read from Redis
          </Button>
        </div>

        {/* Status Boxes */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save Operation Status
            </h3>
            <StatusBox result={saveResult} operation="save" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Read Operation Status
            </h3>
            <StatusBox result={readResult} operation="read" />
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Testing Redis connection...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 