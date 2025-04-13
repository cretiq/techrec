'use client';

import React, { useState, useEffect } from 'react';

// Define interfaces for Job and Paging based on your API response
interface JobLocation {
  country: string;
  postalCode?: string;
  city?: string;
  address?: string;
}

interface CompanyDetails {
  companyId: string;
  companyName: string;
  logoUrl?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: JobLocation;
  companyDetails: CompanyDetails;
  listingType: string;
  applicationDeadline?: string;
  seniorityLevel?: string;
  employmentType?: string; // Consider using your RoleType enum here if applicable
  industries?: string[];
  jobFunctions?: string[];
  experienceLevel?: string;
  salaryRange?: any; // Define more specifically if needed
  remote?: boolean;
}

interface Paging {
  count: number;
  start: number;
  total: number;
}

interface ApiResponse {
  jobs: Job[];
  paging: Paging;
  error?: string;
  authUrl?: string; // For handling authentication redirection
}

// Interface for API Test Results
interface TestResult {
  endpoint: string;
  status: number | 'pending' | 'error';
  data: any;
}

export default function LinkedInJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [paging, setPaging] = useState<Paging | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationTerm, setLocationTerm] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const fetchJobs = async (keywords: string = '', location: string = '', start: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        start: start.toString(),
        count: '10', // Or make this dynamic
      });
      if (keywords) queryParams.set('keywords', keywords);
      if (location) queryParams.set('location', location);

      const response = await fetch(`/api/linkedin/jobs?${queryParams.toString()}`);
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        if (data.authUrl) {
          // Redirect to LinkedIn authentication
          window.location.href = data.authUrl;
          return; // Stop execution after redirect
        }
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setJobs(data.jobs || []); // Handle case where jobs might be null/undefined
      setPaging(data.paging);
    } catch (err: any) {
      console.error("Failed to fetch jobs:", err);
      setError(err.message || "Failed to fetch jobs. You might not have the required API permissions.");
      setJobs([]);
      setPaging(null);
    }
    setIsLoading(false);
  };

  // List of endpoints to test
  const endpointsToTest = [
    { name: 'User Info (/v2/userinfo)', url: 'https://api.linkedin.com/v2/userinfo' },
    { name: 'Basic Profile (/v2/me)', url: 'https://api.linkedin.com/v2/me' },
    { name: 'Email Address (/v2/emailAddress?q=members&projection=(elements*(handle~)))', url: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))' },
    { name: 'Profile Projection (/v2/me?projection=(id,localizedFirstName))', url: 'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName)' },
    { name: 'Job Search Test (/v2/search?q=jobSearch&keywords=test)', url: 'https://api.linkedin.com/v2/search?q=jobSearch&keywords=test' },
    { name: 'Company Search Test (/v2/companySearch?q=search&query=TestCompany)', url: 'https://api.linkedin.com/v2/companySearch?q=search&query=TestCompany' },
    { name: 'Company Search Test (/v2/)', url: 'https://api.linkedin.com/v2/companySearch?q=search&query=TestCompany' },
  ];

  const runApiTest = async (endpoint: { name: string; url: string }) => {
    setTestResults(prev => [
      ...prev.filter(r => r.endpoint !== endpoint.name),
      { endpoint: endpoint.name, status: 'pending', data: null }
    ]);
    setIsTesting(true);

    try {
      const targetUrl = encodeURIComponent(endpoint.url);
      const response = await fetch(`/api/linkedin/test-endpoint?targetUrl=${targetUrl}`);
      const resultData = await response.json();

      setTestResults(prev => [
        ...prev.filter(r => r.endpoint !== endpoint.name),
        { endpoint: endpoint.name, status: response.status, data: resultData }
      ]);

    } catch (err: any) {
      console.error(`Failed to test endpoint ${endpoint.name}:`, err);
      setTestResults(prev => [
        ...prev.filter(r => r.endpoint !== endpoint.name),
        { endpoint: endpoint.name, status: 'error', data: { error: 'Frontend fetch error', details: err.message } }
      ]);
    }
    setIsTesting(false); // Consider managing this more granularly if running tests in parallel
  };

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchJobs(searchTerm, locationTerm);
  };

  const handleLoadMore = () => {
    if (paging && paging.start + paging.count < paging.total) {
      fetchJobs(searchTerm, locationTerm, paging.start + paging.count);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LinkedIn Job Search</h1>
      
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input 
          type="text"
          placeholder="Keywords (e.g., Engineer)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input 
          type="text"
          placeholder="Location (e.g., London)"
          value={locationTerm}
          onChange={(e) => setLocationTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {isLoading && <p>Loading jobs...</p>}
      
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && jobs.length === 0 && (
        <p>No jobs found matching your criteria.</p>
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <div>
          <ul>
            {jobs.map((job) => (
              <li key={job.id} className="border-b p-4 mb-4 rounded shadow">
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p className="text-gray-700">{job.companyDetails.companyName}</p>
                <p className="text-gray-600">{job.location?.city}, {job.location?.country}</p>
                {/* Add more job details as needed */}
                {/* <p className="mt-2 text-sm">{job.description.substring(0, 150)}...</p> */}
              </li>
            ))}
          </ul>
          {paging && paging.start + paging.count < paging.total && (
            <button 
              onClick={handleLoadMore} 
              className="mt-4 bg-gray-500 text-white p-2 rounded"
              disabled={isLoading}
            >
              Load More
            </button>
          )}
        </div>
      )}

      <hr className="my-8" />

      {/* API Test Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">LinkedIn API Test Section</h2>
        <p className="mb-4 text-sm text-gray-600">
          Click buttons to test different LinkedIn API endpoints using your current access token.
          This helps diagnose permission issues.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {endpointsToTest.map((endpoint) => (
            <button
              key={endpoint.name}
              onClick={() => runApiTest(endpoint)}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded text-sm"
              disabled={isTesting}
            >
              Test: {endpoint.name}
            </button>
          ))}
        </div>

        {testResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
            <ul className="space-y-2">
              {testResults.map((result) => (
                <li key={result.endpoint} className="border p-3 rounded bg-gray-50">
                  <p className="font-medium">{result.endpoint}</p>
                  <p className={`text-sm font-mono ${result.status === 200 ? 'text-green-700' : 'text-red-700'}`}>
                    Status: {result.status}
                  </p>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 