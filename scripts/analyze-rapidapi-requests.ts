#!/usr/bin/env ts-node

import { RapidApiDebugLogger } from '../utils/rapidApiDebugLogger';
import fs from 'fs';
import path from 'path';

/**
 * Analyze RapidAPI Request Sessions
 * 
 * Analyzes the complete RapidAPI request/response cycle:
 * 1. Request Parameter Quality and High-Fidelity Defaults
 * 2. API Response Quality and Data Enrichment
 * 3. Performance and Credit Efficiency
 * 4. Improvement Recommendations
 */

async function analyzeRapidApiRequests() {
  console.log('🔍 Analyzing RapidAPI Request Sessions...\n');
  
  const latestSession = RapidApiDebugLogger.getLatestSession();
  
  if (!latestSession) {
    console.log('❌ No RapidAPI debug sessions found. Please:');
    console.log('1. Make a job search request through the UI at /developer/roles/search');
    console.log('2. Run this script again to analyze the session data');
    console.log('');
    console.log('💡 Note: To get detailed request/response logging, set DEBUG_RAPIDAPI_CALL=true');
    console.log('   For cost-free debugging, set STOP_RAPIDAPI_CALL=true');
    console.log('   Normal searches without debug flags will still create analyzable sessions.');
    return;
  }
  
  console.log(`📊 Analyzing RapidAPI session: ${latestSession.sessionId}`);
  console.log(`📁 Request file: ${latestSession.requestFile}`);
  console.log(`📁 Response file: ${latestSession.responseFile}\n`);
  
  // Read session data
  const sessionData = RapidApiDebugLogger.readSession(latestSession.sessionId);
  
  if (!sessionData.request || !sessionData.response) {
    console.log('❌ Failed to read session data. Check file permissions and content.');
    return;
  }

  const request = sessionData.request;
  const response = sessionData.response;

  console.log('=== REQUEST ANALYSIS ===');
  console.log(`User ID: ${request.userId}`);
  console.log(`Session ID: ${request.sessionId}`);
  console.log(`Timestamp: ${request.timestamp}`);
  console.log(`Endpoint: ${request.parameterAnalysis.endpoint}`);
  
  console.log('\n📋 Parameter Quality Analysis:');
  const paramAnalysis = request.parameterAnalysis;
  console.log(`- Parameters sent: ${paramAnalysis.normalizedParamsCount}`);
  console.log(`- High-fidelity defaults applied: ${paramAnalysis.highFidelityDefaults.length}`);
  paramAnalysis.highFidelityDefaults.forEach(def => {
    console.log(`  ✅ ${def}`);
  });
  
  console.log(`- User overrides: ${paramAnalysis.userOverrides.length}`);
  if (paramAnalysis.userOverrides.length > 0) {
    paramAnalysis.userOverrides.forEach(override => {
      console.log(`  🎯 ${override}: ${request.normalizedParameters[override]}`);
    });
  }
  
  console.log('\n🔗 API Call Details:');
  console.log(`- URL Length: ${request.metadata.urlLength} characters`);
  console.log(`- Method: ${request.apiCall.method}`);
  console.log(`- Endpoint: ${request.apiCall.endpoint}`);
  console.log(`- API Key: ${request.apiCall.headers['x-rapidapi-key']}`);
  
  console.log('\n💰 Credit Estimation:');
  console.log(`- Estimated jobs consumption: ${request.apiCall.estimatedCredits.jobs}`);
  console.log(`- Estimated requests consumption: ${request.apiCall.estimatedCredits.requests}`);
  
  console.log('\n🗄️ Cache Information:');
  console.log(`- Cache key: ${request.cache.key}`);
  console.log(`- Cache hit: ${request.cache.hit ? '✅ YES' : '❌ NO (making API call)'}`);

  console.log('\n=== RESPONSE ANALYSIS ===');
  const responseAnalysis = response.responseAnalysis;
  console.log(`Duration: ${response.performance.duration}ms`);
  console.log(`Status Code: ${response.performance.statusCode}`);
  console.log(`Success: ${response.performance.success ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n📊 Data Quality Metrics:');
  if (responseAnalysis.dataQuality) {
    const quality = responseAnalysis.dataQuality;
    console.log(`- Jobs returned: ${quality.jobCount}`);
    console.log(`- AI fields coverage: ${(quality.aiFieldsCoverage * 100).toFixed(1)}% (${Math.round(quality.jobCount * quality.aiFieldsCoverage)}/${quality.jobCount} jobs)`);
    console.log(`- LinkedIn org coverage: ${(quality.linkedInOrgCoverage * 100).toFixed(1)}% (${Math.round(quality.jobCount * quality.linkedInOrgCoverage)}/${quality.jobCount} jobs)`);
    console.log(`- Description coverage: ${(quality.descriptionCoverage * 100).toFixed(1)}% (${Math.round(quality.jobCount * quality.descriptionCoverage)}/${quality.jobCount} jobs)`);
    console.log(`- Avg skills per job: ${quality.avgSkillsPerJob.toFixed(1)} skills`);
    console.log(`- Salary data coverage: ${(quality.salaryDataCoverage * 100).toFixed(1)}% (${Math.round(quality.jobCount * quality.salaryDataCoverage)}/${quality.jobCount} jobs)`);
  }
  
  console.log('\n📈 Rate Limit Information:');
  if (response.rateLimitInfo) {
    const rate = response.rateLimitInfo;
    console.log(`- Jobs remaining: ${rate.jobsRemaining?.toLocaleString() || 'N/A'} / ${rate.jobsLimit?.toLocaleString() || 'N/A'}`);
    console.log(`- Requests remaining: ${rate.requestsRemaining?.toLocaleString() || 'N/A'} / ${rate.requestsLimit?.toLocaleString() || 'N/A'}`);
    if (rate.resetTime) {
      console.log(`- Reset time: ${new Date(rate.resetTime).toLocaleString()}`);
      console.log(`- Reset in: ${Math.round((rate.resetSeconds || 0) / 3600)} hours`);
    }
    
    if (rate.jobsLimit && rate.jobsRemaining) {
      const jobsUsed = rate.jobsLimit - rate.jobsRemaining;
      const jobsUsagePercent = (jobsUsed / rate.jobsLimit) * 100;
      console.log(`- Jobs usage: ${jobsUsagePercent.toFixed(1)}% (${jobsUsed.toLocaleString()} used)`);
      
      if (jobsUsagePercent > 90) {
        console.log('  ⚠️  Critical usage level - approaching API limits');
      } else if (jobsUsagePercent > 75) {
        console.log('  ⚠️  High usage level - monitor consumption');
      } else {
        console.log('  ✅ Healthy usage level');
      }
    }
  }
  
  console.log('\n📦 Response Details:');
  console.log(`- Data size: ${(responseAnalysis.dataSize / 1024).toFixed(1)} KB`);
  console.log(`- Cache stored: ${response.cache.stored ? '✅ YES' : '❌ NO'}`);
  console.log(`- Error occurred: ${responseAnalysis.hasError ? '❌ YES' : '✅ NO'}`);
  
  if (responseAnalysis.errorDetails) {
    console.log(`- Error message: ${responseAnalysis.errorDetails.message}`);
    console.log(`- Error type: ${responseAnalysis.errorDetails.type}`);
  }

  console.log('\n🔬 FULL RESPONSE ANALYSIS:');
  
  // Analyze full response data if available
  if (response.fullResponseData && response.fullResponseData.length > 0) {
    console.log(`\n📋 Complete Response Dataset:`);
    console.log(`- Total jobs in response: ${response.fullResponseData.length}`);
    console.log(`- Raw response data available: ✅ YES`);
    
    // Field distribution analysis across all jobs
    console.log(`\n📊 Field Distribution Across All ${response.fullResponseData.length} Jobs:`);
    const fieldStats = analyzeFieldDistribution(response.fullResponseData);
    
    Object.entries(fieldStats).forEach(([fieldName, stats]) => {
      const coverage = ((stats.present / response.fullResponseData.length) * 100).toFixed(1);
      const coverageIndicator = stats.present > 0 ? '✅' : '❌';
      console.log(`  ${coverageIndicator} ${fieldName}: ${coverage}% (${stats.present}/${response.fullResponseData.length} jobs)`);
      
      if (stats.sampleValues.length > 0 && stats.present > 0) {
        console.log(`    Sample values: ${stats.sampleValues.slice(0, 3).join(', ')}${stats.sampleValues.length > 3 ? '...' : ''}`);
      }
    });
    
    // AI field analysis
    console.log(`\n🤖 AI-Enhanced Field Coverage:`);
    const aiFields = Object.keys(fieldStats).filter(field => field.startsWith('ai_'));
    if (aiFields.length > 0) {
      aiFields.forEach(field => {
        const stats = fieldStats[field];
        const coverage = ((stats.present / response.fullResponseData.length) * 100).toFixed(1);
        console.log(`  - ${field}: ${coverage}% coverage`);
      });
    } else {
      console.log(`  - No AI-enhanced fields found (check if include_ai=true parameter is working)`);
    }
    
    // LinkedIn organization field analysis
    console.log(`\n🔗 LinkedIn Organization Field Coverage:`);
    const linkedInFields = Object.keys(fieldStats).filter(field => field.startsWith('linkedin_org_'));
    if (linkedInFields.length > 0) {
      linkedInFields.forEach(field => {
        const stats = fieldStats[field];
        const coverage = ((stats.present / response.fullResponseData.length) * 100).toFixed(1);
        console.log(`  - ${field}: ${coverage}% coverage`);
      });
    } else {
      console.log(`  - No LinkedIn organization fields found`);
    }
    
    // Show first 3 complete job records for manual inspection
    console.log(`\n🔍 Raw Job Records Sample (First 3 Complete Jobs):`);
    response.fullResponseData.slice(0, 3).forEach((job, index) => {
      console.log(`\n--- Job ${index + 1}: ${job.title || 'No Title'} at ${job.organization || job.company?.name || 'Unknown Company'} ---`);
      console.log('Raw job object keys:', Object.keys(job).join(', '));
      console.log('Raw job data (first 500 chars):');
      console.log(JSON.stringify(job, null, 2).substring(0, 500) + '...');
    });
    
  } else if (response.fullResponseData === null) {
    console.log(`\n📋 Full Response Storage: ❌ DISABLED`);
    console.log(`💡 To enable full response storage, set DEBUG_RAPIDAPI_STORE_FULL=true`);
  } else {
    console.log(`\n📋 Full Response Data: ❌ NOT AVAILABLE`);
    console.log(`This might be from an older debug session before full response storage was implemented.`);
  }

  console.log('\n🔬 Sample Data Analysis (Legacy):');
  if (response.sampleData && response.sampleData.length > 0) {
    console.log(`Analyzing first ${response.sampleData.length} jobs from response:`);
    
    response.sampleData.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title} at ${job.organization}`);
      console.log(`   - AI fields: ${job.hasAiFields ? '✅ YES' : '❌ NO'} (${job.fieldCounts.aiFields} fields)`);
      console.log(`   - LinkedIn org: ${job.hasLinkedInOrg ? '✅ YES' : '❌ NO'} (${job.fieldCounts.linkedInFields} fields)`);
      console.log(`   - Description: ${job.hasDescription ? '✅ YES' : '❌ NO'}`);
      console.log(`   - Total fields: ${job.fieldCounts.totalFields}`);
    });
  }

  console.log('\n=== PERFORMANCE ANALYSIS ===');
  const performanceScore = calculatePerformanceScore(request, response);
  console.log(`Overall Performance Score: ${performanceScore.total}/100`);
  console.log(`- Parameter Quality: ${performanceScore.parameterQuality}/25`);
  console.log(`- Data Quality: ${performanceScore.dataQuality}/25`);
  console.log(`- Response Speed: ${performanceScore.responseSpeed}/25`);
  console.log(`- Credit Efficiency: ${performanceScore.creditEfficiency}/25`);

  console.log('\n=== IMPROVEMENT OPPORTUNITIES ===');
  const findings: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];

  // Analyze parameter quality
  if (paramAnalysis.highFidelityDefaults.length < 3) {
    findings.push('Not all high-fidelity defaults are being applied');
    improvements.push('Ensure agency=FALSE, include_ai=true, and description_type=text are set');
  } else {
    findings.push('All high-fidelity defaults applied correctly ✅');
  }

  // Analyze data quality
  if (responseAnalysis.dataQuality) {
    const quality = responseAnalysis.dataQuality;
    
    if (quality.aiFieldsCoverage < 0.7) {
      findings.push(`Low AI fields coverage (${(quality.aiFieldsCoverage * 100).toFixed(1)}%)`);
      improvements.push('Verify include_ai=true parameter is working correctly');
    }
    
    if (quality.descriptionCoverage < 0.8) {
      findings.push(`Low description coverage (${(quality.descriptionCoverage * 100).toFixed(1)}%)`);
      improvements.push('Verify description_type=text parameter is working correctly');
    }
    
    if (quality.avgSkillsPerJob < 5) {
      findings.push(`Low average skills per job (${quality.avgSkillsPerJob.toFixed(1)} skills)`);
      recommendations.push('AI skill extraction may need improvement');
    }
    
    if (quality.linkedInOrgCoverage > 0.95) {
      findings.push('Excellent LinkedIn organization data coverage ✅');
    }
  }

  // Analyze performance
  if (response.performance.duration > 10000) {
    findings.push(`Slow response time (${response.performance.duration}ms)`);
    improvements.push('Consider reducing limit parameter or using 24h/1h endpoints for smaller datasets');
  } else if (response.performance.duration < 2000) {
    findings.push('Fast response time ✅');
  }

  // Analyze credit efficiency
  if (responseAnalysis.jobCount > request.apiCall.estimatedCredits.jobs) {
    findings.push(`Better than expected results (got ${responseAnalysis.jobCount}, estimated ${request.apiCall.estimatedCredits.jobs})`);
    recommendations.push('Credit estimation can be adjusted upward for this parameter combination');
  } else if (responseAnalysis.jobCount < request.apiCall.estimatedCredits.jobs * 0.7) {
    findings.push(`Lower than expected results (got ${responseAnalysis.jobCount}, estimated ${request.apiCall.estimatedCredits.jobs})`);
    improvements.push('Check parameter combination effectiveness or adjust estimates');
  }

  // Check for agency filtering effectiveness
  if (paramAnalysis.highFidelityDefaults.some(d => d.includes('agency=FALSE'))) {
    findings.push('Agency filtering active - should improve job quality ✅');
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

  console.log('\n=== HIGH-FIDELITY DEFAULTS VERIFICATION ===');
  const expectedDefaults = {
    'agency': 'FALSE',
    'include_ai': 'true', 
    'description_type': 'text'
  };

  let defaultsCorrect = 0;
  Object.entries(expectedDefaults).forEach(([param, expectedValue]) => {
    const actualValue = request.normalizedParameters[param];
    const isCorrect = actualValue === expectedValue;
    defaultsCorrect += isCorrect ? 1 : 0;
    
    console.log(`- ${param}: ${actualValue} ${isCorrect ? '✅' : '❌'} (expected: ${expectedValue})`);
    
    if (!isCorrect) {
      improvements.push(`Fix ${param} parameter to use high-fidelity default: ${expectedValue}`);
    }
  });

  const defaultsScore = (defaultsCorrect / Object.keys(expectedDefaults).length) * 100;
  console.log(`\nHigh-Fidelity Defaults Score: ${defaultsScore.toFixed(0)}% (${defaultsCorrect}/${Object.keys(expectedDefaults).length})`);

  if (defaultsScore === 100) {
    console.log('🎉 Perfect! All high-fidelity defaults are working correctly.');
  } else {
    console.log('⚠️  Some high-fidelity defaults need attention - this affects data quality.');
  }

  // Save analysis
  const analysis = {
    sessionId: latestSession.sessionId,
    findings,
    improvements,
    recommendations,
    performanceScore,
    defaultsScore,
    metrics: {
      requestDuration: response.performance.duration,
      jobsReturned: responseAnalysis.jobCount,
      dataQuality: responseAnalysis.dataQuality,
      creditEfficiency: responseAnalysis.jobCount / (request.apiCall.estimatedCredits.jobs || 1),
      parametersUsed: paramAnalysis.normalizedParamsCount,
      highFidelityDefaultsApplied: paramAnalysis.highFidelityDefaults.length,
    }
  };

  RapidApiDebugLogger.logAnalysis(analysis);
  console.log('\n✅ Analysis complete and saved!');
  console.log(`📁 Analysis file: logs/rapidapi/${latestSession.sessionId}-analysis.json`);
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log(`Overall Score: ${performanceScore.total}/100`);
  console.log(`Jobs Retrieved: ${responseAnalysis.jobCount}`);
  console.log(`Response Time: ${response.performance.duration}ms`);
  console.log(`High-Fidelity Defaults: ${defaultsScore.toFixed(0)}%`);
  
  if (responseAnalysis.dataQuality) {
    console.log(`AI Enhancement: ${(responseAnalysis.dataQuality.aiFieldsCoverage * 100).toFixed(0)}%`);
  }
  
  const overallHealth = performanceScore.total >= 80 ? 'EXCELLENT' : 
                      performanceScore.total >= 60 ? 'GOOD' : 
                      performanceScore.total >= 40 ? 'NEEDS_IMPROVEMENT' : 'POOR';
  
  console.log(`Status: ${overallHealth}`);
  
  console.log(`\n💡 To view raw request/response data, check:`);
  console.log(`   Request: ${latestSession.requestFile}`);
  console.log(`   Response: ${latestSession.responseFile}`);
}

