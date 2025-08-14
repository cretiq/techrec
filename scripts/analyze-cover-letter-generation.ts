#!/usr/bin/env ts-node

import { CoverLetterDebugLogger } from '../utils/debugLogger';
import fs from 'fs';
import path from 'path';

// Analyze the latest cover letter generation session
async function analyzeCoverLetterGeneration() {
  console.log('🔍 Analyzing Cover Letter Generation Sessions...\n');
  
  const latestSession = CoverLetterDebugLogger.getLatestSession();
  
  if (!latestSession) {
    console.log('❌ No debug sessions found. Please run the cover letter generation feature first.');
    console.log('💡 Make sure DEBUG_COVER_LETTER=true is set in your environment.');
    return;
  }
  
  console.log(`📊 Analyzing session: ${latestSession.sessionId}`);
  
  if (latestSession.unifiedFile) {
    console.log(`📁 Unified debug file: ${latestSession.unifiedFile}\n`);
  } else {
    console.log(`📁 Request file: ${latestSession.requestFile}`);
    console.log(`📁 Response files: ${latestSession.responseFiles.length}\n`);
  }
  
  // Read session data
  const sessionData = CoverLetterDebugLogger.readSession(latestSession.sessionId);
  
  // If we have unified data, display the new format first
  if (sessionData.unified) {
    console.log('=== UNIFIED DEBUG FILE STRUCTURE (CLEANED) ===');
    console.log(`Unified file contains:`);
    console.log(`- Main content fields: 3 (rawPromptTemplate, fullPrompt, aiResponse)`);
    console.log(`- Metadata sections: ${Object.keys(sessionData.unified.metadata).length}`);
    
    console.log('\n--- MAIN CONTENT ACCESS ---');
    console.log(`Raw prompt template: ${sessionData.unified.rawPromptTemplate ? 'Available' : 'Not available'}`);
    console.log(`Final processed prompt: ${sessionData.unified.fullPrompt ? 'Available' : 'Not available'}`);
    console.log(`AI response: ${sessionData.unified.aiResponse ? 'Available' : 'Not available'}`);
    
    const metadata = sessionData.unified.metadata;
    console.log('\n--- QUICK METADATA OVERVIEW ---');
    console.log(`Template type: ${metadata.templateInfo.templateType}`);
    console.log(`Template expansion: ${metadata.templateInfo.rawTemplateLength} → ${metadata.templateInfo.finalPromptLength} chars (${metadata.templateInfo.expansionRatio}x)`);
    console.log(`Response: ${metadata.responseInfo.wordCount} words, ${metadata.responseInfo.duration}ms generation`);
    console.log(`Validation: ${metadata.responseInfo.validationPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Cache: ${sessionData.unified.cached ? '✅ HIT' : '❌ MISS'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 Access main content fields at:');
    console.log(`   sessionData.unified.rawPromptTemplate    # Template with \${variable} placeholders`);
    console.log(`   sessionData.unified.fullPrompt           # Final prompt with substituted values`); 
    console.log(`   sessionData.unified.aiResponse           # Generated cover letter content`);
    console.log('='.repeat(60) + '\n');
  }
  
  // Analyze request
  console.log('=== REQUEST ANALYSIS ===');
  const request = sessionData.request;
  console.log(`User ID: ${request.userId}`);
  console.log(`Timestamp: ${request.timestamp}`);
  console.log(`Session ID: ${request.sessionId}`);
  console.log(`Request Type: ${request.type}`);
  
  console.log('\nCache Information:');
  console.log(`- Cache Key: ${request.cacheInfo.key}`);
  console.log(`- Cache Hit: ${request.cacheInfo.hit ? '✅ YES' : '❌ NO'}`);
  
  console.log('\nRole Information:');
  console.log(`- Title: ${request.requestData.roleInfo.title}`);
  console.log(`- Company: ${request.requestData.roleInfo.company}`);
  console.log(`- Location: ${request.requestData.roleInfo.location || 'N/A'}`);
  console.log(`- Requirements: ${request.requestData.roleInfo.requirementsCount} items`);
  console.log(`- Skills: ${request.requestData.roleInfo.skillsCount} items`);
  console.log(`- Description Length: ${request.requestData.roleInfo.descriptionLength} chars`);
  
  console.log('\nDeveloper Profile Summary:');
  const profileSummary = request.requestData.developerProfileSummary;
  console.log(`- Has Contact Info: ${profileSummary.hasContactInfo ? '✅' : '❌'}`);
  console.log(`- Has Email: ${profileSummary.hasEmail ? '✅' : '❌'}`);
  console.log(`- Has About Section: ${profileSummary.hasAbout ? '✅' : '❌'}`);
  console.log(`- About Length: ${profileSummary.aboutLength} chars`);
  console.log(`- Skills: ${profileSummary.skillsCount} items`);
  console.log(`- Experience: ${profileSummary.experienceCount} items`);
  console.log(`- Education: ${profileSummary.educationCount} items`);
  console.log(`- Achievements: ${profileSummary.achievementsCount} items`);
  console.log(`- Projects: ${profileSummary.projectsCount} items`);
  console.log(`- Has MVP CV Content: ${profileSummary.hasMvpCvContent ? '✅ YES' : '❌ NO'}`);
  
  console.log('\nPersonalization:');
  const personalization = request.requestData.personalization;
  console.log(`- Tone: ${personalization.tone || 'formal'}`);
  console.log(`- Hiring Manager: ${personalization.hiringManager || 'Not specified'}`);
  console.log(`- Job Source: ${personalization.jobSource || 'Not specified'}`);
  console.log(`- Attraction Points: ${personalization.attractionPoints?.length || 0} items`);
  
  console.log('\nProcessed Data:');
  const processedData = request.requestData.processedData;
  console.log(`- Keywords: ${processedData.keywords.join(', ')}`);
  console.log(`- Core Skills: ${processedData.coreSkills.join(', ')}`);
  console.log(`- Achievements: ${processedData.achievements.length} items`);
  processedData.achievements.forEach((achievement, idx) => {
    console.log(`  ${idx + 1}. ${achievement.substring(0, 80)}${achievement.length > 80 ? '...' : ''}`);
  });
  
  console.log(`\nFinal Prompt Length: ${request.promptInfo.promptLength} chars`);
  console.log(`Raw Template Length: ${request.promptInfo.rawTemplateLength} chars`);
  
  // NEW: Show full developer profile data sent to AI
  console.log('\n=== FULL DEVELOPER PROFILE SENT TO AI ===');
  if (request.fullDeveloperProfile) {
    const profile = request.fullDeveloperProfile;
    console.log(`Name: ${profile.name || 'N/A'}`);
    console.log(`Title: ${profile.title || 'N/A'}`);
    console.log(`Email: ${profile.profileEmail || profile.email || 'N/A'}`);
    console.log(`About: ${profile.about ? `"${profile.about.substring(0, 200)}${profile.about.length > 200 ? '...' : ''}"` : 'N/A'}`);
    
    if (profile.contactInfo) {
      console.log('\nContact Information:');
      console.log(`  Phone: ${profile.contactInfo.phone || 'N/A'}`);
      console.log(`  Address: ${profile.contactInfo.address || 'N/A'}`);
      console.log(`  LinkedIn: ${profile.contactInfo.linkedin || 'N/A'}`);
      console.log(`  GitHub: ${profile.contactInfo.github || 'N/A'}`);
      console.log(`  Website: ${profile.contactInfo.website || 'N/A'}`);
    }
    
    console.log(`\nSkills: ${profile.skills?.length || 0} items`);
    if (profile.skills?.length > 0) {
      profile.skills.slice(0, 10).forEach((skill, idx) => {
        console.log(`  ${idx + 1}. ${skill.name} (${skill.level || 'N/A'}) - ${skill.category || 'N/A'}`);
      });
      if (profile.skills.length > 10) {
        console.log(`  ... and ${profile.skills.length - 10} more`);
      }
    }
    
    console.log(`\nExperience: ${profile.experience?.length || 0} items`);
    if (profile.experience?.length > 0) {
      profile.experience.slice(0, 3).forEach((exp, idx) => {
        console.log(`  ${idx + 1}. ${exp.title} at ${exp.company}`);
        console.log(`     Duration: ${exp.startDate ? new Date(exp.startDate).getFullYear() : 'N/A'} - ${exp.endDate ? new Date(exp.endDate).getFullYear() : (exp.current ? 'Present' : 'N/A')}`);
        console.log(`     Description: ${exp.description ? `"${exp.description.substring(0, 100)}${exp.description.length > 100 ? '...' : ''}"` : 'N/A'}`);
        if (exp.achievements?.length > 0) {
          console.log(`     Achievements: ${exp.achievements.length} items`);
          exp.achievements.slice(0, 2).forEach(ach => {
            console.log(`       - ${ach.substring(0, 80)}${ach.length > 80 ? '...' : ''}`);
          });
        }
      });
      if (profile.experience.length > 3) {
        console.log(`  ... and ${profile.experience.length - 3} more experiences`);
      }
    }
    
    console.log(`\nAchievements: ${profile.achievements?.length || 0} items`);
    if (profile.achievements?.length > 0) {
      profile.achievements.slice(0, 5).forEach((ach, idx) => {
        console.log(`  ${idx + 1}. ${ach.title}: ${ach.description?.substring(0, 100)}${ach.description?.length > 100 ? '...' : ''}`);
      });
    }
    
    console.log(`\nEducation: ${profile.education?.length || 0} items`);
    if (profile.education?.length > 0) {
      profile.education.forEach((edu, idx) => {
        console.log(`  ${idx + 1}. ${edu.degree || 'N/A'} at ${edu.institution}`);
        console.log(`     Year: ${edu.year || 'N/A'}`);
      });
    }
    
    console.log(`\nMVP CV Content Available: ${profile.mvpContent ? 'YES' : 'NO'}`);
    if (profile.mvpContent) {
      console.log(`MVP Content Length: ${profile.mvpContent.length} chars`);
      console.log(`MVP Preview: "${profile.mvpContent.substring(0, 200)}${profile.mvpContent.length > 200 ? '...' : ''}"`);
    }
  } else {
    console.log('❌ No full developer profile data found in request');
  }
  
  // NEW: Show full role information sent to AI  
  console.log('\n=== FULL ROLE INFORMATION SENT TO AI ===');
  if (request.fullRoleInfo) {
    const role = request.fullRoleInfo;
    console.log(`Title: ${role.title || 'N/A'}`);
    console.log(`Description: ${role.description ? `"${role.description.substring(0, 300)}${role.description.length > 300 ? '...' : ''}"` : 'N/A'}`);
    console.log(`Requirements: ${role.requirements?.length || 0} items`);
    if (role.requirements?.length > 0) {
      role.requirements.forEach((req, idx) => {
        console.log(`  ${idx + 1}. ${req}`);
      });
    }
    console.log(`Skills: ${role.skills?.length || 0} items`);
    if (role.skills?.length > 0) {
      console.log(`  ${role.skills.join(', ')}`);
    }
    console.log(`Location: ${role.location || 'N/A'}`);
    console.log(`Salary: ${role.salary || 'N/A'}`);
    console.log(`Type: ${role.type || 'N/A'}`);
    console.log(`Remote: ${role.remote || 'N/A'}`);
  } else {
    console.log('❌ No full role information data found in request');
  }
  
  // NEW: Show full company information sent to AI
  console.log('\n=== FULL COMPANY INFORMATION SENT TO AI ===');
  if (request.fullCompanyInfo) {
    const company = request.fullCompanyInfo;
    console.log(`Name: ${company.name || 'N/A'}`);
    console.log(`Location: ${company.location || 'N/A'}`);
    console.log(`Description: ${company.description ? `"${company.description.substring(0, 200)}${company.description.length > 200 ? '...' : ''}"` : 'N/A'}`);
    console.log(`Website: ${company.website || 'N/A'}`);
    console.log(`Size: ${company.size || 'N/A'}`);
    console.log(`Industry: ${company.industry || 'N/A'}`);
    console.log(`Attraction Points: ${company.attractionPoints?.length || 0} items`);
    if (company.attractionPoints?.length > 0) {
      company.attractionPoints.forEach((point, idx) => {
        console.log(`  ${idx + 1}. ${point}`);
      });
    }
  } else {
    console.log('❌ No full company information data found in request');
  }
  
  // NEW: Show raw prompt template and final prompt
  console.log('\n=== PROMPT ANALYSIS ===');
  
  if (request.promptInfo.rawTemplate) {
    console.log('\n--- RAW PROMPT TEMPLATE ---');
    console.log('(Shows variable placeholders like ${variable})');
    console.log(`Length: ${request.promptInfo.rawTemplateLength} characters`);
    console.log(`Template Type: ${request.promptInfo.rawTemplate.includes('FULL CV CONTENT') ? 'MVP Content Template' : 'Structured Data Template'}`);
    
    // Show first 500 chars of raw template
    console.log('\nTemplate Preview:');
    console.log('-'.repeat(60));
    console.log(request.promptInfo.rawTemplatePreview);
    console.log('-'.repeat(60));
    
    // Show key template sections
    const template = request.promptInfo.rawTemplate;
    const sections = [
      { name: 'System Prompt', start: 'SYSTEM:', end: 'USER:' },
      { name: 'Header Section', start: '<HEADER>', end: '<COMPANY CONTEXT>' },
      { name: 'Company Context', start: '<COMPANY CONTEXT>', end: '<ROLE SPECIFICS>' },
      { name: 'Role Specifics', start: '<ROLE SPECIFICS>', end: '<TASK>' },
      { name: 'Task Instructions', start: '<TASK>', end: 'Rules:' }
    ];
    
    console.log('\nTemplate Structure:');
    sections.forEach(section => {
      const startIdx = template.indexOf(section.start);
      const endIdx = template.indexOf(section.end, startIdx);
      if (startIdx !== -1) {
        const sectionLength = endIdx !== -1 ? endIdx - startIdx : template.length - startIdx;
        console.log(`  ${section.name}: ${sectionLength} chars ${startIdx !== -1 ? '✅' : '❌'}`);
      } else {
        console.log(`  ${section.name}: Not found ❌`);
      }
    });
    
    // Count variable placeholders
    const variableMatches = template.match(/\$\{[^}]+\}/g) || [];
    console.log(`\nVariable Placeholders: ${variableMatches.length} found`);
    
    // Show top variable types
    const variableTypes = variableMatches
      .map(v => v.replace(/\$\{([^.}]+)\..*\}/, '$1').replace(/\$\{([^}]+)\}/, '$1'))
      .reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    Object.entries(variableTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} references`);
      });
      
  } else {
    console.log('❌ No raw prompt template found in request');
  }
  
  console.log('\n--- FINAL PROCESSED PROMPT ---');
  console.log('(Shows actual values substituted)');
  console.log(`Length: ${request.promptInfo.promptLength} characters`);
  console.log(`Processing: ${request.promptInfo.rawTemplate ? 'Template → Final' : 'Direct Generation'}`);
  
  // Show first 500 chars of final prompt
  console.log('\nFinal Prompt Preview:');
  console.log('-'.repeat(60));
  console.log(request.promptInfo.promptPreview);
  console.log('-'.repeat(60));
  
  // Show expansion ratio
  if (request.promptInfo.rawTemplate && request.promptInfo.rawTemplateLength > 0) {
    const expansionRatio = (request.promptInfo.promptLength / request.promptInfo.rawTemplateLength).toFixed(2);
    console.log(`\nTemplate Expansion: ${request.promptInfo.rawTemplateLength} → ${request.promptInfo.promptLength} chars (${expansionRatio}x)`);
    
    if (parseFloat(expansionRatio) < 1.5) {
      console.log('⚠️  Low expansion ratio - may indicate missing variable substitution');
    } else if (parseFloat(expansionRatio) > 5.0) {
      console.log('⚠️  Very high expansion ratio - check for data bloat');
    } else {
      console.log('✅ Normal expansion ratio');
    }
  }
  
  // Analyze responses
  console.log('\n=== RESPONSE ANALYSIS ===');
  sessionData.responses.forEach((response, index) => {
    console.log(`\n--- Attempt ${response.attempt} ---`);
    console.log(`Duration: ${response.duration}ms`);
    console.log(`Cached: ${response.cached ? '✅ YES' : '❌ NO'}`);
    console.log(`Provider: ${response.provider}`);
    
    if (response.error) {
      console.log(`❌ ERROR: ${response.error.message || response.error}`);
      if (response.analysis?.errorType) {
        console.log(`Error Type: ${response.analysis.errorType}`);
      }
      return;
    }
    
    if (response.modelInfo) {
      console.log(`\nModel Information:`);
      console.log(`- Name: ${response.modelInfo.name}`);
      console.log(`- Temperature: ${response.modelInfo.config?.temperature}`);
      console.log(`- Top K: ${response.modelInfo.config?.topK}`);
      console.log(`- Top P: ${response.modelInfo.config?.topP}`);
      console.log(`- Max Output Tokens: ${response.modelInfo.config?.maxOutputTokens}`);
    }
    
    console.log(`\nAI Response:`);
    console.log(`- Raw Length: ${response.aiResponse.rawLength} chars`);
    console.log(`- Preview: "${response.aiResponse.preview}"`);
    
    if (response.qualityMetrics) {
      console.log(`\nQuality Metrics:`);
      const metrics = response.qualityMetrics;
      console.log(`- Word Count: ${metrics.wordCount}`);
      console.log(`- Paragraph Count: ${metrics.paragraphCount}`);
      console.log(`- Sentence Count: ${metrics.sentenceCount}`);
      console.log(`- Avg Words/Sentence: ${metrics.avgWordsPerSentence}`);
      console.log(`- Has Greeting: ${metrics.hasGreeting ? '✅' : '❌'}`);
      console.log(`- Has Closing: ${metrics.hasClosing ? '✅' : '❌'}`);
      console.log(`- Has Markdown: ${metrics.hasMarkdown ? '⚠️ YES' : '✅ NO'}`);
    }
    
    if (response.validation) {
      console.log(`\nValidation Result:`);
      console.log(`- Status: ${response.validation.isValid ? '✅ VALID' : '❌ INVALID'}`);
      if (response.validation.errors?.length > 0) {
        console.log(`- Errors (${response.validation.errors.length}):`);
        response.validation.errors.forEach(err => console.log(`  ❌ ${err}`));
      }
      if (response.validation.warnings?.length > 0) {
        console.log(`- Warnings (${response.validation.warnings.length}):`);
        response.validation.warnings.forEach(warn => console.log(`  ⚠️ ${warn}`));
      }
      if (response.validation.wordCount !== undefined) {
        console.log(`- Word Count: ${response.validation.wordCount}`);
      }
    }
    
    if (response.analysis) {
      console.log(`\nAnalysis Summary:`);
      console.log(`- Response Quality: ${response.analysis.responseQuality}`);
      console.log(`- Error Count: ${response.analysis.errorCount}`);
      console.log(`- Warning Count: ${response.analysis.warningCount}`);
    }
  });
  
  // Identify improvement opportunities
  console.log('\n=== IMPROVEMENT OPPORTUNITIES ===');
  
  const findings: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];
  
  // Check if MVP CV content is being used
  if (!profileSummary.hasMvpCvContent) {
    findings.push('MVP CV content not available in profile');
    improvements.push('Consider using MVP CV content for enhanced personalization');
  }
  
  // Check profile completeness
  if (!profileSummary.hasContactInfo) {
    findings.push('Missing contact information in profile');
    recommendations.push('Add contact information to improve letter personalization');
  }
  
  if (profileSummary.aboutLength === 0) {
    findings.push('No "About" section in profile');
    recommendations.push('Add an About section to provide better context for letters');
  }
  
  if (profileSummary.achievementsCount === 0) {
    findings.push('No achievements in profile');
    recommendations.push('Add quantified achievements for stronger cover letters');
  }
  
  // Check cache efficiency
  if (request.cacheInfo.hit) {
    findings.push('Request was served from cache (efficient)');
  } else {
    findings.push('Cache miss - new generation was required');
  }
  
  // Analyze successful responses
  const successfulResponse = sessionData.responses.find(r => !r.error && r.aiResponse);
  if (successfulResponse) {
    // Check quality metrics
    const metrics = successfulResponse.qualityMetrics;
    if (metrics) {
      if (!metrics.hasGreeting) {
        findings.push('Generated letter missing proper greeting');
        improvements.push('Ensure prompt enforces greeting inclusion');
      }
      
      if (!metrics.hasClosing) {
        findings.push('Generated letter missing professional closing');
        improvements.push('Ensure prompt enforces closing inclusion');
      }
      
      if (metrics.hasMarkdown) {
        findings.push('Generated letter contains markdown formatting');
        improvements.push('Strengthen prompt to prevent markdown in output');
      }
      
      if (metrics.avgWordsPerSentence > 25) {
        findings.push(`High average words per sentence (${metrics.avgWordsPerSentence})`);
        recommendations.push('Consider prompting for more concise sentences');
      }
      
      if (metrics.wordCount < 150) {
        findings.push(`Letter is quite short (${metrics.wordCount} words)`);
        recommendations.push('Consider adjusting prompt for more comprehensive content');
      } else if (metrics.wordCount > 350) {
        findings.push(`Letter is quite long (${metrics.wordCount} words)`);
        recommendations.push('Consider enforcing word limits more strictly');
      }
    }
    
    // Check validation results
    const validation = successfulResponse.validation;
    if (validation && !validation.isValid) {
      findings.push(`Validation failed with ${validation.errors?.length || 0} errors`);
      improvements.push('Review validation criteria and prompt alignment');
    }
    
    // Check generation time
    if (successfulResponse.duration > 10000) {
      findings.push(`Slow generation time (${successfulResponse.duration}ms)`);
      recommendations.push('Consider optimizing prompt or model configuration');
    }
  } else {
    findings.push('No successful response found');
    improvements.push('Debug the error and ensure proper request handling');
  }
  
  // Check processed data quality
  if (processedData.keywords.length === 0) {
    findings.push('No keywords extracted from role');
    improvements.push('Improve keyword extraction logic');
  }
  
  if (processedData.coreSkills.length === 0) {
    findings.push('No core skills identified from profile');
    improvements.push('Ensure profile has skills data');
  }
  
  if (processedData.achievements.length === 0) {
    findings.push('No achievements derived from profile');
    recommendations.push('Add quantified achievements to profile for better letters');
  }
  
  console.log('\nFindings:');
  findings.forEach(f => console.log(`- ${f}`));
  
  if (improvements.length > 0) {
    console.log('\nSuggested Improvements:');
    improvements.forEach(i => console.log(`- ${i}`));
  }
  
  if (recommendations.length > 0) {
    console.log('\nRecommendations:');
    recommendations.forEach(r => console.log(`- ${r}`));
  }
  
  // Calculate metrics
  const metrics = {
    sessionId: latestSession.sessionId,
    requestPromptLength: request.promptInfo.promptLength,
    cacheHit: request.cacheInfo.hit,
    profileCompleteness: {
      hasContactInfo: profileSummary.hasContactInfo,
      hasEmail: profileSummary.hasEmail,
      hasAbout: profileSummary.hasAbout,
      hasMvpCvContent: profileSummary.hasMvpCvContent,
      skillsCount: profileSummary.skillsCount,
      experienceCount: profileSummary.experienceCount,
      achievementsCount: profileSummary.achievementsCount,
    },
    processedDataQuality: {
      keywordsCount: processedData.keywords.length,
      coreSkillsCount: processedData.coreSkills.length,
      achievementsCount: processedData.achievements.length,
    },
    responseMetrics: sessionData.responses.map(r => ({
      attempt: r.attempt,
      duration: r.duration,
      success: !r.error,
      cached: r.cached,
      provider: r.provider,
      wordCount: r.qualityMetrics?.wordCount || 0,
      hasGreeting: r.qualityMetrics?.hasGreeting || false,
      hasClosing: r.qualityMetrics?.hasClosing || false,
      hasMarkdown: r.qualityMetrics?.hasMarkdown || false,
      validationPassed: r.validation?.isValid || false,
    })),
  };
  
  // Save analysis
  const analysis = {
    sessionId: latestSession.sessionId,
    findings,
    improvements,
    metrics,
    recommendations,
  };
  
  CoverLetterDebugLogger.logAnalysis(analysis);
  console.log('\n✅ Analysis complete and saved!');
  console.log(`📁 Analysis file: logs/cover-letter-generation/${latestSession.sessionId}-analysis.json`);
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  const successRate = sessionData.responses.filter(r => !r.error).length / sessionData.responses.length * 100;
  console.log(`Success Rate: ${successRate.toFixed(0)}%`);
  
  if (successfulResponse) {
    console.log(`Generation Time: ${successfulResponse.duration}ms`);
    console.log(`Word Count: ${successfulResponse.qualityMetrics?.wordCount || 'N/A'}`);
    console.log(`Quality Score: ${successfulResponse.validation?.isValid ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  console.log(`\n💡 To view the full generated letter, check:`);
  console.log(`   ${latestSession.responseFiles[0]}`);
  
  // Create raw-only file for easy access to core content
  if (sessionData.unified) {
    console.log('\n=== CREATING RAW CONTENT FILE ===');
    
    const rawContent = {
      rawPromptTemplate: sessionData.unified.rawPromptTemplate,
      fullPrompt: sessionData.unified.fullPrompt,  
      aiResponse: sessionData.unified.aiResponse
    };
    
    const rawFileName = `${latestSession.sessionId}-raw-content.json`;
    const rawFilePath = path.join(path.dirname(latestSession.unifiedFile || latestSession.requestFile), rawFileName);
    
    try {
      fs.writeFileSync(rawFilePath, JSON.stringify(rawContent, null, 2));
      console.log(`✅ Raw content file created: ${rawFilePath}`);
      console.log(`📋 Contains only the 3 main fields:`);
      console.log(`   - rawPromptTemplate: ${rawContent.rawPromptTemplate ? 'Available' : 'Missing'}`);
      console.log(`   - fullPrompt: ${rawContent.fullPrompt ? 'Available' : 'Missing'}`);
      console.log(`   - aiResponse: ${rawContent.aiResponse ? 'Available' : 'Missing'}`);
    } catch (error) {
      console.error(`❌ Failed to create raw content file: ${error.message}`);
    }
  } else {
    console.log('\n⚠️  Raw content file creation skipped - unified data not available');
  }
}

// Run the analysis
analyzeCoverLetterGeneration().catch(console.error);