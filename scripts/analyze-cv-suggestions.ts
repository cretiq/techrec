#!/usr/bin/env ts-node

import { CvImprovementDebugLogger } from '../utils/debugLogger';
import fs from 'fs';

// Analyze the latest CV improvement session
async function analyzeCvSuggestions() {
  console.log('🔍 Analyzing CV Improvement Sessions...\n');
  
  const latestSession = CvImprovementDebugLogger.getLatestSession();
  
  if (!latestSession) {
    console.log('❌ No debug sessions found. Please run the CV suggestions feature first.');
    return;
  }
  
  console.log(`📊 Analyzing session: ${latestSession.sessionId}`);
  console.log(`📁 Request file: ${latestSession.requestFile}`);
  console.log(`📁 Response files: ${latestSession.responseFiles.length}\n`);
  
  // Read session data
  const sessionData = CvImprovementDebugLogger.readSession(latestSession.sessionId);
  
  // Analyze request
  console.log('=== REQUEST ANALYSIS ===');
  const request = sessionData.request;
  console.log(`User ID: ${request.userId}`);
  console.log(`Timestamp: ${request.timestamp}`);
  console.log('\nCV Data Summary:');
  console.log(`- Contact Info: ${JSON.stringify(request.cvDataSummary.contactInfoFields)}`);
  console.log(`- About: ${request.cvDataSummary.aboutLength} chars`);
  console.log(`- Skills: ${request.cvDataSummary.skillsCount} items`);
  console.log(`- Experience: ${request.cvDataSummary.experienceCount} items`);
  console.log(`- Education: ${request.cvDataSummary.educationCount} items`);
  console.log(`- Achievements: ${request.cvDataSummary.achievementsCount} items`);
  console.log(`\nPrompt Length: ${request.promptLength} chars`);
  
  // Analyze responses
  console.log('\n=== RESPONSE ANALYSIS ===');
  sessionData.responses.forEach((response, index) => {
    console.log(`\n--- Attempt ${response.attempt} ---`);
    console.log(`Duration: ${response.duration}ms`);
    
    if (response.error) {
      console.log(`❌ ERROR: ${response.error.message}`);
      return;
    }
    
    console.log(`Raw Response Length: ${response.rawResponse.length} chars`);
    
    if (response.parsedResponse?.suggestions) {
      console.log(`Total Suggestions: ${response.parsedResponse.suggestions.length}`);
      
      // Analyze each suggestion
      console.log('\nSuggestion Details:');
      response.parsedResponse.suggestions.forEach((s: any, idx: number) => {
        console.log(`\n  ${idx + 1}. ${s.section || 'unknown section'}`);
        console.log(`     Type: ${s.suggestionType || s.type || 'unknown'}`);
        console.log(`     Has Original: ${!!s.originalText}`);
        console.log(`     Has Suggested: ${!!s.suggestedText}`);
        console.log(`     Reasoning: ${s.reasoning?.substring(0, 80)}...`);
        console.log(`     Reasoning Length: ${s.reasoning?.length || 0} chars`);
      });
      
      // Section distribution
      const sectionCounts: Record<string, number> = {};
      response.parsedResponse.suggestions.forEach((s: any) => {
        const section = s.section || 'unknown';
        sectionCounts[section] = (sectionCounts[section] || 0) + 1;
      });
      
      console.log('\nSection Distribution:');
      Object.entries(sectionCounts).forEach(([section, count]) => {
        console.log(`  ${section}: ${count}`);
      });
    }
    
    if (response.validationResult) {
      console.log(`\nValidation: ${response.validationResult.isValid ? '✅ VALID' : '❌ INVALID'}`);
      console.log(`Quality Suggestions: ${response.validationResult.qualitySuggestions.length}`);
      if (response.validationResult.errors.length > 0) {
        console.log(`Errors: ${response.validationResult.errors.join(', ')}`);
      }
      if (response.validationResult.warnings.length > 0) {
        console.log(`Warnings: ${response.validationResult.warnings.join(', ')}`);
      }
    }
  });
  
  // Identify improvement opportunities
  console.log('\n=== IMPROVEMENT OPPORTUNITIES ===');
  
  const findings: string[] = [];
  const improvements: string[] = [];
  
  // Check if contact info is complete
  if (!request.fullCvData.contactInfo?.linkedin || !request.fullCvData.contactInfo?.github) {
    findings.push('Missing LinkedIn and/or GitHub links');
    improvements.push('Add specific suggestions for adding professional links');
  }
  
  // Check suggestion quality
  const successfulResponse = sessionData.responses.find(r => !r.error && r.parsedResponse);
  if (successfulResponse) {
    const suggestions = successfulResponse.parsedResponse.suggestions;
    
    // Check for variety
    const sections = new Set(suggestions.map((s: any) => s.section));
    if (sections.size < 3) {
      findings.push(`Limited section variety (only ${sections.size} sections)`);
      improvements.push('Ensure suggestions cover more CV sections');
    }
    
    // Check for specific improvements
    const hasContactSuggestions = suggestions.some((s: any) => s.section.includes('contactInfo'));
    if (!hasContactSuggestions && (!request.fullCvData.contactInfo?.linkedin || !request.fullCvData.contactInfo?.github)) {
      findings.push('No suggestions for missing contact information');
      improvements.push('Add suggestions for missing LinkedIn/GitHub links');
    }
    
    // Check reasoning quality
    const shortReasonings = suggestions.filter((s: any) => s.reasoning && s.reasoning.length < 50);
    if (shortReasonings.length > 0) {
      findings.push(`${shortReasonings.length} suggestions have short reasoning (<50 chars)`);
      improvements.push('Provide more detailed reasoning for suggestions');
    }
  }
  
  console.log('\nFindings:');
  findings.forEach(f => console.log(`- ${f}`));
  
  console.log('\nSuggested Improvements:');
  improvements.forEach(i => console.log(`- ${i}`));
  
  // Save analysis
  const analysis = {
    sessionId: latestSession.sessionId,
    findings,
    improvements,
    metrics: {
      requestPromptLength: request.promptLength,
      cvDataCompleteness: {
        hasLinkedIn: !!request.fullCvData.contactInfo?.linkedin,
        hasGitHub: !!request.fullCvData.contactInfo?.github,
        hasWebsite: !!request.fullCvData.contactInfo?.website,
        skillsCount: request.cvDataSummary.skillsCount,
        experienceCount: request.cvDataSummary.experienceCount,
      },
      responseMetrics: sessionData.responses.map(r => ({
        attempt: r.attempt,
        duration: r.duration,
        success: !r.error,
        suggestionsCount: r.parsedResponse?.suggestions?.length || 0,
      })),
    },
  };
  
  CvImprovementDebugLogger.logAnalysis(analysis);
  console.log('\n✅ Analysis complete and saved!');
}

// Run the analysis
analyzeCvSuggestions().catch(console.error);