API Overview
High quality job listings from LinkedIn. Includes all relevant details like: Full job description - Recruiter name, title and url - Company industry, number of followers, location, specialisties, description.

Our database indexes over 20,000 jobs every hour and contains jobs from the last 7 days. Over 2 million jobs every week! Each API call returns up to 100 jobs.

We offer a wide range of filters to narrow the results down: Job Title, Description, Location, Company, Remote.

10M+ AI-enriched LinkedIn jobs every month with Apply URL + Recruiter + Company info & Hourly refresh - Description included by default

Do you wish to retrieve jobs beyond the limits of this API? Please reach out to remco@fantastic.jobs for any custom requests.

This API makes no representations or warranties of any kind, express or implied, that it is in any way an official LinkedIn API.

This API contains publicaly available LinkedIn Job Posting Data, no member pages are scraped or indexed for the purpose of this API.

Our Other Job APIs
Career site/ATS API:
This API is designed for high quality job listings directly from the employer's career site, allowing your users to directly apply with the employer without the need of a 3rd party.

Career site/ATS API

Hiring Manager API for Lead Generation:
This API returns only jobs with:

Hiring Manager LinkedIn profiles (900k+ per month)
Hiring Manager Email addresses (50k+ per month)
This contact data is extracted directly from the jobs, no external sources are accessed, guaranteeing high quality data.

Hiring Manager API

Other APIs:
Upwork Jobs API

API with Upwork Jobs and detailled employers data.

About this API
This API is designed for job platforms requiring high quality LinkedIn job listings.

This API returns up to 100 jobs per request

You may reduce the number of jobs per request by using the limit parameter. Each plan has plenty of requests to support strategies with a lower number of jobs per API call. If you omit the limit parameter, the limit defaults to 100 jobs.

Job Credits & Request Credits
Each request deducts the number of jobs returned from your "Jobs" credits.
Each request deducts 1 credit from your "Requests" credits.
Your "Jobs" credits should run out before your "Requests" credits. This is by design.
If you have any question or require more than 200,000 jobs per month, please reach out to us at remco@fantastic.jobs
Tracking your Credit usage
There are two ways to keep track of your credits:

Each API request returns several headers, showing your how many credits you have left for Jobs and Requests: For example:
x-ratelimit-jobs-limit: 200000
x-ratelimit-jobs-remaining: 199234
x-ratelimit-requests-limit: 25000
x-ratelimit-requests-remaining: 24975
In addition, there's a header to track the time left in your plan (reset date), in seconds:

x-ratelimit-jobs-reset: 2505077
You can also track your usage on the Subscription & Usage page: https://rapidapi.com/developer/billing/subscriptions-and-usage
Important:
To prevent retrieving duplicate jobs, we encourage using the following strategy:

Call the API on a regular schedule:
Get Jobs 7 days: Call the API on the same time and day every week

Get Jobs 24h: Call the API on the same time every day.

Get Jobs 1h: Call the API on the same time every hour

Doing so will ensure that you will not retrieve the same jobs twice.

Most of our filters allow you to combine keywords, do this as much as possible. For example, you may search multiple locations using location_filter="United States" OR "United Kingdom".

If you're ever in doubt, please reach out to remco@fantastic.jobs

Endpoints
Get Jobs 7 days:
Contains LinkedIn jobs from the last 7 days

Get Jobs 24h:
Contains LinkedIn jobs indexed during the last 24h

Get Jobs Hourly - (Ultra & Mega plan)
Firehose API containing jobs indexed during the last hour (with a 2 hour delay). Perfect for one or more hourly API calls to get the freshest jobs!

The data
This API calls a database that includes LinkedIn jobs posted during the last 7 days.

The API refreshes every hour with a delay of one to two hours. For example, if a job is posted at 06:00 UTC, it will appear between 07:00 and 08:00 UTC

We index LinkedIn jobs from over 50 countries. Please see the list below and let us know if you wish for us to add any additional locations,

All jobs in the database are unique based on their URL. However, organizations occasionally create duplicates themselves. More commonly, organizations sometimes create the same job listing for multiple cities or states. If you wish to create a rich and unique dataset, we recommend further deduplication on title + organization, or title + organization + locations

We're testing AI enrichment for Technology jobs by extracting useful job details from the description with an LLM. Please see below for more information

Search
Our database can be searched with the following syntax:

