import * as cheerio from 'cheerio';
import { z } from 'zod';

// Define the schema for the expected response from the scraping API
const ScrapeResponseSchema = z.object({
  content: z.string(),
});

// A class to encapsulate the logic for scraping job descriptions.
// This approach makes it easier to manage dependencies and mock for testing.
class JobScraper {
  private apiKey: string;
  private baseUrl = 'https://api.brightdata.com/scraper/v2'; // Example: Using BrightData

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error('SCRAPING_API_KEY is not set in environment variables.');
    }
    this.apiKey = apiKey;
  }

  /**
   * Scrapes the job description from a given LinkedIn URL.
   *
   * @param url The URL of the LinkedIn job posting.
   * @returns The text content of the job description, or null if scraping fails.
   */
  async scrapeJobDescription(url: string): Promise<string | null> {
    console.log(`Starting scrape for URL: ${url}`);
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url: url,
          // Additional parameters for the scraping service can be added here
          // e.g., country, rendering, etc.
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `Scraping API request failed with status ${response.status}: ${errorBody}`
        );
        return null;
      }

      const result = await response.json();
      const validatedResult = ScrapeResponseSchema.safeParse(result);

      if (!validatedResult.success) {
        console.error('Scraping API response validation failed:', validatedResult.error);
        return null;
      }

      const htmlContent = validatedResult.data.content;
      const $ = cheerio.load(htmlContent);

      // LinkedIn's job description is typically in a div with a specific class.
      // This selector is subject to change if LinkedIn updates their layout.
      const descriptionSelector = '.jobs-description__content .jobs-box__html-content';
      const descriptionHtml = $(descriptionSelector).html();

      if (!descriptionHtml) {
        console.warn(`Could not find job description selector ('${descriptionSelector}') in the HTML content for URL: ${url}`);
        return null;
      }

      // Clean up the extracted text
      const cleanedText = this.cleanText(descriptionHtml);

      console.log(`Successfully scraped and processed description for URL: ${url}`);
      return cleanedText;
    } catch (error) {
      console.error(`An unexpected error occurred during scraping for URL ${url}:`, error);
      return null;
    }
  }

  /**
   * Cleans the HTML content by converting block-level tags to newlines
   * and removing all other HTML tags.
   *
   * @param html The HTML string to clean.
   * @returns A clean text string.
   */
  private cleanText(html: string): string {
    // Replace block-level elements with newlines for better readability
    const blockElements = ['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    let text = html;
    blockElements.forEach(tag => {
      text = text.replace(new RegExp(`</${tag}>`, 'g'), '\n');
    });

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities and trim whitespace
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}

// Export a singleton instance of the scraper
export const jobScraper = new JobScraper(process.env.SCRAPING_API_KEY);