function calculatePerformanceScore(request: any, response: any) {
  let parameterQuality = 0;
  let dataQuality = 0;
  let responseSpeed = 0;
  let creditEfficiency = 0;

  // Parameter Quality (25 points)
  const expectedDefaults = ['agency=FALSE', 'include_ai=true', 'description_type=text'];
  const appliedDefaults = request.parameterAnalysis.highFidelityDefaults.length;
  parameterQuality = Math.round((appliedDefaults / expectedDefaults.length) * 25);

  // Data Quality (25 points)
  if (response.responseAnalysis.dataQuality) {
    const quality = response.responseAnalysis.dataQuality;
    const avgQuality = (quality.aiFieldsCoverage + quality.linkedInOrgCoverage + quality.descriptionCoverage) / 3;
    dataQuality = Math.round(avgQuality * 25);
  }

  // Response Speed (25 points) - under 5s is excellent, under 10s is good
  const duration = response.performance.duration;
  if (duration <= 5000) responseSpeed = 25;
  else if (duration <= 10000) responseSpeed = Math.round(25 - ((duration - 5000) / 5000) * 15);
  else responseSpeed = Math.max(0, Math.round(10 - ((duration - 10000) / 10000) * 10));

  // Credit Efficiency (25 points) - getting expected or more results
  const actualJobs = response.responseAnalysis.jobCount;
  const estimatedJobs = request.apiCall.estimatedCredits.jobs;
  const efficiency = actualJobs / (estimatedJobs || 1);
  
  if (efficiency >= 1) creditEfficiency = 25;
  else creditEfficiency = Math.round(efficiency * 25);

  return {
    parameterQuality,
    dataQuality,
    responseSpeed, 
    creditEfficiency,
    total: parameterQuality + dataQuality + responseSpeed + creditEfficiency
  };
}