Job searches are limited to 10 jobs per API call. You can easily extend your search by using the 'offset' parameter.

title_filter

Our filters are similar to searching on google:

Query	Result
Software	All jobs including software in the job title
Software Engineer	All jobs including 'software' AND 'engineer' in the job title
"Software Engineer"	All jobs including 'software' AND 'engineer' in order in the job title
Software OR Engineer	All jobs including 'software' OR 'engineer' in the job title
-"Software Engineer"	All jobs excluding 'software' AND 'engineer' in order in the job title
For advanced filtering, including parenthesis and prefix wildcard searching, please use the advanced_title_filter. Documentation can be found at the bottom of this page

Advanced Title Filter

Advanced Title filter enables more features like parenthesis, 'AND', and prefix searching.

Can't be used in combination with regular title_filter

Phrares (two words or more) always need to be single quoted or use the operator <->

Instead of using natural language like 'OR' you need to use operators like:

& (AND)
| (OR)
! (NOT)
<-> (FOLLOWED BY)
' ' (FOLLOWED BY alternative, does not work with 6. Prefix Wildcard)
:* (Prefix Wildcard)
For example:

(AI | 'Machine Learning' | 'Robotics') & ! Marketing

Will return all jobs with ai, or machine learning, or robotics in the title except titles with marketing

Project <-> Manag:*

Will return jobs like Project Manager or Project Management

Please send us a message if you're getting errors

location_filter

You can use the same syntax as title_filter for searches on Location. Please make sure to search on the full name of the location, abbreviations are not supported.

For US, please search on United States
For UK, please search on United Kingdom
For states in the United States, please search on their full name, like "New York"
For example: location_filter="United States" OR "United Kingdom"

description_filter

You can use the same syntax as title_filter for description_filter.

Warning, when using description_filter for the 7 day endpoint there's a risk of timeouts. We recommend using the description_filter with the 24h or Hourly endpoints.

If you do want to use it for the 7 day endpoint:

Avoid double quoting common keywords like "health safety"
Stick to a low limit, prefereably 10
Stick to a low offset
organization_description_filter

Filter on the job's organization LinkedIn description. You can use the same syntax as title_filter

organization_specialties_filter

Filter on the job's organization LinkedIn specialties. You can use the same syntax as title_filter

organization_slug_filter

Filter on the job's company via the slug. You can search on more than one company with a comma delimited list without spaces!. For example: organization_filter:microsoft,tesla-motors

Only allows for exact matches, please check the exact company slug before filtering.

The slug is the company specific part of the url. For example the slug in the following url is 'tesla-motors': https://www.linkedin.com/company/tesla-motors/

type_filter

Filter on a specific job type, the options are: CONTRACTOR, FULL_TIME, INTERN, OTHER, PART_TIME, TEMPORARY, VOLUNTEER

To filter on more than one job type, please delimit by comma with no space, like such: FULL_TIME,PART_TIME

industry_filter

Filter on the organization's LinkedIn Industry.

Please use the exact Industry. This filter is case sensitive.

All industries are now in English You can find an overview of all LinkedIn industries on our website

If the industry contains a comma, please double-quote. For Example: industry_filter:"Air, Water, and Waste Program Management","Accounting"

You can filter on more than one industry with a comma delimited list without spaces. For example: industry_filter=Accounting,Staffing and Recruiting

seniority_filter

Filter on the seniority level as described on the LinkedIn jobs page.

Please use the exact seniorty description. This filter is case sensitive.

Please note that certain languages might not use the English description. We recommend use both the English and any foreign language seniority descriptions

You can filter on more than one seniority description with a comma delimited list without spaces. For example: seniority_filter=Mid-Senior level,Entry level

For English, you can use the following filters. Please note that these might change so we recommend regularly checking these: Associate, Director, Executive, Mid-Senior level, Entry level, Not Applicable, Internship

Due to employers using 'Not Applicable' regularly, we recommend only using this filter when you're happy with missing out on some jobs that might be relevant.

description_type

You may optionally include the job description in the output.

'text': A plain text version of the HTML description. Might include /n breaks
This makes the API a bit slower so only include if needed.

remote

Set to 'true' to include remote jobs only. Set to 'false' to include jobs that are not remote. Leave empty to include both remote and non remote jobs

This is a derived field. We identify remote jobs by title, raw location fields, and the offical google jobs 'TELECOMMUTE' schema

agency

