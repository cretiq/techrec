# Feature Request #28: AI-Powered Job Description Scraping for Enhanced Content Generation

**Status:** In Progress  
**Priority:** High  
**Risk Level:** Medium (Mitigated by using a third-party API)

**Goal:** To dramatically improve the quality and relevance of AI-generated content, such as cover letters, by dynamically scraping and incorporating the full "About the job" section from LinkedIn job postings into the generation prompt.

**User Story:** As a developer using the Writing Help feature, when I generate a cover letter for a role that has a LinkedIn job posting link, I want the AI to automatically read the full job description from that link. This way, the generated content can be highly tailored, incorporating key details, responsibilities, and qualifications from the "About the job" section, making my application significantly more compelling and relevant.

**Success Metrics:**
- Generated cover letters for roles with LinkedIn links show a measurable increase in keyword overlap with the original job description.
- User acceptance rate of generated cover letters increases by 25% for roles with scraped content.
- The system successfully scrapes content from 95%+ of valid LinkedIn job posting URLs via the third-party API.
- End-to-end generation time, including scraping, remains under a reasonable threshold (e.g., 15 seconds) to maintain a good user experience.

**Technical Implementation Plan (Revised):**

1.  **Third-Party Scraping Service Integration:**
    -   A new utility (`utils/scrapers/jobScraper.ts`) will be created to abstract the third-party scraping API (e.g., BrightData, ScrapingBee).
    -   This service will handle making requests to the external API, passing the job posting URL, and processing the returned HTML.
    -   It will use `cheerio` to parse the HTML and extract the relevant job description text.
    -   The service will include robust error handling and return `null` if scraping fails, allowing the generation process to continue gracefully.

2.  **API Layer Modification & Caching:**
    -   The primary content generation API (`/api/generate-cover-letter`) will be modified.
    -   It will check if the `SavedRole` object contains a `jobPostingUrl`.
    -   **Redis Caching:** Before making a scraping request, the API will check Redis for a cached version of the job description (using the URL as the key). If found, it will use the cached data.
    -   If not cached, it will call the new `jobScraper` service. The successfully scraped content will be stored in Redis with a 1-hour TTL to reduce costs and latency.

3.  **AI Prompt Engineering:**
    -   The scraped job description text will be sanitized and injected into a new section of the AI prompt (e.g., `CONTEXT_FROM_JOB_POSTING: "{scraped_text}"`).
    -   The system prompt will be updated to explicitly instruct the AI to prioritize the scraped content.

4.  **Environment Configuration:**
    -   A new environment variable, `SCRAPING_API_KEY`, will be added to store the API key for the third-party service.

**Acceptance Criteria:**
- [ ] A new `jobScraper.ts` utility is created to integrate with a third-party scraping API.
- [ ] The `/api/generate-cover-letter` endpoint is modified to include the web scraping step for `jobPostingUrl` found in `SavedRole` data.
- [ ] Scraped content is cached in Redis for 1 hour to optimize performance and cost.
- [ ] The AI prompt for cover letters is enhanced to include the scraped content, with instructions to use it.
- [ ] Generated cover letters for applicable roles reflect the specific details and language of the job description.
- [ ] The system gracefully handles failures in the scraping process by proceeding without the extra context.
- [ ] The UI provides clear feedback to the user that the job description is being analyzed (e.g., "Analyzing job description...").
- [ ] The `SCRAPING_API_KEY` is added to the environment configuration.

**Questions Resolved:**
- [x] **Scraping Technology**: ✅ **RESOLVED** - Will use a reliable third-party scraping API to mitigate technical and legal risks.
- [x] **Latency Handling**: ✅ **RESOLVED** - Latency will be managed via Redis caching and informative frontend loading states.
- [x] **Resilience**: ✅ **RESOLVED** - The scraper utility will be designed to be resilient to layout changes (handled by the third party) and the API will have graceful fallbacks.
- [x] **Scope**: ✅ **RESOLVED** - The feature will be available to all users for roles with a valid LinkedIn URL. Non-LinkedIn URLs will be ignored for now.

**Dependencies:**
- [x] A third-party web scraping service subscription and API key.
- [ ] Modifications to the `/api/generate-cover-letter` API route.
- [ ] Updates to the frontend loading indicators in `app/developer/writing-help/page.tsx`.
- [x] Redis for caching scraped content.