/**
 * Direct test of MVP CV suggestions using the extracted MVP content
 */

import fetch from 'node-fetch';

async function testMvpSuggestionsDirectly() {
  console.log('🚀 Testing MVP CV Suggestions directly with sample data...');
  
  try {
    // Use the sample data from the PDF we uploaded earlier
    const sampleMvpData = {
      "contactInfo": {
        "name": "Krushal Sonani",
        "email": "krushalsonani2@gmail.com",
        "phone": "+91 9737477976",
        "location": "Ahmedabad, Gujarat, India",
        "linkedin": "",
        "github": ""
      },
      "about": "Experienced Software Developer with expertise in Full Stack Development. Proficient in React, Node.js, MongoDB, and modern web technologies. Passionate about creating scalable applications and solving complex problems.",
      "skills": [
        {"name": "JavaScript", "category": "Programming Languages", "level": "ADVANCED"},
        {"name": "React", "category": "Frontend Frameworks", "level": "ADVANCED"},
        {"name": "Node.js", "category": "Backend Technologies", "level": "ADVANCED"},
        {"name": "MongoDB", "category": "Databases", "level": "INTERMEDIATE"},
        {"name": "Express.js", "category": "Backend Frameworks", "level": "ADVANCED"},
        {"name": "HTML/CSS", "category": "Frontend Technologies", "level": "ADVANCED"}
      ],
      "experience": [
        {
          "id": "exp_1",
          "title": "Full Stack Developer",
          "company": "Tech Solutions Inc",
          "location": "Ahmedabad, India",
          "startDate": "2022-01-01",
          "endDate": "2024-08-01",
          "current": false,
          "description": "Developed and maintained web applications using React and Node.js",
          "responsibilities": [
            "Built responsive web applications using React",
            "Developed REST APIs using Node.js and Express",
            "Worked with MongoDB for database operations",
            "Collaborated with cross-functional teams"
          ]
        },
        {
          "id": "exp_2", 
          "title": "Junior Developer",
          "company": "StartupXYZ",
          "location": "Remote",
          "startDate": "2020-06-01",
          "endDate": "2021-12-01",
          "current": false,
          "description": "Assisted in web development projects and gained experience with modern frameworks",
          "responsibilities": [
            "Assisted senior developers with React components",
            "Learned modern JavaScript frameworks"
          ]
        }
      ],
      "education": [
        {
          "id": "edu_1",
          "degree": "Bachelor of Technology in Computer Engineering",
          "institution": "Gujarat Technological University",
          "year": "2020",
          "location": "Gujarat, India"
        }
      ],
      "achievements": []
    };

    console.log('\n📊 Sample data prepared:');
    console.log(`- Name: ${sampleMvpData.contactInfo.name}`);
    console.log(`- Email: ${sampleMvpData.contactInfo.email}`);
    console.log(`- Skills: ${sampleMvpData.skills.length} items`);
    console.log(`- Experience: ${sampleMvpData.experience.length} items`);
    console.log(`- Education: ${sampleMvpData.education.length} items`);

    // Calculate word count
    const allText = [
      sampleMvpData.about,
      ...sampleMvpData.skills.map(s => s.name),
      ...sampleMvpData.experience.flatMap(e => [e.title, e.company, e.description, ...e.responsibilities]),
      ...sampleMvpData.education.map(e => `${e.degree} ${e.institution}`)
    ].join(' ');
    
    const wordCount = allText.split(/\\s+/).filter(word => word.length > 0).length;
    console.log(`- Total word count: ${wordCount} words`);
    
    // Test the suggestions API
    console.log('\\n🔍 Calling CV improvement suggestions API...');
    
    const response = await fetch('http://localhost:3000/api/cv-improvement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleMvpData)
    });
    
    const responseText = await response.text();
    console.log(`\\n📥 Response status: ${response.status}`);
    console.log(`📥 Response headers: ${JSON.stringify([...response.headers.entries()])}`);
    console.log(`📥 Raw response (first 500 chars): ${responseText.substring(0, 500)}`);
    
    if (!response.ok) {
      throw new Error(`API failed: ${response.status} - ${responseText}`);
    }
    
    const suggestions = JSON.parse(responseText);
    console.log('\\n✅ Suggestions generated successfully!');
    console.log(`📊 Total suggestions: ${suggestions.suggestions.length}`);
    
    // Group suggestions by section
    const suggestionsBySection = suggestions.suggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.section]) {
        acc[suggestion.section] = [];
      }
      acc[suggestion.section].push(suggestion);
      return acc;
    }, {});
    
    console.log('\\n📋 Suggestions by section:');
    Object.entries(suggestionsBySection).forEach(([section, sectionSuggestions]) => {
      console.log(`\\n🔖 ${section.toUpperCase()} (${sectionSuggestions.length} suggestions):`);
      sectionSuggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. [${suggestion.suggestionType}] ${suggestion.reasoning}`);
        if (suggestion.originalText) {
          console.log(`      Original: "${suggestion.originalText.substring(0, 80)}${suggestion.originalText.length > 80 ? '...' : ''}"`);
        }
        if (suggestion.suggestedText) {
          console.log(`      Suggested: "${suggestion.suggestedText.substring(0, 80)}${suggestion.suggestedText.length > 80 ? '...' : ''}"`);
        }
      });
    });
    
    console.log('\\n🎉 MVP CV Suggestions test completed successfully!');
    console.log('\\n📊 Summary:');
    console.log(`- Resume Word Count: ${wordCount} words`);
    console.log(`- Total Suggestions: ${suggestions.suggestions.length}`);
    console.log(`- Sections Covered: ${Object.keys(suggestionsBySection).join(', ')}`);
    console.log(`- Suggestion Types: ${[...new Set(suggestions.suggestions.map(s => s.suggestionType))].join(', ')}`);
    
    // Check for specific Resume Mastery rules
    console.log('\\n🔍 Resume Mastery Rules Analysis:');
    const hasKeywordSuggestion = suggestions.suggestions.some(s => s.reasoning.toLowerCase().includes('keyword'));
    const hasNumbersSuggestion = suggestions.suggestions.some(s => s.reasoning.toLowerCase().includes('number'));
    const hasLengthSuggestion = suggestions.suggestions.some(s => s.reasoning.toLowerCase().includes('word') && (s.reasoning.includes('475') || s.reasoning.includes('600')));
    const hasBuzzwordSuggestion = suggestions.suggestions.some(s => s.reasoning.toLowerCase().includes('buzzword'));
    const hasLinksSuggestion = suggestions.suggestions.some(s => s.reasoning.toLowerCase().includes('linkedin') || s.reasoning.toLowerCase().includes('github'));
    const hasActionWordsSuggestion = suggestions.suggestions.some(s => s.reasoning.toLowerCase().includes('action') || s.reasoning.toLowerCase().includes('verb'));
    
    console.log(`- Keywords suggestion: ${hasKeywordSuggestion ? '✅' : '❌'}`);
    console.log(`- Numbers/metrics suggestion: ${hasNumbersSuggestion ? '✅' : '❌'}`);
    console.log(`- Resume length suggestion: ${hasLengthSuggestion ? '✅' : '❌'}`);
    console.log(`- Buzzwords removal: ${hasBuzzwordSuggestion ? '✅' : '❌'}`);
    console.log(`- Important links: ${hasLinksSuggestion ? '✅' : '❌'}`);
    console.log(`- Strong action words: ${hasActionWordsSuggestion ? '✅' : '❌'}`);
    
    return suggestions;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testMvpSuggestionsDirectly();