#!/usr/bin/env ts-node

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { DirectUploadDebugLogger } from '../utils/directUploadDebugLogger';
import fs from 'fs';

/**
 * Analyze Direct Gemini Upload Flow
 * 
 * Analyzes the complete Direct Gemini Upload pipeline:
 * 1. File Upload to Gemini Quality
 * 2. Gemini Analysis Request/Response Quality
 * 3. Profile Sync Transformation Quality
 */

interface AnalysisFindings {
  stage: string;
  findings: string[];
  improvements: string[];
  metrics: any;
}

async function analyzeDirectUpload() {
  console.log('🚀 Analyzing Direct Gemini Upload Flow...\n');
  
  const latestSession = DirectUploadDebugLogger.getLatestSession();
  
  if (!latestSession) {
    console.log('❌ No direct upload debug sessions found. Please:');
    console.log('1. Set DEBUG_CV_UPLOAD=true in your environment');
    console.log('2. Set ENABLE_DIRECT_GEMINI_UPLOAD=true in your environment');
    console.log('3. Upload a CV through the UI at /developer/cv-management');
    console.log('4. Run this script again');
    return;
  }
  
  console.log(`📊 Analyzing direct upload session: ${latestSession.sessionId}`);
  console.log(`📁 Session files found: ${latestSession.allFiles.length}\n`);
  
  // Read all session data
  const sessionData = DirectUploadDebugLogger.readSession(latestSession.sessionId);
  
  if (!sessionData) {
    console.log('❌ Failed to read session data');
    return;
  }

  const allFindings: AnalysisFindings[] = [];

  // === STAGE 1: FILE UPLOAD TO GEMINI ANALYSIS ===
  console.log('=== STAGE 1: FILE UPLOAD TO GEMINI ANALYSIS ===');
  if (sessionData.upload) {
    const upload = sessionData.upload;
    console.log(`CV ID: ${upload.cvId}`);
    console.log(`Developer ID: ${upload.developerId}`);
    console.log(`File: ${upload.fileInfo.originalFilename} (${upload.fileInfo.mimeType})`);
    console.log(`Local File Size: ${(upload.fileInfo.localFileSize / 1024).toFixed(1)} KB`);
    console.log(`Upload Duration: ${upload.uploadToGemini.uploadDuration}ms`);
    console.log(`\nUpload Results:`);
    console.log(`- Upload Success: ${upload.uploadToGemini.success ? '✅' : '❌'}`);
    console.log(`- Gemini File URI: ${upload.uploadToGemini.fileUri ? 'Present' : 'Missing'}`);
    console.log(`- Gemini File Size: ${upload.uploadToGemini.geminiFileSize || 'N/A'} bytes`);
    console.log(`- File Name in Gemini: ${upload.uploadToGemini.geminiFileName || 'N/A'}`);
    
    console.log('\nValidation Results:');
    console.log(`- File Size Valid: ${upload.validation.fileSizeValid ? '✅' : '❌'}`);
    console.log(`- MIME Type Supported: ${upload.validation.mimeTypeSupported ? '✅' : '❌'}`);
    console.log(`- Upload Successful: ${upload.validation.uploadSuccessful ? '✅' : '❌'}`);

    // Analysis findings for file upload
    const uploadFindings: string[] = [];
    const uploadImprovements: string[] = [];

    if (!upload.uploadToGemini.success) {
      uploadFindings.push('File upload to Gemini failed');
      uploadImprovements.push('Check Gemini API credentials and file compatibility');
    }

    if (upload.uploadToGemini.uploadDuration && upload.uploadToGemini.uploadDuration > 30000) {
      uploadFindings.push('Upload took longer than 30 seconds');
      uploadImprovements.push('Consider optimizing file size or checking network connectivity');
    }

    if (!upload.validation.fileSizeValid) {
      uploadFindings.push('File size validation failed');
      uploadImprovements.push('Ensure file is within size limits (10MB max)');
    }

    if (!upload.validation.mimeTypeSupported) {
      uploadFindings.push('MIME type not supported');
      uploadImprovements.push('Use supported file formats (PDF, DOCX, DOC, TXT)');
    }

    const uploadQuality = upload.uploadToGemini.success && upload.validation.fileSizeValid && upload.validation.mimeTypeSupported;
    console.log(`\nUpload Quality: ${uploadQuality ? '✅ Good' : '⚠️ Needs Review'}`);

    allFindings.push({
      stage: 'File Upload to Gemini',
      findings: uploadFindings,
      improvements: uploadImprovements,
      metrics: {
        uploadDuration: upload.uploadToGemini.uploadDuration,
        fileSize: upload.fileInfo.localFileSize,
        geminiFileSize: upload.uploadToGemini.geminiFileSize,
        uploadSuccess: upload.uploadToGemini.success,
        validationsPass: upload.validation.fileSizeValid && upload.validation.mimeTypeSupported,
        quality: uploadQuality
      }
    });
  } else {
    console.log('❌ File upload data not found');
  }

  // === STAGE 2: GEMINI ANALYSIS REQUEST/RESPONSE ===
  console.log('\n=== STAGE 2: GEMINI ANALYSIS REQUEST/RESPONSE ===');
  if (sessionData.analysis) {
    const analysis = sessionData.analysis;
    console.log(`Model: ${analysis.request.model}`);
    console.log(`File URI: ${analysis.request.fileUri}`);
    console.log(`Analysis Duration: ${analysis.response.analysisDuration}ms`);
    console.log(`Prompt Length: ${analysis.request.promptLength} characters`);
    
    console.log('\nPrompt Structure Analysis:');
    console.log(`- Has JSON Schema: ${analysis.request.promptStructure.hasJSONSchema ? '✅' : '❌'}`);
    console.log(`- Has Examples: ${analysis.request.promptStructure.hasExamples ? '✅' : '❌'}`);
    console.log(`- Has Validation Rules: ${analysis.request.promptStructure.hasValidationRules ? '✅' : '❌'}`);
    console.log(`- Mentions Contact Info: ${analysis.request.promptStructure.mentionsContactInfo ? '✅' : '❌'}`);
    console.log(`- Mentions Experience: ${analysis.request.promptStructure.mentionsExperience ? '✅' : '❌'}`);
    console.log(`- Mentions Skills: ${analysis.request.promptStructure.mentionsSkills ? '✅' : '❌'}`);

    console.log('\nResponse Analysis:');
    console.log(`- Analysis Success: ${analysis.response.success ? '✅' : '❌'}`);
    console.log(`- Response Length: ${analysis.response.rawResponseLength} characters`);
    console.log(`- JSON Parsing Success: ${analysis.response.parsingSuccess ? '✅' : '❌'}`);
    if (analysis.response.error) {
      console.log(`- Error: ${analysis.response.error}`);
    }

    console.log('\nExtracted Data Quality:');
    if (analysis.analysis.dataQuality) {
      const quality = analysis.analysis.dataQuality;
      console.log(`- Contact Info: ${quality.hasContactInfo ? '✅' : '❌'}`);
      console.log(`- About/Summary: ${quality.hasAbout ? '✅' : '❌'}`);
      console.log(`- Skills: ${quality.skillsCount} items`);
      console.log(`- Experience: ${quality.experienceCount} items`);
      console.log(`- Education: ${quality.educationCount} items`);
      console.log(`- Achievements: ${quality.achievementsCount} items`);
    }

    console.log('\nResponse Structure:');
    console.log(`- Top-level keys: ${analysis.analysis.responseStructure.join(', ')}`);

    // Analysis findings for Gemini analysis
    const analysisFindings: string[] = [];
    const analysisImprovements: string[] = [];

    if (!analysis.response.success) {
      analysisFindings.push('Gemini analysis failed');
      analysisImprovements.push('Review Gemini API error logs and file compatibility');
    }

    if (!analysis.response.parsingSuccess) {
      analysisFindings.push('JSON response parsing failed');
      analysisImprovements.push('Review response format and JSON structure validation');
    }

    if (analysis.analysis.dataQuality && !analysis.analysis.dataQuality.hasContactInfo) {
      analysisFindings.push('No contact information extracted');
      analysisImprovements.push('Improve contact info extraction in prompt');
    }

    if (analysis.analysis.dataQuality && analysis.analysis.dataQuality.experienceCount === 0) {
      analysisFindings.push('No experience items extracted');
      analysisImprovements.push('Enhance experience extraction guidelines');
    }

    if (analysis.analysis.dataQuality && analysis.analysis.dataQuality.skillsCount < 5) {
      analysisFindings.push('Very few skills extracted');
      analysisImprovements.push('Improve skill detection and categorization');
    }

    if (analysis.response.analysisDuration && analysis.response.analysisDuration > 30000) {
      analysisFindings.push('Analysis took longer than 30 seconds');
      analysisImprovements.push('Consider optimizing prompt length or model selection');
    }

    const analysisQuality = analysis.response.success && 
                          analysis.response.parsingSuccess && 
                          analysis.analysis.dataQuality?.hasContactInfo &&
                          (analysis.analysis.dataQuality?.experienceCount || 0) > 0 &&
                          (analysis.analysis.dataQuality?.skillsCount || 0) > 0;
    console.log(`\nAnalysis Quality: ${analysisQuality ? '✅ Good' : '⚠️ Needs Review'}`);

    allFindings.push({
      stage: 'Gemini Analysis',
      findings: analysisFindings,
      improvements: analysisImprovements,
      metrics: {
        analysisDuration: analysis.response.analysisDuration,
        success: analysis.response.success,
        parsingSuccess: analysis.response.parsingSuccess,
        promptStructure: analysis.request.promptStructure,
        dataQuality: analysis.analysis.dataQuality,
        responseStructure: analysis.analysis.responseStructure,
        quality: analysisQuality
      }
    });
  } else {
    console.log('❌ Gemini analysis data not found');
  }

  // === STAGE 3: PROFILE SYNC ANALYSIS ===
  console.log('\n=== STAGE 3: PROFILE SYNC ANALYSIS ===');
  if (sessionData.sync) {
    const sync = sessionData.sync;
    console.log(`Duration: ${sync.sync.duration}ms`);
    console.log(`Success: ${sync.sync.success ? '✅' : '❌'}`);
    console.log(`Improvement Score: ${sync.sync.improvementScore}`);
    
    console.log('\nItems Synced:');
    const synced = sync.sync.itemsSynced;
    console.log(`- Contact Info: ${synced.contactInfo ? '✅' : '❌'}`);
    console.log(`- Experience Items: ${synced.experience}`);
    console.log(`- Education Items: ${synced.education}`);
    console.log(`- Skills: ${synced.skills}`);
    console.log(`- Achievements: ${synced.achievements}`);

    console.log('\nData Transformation:');
    const transform = sync.dataTransformation;
    console.log(`- Input Data Structure: ${transform.inputDataStructure.join(', ')}`);
    console.log(`- Contact Info Fields: ${transform.contactInfoFields.join(', ')}`);
    console.log(`- Experience Fields: ${transform.experienceFields.join(', ')}`);
    if (transform.experiencePreview && transform.experiencePreview.length > 0) {
      console.log(`- Experience Preview: ${transform.experiencePreview.map(exp => `${exp.title} at ${exp.company} (${exp.responsibilitiesCount} responsibilities)`).join(', ')}`);
    }

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

    if (sync.sync.improvementScore < 50) {
      syncFindings.push('Low improvement score suggests incomplete data');
      syncImprovements.push('Review extraction completeness and scoring algorithm');
    }

    if (sync.sync.duration > 5000) {
      syncFindings.push('Sync took longer than 5 seconds');
      syncImprovements.push('Consider database optimization or parallel processing');
    }

    const syncQuality = sync.sync.success && synced.experience > 0 && synced.skills > 0 && sync.sync.improvementScore >= 50;
    console.log(`\nSync Quality: ${syncQuality ? '✅ Good' : '⚠️ Needs Review'}`);

    allFindings.push({
      stage: 'Profile Sync',
      findings: syncFindings,
      improvements: syncImprovements,
      metrics: {
        duration: sync.sync.duration,
        success: sync.sync.success,
        improvementScore: sync.sync.improvementScore,
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
  const overallHealth = totalStages > 0 ? (healthyStages / totalStages) * 100 : 0;
  
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

  // Additional Direct Upload Specific Metrics
  console.log('\n🚀 Direct Upload Specific Metrics:');
  if (sessionData.upload && sessionData.analysis && sessionData.sync) {
    const totalDuration = (sessionData.upload.uploadToGemini.uploadDuration || 0) + 
                         (sessionData.analysis.response.analysisDuration || 0) + 
                         (sessionData.sync.sync.duration || 0);
    
    console.log(`- Total Pipeline Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(1)}s)`);
    console.log(`- Upload Phase: ${sessionData.upload.uploadToGemini.uploadDuration || 0}ms (${((sessionData.upload.uploadToGemini.uploadDuration || 0) / totalDuration * 100).toFixed(1)}%)`);
    console.log(`- Analysis Phase: ${sessionData.analysis.response.analysisDuration || 0}ms (${((sessionData.analysis.response.analysisDuration || 0) / totalDuration * 100).toFixed(1)}%)`);
    console.log(`- Sync Phase: ${sessionData.sync.sync.duration}ms (${(sessionData.sync.sync.duration / totalDuration * 100).toFixed(1)}%)`);
    
    const fileSize = sessionData.upload.fileInfo.localFileSize;
    if (fileSize && totalDuration) {
      console.log(`- Processing Speed: ${((fileSize / 1024) / (totalDuration / 1000)).toFixed(2)} KB/s`);
    }
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
    directUploadMetrics: {
      uploadDuration: sessionData.upload?.uploadToGemini.uploadDuration,
      analysisDuration: sessionData.analysis?.response.analysisDuration,
      syncDuration: sessionData.sync?.sync.duration,
      totalDuration: (sessionData.upload?.uploadToGemini.uploadDuration || 0) + 
                    (sessionData.analysis?.response.analysisDuration || 0) + 
                    (sessionData.sync?.sync.duration || 0),
      fileSize: sessionData.upload?.fileInfo.localFileSize,
      improvementScore: sessionData.sync?.sync.improvementScore,
      extractedItems: {
        experience: sessionData.analysis?.analysis.dataQuality?.experienceCount,
        skills: sessionData.analysis?.analysis.dataQuality?.skillsCount,
        education: sessionData.analysis?.analysis.dataQuality?.educationCount
      }
    }
  };

  DirectUploadDebugLogger.logAnalysisSummary(analysisSummary);
  console.log('\n✅ Analysis complete and saved!');
}

// Run the analysis
analyzeDirectUpload().catch(console.error);