'use client';

import React, { useState, useCallback } from 'react';
import JobSearchForm from '@/components/theirstack/JobSearchForm';
import JobResultsDisplay from '@/components/theirstack/JobResultsDisplay';
import { json } from 'stream/consumers';

// Define the expected response structure from our backend proxy
// Ensure this matches the one in JobResultsDisplay.tsx
interface BackendResponse {
  validationStatus: 'success' | 'failure' | 'skipped' | 'error';
  validationErrors?: any[];
  data: any; // The actual data (or error message) from TheirStack
  error?: string; // Error message from our proxy itself
  details?: string;
}

// Path for the job search endpoint
const JOB_SEARCH_PATH = '/v1/jobs/search';

export default function TheirStackTestPage() {
  const [result, setResult] = useState<{ status: number | null; response: BackendResponse } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearchSubmit = useCallback(async (filters: Record<string, any>) => {
    setIsLoading(true);
    setResult(null);

    const requestPayload = {
      endpointPath: JOB_SEARCH_PATH,
      method: 'POST',
      body: filters, // Pass the cleaned filters as the body
    };

    try {
      const fetchResponse = await fetch('/api/theirstack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const responseData: BackendResponse = await fetchResponse.json();
      setResult({ status: fetchResponse.status, response: responseData });
      console.log("RESPONSE DATA", responseData.data);

    } catch (err: any) {
      console.error(`Error calling endpoint ${JOB_SEARCH_PATH}:`, err);
      setResult({
        status: 500,
        response: {
          validationStatus: 'error',
          error: 'Frontend fetch failed',
          details: err.message,
          data: null
        }
      });
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">TheirStack Jobs Search</h1>
      <p className="text-gray-600 mb-6">
        Use this interface to search for jobs using various filters based on the TheirStack API.
        At least one date filter (Max Age, Posted After, Posted Before) or Company Name is required.
        Find the official documentation <a href="https://api.theirstack.com/#tag/jobs/POST/v1/jobs/search" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">here</a>.
      </p>

      <JobSearchForm onSubmit={handleSearchSubmit} isLoading={isLoading} />

      <JobResultsDisplay result={result} />

    </div>
  );
} 