Use this to filter or filter-out recruitment agencies and job boards: TRUE = only recruitment agencies and job boards FALSE= only regular companies.

Please send us a message if you notice any organizations with the wrong flag.

offset

Offset allows you to paginate and include more results. For example, if you want to retrieve 30 jobs from our api you can send 3 requests with offset 0, 10, and 20. This is always a multiple of the 'limit' parameter

date_filter

You can use this filter to return only the most recent jobs, instead of all jobs from the last 7 days. This filter is a "greater than" filter. For example, if today's date is 2025-01-03 and you wish to only return jobs posted in 2025, you can filter on '2025-01-01'.

To include time, use the following syntax: '2025-01-01T14:00:00'

Please keep in mind that the jobs posted date/time is UTC and there's a 1 to 2 hour delay before jobs appear on this API.

external_apply_url

Set to True to include only jobs with an external_apply_url.

The url's are not cleaned and might include trackers like source=linkedin, utm tags, etc

this parameter is the opposite of directapply

directapply (easyapply)

Set to True to only include jobs with directapply (easyapply). Set to false to exclude jobs with directapply.

This field is very complimentary to our ATS API. Jobs with easyapply have almost no overlap with ATS jobs.

this parameter is the opposite of exernal_apply_url

employees_lte

Use this to filter on jobs from companies less than a certain number of employees. Can be used in combination with employees_gte. For example, if you wish to filter on small companies but want to exclude companies with just one employee, you can use the following query filter: employees_gte=1 employees_lte=200

employees_gte

Use this to filter on jobs from companies greater than a certain number of employees. Can be used in combination with employees_lte. For example, if you wish to filter on small companies but want to exclude companies with just one employee, you can use the following query filter: employees_gte=1 employees_lte=200

order The order of the jobs is date descending by default, if you wish to order on date ascending, please use 'asc'

include_ai

BETA Feature

We're now extracting useful insights from the job description with AI. Includes Salary, Benefits, Experience Level, Detailed Remote filters, and more. Please see the table below for all fields.

Set this field to true to include all AI-enriched fields.

AI enrichment is only performed on Technology roles listed by companies. Jobs listed by recruitment/staffing agencies and other 3rd parties are not included.

Do you see a repeated mistake in the output? Please report here

ai_work_arrangement_filter

BETA Feature.

Filter on a specific work arrangement identified by our AI, This is a more granular version of the 'remote' filter, which is quite broad the options are:

On-site (Job is on site only, no working from home available)
Hybrid (Job is in the office with one or more days remote)
Remote OK (Job is fully remote, but an office is available)
Remote Solely (Job is fully remote, and no office is available)
To filter on more than one job type, please delimit by comma with no space, like such: Hybrid,Remote OK,Remote Solely

ai_has_salary

BETA Feature.

Set to 'true' to only include jobs with a salary, either listed in salary_raw or extracted from the job description with AI

ai_experience_level_filter

BETA Feature.

Filter on a certain required experience level as identified by our AI, the options are:

0-2/2-5/5-10/10+

To filter on more than one job type, please delimit by comma with no space, like such: 0-2,2-5

ai_visa_sponsorship_filter

BETA Feature.

Filter on jobs that mention Visa sponsorship within the job description.

Output

Jobs are ordered on 'dateposted' ascending. Resulting in the most recent jobs being first in the array.

