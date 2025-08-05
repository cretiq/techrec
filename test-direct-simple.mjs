#!/usr/bin/env node

/**
 * Simple test for direct Gemini upload functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local (safe and reliable)
console.log('🔧 Loading environment from .env.local...');
const envResult = config({ path: path.join(__dirname, '.env.local') });

if (envResult.error) {
  console.error('❌ Failed to load .env.local:', envResult.error.message);
  console.log('Make sure .env.local exists and contains GOOGLE_AI_API_KEY');
  process.exit(1);
}

// Override specific test settings (but keep API keys from .env.local)
process.env.DEBUG_CV_UPLOAD = 'true';
process.env.NODE_ENV = 'development';
// ENABLE_DIRECT_GEMINI_UPLOAD should already be set in .env.local

console.log('✅ Environment loaded from .env.local');

console.log('🧪 Simple Direct Gemini Upload Test');
console.log('===================================');

const testFilePath = path.join(__dirname, 'tests/fixtures/KRUSHAL_SONANI.pdf');
console.log(`Test file: ${testFilePath}`);
console.log(`File exists: ${fs.existsSync(testFilePath)}`);

if (!fs.existsSync(testFilePath)) {
  console.log('❌ Test file not found');
  process.exit(1);
}

const stats = fs.statSync(testFilePath);
console.log(`File size: ${stats.size} bytes`);

// Simple service test
async function runTest() {
  try {
    console.log('\n🔧 Loading DirectGeminiUploadService...');
    
    // Load the service directly
    const module = await import('./utils/directGeminiUpload.ts');
    const { directGeminiUpload } = module;
    
    console.log(`✅ Service loaded`);
    console.log(`Available: ${directGeminiUpload.isAvailable()}`);
    
    if (!directGeminiUpload.isAvailable()) {
      console.log('❌ Service not available - check GOOGLE_AI_API_KEY');
      console.log('Environment check:', {
        GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? 'Present' : 'Missing',
        ENABLE_DIRECT_GEMINI_UPLOAD: process.env.ENABLE_DIRECT_GEMINI_UPLOAD,
        NODE_ENV: process.env.NODE_ENV
      });
      return;
    }
    
    console.log('\n📤 Testing upload and analysis...');
    const result = await directGeminiUpload.uploadAndAnalyze(testFilePath, 'Krushal_Test_CV');
    
    console.log('\n📊 Results:');
    console.log('Upload:', {
      success: result.upload.success,
      error: result.upload.error,
      duration: result.upload.uploadDuration,
      fileUri: result.upload.fileUri?.substring(0, 50) + '...' || 'None'
    });
    
    if (result.analysis) {
      console.log('Analysis:', {
        success: result.analysis.success,
        error: result.analysis.error,
        duration: result.analysis.analysisDuration
      });
      
      if (result.analysis.success && result.analysis.extractedData) {
        const data = result.analysis.extractedData;
        console.log('\n🎯 Extracted Data Summary:');
        console.log({
          contactInfo: !!data.contactInfo?.email,
          skills: data.skills?.length || 0,
          experience: data.experience?.length || 0,
          education: data.education?.length || 0,
          achievements: data.achievements?.length || 0,
          totalYears: data.totalYearsExperience
        });
        
        // Key test: Check project nesting
        console.log('\n🔍 Project Nesting Check (Critical Issue):');
        if (data.experience && data.experience.length > 0) {
          data.experience.forEach((exp, i) => {
            const projects = exp.projects || [];
            console.log(`${i+1}. ${exp.company} (${exp.title}): ${projects.length} projects`);
            projects.forEach((project, j) => {
              console.log(`   - ${project.name}: ${project.description?.substring(0, 40)}...`);
            });
          });
          
          // Look for specific projects that should be nested under Superworks
          const superworksExp = data.experience.find(exp => exp.company?.toLowerCase().includes('superworks'));
          if (superworksExp) {
            const hasNestedProjects = superworksExp.projects && superworksExp.projects.length > 0;
            console.log(`\n✅ Superworks experience found with ${hasNestedProjects ? superworksExp.projects.length + ' nested projects' : 'no nested projects'}`);
            
            if (hasNestedProjects) {
              const projectNames = superworksExp.projects.map(p => p.name).join(', ');
              console.log(`   Projects: ${projectNames}`);
            }
          }
          
          // Check if problematic projects are in achievements instead
          const problematicInAchievements = data.achievements?.filter(ach => 
            ach.title?.toLowerCase().includes('exchange') || 
            ach.title?.toLowerCase().includes('baseball') ||
            ach.title?.toLowerCase().includes('sundance')
          ) || [];
          
          if (problematicInAchievements.length > 0) {
            console.log(`\n⚠️  Found ${problematicInAchievements.length} project-like items in achievements:`);
            problematicInAchievements.forEach(ach => console.log(`   - ${ach.title}`));
            console.log('   These should ideally be nested under relevant experience');
          } else {
            console.log('\n✅ No project-like items found in achievements - good!');
          }
          
        } else {
          console.log('❌ No experience data found');
        }
      }
    }
    
    // Cleanup
    if (result.upload.success && result.upload.fileName) {
      console.log('\n🧹 Cleaning up...');
      const cleanup = await directGeminiUpload.deleteFile(result.upload.fileName);
      console.log(`Cleanup: ${cleanup.success ? 'Success' : cleanup.error}`);
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();