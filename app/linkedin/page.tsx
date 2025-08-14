'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {  Button  } from '@/components/ui-daisy/button';
import {  Input  } from '@/components/ui-daisy/input';
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import { Label } from '@/components/ui-daisy/label';
import { Textarea } from "@/components/ui-daisy/textarea";
import { toast } from 'sonner';

interface LinkedInJob {
  id: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  location: string;
  salary: string;
  type: string;
  remote: boolean;
  applicationDeadline?: string;
  seniorityLevel?: string;
  industries?: string[];
  jobFunctions?: string[];
  experienceLevel?: string;
}

interface LinkedInJobsResponse {
  jobs: LinkedInJob[];
  paging: {
    count: number;
    start: number;
    total: number;
  };
}

export default function LinkedInTesterPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Job Search State
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState<LinkedInJobsResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Get Job by ID State
  const [jobId, setJobId] = useState('');
  const [jobDetails, setJobDetails] = useState<LinkedInJob | null>(null);
  const [isFetchingJob, setIsFetchingJob] = useState(false);

  // Check for token on component mount (from query params or local storage)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = queryParams.get('token');
    const tokenFromStorage = localStorage.getItem('linkedin_access_token');

    if (tokenFromQuery) {
      setAccessToken(tokenFromQuery);
      localStorage.setItem('linkedin_access_token', tokenFromQuery);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.success('LinkedIn authentication successful!');
    } else if (tokenFromStorage) {
      setAccessToken(tokenFromStorage);
    }
  }, []);

  // Function to initiate auth or check token validity
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAuthUrl(null);
    try {
      const response = await fetch('/api/linkedin/jobs'); // Ping the endpoint
      if (response.status === 401) {
        const data = await response.json();
        if (data.authUrl) {
          setAuthUrl(data.authUrl);
          toast.info('Please authenticate with LinkedIn.');
        } else {
          setError('Failed to get LinkedIn authorization URL.');
          toast.error('Failed to get LinkedIn authorization URL.');
        }
      } else if (response.ok) {
        // If it returns OK, it means we might have a valid token server-side (less likely with this setup)
        // Or the check itself passed but we don't have a token client-side.
        // If we don't have a token client-side, fetch auth url
        if (!accessToken) {
           const checkResponse = await fetch('/api/linkedin/jobs');
           const checkData = await checkResponse.json();
           if (checkData.authUrl) {
              setAuthUrl(checkData.authUrl);
              toast.info('Please authenticate with LinkedIn.');
           } else {
               setError('Already authenticated or failed to get auth URL.');
               toast.error('Already authenticated or failed to get auth URL.');
           }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to check LinkedIn authentication.');
        toast.error(errorData.error || 'Failed to check LinkedIn authentication.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to check LinkedIn authentication: ${errorMessage}`);
      toast.error(`Failed to check LinkedIn authentication: ${errorMessage}`);
    }
    setIsLoading(false);
  }, [accessToken]);

  // Automatically check auth status if no token is found on load
  useEffect(() => {
    if (!accessToken) {
      checkAuth();
    }
  }, [accessToken, checkAuth]);

  // Function to handle authentication redirect
  const handleAuthenticate = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  // Function to search jobs
  const handleSearchJobs = async () => {
    if (!accessToken) {
      toast.error('Please authenticate first.');
      checkAuth(); // Re-trigger auth check
      return;
    }
    setIsSearching(true);
    setError(null);
    setSearchResults(null);
    try {
      const params = new URLSearchParams();
      if (searchKeywords) params.append('keywords', searchKeywords);
      if (searchLocation) params.append('location', searchLocation);

      const response = await fetch(`/api/linkedin/jobs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
           setError('Authentication failed or token expired. Please re-authenticate.');
           toast.error('Authentication failed or token expired.');
           setAccessToken(null);
           localStorage.removeItem('linkedin_access_token');
           checkAuth(); // Trigger re-auth
        } else {
            setError(errorData.error || 'Failed to search jobs.');
            toast.error(errorData.error || 'Failed to search jobs.');
        }
        return;
      }

      const data: LinkedInJobsResponse = await response.json();
      setSearchResults(data);
      toast.success(`Found ${data.paging.total} jobs.`);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Job search failed: ${errorMessage}`);
      toast.error(`Job search failed: ${errorMessage}`);
    }
    setIsSearching(false);
  };

  // Function to get job by ID
  const handleGetJobById = async () => {
    if (!accessToken) {
      toast.error('Please authenticate first.');
      checkAuth(); // Re-trigger auth check
      return;
    }
    if (!jobId) {
      toast.warning('Please enter a Job ID.');
      return;
    }
    setIsFetchingJob(true);
    setError(null);
    setJobDetails(null);
    try {
      const response = await fetch(`/api/linkedin/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

       if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
           setError('Authentication failed or token expired. Please re-authenticate.');
           toast.error('Authentication failed or token expired.');
           setAccessToken(null);
           localStorage.removeItem('linkedin_access_token');
           checkAuth(); // Trigger re-auth
        } else {
            setError(errorData.error || `Failed to fetch job ${jobId}.`);
            toast.error(errorData.error || `Failed to fetch job ${jobId}.`);
        }
        return;
      }

      const data: LinkedInJob = await response.json();
      setJobDetails(data);
      toast.success(`Fetched details for job ${jobId}.`);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to fetch job details: ${errorMessage}`);
      toast.error(`Failed to fetch job details: ${errorMessage}`);
    }
    setIsFetchingJob(false);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">LinkedIn API Tester</h1>

      {/* Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Authenticate with LinkedIn to use the API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accessToken ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">Authenticated!</p>
              <Label htmlFor="accessToken">Access Token:</Label>
              <Textarea id="accessToken" readOnly value={accessToken} rows={3} className="font-mono text-xs" />
               <Button onClick={() => { setAccessToken(null); localStorage.removeItem('linkedin_access_token'); setAuthUrl(null); checkAuth(); toast.info('Logged out.'); }} variant="error">Logout</Button>
            </div>
          ) : (
            <Button onClick={handleAuthenticate} variant="primary" disabled={isLoading || !authUrl}>
              {isLoading ? 'Checking...' : 'Authenticate with LinkedIn'}
            </Button>
          )}
        </CardContent>
        {authUrl && !accessToken && (
           <CardFooter className="text-sm text-muted-foreground">
              Click the button above to proceed to LinkedIn.
           </CardFooter>
        )}
      </Card>

      {accessToken && (
        <>
          {/* Job Search Section */}
          <Card>
            <CardHeader>
              <CardTitle>Search Jobs</CardTitle>
              <CardDescription>Search for jobs on LinkedIn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="searchKeywords">Keywords</Label>
                  <Input
                    id="searchKeywords"
                    placeholder="e.g., Software Engineer, React"
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="searchLocation">Location</Label>
                  <Input
                    id="searchLocation"
                    placeholder="e.g., San Francisco, Remote"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSearchJobs} variant="primary" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search Jobs'}
              </Button>
            </CardContent>
            {searchResults && (
              <CardFooter className="flex flex-col items-start space-y-4">
                <h3 className="font-semibold">Search Results ({searchResults.paging.total} found):</h3>
                <div className="max-h-96 overflow-y-auto w-full space-y-2 border p-2 rounded-md">
                  {searchResults.jobs.length > 0 ? (
                    searchResults.jobs.map((job) => (
                      <div key={job.id} className="border p-3 rounded-md bg-muted/50">
                        <p className="font-medium">{job.title} - {job.company.name}</p>
                        <p className="text-sm text-muted-foreground">{job.location} ({job.type}) {job.remote ? '[Remote]' : ''}</p>
                        <p className="text-xs text-muted-foreground">ID: {job.id}</p>
                      </div>
                    ))
                  ) : (
                    <p>No jobs found matching your criteria.</p>
                  )}
                </div>
              </CardFooter>
            )}
          </Card>

          {/* Get Job by ID Section */}
          <Card>
            <CardHeader>
              <CardTitle>Get Job Details</CardTitle>
              <CardDescription>Fetch details for a specific job by its ID.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobId">Job ID</Label>
                <Input
                  id="jobId"
                  placeholder="Paste Job ID here"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                />
              </div>
              <Button onClick={handleGetJobById} variant="secondary" disabled={isFetchingJob}>
                {isFetchingJob ? 'Fetching...' : 'Get Job Details'}
              </Button>
            </CardContent>
            {jobDetails && (
              <CardFooter className="flex flex-col items-start space-y-4">
                <h3 className="font-semibold">Job Details:</h3>
                <div className="border p-4 rounded-md w-full space-y-2 bg-muted/50">
                    <p><strong>ID:</strong> {jobDetails.id}</p>
                    <p><strong>Title:</strong> {jobDetails.title}</p>
                    <p><strong>Company:</strong> {jobDetails.company.name} (ID: {jobDetails.company.id})</p>
                    {jobDetails.company.logo && <img src={jobDetails.company.logo} alt={`${jobDetails.company.name} logo`} className="h-8 w-auto my-1"/>}
                    <p><strong>Location:</strong> {jobDetails.location}</p>
                    <p><strong>Type:</strong> {jobDetails.type} {jobDetails.remote ? '(Remote)' : ''}</p>
                    {jobDetails.salary && <p><strong>Salary:</strong> {jobDetails.salary}</p>}
                    {jobDetails.applicationDeadline && <p><strong>Apply By:</strong> {new Date(jobDetails.applicationDeadline).toLocaleDateString()}</p>}
                    {jobDetails.seniorityLevel && <p><strong>Seniority:</strong> {jobDetails.seniorityLevel}</p>}
                    {jobDetails.experienceLevel && <p><strong>Experience:</strong> {jobDetails.experienceLevel}</p>}
                    {jobDetails.industries && <p><strong>Industries:</strong> {jobDetails.industries.join(', ')}</p>}
                    {jobDetails.jobFunctions && <p><strong>Functions:</strong> {jobDetails.jobFunctions.join(', ')}</p>}
                    <p><strong>Description:</strong></p>
                    <div className="prose prose-sm max-w-none max-h-60 overflow-y-auto border p-2 rounded-md bg-background" dangerouslySetInnerHTML={{ __html: jobDetails.description }}></div>
                 </div>
              </CardFooter>
            )}
          </Card>
        </>
      )}

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 