Output Fields
Name	Description	Type
id	Our internal ID. We don't recommend this for sorting	Int8
title	Job Title	text
organization	Name of the hiring organization	text
organization_url	URL to the organization's LI page	text
organization_logo	URL to the organization's logo	text
date_posted	Date & Time of posting	timestamptz
date_created	Date & Time of indexing in our systems	timestamptz
date_validthrough	Date & Time of expiration, is null in most cases	timestamptz
locations_raw	Raw location data, per the Google for Jobs requirements	json[]
locations_derived	Derived location data, which is the raw data matched with a database of locations_raw or location_requirements_raw. This is the field where you search locations on.	text[] [{city, admin (state), country}]
location_type	To identify remote jobs: 'TELECOMMUTE' per the Google for Jobs requirements	text
location_requirements_raw	Location requirement to accompany remote (TELECOMMUTE) jobs per the Google for Jobs requirements.	json[]
salary_raw	raw Salary data per the Google for Jobs requirements	json
employment_type	Types like 'Full Time", "Contract", "Internship" etc. Is an array but most commonly just a single value.	text[]
url	The URL of the job, can be used to direct traffic to apply for the job	text
source	in this case 'linkedin'	text
source_type	in this case 'jobboard'	text
source_domain	this domain can help you ID the country from where the job was posted. linkedin.com is the US, uk.linkedin.com the uk etc.	text
description_text	plain text job description - if included	text
cities_derived	All cities from locations_derived	json[]
regions_derived	All regions/states/provinces from locations_derived	json[]
countries_derived	All countries from locations_derived	json[]
timezones_derived	Timezones derived from locations_derived	json[]
lats_derived	lats derived from locations_derived	json[]
lngs_derived	lngs derived from locations_derived	json[]
remote_derived	jobs flagged as remote, by title, raw location, and the offical google jobs 'TELECOMMUTE' schema	bool
seniority	Seniority level: Associate, Director, Executive, Mid-Senior level, Entry level, Not Applicable, Internship	text
directapply	'true' if the end user can apply directly on the job page, in this case LinkedIn "easyapply". False if the job contains a link to a 3rd party	bool
recruiter_name	name of the recruiter (if present)	text
recruiter_title	title of the recruiter (if present)	text
recruiter_url	url to the LI profile of the recruiter (if present)	text
linkedin_org_employees	the number of employess within the job's company according to LI	int
linkedin_org_url	url to the company page	text
linkedin_org_size	the number of employess within the job's company according to the company	text
linkedin_org_slogan	the company's slogan	text
linkedin_org_industry	the company's industry. This is a fixed list that the company can choose from, so could be useful for classification.	text
linkedin_org_followers	the company's followers on LI	int
linkedin_org_headquarters	the company's HQ location	text
linkedin_org_type	the company's type, like 'privately held', 'public', etc	text
linkedin_org_foundeddate	the company's founded date	text
linkedin_org_specialties	a comma delimited list of the company's specialites	text[]
linkedin_org_locations	the full address of the company's locations	text[]
linkedin_org_description	the description fo the company's linkedin page	text
linkedin_org_recruitment_agency_derived	If the company is a recruitment agency, true or false. We identify this for each company using an LLM. The accuracy may value and jobboards might be flagged as false.	bool
linkedin_org_slug	The slug is the company specific part of the url. For example the slug in the following url is 'tesla-motors': https://www.linkedin.com/company/tesla-motors/	text
AI Output Fields
BETA Feature

AI enrichment is enabled for Technology roles. Recruitment agencies are excluded.

Set include_ai to true to include the fields in this table These fields are derived from the text with an LLM and might contain mistakes.

Name	Description	Type
ai_salary_currency	The salary currency	text
ai_salary_value	The salary value, if there's a single salary with no salary range	numeric
ai_salary_minvalue	The salary minimum salary in a range	numeric
ai_salary_maxvalue	The salary maximum salary in a range	numeric
ai_salary_unittext	If the salary is per HOUR/DAY/WEEK/MONTH/YEAR	text
ai_benefits	An array with other non-salary benefits mentioned in the job listing	text[]
ai_experience_level	years of experience required, one of: 0-2, 2-5, 5-10, or 10+	text
ai_work_arrangement	Remote Solely/Remote OK/Hybrid/On-site. Remote solely is remote without an office available, Remote OK is remote with an optional office.	text
ai_work_arrangement_office_days	when work_arrangement is Hybrid, returns the number of days per week in office	bigint
ai_remote_location	When remote but only in a certain location, returns the location	text[]
ai_remote_location_derived	Derived remote location data, which is the raw data (ai_remote_location) matched with a database of locations. This is the same database as the locations_derived field.	text[]
ai_key_skills	An array of key skills mentioned in the job listing	text[]
ai_hiring_manager_name	If present, the hiring manager name	text
ai_hiring_manager_email_address	If present, the hiring manager's email address	text
ai_core_responsibilities	A 2-sentence summary of the job's core responsibilities	text
ai_requirements_summary	A 2-sentence summary of the job's requirements	text
ai_working_hours	The number of required working hours. Defaults to 40 if not mentioned	bigint
ai_employment_type	One or more employment types as derived from the job description: FULL_TIME/PART_TIME/CONTRACTOR/TEMPORARY/INTERN/VOLUNTEER/PER_DIEM/OTHER	text[]
ai_job_language	The language of the job description	text
ai_visa_sponsorship	Returns true if the job description mentions Visa sponsorship opportunities	boolean
