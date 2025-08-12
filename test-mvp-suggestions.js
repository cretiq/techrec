/**
 * Test script to verify MVP CV suggestions integration
 * This tests the flow: Upload CV in MVP mode → Get suggestions using MVP content
 */

import fetch from 'node-fetch';

async function testMvpSuggestions() {
  console.log('🚀 Testing MVP CV Suggestions Flow...');
  
  try {
    // First, let's get the latest CV to see if it has MVP content
    console.log('\n1. Fetching latest CV...');
    const cvsResponse = await fetch('http://localhost:3000/api/developer/cvs');
    
    if (!cvsResponse.ok) {
      throw new Error(`Failed to fetch CVs: ${cvsResponse.status}`);
    }
    
    const cvs = await cvsResponse.json();
    console.log(`Found ${cvs.length} CVs`);
    
    if (cvs.length === 0) {
      throw new Error('No CVs found. Please upload a CV first.');
    }
    
    // Get the latest CV (should be the one with MVP data)
    const latestCV = cvs[0];
    console.log(`Latest CV: ${latestCV.id} - Status: ${latestCV.status}`);
    console.log(`Has MVP content: ${!!latestCV.mvpContent}`);
    console.log(`Has MVP raw data: ${!!latestCV.mvpRawData}`);
    
    if (!latestCV.mvpContent || !latestCV.mvpRawData) {
      throw new Error('Latest CV does not have MVP content. Please upload a CV with ENABLE_MVP_MODE=true');
    }
    
    // Now let's prepare the MVP data for suggestions
    console.log('\n2. Preparing MVP data for suggestions...');
    
    // Convert MVP data to the expected CV suggestions format
    const mvpJson = latestCV.mvpRawData;
    
    // Transform MVP raw data into the format expected by suggestions API
    const suggestionData = {
      contactInfo: {
        name: mvpJson.name || '',
        email: mvpJson.email || '',
        phone: mvpJson.phone || '',
        location: mvpJson.location || '',
        linkedin: mvpJson.linkedin || '',
        github: mvpJson.github || ''
      },
      about: mvpJson.about || '',
      skills: mvpJson.skills ? mvpJson.skills.map(skill => ({
        name: typeof skill === 'string' ? skill : skill.name || skill,
        category: 'General',
        level: 'INTERMEDIATE'
      })) : [],
      experience: mvpJson.experience ? mvpJson.experience.map((exp, index) => ({
        id: `mvp_exp_${index}`,
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.endDate === 'Present' || exp.current || false,
        description: exp.description || '',
        responsibilities: exp.responsibilities || exp.achievements || []
      })) : [],
      education: mvpJson.education ? mvpJson.education.map((edu, index) => ({
        id: `mvp_edu_${index}`,
        degree: edu.degree || '',
        institution: edu.institution || '',
        year: edu.year || '',
        location: edu.location || '',
        gpa: edu.gpa || null
      })) : [],
      achievements: mvpJson.certifications ? mvpJson.certifications.map((cert, index) => ({
        id: `mvp_cert_${index}`,
        title: cert,
        description: '',
        date: '',
        issuer: ''
      })) : [],
      personalProjects: mvpJson.projects ? mvpJson.projects.map((proj, index) => ({
        id: `mvp_proj_${index}`,
        name: proj.name || proj,
        description: proj.description || '',
        technologies: proj.technologies || []
      })) : []
    };
    
    console.log('Transformed data summary:');
    console.log(`- Contact info: ${suggestionData.contactInfo.name ? 'Present' : 'Missing'}`);
    console.log(`- About section: ${suggestionData.about ? suggestionData.about.length + ' chars' : 'Missing'}`);
    console.log(`- Skills: ${suggestionData.skills.length} items`);
    console.log(`- Experience: ${suggestionData.experience.length} items`);
    console.log(`- Education: ${suggestionData.education.length} items`);
    console.log(`- Achievements: ${suggestionData.achievements.length} items`);
    
    // Calculate word count for the resume length check
    const allText = [
      suggestionData.about,
      ...suggestionData.skills.map(s => s.name),
      ...suggestionData.experience.flatMap(e => [e.title, e.company, e.description, ...e.responsibilities]),
      ...suggestionData.education.map(e => `${e.degree} ${e.institution}`)
    ].join(' ');
    
    const wordCount = allText.split(/\s+/).filter(word => word.length > 0).length;
    console.log(`Total word count: ${wordCount} words`);
    
    // Test the suggestions API
    console.log('\n3. Testing CV improvement suggestions...');
    
    const suggestionsResponse = await fetch('http://localhost:3000/api/cv-improvement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(suggestionData)
    });
    
    if (!suggestionsResponse.ok) {
      const errorText = await suggestionsResponse.text();
      throw new Error(`Suggestions API failed: ${suggestionsResponse.status} - ${errorText}`);
    }
    
    const suggestions = await suggestionsResponse.json();
    console.log('\n✅ Suggestions generated successfully!');
    console.log(`Total suggestions: ${suggestions.suggestions.length}`);
    
    // Display suggestions
    suggestions.suggestions.forEach((suggestion, index) => {
      console.log(`\n${index + 1}. ${suggestion.section.toUpperCase()}`);
      console.log(`   Type: ${suggestion.suggestionType}`);
      console.log(`   Issue: ${suggestion.reasoning}`);
      if (suggestion.originalText) {
        console.log(`   Original: "${suggestion.originalText.substring(0, 100)}${suggestion.originalText.length > 100 ? '...' : ''}"`);
      }
      if (suggestion.suggestedText) {
        console.log(`   Suggested: "${suggestion.suggestedText.substring(0, 100)}${suggestion.suggestedText.length > 100 ? '...' : ''}"`);
      }
    });
    
    console.log('\n🎉 MVP CV Suggestions test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- CV ID: ${latestCV.id}`);
    console.log(`- MVP Content Length: ${latestCV.mvpContent.length} chars`);
    console.log(`- Estimated Word Count: ${wordCount} words`);
    console.log(`- Suggestions Generated: ${suggestions.suggestions.length}`);
    console.log(`- Categories covered: ${[...new Set(suggestions.suggestions.map(s => s.section))].join(', ')}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testMvpSuggestions();