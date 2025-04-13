'use client';

import React, { useState } from 'react';

interface JobSearchFormProps {
  onSubmit: (filters: Record<string, any>) => void;
  isLoading: boolean;
}

// Helper to clean object: remove null, undefined, empty strings, empty arrays
const cleanObject = (obj: Record<string, any>): Record<string, any> => {
  return Object.entries(obj)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0))
    .reduce((acc, [key, value]) => {
      // Convert comma-separated strings to arrays for relevant fields
      if (typeof value === 'string' && [
          'job_country_code_or', 'job_country_code_not', 'job_title_or', 'job_title_not',
          'job_technology_slug_or', 'job_technology_slug_not', 'job_technology_slug_and',
          'company_name_or', 'company_domain_or', 'company_id_or' // Add others if needed
      ].includes(key)) {
        acc[key] = value.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
};

const JobSearchForm: React.FC<JobSearchFormProps> = ({ onSubmit, isLoading }) => {
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [jobTitleOr, setJobTitleOr] = useState<string>('');
  const [jobCountryCodeOr, setJobCountryCodeOr] = useState<string>('US');
  const [postedAtMaxAgeDays, setPostedAtMaxAgeDays] = useState<number | ''>(7);
  const [postedAtGte, setPostedAtGte] = useState<string>(''); // YYYY-MM-DD
  const [postedAtLte, setPostedAtLte] = useState<string>(''); // YYYY-MM-DD
  const [remote, setRemote] = useState<boolean | null>(null);
  const [jobTechnologySlugOr, setJobTechnologySlugOr] = useState<string>('');
  const [companyNameOr, setCompanyNameOr] = useState<string>('');
  const [blurCompanyData, setBlurCompanyData] = useState<boolean>(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const rawFilters = {
      page,
      limit,
      job_title_or: jobTitleOr,
      job_country_code_or: jobCountryCodeOr,
      posted_at_max_age_days: postedAtMaxAgeDays === '' ? null : postedAtMaxAgeDays,
      posted_at_gte: postedAtGte,
      posted_at_lte: postedAtLte,
      remote,
      job_technology_slug_or: jobTechnologySlugOr,
      company_name_or: companyNameOr,
      blur_company_data: blurCompanyData,
      // Add more filters here as needed
    };

    const cleanedFilters = cleanObject(rawFilters);

    // Basic validation: Ensure at least one required filter is present
    if (!cleanedFilters.posted_at_max_age_days && !cleanedFilters.posted_at_gte && !cleanedFilters.posted_at_lte && !cleanedFilters.company_name_or) {
        alert('Please provide at least one required filter: \n- Posted Max Age Days \n- Posted After Date \n- Posted Before Date \n- Company Name');
        return;
    }

    onSubmit(cleanedFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Job Search Filters</h2>
      <p className="text-sm text-gray-600 mb-4">Enter your search criteria below. Fields marked with * are required (or part of a required group). Separate multiple values in text fields with commas (e.g., US,CA or react,node).</p>

      {/* --- Basic Filters --- */}
      <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <legend className="text-lg font-medium mb-2 text-gray-700 col-span-full">Basic Filters</legend>
        <div>
          <label htmlFor="jobTitleOr" className="block text-sm font-medium text-gray-700 mb-1">Job Title(s) (OR)</label>
          <input
            type="text"
            id="jobTitleOr"
            value={jobTitleOr}
            onChange={(e) => setJobTitleOr(e.target.value)}
            placeholder="e.g., Software Engineer, Data Scientist"
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
         <div>
          <label htmlFor="jobTechnologySlugOr" className="block text-sm font-medium text-gray-700 mb-1">Technology Slug(s) (OR)</label>
          <input
            type="text"
            id="jobTechnologySlugOr"
            value={jobTechnologySlugOr}
            onChange={(e) => setJobTechnologySlugOr(e.target.value)}
            placeholder="e.g., react,python,aws"
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label htmlFor="remote" className="block text-sm font-medium text-gray-700 mb-1">Remote Status</label>
          <select
            id="remote"
            value={remote === null ? 'any' : (remote ? 'true' : 'false')}
            onChange={(e) => setRemote(e.target.value === 'any' ? null : e.target.value === 'true')}
            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="any">Any</option>
            <option value="true">Remote Only</option>
            <option value="false">Non-Remote Only</option>
          </select>
        </div>
      </fieldset>

      {/* --- Location & Company Filters --- */}
      <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <legend className="text-lg font-medium mb-2 text-gray-700 col-span-full">Location & Company</legend>
          <div>
            <label htmlFor="jobCountryCodeOr" className="block text-sm font-medium text-gray-700 mb-1">Job Country Code(s) (OR)</label>
            <input
                type="text"
                id="jobCountryCodeOr"
                value={jobCountryCodeOr}
                onChange={(e) => setJobCountryCodeOr(e.target.value)}
                placeholder="e.g., US,CA,GB (2-letter ISO)"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
           </div>
          <div>
            <label htmlFor="companyNameOr" className="block text-sm font-medium text-gray-700 mb-1">Company Name(s) (OR)<span className="text-red-500">*</span></label>
            <input
                type="text"
                id="companyNameOr"
                value={companyNameOr}
                onChange={(e) => setCompanyNameOr(e.target.value)}
                placeholder="e.g., Google,Microsoft"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
           <div>
                <label htmlFor="blurCompanyData" className="flex items-center text-sm font-medium text-gray-700 mt-6">
                    <input
                        type="checkbox"
                        id="blurCompanyData"
                        checked={blurCompanyData}
                        onChange={(e) => setBlurCompanyData(e.target.checked)}
                        className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    Blur Company Data (No Credits Used)
                </label>
            </div>
      </fieldset>

      {/* --- Date Filters --- */}
      <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border border-gray-200 p-4 rounded-lg">
        <legend className="text-lg font-medium mb-2 text-gray-700 col-span-full px-2">Date Filters<span className="text-red-500">*</span> (At least one date or company filter required)</legend>
        <div className="space-y-2">
          <label htmlFor="postedAtMaxAgeDays" className="block text-sm font-medium text-gray-700">Posted Max Age (Days)</label>
          <input
            type="number"
            id="postedAtMaxAgeDays"
            value={postedAtMaxAgeDays}
            onChange={(e) => setPostedAtMaxAgeDays(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            min="0"
            placeholder="e.g., 7"
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="postedAtGte" className="block text-sm font-medium text-gray-700">Posted After (YYYY-MM-DD)</label>
          <input
            type="date"
            id="postedAtGte"
            value={postedAtGte}
            onChange={(e) => setPostedAtGte(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="postedAtLte" className="block text-sm font-medium text-gray-700">Posted Before (YYYY-MM-DD)</label>
          <input
            type="date"
            id="postedAtLte"
            value={postedAtLte}
            onChange={(e) => setPostedAtLte(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </fieldset>

      {/* --- Pagination --- */}
      <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <legend className="text-lg font-medium mb-2 text-gray-700 col-span-full">Pagination</legend>
        <div>
          <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-1">Page</label>
          <input
            type="number"
            id="page"
            value={page}
            onChange={(e) => setPage(Math.max(0, parseInt(e.target.value, 10)))}
            min="0"
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
          <input
            type="number"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value, 10)))}
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </fieldset>

      {/* --- Submit Button --- */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : 'Search Jobs'}
        </button>
      </div>
    </form>
  );
};

export default JobSearchForm; 