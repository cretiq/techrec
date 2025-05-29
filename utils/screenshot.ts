import puppeteer from 'puppeteer';
import path from 'path';

export async function takeScreenshot(url: string, filename: string, options?: {
  width?: number;
  height?: number;
  fullPage?: boolean;
  headless?: boolean;
}) {
  const browser = await puppeteer.launch({
    headless: options?.headless ?? true,
  });
  
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({
    width: options?.width ?? 1200,
    height: options?.height ?? 800,
  });
  
  // Navigate to the URL
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Generate timestamp for unique filenames
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotFilename = `${filename}_${timestamp}.png`;
  const screenshotPath = path.join(process.cwd(), 'screenshots', screenshotFilename);
  
  // Take screenshot
  await page.screenshot({
    path: screenshotPath,
    fullPage: options?.fullPage ?? false,
  });
  
  await browser.close();
  
  console.log(`Screenshot saved to: ${screenshotPath}`);
  return screenshotPath;
}

// Example usage:
// takeScreenshot('http://localhost:3000', 'homepage', { width: 1920, height: 1080 });