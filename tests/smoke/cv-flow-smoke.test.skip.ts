/**
 * CV Flow Smoke Tests
 * 
 * Critical smoke tests that run after every deployment
 * to ensure the CV processing pipeline is working
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '../e2e/utils/auth-helper';

test.describe('CV Flow Smoke Tests', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.ensureLoggedIn('junior_developer');
  });

  test('SMOKE: Complete CV upload and processing pipeline', async ({ page }) => {
    console.log('🚀 SMOKE TEST: Starting critical CV flow validation');
    
    // 1. Navigate to CV management
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-upload-form"]')).toBeVisible();
    
    // 2. Upload test CV
    const filePath = path.join(__dirname, '../fixtures/sample-cv.pdf');
    await page.setInputFiles('[data-testid="cv-upload-input"]', filePath);
    await page.click('[data-testid="upload-submit-button"]');
    
    // 3. Wait for upload success
    await expect(page.locator('[data-testid="upload-success-message"]')).toBeVisible({
      timeout: 30000 // CV processing can take time
    });
    
    // 4. Verify CV appears in list
    await expect(page.locator('[data-testid^="cv-row-"]')).toBeVisible();
    
    // 5. Check analysis results are available
    await page.waitForSelector('[data-testid="analysis-results"]', { timeout: 60000 });
    
    // 6. Verify experience data is displayed with new fields
    await expect(page.locator('[data-testid="experience-section"]')).toBeVisible();
    
    // 7. Check for tech stack display (new field validation)
    const techStackExists = await page.locator('[data-testid*="tech-stack"]').count() > 0;
    if (!techStackExists) {
      console.warn('⚠️ SMOKE TEST WARNING: Tech stack not displayed - possible data extraction issue');
    }
    
    console.log('✅ SMOKE TEST: CV flow pipeline validated successfully');
  });

  test('SMOKE: Health endpoint returns healthy status', async ({ page }) => {
    console.log('🏥 SMOKE TEST: Checking CV flow health endpoint');
    
    // Call health check endpoint
    const response = await page.request.get('/api/health/cv-flow?details=true');
    expect(response.status()).toBeLessThan(400);
    
    const healthData = await response.json();
    expect(healthData.status).not.toBe('error');
    
    // Log health status
    console.log('🏥 Health Status:', {
      status: healthData.status,
      successRate: healthData.metrics?.successRate,
      issues: healthData.issues?.length || 0
    });
    
    // Fail if critical issues detected
    if (healthData.status === 'degraded' && healthData.metrics?.successRate < 80) {
      throw new Error(`CV flow is degraded: ${healthData.issues?.join(', ')}`);
    }
    
    console.log('✅ SMOKE TEST: Health endpoint validated');
  });

  test('SMOKE: Data integrity validation', async ({ page }) => {
    console.log('🔍 SMOKE TEST: Validating data integrity');
    
    // Get recent CV from API
    const cvsResponse = await page.request.get('/api/cv');
    expect(cvsResponse.status()).toBe(200);
    
    const cvsData = await cvsResponse.json();
    
    if (cvsData.cvs && cvsData.cvs.length > 0) {
      const latestCV = cvsData.cvs[0];
      
      // Verify CV has required fields
      expect(latestCV.status).toBe('COMPLETED');
      expect(latestCV.improvementScore).toBeGreaterThan(0);
      
      // Get analysis data
      const analysisResponse = await page.request.get('/api/cv-analysis/latest');
      expect(analysisResponse.status()).toBe(200);
      
      const analysisData = await analysisResponse.json();
      
      // Verify analysis has new Experience fields
      const experience = analysisData.analysisResult?.experience?.[0];
      if (experience) {
        console.log('🔍 Experience data structure:', {
          hasTechStack: Array.isArray(experience.techStack),
          hasAchievements: Array.isArray(experience.achievements), 
          hasResponsibilities: Array.isArray(experience.responsibilities),
          hasTeamSize: typeof experience.teamSize === 'number'
        });
        
        // Warn if new fields are missing
        if (!Array.isArray(experience.techStack)) {
          console.warn('⚠️ SMOKE TEST WARNING: techStack field missing or invalid');
        }
        if (!Array.isArray(experience.achievements)) {
          console.warn('⚠️ SMOKE TEST WARNING: achievements field missing or invalid');
        }
        if (!Array.isArray(experience.responsibilities)) {
          console.warn('⚠️ SMOKE TEST WARNING: responsibilities field missing or invalid');
        }
      }
    }
    
    console.log('✅ SMOKE TEST: Data integrity validated');
  });
});

// Performance benchmark test
test.describe('CV Flow Performance', () => {
  test('SMOKE: CV processing performance benchmark', async ({ page }) => {
    console.log('⏱️ PERFORMANCE: Benchmarking CV processing time');
    
    const authHelper = new AuthHelper(page);
    await authHelper.ensureLoggedIn('junior_developer');
    
    await page.goto('/developer/cv-management');
    
    const startTime = Date.now();
    
    // Upload CV
    const filePath = path.join(__dirname, '../fixtures/sample-cv.pdf');
    await page.setInputFiles('[data-testid="cv-upload-input"]', filePath);
    await page.click('[data-testid="upload-submit-button"]');
    
    // Wait for completion
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible({
      timeout: 120000 // 2 minutes max
    });
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ CV Processing Time: ${processingTime}ms`);
    
    // Fail if processing takes too long
    expect(processingTime).toBeLessThan(60000); // Should complete within 1 minute
    
    // Log performance metrics
    console.log('📊 Performance Metrics:', {
      processingTimeMs: processingTime,
      processingTimeSeconds: Math.round(processingTime / 1000),
      status: processingTime < 30000 ? 'fast' : processingTime < 60000 ? 'acceptable' : 'slow'
    });
  });
});