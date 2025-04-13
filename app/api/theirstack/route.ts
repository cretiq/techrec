import { NextResponse } from 'next/server';
import { z } from 'zod';

// Base URL for the TheirStack API
const THEIR_STACK_API_BASE_URL = 'https://api.theirstack.com';

// --- Zod Schemas for Expected Responses ---

// Common structure for pagination metadata
const PaginationSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative().optional(),
});

// Define a detailed structure for a Job Posting
const JobPostingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  company_id: z.string(),
  company_name: z.string(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    raw: z.string().optional(),
  }).optional(),
  url: z.string().url(),
  posted_at: z.string().datetime(),
  employment_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']).optional(),
  remote: z.boolean().optional(),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().length(3).optional(),
    period: z.enum(['HOUR', 'YEAR', 'MONTH']).optional(),
  }).optional(),
  skills: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  seniority: z.enum(['c_level', 'staff', 'senior', 'junior', 'mid_level']).optional(),
  reports_to: z.string().optional(),
  hiring_managers: z.array(z.string()).optional(),
  final_url: z.string().url().optional(),
  discovered_at: z.string().datetime().optional(),
  scraper_name: z.string().optional(),
  easy_apply: z.boolean().optional(),
  technologies: z.array(z.string()).optional(),
});

// Schema for the response of /v1/jobs/search
const JobPostingSearchResponseSchema = z.object({
  data: z.array(JobPostingSchema),
  pagination: PaginationSchema,
  total: z.number().int().nonnegative(),
});

// --- Schema Mapping ---
const schemaMap: Record<string, Record<string, z.ZodSchema<any>>> = {
  '/v1/jobs/search': {
    'POST': JobPostingSearchResponseSchema
  }
};

// Function to get the schema based on path and method
const getResponseSchema = (path: string, method: string): z.ZodSchema<any> | null => {
  const upperMethod = method.toUpperCase();
  return schemaMap[path]?.[upperMethod] || null;
};

/**
 * Handles requests to proxy calls to the TheirStack API.
 * Validates the response against expected schemas and includes validation status.
 */
export async function POST(request: Request) {
  const apiKey = process.env.THEIRSTACK_API_KEY;

  if (!apiKey) {
    console.error('TheirStack API Key is missing from environment variables.');
    return NextResponse.json({ validationStatus: 'error', error: 'Server configuration error: API key missing.' }, { status: 500 });
  }

  let endpointPath = '';
  let method = '';
  try {
    const requestBody = await request.json();
    endpointPath = requestBody.endpointPath;
    method = requestBody.method;
    const { body: innerBody } = requestBody;

    if (!endpointPath || !method) {
      return NextResponse.json({ validationStatus: 'error', error: 'Missing required fields: endpointPath and method' }, { status: 400 });
    }

    // Log the incoming request details
    console.log(`[TheirStack Proxy] Incoming request:`, {
      endpointPath,
      method,
      hasBody: !!innerBody
    });

    // Construct the target URL
    const targetUrl = `${THEIR_STACK_API_BASE_URL}${endpointPath}`;

    // Log the full URL being called
    console.log(`[TheirStack Proxy] Full URL: ${targetUrl}`);

    // Prepare fetch options
    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    };

    if (innerBody) {
      options.body = JSON.stringify(innerBody);
    }

    // Log the request options (excluding the API key)
    console.log(`[TheirStack Proxy] Request options:`, {
      method: options.method,
      headers: {
        ...options.headers,
        'Authorization': 'Bearer [REDACTED]'
      },
      hasBody: !!options.body
    });

    // Make the call
    const apiResponse = await fetch(targetUrl, options);

    // Log the response headers
    console.log(`[TheirStack Proxy] Response headers:`, {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      contentType: apiResponse.headers.get('Content-Type')
    });

    let responseData: any;
    let responseContentType = apiResponse.headers.get('Content-Type') || 'text/plain';
    let isJson = responseContentType.includes('application/json');

    if (isJson) {
      try {
        responseData = await apiResponse.json();
      } catch (e) {
        console.warn(`[TheirStack Proxy] Failed to parse JSON response from ${targetUrl}. Status: ${apiResponse.status}`);
        isJson = false;
        responseData = await apiResponse.text();
        responseContentType = 'text/plain';
      }
    } else {
      responseData = await apiResponse.text();
      console.warn(`[TheirStack Proxy] Non-JSON content type received from ${targetUrl}. Status: ${apiResponse.status}, Type: ${responseContentType}`);
    }

    // Log the response data (truncated if too large)
    console.log(`[TheirStack Proxy] Response data:`, JSON.stringify(responseData).slice(0, 1000));

    let validationPayload: { validationStatus: 'success' | 'failure' | 'skipped' | 'error', validationErrors?: any, data: any } = {
      validationStatus: 'skipped',
      data: responseData
    };

    // Perform validation only if the response was OK and seems to be JSON
    if (apiResponse.ok && isJson) {
      const schemaToValidate = getResponseSchema(endpointPath, method);

      if (schemaToValidate) {
        const validationResult = schemaToValidate.safeParse(responseData);
        if (validationResult.success) {
          validationPayload.validationStatus = 'success';
        } else {
          validationPayload.validationStatus = 'failure';
          validationPayload.validationErrors = validationResult.error.errors;
          console.error(`[TheirStack Proxy] Schema Validation Failed for ${method} ${endpointPath}:`, validationResult.error.errors);
        }
      } else {
        console.warn(`[TheirStack Proxy] No response schema defined for ${method} ${endpointPath}. Skipping validation.`);
        validationPayload.validationStatus = 'skipped';
      }
    } else if (!apiResponse.ok) {
      validationPayload.validationStatus = 'error';
      validationPayload.data = responseData;
    }

    return new NextResponse(JSON.stringify(validationPayload), {
      status: apiResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(`[TheirStack Proxy] Error processing ${method} ${endpointPath}:`, error);
    return NextResponse.json(
      { validationStatus: 'error', error: 'Failed to call/process TheirStack API response', details: error.message },
      { status: 500 }
    );
  }
} 