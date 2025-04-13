import { NextResponse } from 'next/server';

// Define the internal Role structure (ensure this matches the frontend)
interface Role {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: {
    id: string;
    name: string;
    description: string;
  }[];
  company: {
    id: string;
    name: string;
  };
  location: string;
  salary: string;
  type: string; // e.g., FULL_TIME, PART_TIME
  remote: boolean;
  visaSponsorship: boolean; // Assuming this maps from some API field or defaults
  url?: string; // Add URL field
}

// Define a type for the Theirstack Job object (based on the example)
interface TheirstackJob {
  id: number | string; // API uses number, let's keep it flexible
  job_title: string;
  description: string;
  url: string;
  company_object: {
    name: string;
    id?: string; // Company ID might not always be present
    technology_slugs?: string[];
    technology_names?: string[];
  };
  location?: string; // Assuming it exists
  short_location?: string;
  long_location?: string;
  min_annual_salary?: number | null;
  max_annual_salary?: number | null;
  salary_currency?: string | null;
  salary_string?: string | null;
  employment_statuses?: string[]; // e.g., ["Full-time"]
  remote?: boolean | null;
  country_code?: string | null;
  country?: string | null;
  matching_phrases?: string[];
  matching_words?: string[];
  // Add other relevant fields if needed
}