/**
 * Analyzes field distribution across all jobs in the response
 * Returns statistics about which fields are present and sample values
 */
function analyzeFieldDistribution(jobs: any[]): Record<string, { present: number; total: number; sampleValues: string[] }> {
  const fieldStats: Record<string, { present: number; total: number; sampleValues: string[] }> = {};
  
  // Collect all unique field names across all jobs
  const allFields = new Set<string>();
  jobs.forEach(job => {
    Object.keys(job).forEach(field => allFields.add(field));
  });
  
  // Analyze each field
  allFields.forEach(fieldName => {
    const stats = {
      present: 0,
      total: jobs.length,
      sampleValues: [] as string[]
    };
    
    jobs.forEach(job => {
      const value = job[fieldName];
      if (value !== undefined && value !== null && value !== '') {
        stats.present++;
        
        // Collect sample values (limit to 5 unique samples)
        if (stats.sampleValues.length < 5) {
          let stringValue = '';
          if (Array.isArray(value)) {
            stringValue = `[${value.length} items]`;
            if (value.length > 0 && typeof value[0] === 'string') {
              stringValue = `[${value.slice(0, 2).join(', ')}${value.length > 2 ? '...' : ''}]`;
            }
          } else if (typeof value === 'object') {
            stringValue = `{object with ${Object.keys(value).length} keys}`;
          } else {
            stringValue = String(value).substring(0, 50);
          }
          
          if (!stats.sampleValues.includes(stringValue)) {
            stats.sampleValues.push(stringValue);
          }
        }
      }
    });
    
    fieldStats[fieldName] = stats;
  });
  
  // Sort fields by coverage (most present first)
  const sortedFields = Object.fromEntries(
    Object.entries(fieldStats).sort(([,a], [,b]) => b.present - a.present)
  );
  
  return sortedFields;
}

// Run the analysis
analyzeRapidApiRequests().catch(console.error);