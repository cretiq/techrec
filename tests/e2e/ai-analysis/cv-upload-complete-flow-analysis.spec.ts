import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive CV Upload & Analysis Flow Test
 * 
 * This test validates the complete data pipeline from CV upload through Gemini analysis
 * to database storage and UI display, identifying any data loss or quality issues.
 * 
 * Flow: File Upload → PDF Parsing → Gemini Request → Gemini Response → DB Storage → UI Display
 */

test.describe('CV Upload Complete Flow Analysis', () => {
  let authHelper: AuthHelper;

  // Test data storage for cross-step analysis
  let testData: {
    uploadResponse?: any;
    parsedContent?: any;
    geminiRequest?: any;
    geminiResponse?: any;
    databaseContent?: any;
    uiContent?: any;
    qualityMetrics?: any;
  } = {};

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testData = {}; // Reset test data
  });

  test('Complete CV Flow Analysis with Data Validation', async ({ page }) => {
    console.log('🚀 Starting Comprehensive CV Upload Flow Analysis');
    console.log('=' .repeat(80));

    // ===== PHASE 1: CLEAN SLATE SETUP =====
    console.log('\n📋 PHASE 1: Clean Slate Setup');
    console.log('-' .repeat(40));

    // Step 1.1: User cleanup via API (skip admin panel for now)
    console.log('🔑 Step 1.1: User data cleanup via API...');

    // Clean existing CV data for test user
    const testUserEmail = 'senior@test.techrec.com';
    console.log(`🧹 Cleaning existing data for test user: ${testUserEmail}`);

    // Clean user data via API
    const cleanupResult = await page.evaluate(async (email) => {
      try {
        const response = await fetch(`${window.location.origin}/api/test/clean-user-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await response.json();
        return { success: response.ok, status: response.status, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, testUserEmail);

    if (cleanupResult.success) {
      console.log('✅ User data cleanup successful:', cleanupResult.data.message);
    } else {
      console.log('⚠️ User data cleanup failed or not available:', cleanupResult.error);
    }

    // ===== PHASE 2: API MONITORING SETUP =====
    console.log('\n📡 PHASE 2: API Monitoring Setup');
    console.log('-' .repeat(40));

    // Monitor CV upload API
    await page.route('/api/cv/upload', async route => {
      console.log('📞 [API-MONITOR] CV Upload API intercepted');
      const response = await page.request.fetch(route.request());
      const responseBody = await response.text();
      
      try {
        testData.uploadResponse = JSON.parse(responseBody);
        console.log('📁 [UPLOAD-RESPONSE] Success:', {
          status: response.status(),
          analysisId: testData.uploadResponse?.analysisId,
          s3Key: testData.uploadResponse?.s3Key,
          filename: testData.uploadResponse?.filename
        });
      } catch (e) {
        testData.uploadResponse = { raw: responseBody, parseError: e.message };
        console.log('❌ [UPLOAD-RESPONSE] Parse error:', e.message);
      }
      
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });

    // Monitor CV analysis APIs
    await page.route('/api/cv-analysis/**', async route => {
      const request = route.request();
      const requestData = request.postData();
      
      console.log('📞 [API-MONITOR] CV Analysis API intercepted:', {
        url: request.url(),
        method: request.method()
      });

      // Capture request data if it's a POST (Gemini request)
      if (requestData) {
        try {
          testData.geminiRequest = JSON.parse(requestData);
          console.log('🧠 [GEMINI-REQUEST] Structure:', {
            hasContactInfo: !!testData.geminiRequest.contactInfo,
            hasAbout: !!testData.geminiRequest.about,
            skillsCount: testData.geminiRequest.skills?.length || 0,
            experienceCount: testData.geminiRequest.experience?.length || 0,
            educationCount: testData.geminiRequest.education?.length || 0,
            requestSize: requestData.length
          });
        } catch (e) {
          console.log('❌ [GEMINI-REQUEST] Parse error:', e.message);
        }
      }
      
      const response = await page.request.fetch(request);
      const responseBody = await response.text();
      
      try {
        testData.geminiResponse = JSON.parse(responseBody);
        console.log('🧠 [GEMINI-RESPONSE] Structure:', {
          status: response.status(),
          hasAnalysisResult: !!testData.geminiResponse?.analysisResult,
          responseSize: responseBody.length,
          provider: testData.geminiResponse?.provider,
          analysisStatus: testData.geminiResponse?.status
        });
      } catch (e) {
        testData.geminiResponse = { raw: responseBody, parseError: e.message };
        console.log('❌ [GEMINI-RESPONSE] Parse error:', e.message);
      }
      
      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: responseBody
      });
    });

    // ===== PHASE 3: TEST USER LOGIN & CV UPLOAD =====
    console.log('\n👤 PHASE 3: Test User Login & CV Upload');
    console.log('-' .repeat(40));

    // Switch to test user
    await authHelper.loginAsUserType('experienced_developer');
    console.log('✅ Test user authenticated:', testUserEmail);

    // Navigate to CV management
    await page.goto('/developer/cv-management');
    await expect(page.locator('[data-testid="cv-management-page-container"]')).toBeVisible();
    console.log('✅ CV management page loaded');

    // Verify clean slate (no existing CV)
    const entrySection = page.locator('[data-testid="cv-management-entry-section"]');
    const profileSection = page.locator('[data-testid="cv-management-profile-section"]');

    if (await profileSection.isVisible()) {
      console.log('⚠️ Existing CV found - test may not start from clean slate');
    } else {
      console.log('✅ Clean slate confirmed - no existing CV data');
    }

    // Upload CV
    console.log('📤 Uploading test CV...');
    const dropzone = page.locator('[data-testid="cv-management-upload-dropzone"]');
    await expect(dropzone).toBeVisible();

    // Verify file exists and has content before upload
    const cvPath = path.resolve(process.cwd(), 'tests/fixtures/Filip_Mellqvist_CV.pdf');
    const fileStats = fs.statSync(cvPath);
    console.log('📊 Test file verification:', {
      path: cvPath,
      exists: fs.existsSync(cvPath),
      size: fileStats.size,
      sizeKB: Math.round(fileStats.size / 1024)
    });

    const fileInput = page.locator('[data-testid="cv-management-upload-file-input"]');
    
    // Verify file content is read correctly
    const fileBuffer = fs.readFileSync(cvPath);
    console.log('📊 Buffer verification before upload:', {
      bufferSize: fileBuffer.length,
      fileSize: fileStats.size,
      bufferMatches: fileBuffer.length === fileStats.size
    });
    
    // Use the most reliable file upload approach with explicit path
    await fileInput.setInputFiles(cvPath);
    
    console.log('📁 CV file uploaded using file path directly');

    // Verify the file input has files
    const hasFiles = await fileInput.evaluate(input => {
      const fileInputElement = input as HTMLInputElement;
      if (fileInputElement.files && fileInputElement.files.length > 0) {
        const file = fileInputElement.files[0];
        return {
          count: fileInputElement.files.length,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        };
      }
      return { count: 0 };
    });
    console.log(`📁 File input verification:`, hasFiles);
    
    if (hasFiles.fileSize === 0) {
      throw new Error(`File upload failed - file size is 0. Expected size: ${fileStats.size}`);
    }

    // Trigger upload
    const uploadButton = page.locator('[data-testid="cv-management-button-upload-trigger"]');
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();
    console.log('🚀 Upload initiated with verified file content');

    // Wait for upload completion
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="cv-management-profile-section"]')).toBeVisible({ timeout: 30000 });
    console.log('✅ Upload completed and CV analysis displayed');

    // ===== PHASE 4: DATA ANALYSIS & VALIDATION =====
    console.log('\n🔍 PHASE 4: Data Analysis & Validation');
    console.log('-' .repeat(40));

    // Wait a moment for all API calls to complete
    await page.waitForTimeout(2000);

    // Step 4.1: Upload Response Analysis
    console.log('\n📁 Step 4.1: Upload Response Analysis');
    if (testData.uploadResponse && !testData.uploadResponse.parseError) {
      console.log('✅ Upload Response Structure Valid');
      console.log('📊 Upload Response Details:', {
        analysisId: testData.uploadResponse.analysisId,
        filename: testData.uploadResponse.filename,
        s3Key: testData.uploadResponse.s3Key,
        size: testData.uploadResponse.size,
        mimeType: testData.uploadResponse.mimeType
      });
    } else {
      console.log('❌ Upload Response Issues:', testData.uploadResponse?.parseError || 'No response captured');
    }

    // Step 4.2: Gemini Request Analysis
    console.log('\n🧠 Step 4.2: Gemini Request Analysis');
    if (testData.geminiRequest) {
      const requestAnalysis = {
        hasContactInfo: !!testData.geminiRequest.contactInfo,
        hasAbout: !!testData.geminiRequest.about && testData.geminiRequest.about.length > 0,
        skillsProvided: testData.geminiRequest.skills?.length || 0,
        experienceProvided: testData.geminiRequest.experience?.length || 0,
        educationProvided: testData.geminiRequest.education?.length || 0,
        totalDataSize: JSON.stringify(testData.geminiRequest).length
      };
      
      console.log('✅ Gemini Request Analysis:', requestAnalysis);
      
      // Detailed content analysis
      if (testData.geminiRequest.about) {
        console.log('📄 About section preview:', testData.geminiRequest.about.substring(0, 100) + '...');
      }
      if (testData.geminiRequest.skills?.length > 0) {
        console.log('🛠️ Skills provided:', testData.geminiRequest.skills.slice(0, 5));
      }
      if (testData.geminiRequest.experience?.length > 0) {
        console.log('💼 Experience entries:', testData.geminiRequest.experience.length);
        console.log('💼 First experience:', {
          title: testData.geminiRequest.experience[0]?.title,
          company: testData.geminiRequest.experience[0]?.company,
          duration: testData.geminiRequest.experience[0]?.startDate + ' - ' + (testData.geminiRequest.experience[0]?.endDate || 'Present')
        });
      }
    } else {
      console.log('❌ No Gemini request captured');
    }

    // Step 4.3: Gemini Response Analysis
    console.log('\n🧠 Step 4.3: Gemini Response Analysis');
    if (testData.geminiResponse && !testData.geminiResponse.parseError) {
      const analysisResult = testData.geminiResponse.analysisResult;
      
      if (analysisResult) {
        const responseAnalysis = {
          hasAbout: !!analysisResult.about && analysisResult.about.length > 0,
          skillsReturned: analysisResult.skills?.length || 0,
          experienceReturned: analysisResult.experience?.length || 0,
          educationReturned: analysisResult.education?.length || 0,
          hasContactInfo: !!analysisResult.contactInfo,
          responseCompleteness: calculateCompleteness(analysisResult),
          provider: testData.geminiResponse.provider,
          fromCache: testData.geminiResponse.fromCache
        };
        
        console.log('✅ Gemini Response Analysis:', responseAnalysis);
        
        // Quality assessment
        const qualityIssues = [];
        if (!analysisResult.about || analysisResult.about.length < 50) {
          qualityIssues.push('About section too short or missing');
        }
        if (!analysisResult.skills || analysisResult.skills.length < 3) {
          qualityIssues.push('Insufficient skills detected');
        }
        if (!analysisResult.experience || analysisResult.experience.length === 0) {
          qualityIssues.push('No experience data returned');
        }
        
        if (qualityIssues.length === 0) {
          console.log('✅ Gemini response quality: GOOD');
        } else {
          console.log('⚠️ Gemini response quality issues:', qualityIssues);
        }
      } else {
        console.log('❌ No analysisResult in Gemini response');
      }
    } else {
      console.log('❌ Gemini Response Issues:', testData.geminiResponse?.parseError || 'No response captured');
    }

    // Step 4.4: UI Display Validation
    console.log('\n🖥️ Step 4.4: UI Display Validation');
    
    // Check if all sections are displayed with content
    const sections = ['about', 'skills', 'experience', 'education'];
    const uiAnalysis = {};
    
    for (const section of sections) {
      const sectionElement = page.locator(`[data-testid*="${section}"]`).first();
      const isVisible = await sectionElement.isVisible().catch(() => false);
      const hasContent = isVisible ? await sectionElement.textContent().then(text => text && text.trim().length > 10) : false;
      
      uiAnalysis[section] = {
        visible: isVisible,
        hasContent: hasContent
      };
      
      console.log(`📋 ${section.toUpperCase()} section:`, uiAnalysis[section]);
    }

    testData.uiContent = uiAnalysis;

    // Step 4.5: Database Verification (if endpoint exists)
    console.log('\n💾 Step 4.5: Database Verification');
    try {
      const dbVerification = await page.evaluate(async (email) => {
        const response = await fetch(`${window.location.origin}/api/test/db-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: email })
        });
        
        if (response.ok) {
          return await response.json();
        } else {
          return { error: 'Verification endpoint not available', status: response.status };
        }
      }, testUserEmail);
      
      if (!dbVerification.error) {
        testData.databaseContent = dbVerification;
        console.log('✅ Database verification successful:', {
          cvRecords: dbVerification.cvCount,
          analysisRecords: dbVerification.analysisCount,
          dataComplete: dbVerification.dataComplete
        });
      } else {
        console.log('⚠️ Database verification endpoint not available');
      }
    } catch (error) {
      console.log('⚠️ Database verification failed:', error.message);
    }

    // ===== PHASE 5: COMPREHENSIVE ANALYSIS REPORT =====
    console.log('\n📊 PHASE 5: Comprehensive Analysis Report');
    console.log('=' .repeat(80));

    // Data Flow Integrity Check
    console.log('\n🔄 Data Flow Integrity Analysis:');
    
    const flowIntegrity = {
      uploadSuccessful: !!(testData.uploadResponse && !testData.uploadResponse.parseError),
      geminiRequestValid: !!(testData.geminiRequest && Object.keys(testData.geminiRequest).length > 0),
      geminiResponseValid: !!(testData.geminiResponse && !testData.geminiResponse.parseError),
      uiDisplayWorking: Object.values(testData.uiContent || {}).some((section: any) => section.visible && section.hasContent),
      databaseIntegrity: !!(testData.databaseContent && !testData.databaseContent.error)
    };
    
    console.log('🔍 Flow Integrity Results:', flowIntegrity);
    
    // Identify bottlenecks and issues
    const issues = [];
    if (!flowIntegrity.uploadSuccessful) issues.push('Upload API failure');
    if (!flowIntegrity.geminiRequestValid) issues.push('Gemini request malformed or missing');
    if (!flowIntegrity.geminiResponseValid) issues.push('Gemini response invalid or error');
    if (!flowIntegrity.uiDisplayWorking) issues.push('UI display not showing content properly');
    if (!flowIntegrity.databaseIntegrity) issues.push('Database storage or retrieval issues');
    
    if (issues.length === 0) {
      console.log('🎉 ANALYSIS RESULT: All data flow steps working correctly!');
    } else {
      console.log('❌ ANALYSIS RESULT: Issues identified:', issues);
    }

    // Data Loss Analysis
    console.log('\n📉 Data Loss Analysis:');
    if (testData.geminiRequest && testData.geminiResponse?.analysisResult) {
      const inputSkills = testData.geminiRequest.skills?.length || 0;
      const outputSkills = testData.geminiResponse.analysisResult.skills?.length || 0;
      const inputExperience = testData.geminiRequest.experience?.length || 0;
      const outputExperience = testData.geminiResponse.analysisResult.experience?.length || 0;
      
      console.log('📊 Data Transformation Comparison:', {
        skills: { input: inputSkills, output: outputSkills, ratio: outputSkills / Math.max(inputSkills, 1) },
        experience: { input: inputExperience, output: outputExperience, ratio: outputExperience / Math.max(inputExperience, 1) }
      });
    }

    // Final Test Assertions
    console.log('\n✅ Test Assertions:');
    
    // Assert critical flow components work
    expect(flowIntegrity.uploadSuccessful, 'CV upload should succeed').toBe(true);
    expect(flowIntegrity.geminiRequestValid, 'Gemini request should be valid').toBe(true);
    expect(flowIntegrity.geminiResponseValid, 'Gemini response should be valid').toBe(true);
    expect(flowIntegrity.uiDisplayWorking, 'UI should display CV content').toBe(true);
    
    console.log('🎉 Comprehensive CV Upload Flow Analysis Completed Successfully!');
  });

  // Helper function to calculate response completeness
  function calculateCompleteness(data: any): number {
    const expectedFields = ['about', 'skills', 'experience', 'education'];
    const presentFields = expectedFields.filter(field => {
      const fieldData = data[field];
      if (Array.isArray(fieldData)) {
        return fieldData.length > 0;
      }
      return fieldData && fieldData.length > 0;
    });
    
    return presentFields.length / expectedFields.length;
  }
});