// Mapping function from TheirstackJob to internal Role
function mapTheirStackJobToRole(job: TheirstackJob): Role {
  const determineType = (statuses?: string[]): string => {
    if (!statuses || statuses.length === 0) return 'UNKNOWN';
    const lowerStatuses = statuses.map(s => s.toLowerCase());
    if (lowerStatuses.includes('full-time')) return 'FULL_TIME';
    if (lowerStatuses.includes('part-time')) return 'PART_TIME';
    if (lowerStatuses.includes('contract')) return 'CONTRACT';
    if (lowerStatuses.includes('internship')) return 'INTERNSHIP';
    if (lowerStatuses.includes('temporary')) return 'TEMPORARY';
    return statuses[0].toUpperCase().replace(' ', '_'); // Fallback
  };

  const formatSalary = (job: TheirstackJob): string => {
    if (job.salary_string) return job.salary_string;
    if (job.min_annual_salary && job.max_annual_salary && job.salary_currency) {
      return `$${job.min_annual_salary.toLocaleString()} - $${job.max_annual_salary.toLocaleString()} ${job.salary_currency}`;
    }
    if (job.min_annual_salary && job.salary_currency) {
      return `From $${job.min_annual_salary.toLocaleString()} ${job.salary_currency}`;
    }
    if (job.max_annual_salary && job.salary_currency) {
      return `Up to $${job.max_annual_salary.toLocaleString()} ${job.salary_currency}`;
    }
    return 'Not Specified';
  };

  const extractSkillsFromMatchingPhrasesAndTechnologies = (job: TheirstackJob): { id: string; name: string; description: string }[] => {
    let skills: { id: string; name: string; description: string }[] = [];

    //job.matching_phrases is a string separated by commas, split it into an array
    const matchingPhrases = job.matching_phrases?.[0]?.split(',').map(phrase => phrase.trim()) || [];
    matchingPhrases.map((phrase) => {
      skills.push({
        id: phrase,
        name: phrase,
        description: '',
      });
    });
    // job.company_object.technology_names?.map((name) => {
    //   skills.push({
    //     id: name,
    //     name: name,
    //     description: '',
    //   });
    // });

    console.log("skills", skills);

    return skills;
  };


  return {
    id: String(job.id),
    title: job.job_title,
    description: job.description || 'No description available.',
    requirements: job.company_object.technology_slugs || [],
    skills: extractSkillsFromMatchingPhrasesAndTechnologies(job),
    company: {
      id: job.company_object?.id || job.company_object?.name || 'unknown',
      name: job.company_object?.name || 'Unknown Company',
    },
    // Prioritize more specific location fields if available
    location: job.long_location || job.short_location || job.location || job.country || 'Unknown Location',
    salary: formatSalary(job),
    type: determineType(job.employment_statuses),
    remote: job.remote ?? false,
    visaSponsorship: false, // Still defaulting to false
    url: job.url,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobTitleParam = searchParams.get('query');
  const countriesParam = searchParams.get('countries');
  const technologiesParam = searchParams.get('technologies');
  const companiesParam = searchParams.get('companies');
  const remoteParam = searchParams.get('remote');
  const postedAtMaxAgeDaysParam = searchParams.get('posted_at_max_age_days');

  const apiKey = process.env.THEIRSTACK_API_KEY;
  if (!apiKey) {
    console.error('API Route Error: TheirStack API Key is missing.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Construct the search body for Theirstack API
  const searchBody: Record<string, any> = {
    limit: 1,
    page: 0,
    // Add filters based on query parameters
    posted_at_max_age_days: postedAtMaxAgeDaysParam,
  };

  let hasRequiredFilter = false;

  if (jobTitleParam) {
    searchBody.job_title_or = [jobTitleParam];
    // job_title_or doesn't count as a required filter on its own
  }
  if (countriesParam) {
    searchBody.job_country_code_or = countriesParam.split(',').map(code => code.trim()).filter(Boolean);
    hasRequiredFilter = true; // country filter counts
  }
  if (technologiesParam) {
    searchBody.job_technology_slug_or = technologiesParam.split(',').map(slug => slug.trim()).filter(Boolean);
    // Tech filter doesn't count as required
  }
  if (companiesParam) {
    searchBody.company_name_or = companiesParam.split(',').map(name => name.trim()).filter(Boolean);
    hasRequiredFilter = true; // company filter counts
  }
  if (remoteParam !== null) {
    // Convert string 'true'/'false' back to boolean
    searchBody.remote = remoteParam === 'true';
  }

  // Add default date filter ONLY if no other required filter is present
  if (!hasRequiredFilter) {
     searchBody.posted_at_max_age_days = 90; // Add a default date filter
     console.log('[API /roles/search] No specific required filter found, adding default posted_at_max_age_days=90');
  }

  // Ensure at least one required filter is sent if needed by API rules
  // (The default date filter handles this for now)
  if (!searchBody.job_title_or && !searchBody.job_country_code_or && !searchBody.company_name_or && !searchBody.posted_at_max_age_days) {
       console.warn('[API /roles/search] No searchable filters provided.');
       // Optionally return empty array or a specific message instead of hitting API
       // return NextResponse.json([], { status: 200 });
       // For now, let the default date filter handle it, or add one if logic changes
       if (!searchBody.posted_at_max_age_days) searchBody.posted_at_max_age_days = 90;
  }

  console.log("JSON.stringify(searchBody)", JSON.stringify(searchBody));

  try {
    console.log(`[API /roles/search] Calling TheirStack with body:`, JSON.stringify(searchBody).slice(0, 500)); // Log truncated body
    const theirstackResponse = await fetch('https://api.theirstack.com/v1/jobs/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(searchBody),
      cache: 'no-store',
    });

    if (!theirstackResponse.ok) {
      let errorDetails = `TheirStack API responded with status: ${theirstackResponse.status}`;
      try {
        const errorData = await theirstackResponse.json();
        
        // Handle 422 validation errors specifically
        if (theirstackResponse.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => ({
            field: err.loc?.join('.') || 'unknown',
            message: err.msg || 'Unknown validation error',
            type: err.type || 'unknown'
          }));
          
          console.error(`[API /roles/search] TheirStack Validation Errors:`, validationErrors);
          return NextResponse.json({ 
            error: 'Invalid search parameters',
            details: validationErrors 
          }, { status: 422 });
        }
        
        errorDetails = errorData.detail || JSON.stringify(errorData) || errorDetails;
        console.error(`[API /roles/search] TheirStack API Error: ${theirstackResponse.status}`, errorData);
      } catch (e) {
        console.error(`[API /roles/search] TheirStack API Error: ${theirstackResponse.status}, could not parse error response body.`);
        errorDetails = `${errorDetails}. Response body not JSON.`;
      }
      const statusCode = theirstackResponse.status === 401 || theirstackResponse.status === 403 ? 500 : 502;
      return NextResponse.json({ error: `Failed to fetch from TheirStack API: ${errorDetails}` }, { status: statusCode });
    }

    const theirstackData = await theirstackResponse.json();

    console.log("theirstackData", theirstackData);
    // if theirstackData.company_object exists, log the company_object.name
    if (theirstackData.data[0].company_object) {
      console.log("theirstackData.company_object.name", theirstackData.data[0].company_object.name);
    }
    if (theirstackData.data[0].matching_phrases) {
      console.log("theirstackData.matching_phrases", theirstackData.data[0].matching_phrases);
    }
    if (theirstackData.data[0].matching_words) {
      console.log("theirstackData.matching_words", theirstackData.data[0].matching_words);
    }

    if (!theirstackData || !Array.isArray(theirstackData.data)) {
        console.warn('[API /roles/search] TheirStack response format unexpected or data array missing.', theirstackData);
        return NextResponse.json({ error: 'Unexpected response format from TheirStack API' }, { status: 502 });
    }

    const mappedRoles: Role[] = theirstackData.data.map(mapTheirStackJobToRole);

    console.log(`[API /roles/search] Successfully fetched and mapped ${mappedRoles.length} roles.`);
    return NextResponse.json(mappedRoles, { status: 200 });

  } catch (error: any) {
    console.error(`[API /roles/search] Internal Server Error:`, error);
    return NextResponse.json({ error: 'Internal server error processing search request', details: error.message }, { status: 500 });
  }
} 