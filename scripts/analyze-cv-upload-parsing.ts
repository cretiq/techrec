#!/usr/bin/env ts-node

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { CvUploadDebugLogger } from '../utils/cvUploadDebugLogger';
import { DirectUploadDebugLogger } from '../utils/directUploadDebugLogger';
import fs from 'fs';

/**
 * Analyze CV Upload Parsing Flow
 * 
 * Analyzes both CV upload pipelines:
 * TRADITIONAL FLOW:
 * 1. PDF Parsing Quality
 * 2. Gemini Request Formation
 * 3. Gemini Response Analysis
 * 4. Profile Sync Transformation
 * 
 * DIRECT UPLOAD FLOW:
 * 1. File Upload to Gemini
 * 2. Gemini Analysis Request/Response
 * 3. Profile Sync Transformation
 */

interface AnalysisFindings {
  stage: string;
  findings: string[];
  improvements: string[];
  metrics: any;
}

async function analyzeCvUploadParsing() {
  console.log('🔍 Analyzing CV Upload Flow...\n');
  
  // Check for both traditional and direct upload sessions
  const traditionalSession = CvUploadDebugLogger.getLatestSession();
  const directSession = DirectUploadDebugLogger.getLatestSession();
  
  if (!traditionalSession && !directSession) {
    console.log('❌ No debug sessions found. Please:');
    console.log('1. Set DEBUG_CV_UPLOAD=true in your environment');
    console.log('2. Upload a CV through the UI at /developer/cv-management');
    console.log('3. Run this script again');
    console.log('');
    console.log('📋 This script detects both upload methods:');
    console.log('- Traditional Flow: Set ENABLE_DIRECT_GEMINI_UPLOAD=false');
    console.log('- Direct Upload Flow: Set ENABLE_DIRECT_GEMINI_UPLOAD=true');
    return;
  }

  // Determine which method to analyze based on available sessions
  let useTraditional = false;
  let useDirect = false;
  
  if (traditionalSession && directSession) {
    // Both available - use the most recent one
    const traditionalTime = traditionalSession.sessionId;
    const directTime = directSession.sessionId;
    
    if (traditionalTime > directTime) {
      console.log('📊 Found both session types. Using most recent: TRADITIONAL FLOW');
      useTraditional = true;
    } else {
      console.log('📊 Found both session types. Using most recent: DIRECT UPLOAD FLOW');
      useDirect = true;
    }
  } else if (traditionalSession) {
    console.log('📊 Detected session type: TRADITIONAL FLOW');
    useTraditional = true;
  } else {
    console.log('📊 Detected session type: DIRECT UPLOAD FLOW');
    useDirect = true;
  }

  if (useDirect) {
    console.log('🚀 Routing to Direct Upload analyzer...\n');
    console.log('💡 For detailed direct upload analysis, run: npx tsx scripts/analyze-direct-upload.ts\n');
    
    // Run simplified direct upload analysis
    await analyzeDirectUploadSimple(directSession!);
  } else if (useTraditional) {
    console.log('📄 Analyzing Traditional Upload Flow...\n');
    await analyzeTraditionalFlow(traditionalSession!);
  }
}

async function analyzeDirectUploadSimple(latestSession: any) {
  console.log(`📊 Analyzing direct upload session: ${latestSession.sessionId}`);
  console.log(`📁 Session files found: ${latestSession.allFiles.length}\n`);
  
  const sessionData = DirectUploadDebugLogger.readSession(latestSession.sessionId);
  
  if (!sessionData) {
    console.log('❌ Failed to read session data');
    return;
  }

  // Quick summary of direct upload results
  console.log('=== DIRECT UPLOAD SUMMARY ===');
  
  if (sessionData.upload) {
    console.log(`✅ File Upload: ${sessionData.upload.uploadToGemini.success ? 'Success' : 'Failed'} (${sessionData.upload.uploadToGemini.uploadDuration}ms)`);
  }
  
  if (sessionData.analysis) {
    console.log(`✅ Gemini Analysis: ${sessionData.analysis.response.success ? 'Success' : 'Failed'} (${sessionData.analysis.response.analysisDuration}ms)`);
    if (sessionData.analysis.analysis.dataQuality) {
      const q = sessionData.analysis.analysis.dataQuality;
      console.log(`   - Contact Info: ${q.hasContactInfo ? '✅' : '❌'}`);
      console.log(`   - Experience: ${q.experienceCount} items`);
      console.log(`   - Skills: ${q.skillsCount} items`);
    }
  }
  
  if (sessionData.sync) {
    console.log(`✅ Profile Sync: ${sessionData.sync.sync.success ? 'Success' : 'Failed'} (${sessionData.sync.sync.duration}ms)`);
    console.log(`   - Improvement Score: ${sessionData.sync.sync.improvementScore}`);
  }

  const totalDuration = (sessionData.upload?.uploadToGemini.uploadDuration || 0) + 
                       (sessionData.analysis?.response.analysisDuration || 0) + 
                       (sessionData.sync?.sync.duration || 0);
  
  console.log(`\n📊 Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(1)}s)`);
  console.log('🎯 Pipeline Status: Direct Upload Workflow Complete');
  console.log('\n💡 For detailed analysis, run: npx tsx scripts/analyze-direct-upload.ts');
}

async function analyzeTraditionalFlow(latestSession: any) {
  
  console.log(`📊 Analyzing session: ${latestSession.sessionId}`);
  console.log(`📁 Session files found: ${latestSession.allFiles.length}\n`);
  
  // Read all session data
  const sessionData = CvUploadDebugLogger.readSession(latestSession.sessionId);
  
  if (!sessionData) {
    console.log('❌ Failed to read session data');
    return;
  }

  const allFindings: AnalysisFindings[] = [];

  // === STAGE 1: PDF PARSING ANALYSIS ===
  console.log('=== STAGE 1: PDF PARSING ANALYSIS ===');
  if (sessionData.parsing) {
    const parsing = sessionData.parsing;
    console.log(`CV ID: ${parsing.cvId}`);
    console.log(`Developer ID: ${parsing.developerId}`);
    console.log(`File: ${parsing.fileInfo.filename} (${parsing.fileInfo.mimeType})`);
    console.log(`File Size: ${(parsing.fileInfo.fileSize / 1024).toFixed(1)} KB`);
    console.log(`Parsing Duration: ${parsing.parsing.duration}ms`);
    console.log(`\nParsing Results:`);
    console.log(`- Text Length: ${parsing.parsing.textLength} characters`);
    console.log(`- Estimated Words: ${parsing.parsing.estimatedWords}`);
    console.log(`- Estimated Lines: ${parsing.parsing.estimatedLines}`);
    console.log(`- Has Content: ${parsing.parsing.hasContent ? '✅' : '❌'}`);
    
    console.log('\nText Sample (First 10 lines):');
    parsing.parsing.textSample.firstLines.forEach((line: string, idx: number) => {
      console.log(`  ${idx + 1}: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
    });

    // Analysis findings for PDF parsing
    const parsingFindings: string[] = [];
    const parsingImprovements: string[] = [];

    if (!parsing.parsing.hasContent) {
      parsingFindings.push('PDF parsing failed - no text extracted');
      parsingImprovements.push('Check PDF file integrity and parser compatibility');
    }

    if (parsing.parsing.textLength < 100) {
      parsingFindings.push('Very short text extracted - possible parsing issue');
      parsingImprovements.push('Verify PDF is not image-based or protected');
    }

    if (parsing.parsing.estimatedWords < 50) {
      parsingFindings.push('Low word count suggests incomplete parsing');
      parsingImprovements.push('Consider alternative parsing methods');
    }

    const parsingQuality = parsing.parsing.textLength > 1000 && parsing.parsing.estimatedWords > 100;
    console.log(`\nParsing Quality: ${parsingQuality ? '✅ Good' : '⚠️ Needs Review'}`);

    allFindings.push({
      stage: 'PDF Parsing',
      findings: parsingFindings,
      improvements: parsingImprovements,
      metrics: {
        textLength: parsing.parsing.textLength,
        estimatedWords: parsing.parsing.estimatedWords,
        estimatedLines: parsing.parsing.estimatedLines,
        duration: parsing.parsing.duration,
        quality: parsingQuality
      }
    });
  } else {
    console.log('❌ PDF parsing data not found');
  }

  // === STAGE 2: GEMINI REQUEST ANALYSIS ===
  console.log('\n=== STAGE 2: GEMINI REQUEST ANALYSIS ===');
  if (sessionData.request) {
    const request = sessionData.request;
    console.log(`Model: ${request.request.model}`);
    console.log(`Estimated Tokens: ${request.request.estimatedTokens}`);
    console.log(`Input Text Length: ${request.request.inputTextLength} characters`);
    console.log(`Prompt Length: ${request.request.promptLength} characters`);
    console.log('\nPrompt Structure Analysis:');
    console.log(`- Has JSON Schema: ${request.request.promptStructure.hasJsonSchema ? '✅' : '❌'}`);
    console.log(`- Has Examples: ${request.request.promptStructure.hasExamples ? '✅' : '❌'}`);
    console.log(`- Has Validation Rules: ${request.request.promptStructure.hasValidationRules ? '✅' : '❌'}`);

    // Analysis findings for Gemini request
    const requestFindings: string[] = [];
    const requestImprovements: string[] = [];

    if (request.request.estimatedTokens > 100000) {
      requestFindings.push('Very large input - may hit token limits');
      requestImprovements.push('Consider chunking or summarizing input text');
    }

    if (!request.request.promptStructure.hasJsonSchema) {
      requestFindings.push('Missing JSON schema in prompt');
      requestImprovements.push('Add structured JSON schema for better extraction');
    }

    allFindings.push({
      stage: 'Gemini Request',
      findings: requestFindings,
      improvements: requestImprovements,
      metrics: {
        estimatedTokens: request.request.estimatedTokens,
        inputTextLength: request.request.inputTextLength,
        promptLength: request.request.promptLength,
        promptStructure: request.request.promptStructure
      }
    });
  } else {
    console.log('❌ Gemini request data not found');
  }

  // === STAGE 3: GEMINI RESPONSE ANALYSIS ===
  console.log('\n=== STAGE 3: GEMINI RESPONSE ANALYSIS ===');
  if (sessionData.response) {
    const response = sessionData.response;
    console.log(`Duration: ${response.response.duration}ms`);
    console.log(`Raw Response Length: ${response.response.rawResponseLength} characters`);
    console.log(`Parsing Success: ${response.response.parsingSuccess ? '✅' : '❌'}`);
    console.log(`Validation: ${response.response.validationResult.isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    if (response.response.validationResult.errors.length > 0) {
      console.log(`Errors: ${response.response.validationResult.errors.join(', ')}`);
    }
    if (response.response.validationResult.warnings.length > 0) {
      console.log(`Warnings: ${response.response.validationResult.warnings.join(', ')}`);
    }

    console.log('\nExtracted Data Quality:');
    const extracted = response.response.extractedDataQuality;
    console.log(`- Contact Info: ${extracted.hasContactInfo ? '✅' : '❌'}`);
    console.log(`- About/Summary: ${extracted.hasAbout ? '✅' : '❌'}`);
    console.log(`- Skills: ${extracted.skillsCount} items`);
    console.log(`- Experience: ${extracted.experienceCount} items`);
    console.log(`- Education: ${extracted.educationCount} items`);
    console.log(`- Achievements: ${extracted.achievementsCount} items`);

    console.log('\nData Completeness Analysis:');
    const completeness = response.analysis.dataCompleteness;
    console.log(`- Total Fields Extracted: ${completeness.totalFields}`);
    if (completeness.missingFields.length > 0) {
      console.log(`- Missing Fields: ${completeness.missingFields.join(', ')}`);
    }

    // Analysis findings for Gemini response
    const responseFindings: string[] = [];
    const responseImprovements: string[] = [];

    if (!response.response.parsingSuccess) {
      responseFindings.push('Gemini response parsing failed');
      responseImprovements.push('Review response format and JSON structure');
    }

    if (!extracted.hasContactInfo) {
      responseFindings.push('No contact information extracted');
      responseImprovements.push('Improve contact info parsing in prompt');
    }

    if (extracted.experienceCount === 0) {
      responseFindings.push('No experience items extracted');
      responseImprovements.push('Enhance experience extraction guidelines');
    }

    if (extracted.skillsCount < 5) {
      responseFindings.push('Very few skills extracted');
      responseImprovements.push('Improve skill detection and categorization');
    }

    const overallQuality = extracted.hasContactInfo && extracted.experienceCount > 0 && extracted.skillsCount > 0;
    console.log(`\nExtraction Quality: ${overallQuality ? '✅ Good' : '⚠️ Needs Review'}`);

    allFindings.push({
      stage: 'Gemini Response',
      findings: responseFindings,
      improvements: responseImprovements,
      metrics: {
        duration: response.response.duration,
        parsingSuccess: response.response.parsingSuccess,
        validationResult: response.response.validationResult,
        extractedDataQuality: extracted,
        dataCompleteness: completeness,
        overallQuality
      }
    });
  } else {
    console.log('❌ Gemini response data not found');
  }

  // === STAGE 4: PROFILE SYNC ANALYSIS ===
  console.log('\n=== STAGE 4: PROFILE SYNC ANALYSIS ===');
  if (sessionData.sync) {
    const sync = sessionData.sync;
    console.log(`Duration: ${sync.sync.duration}ms`);
    console.log(`Success: ${sync.sync.success ? '✅' : '❌'}`);
    
    console.log('\nItems Synced:');
    const synced = sync.sync.itemsSynced;
    console.log(`- Contact Info: ${synced.contactInfo ? '✅' : '❌'}`);
    console.log(`- Experience Items: ${synced.experience}`);
    console.log(`- Education Items: ${synced.education}`);
    console.log(`- Skills: ${synced.skills}`);
    console.log(`- Achievements: ${synced.achievements}`);

    console.log('\nData Transformation:');
    const transform = sync.sync.dataTransformation;
    console.log(`- Contact Info Fields: ${transform.contactInfoFields.join(', ')}`);
    console.log(`- Experience Fields: ${transform.experienceFields.join(', ')}`);
    console.log(`- Skills Sample: ${JSON.stringify(transform.skillsStructure)}`);

    if (sync.error) {
      console.log(`\n❌ Sync Error: ${sync.error.message}`);
    }

    // Analysis findings for profile sync
    const syncFindings: string[] = [];
    const syncImprovements: string[] = [];

    if (!sync.sync.success) {
      syncFindings.push('Profile sync failed');
      syncImprovements.push('Review database connection and data validation');
    }

    if (synced.experience === 0) {
      syncFindings.push('No experience items synced to profile');
      syncImprovements.push('Check experience data transformation logic');
    }

    if (synced.skills === 0) {
      syncFindings.push('No skills synced to profile');
      syncImprovements.push('Review skills categorization and storage');
    }

    const syncQuality = sync.sync.success && synced.experience > 0 && synced.skills > 0;
    console.log(`\nSync Quality: ${syncQuality ? '✅ Good' : '⚠️ Needs Review'}`);

    allFindings.push({
      stage: 'Profile Sync',
      findings: syncFindings,
      improvements: syncImprovements,
      metrics: {
        duration: sync.sync.duration,
        success: sync.sync.success,
        itemsSynced: synced,
        dataTransformation: transform,
        quality: syncQuality
      }
    });
  } else {
    console.log('❌ Profile sync data not found');
  }

  // === OVERALL ANALYSIS SUMMARY ===
  console.log('\n=== OVERALL ANALYSIS SUMMARY ===');
  
  const allFindingsFlat = allFindings.flatMap(stage => stage.findings);
  const allImprovements = allFindings.flatMap(stage => stage.improvements);
  
  console.log('\n📋 Key Findings:');
  if (allFindingsFlat.length === 0) {
    console.log('✅ No major issues found');
  } else {
    allFindingsFlat.forEach((finding, idx) => {
      console.log(`${idx + 1}. ${finding}`);
    });
  }
  
  console.log('\n💡 Improvement Recommendations:');
  if (allImprovements.length === 0) {
    console.log('✅ Pipeline working optimally');
  } else {
    allImprovements.forEach((improvement, idx) => {
      console.log(`${idx + 1}. ${improvement}`);
    });
  }

  console.log('\n📊 Pipeline Health:');
  const stageQualities = allFindings.map(stage => stage.metrics.quality !== false);
  const healthyStages = stageQualities.filter(Boolean).length;
  const totalStages = stageQualities.length;
  const overallHealth = (healthyStages / totalStages) * 100;
  
  console.log(`- Stages Analyzed: ${totalStages}`);
  console.log(`- Healthy Stages: ${healthyStages}`);
  console.log(`- Overall Health: ${overallHealth.toFixed(1)}%`);
  
  if (overallHealth >= 75) {
    console.log('🎉 Pipeline Status: HEALTHY');
  } else if (overallHealth >= 50) {
    console.log('⚠️ Pipeline Status: NEEDS ATTENTION');
  } else {
    console.log('🚨 Pipeline Status: CRITICAL ISSUES');
  }

  // Save analysis summary
  const analysisSummary = {
    sessionId: latestSession.sessionId,
    timestamp: new Date().toISOString(),
    findings: allFindingsFlat,
    improvements: allImprovements,
    stageAnalysis: allFindings,
    overallHealth: {
      percentage: overallHealth,
      status: overallHealth >= 75 ? 'HEALTHY' : overallHealth >= 50 ? 'NEEDS_ATTENTION' : 'CRITICAL',
      stagesAnalyzed: totalStages,
      healthyStages: healthyStages
    },
    metrics: {
      parsingDuration: sessionData.parsing?.parsing.duration,
      geminiDuration: sessionData.response?.response.duration,
      syncDuration: sessionData.sync?.sync.duration,
      totalTextLength: sessionData.parsing?.parsing.textLength,
      extractedItems: {
        experience: sessionData.response?.response.extractedDataQuality.experienceCount,
        skills: sessionData.response?.response.extractedDataQuality.skillsCount,
        education: sessionData.response?.response.extractedDataQuality.educationCount
      }
    }
  };

  CvUploadDebugLogger.logAnalysisSummary(analysisSummary);
  console.log('\n✅ Analysis complete and saved!');
}

// Run the analysis
analyzeCvUploadParsing().catch(console.error);