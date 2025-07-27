import { Page } from '@playwright/test';

/**
 * Test data helper for setting up realistic scenarios
 */
export class TestDataHelper {
  constructor(private page: Page) {}

  /**
   * Upload a test CV with specific characteristics
   */
  async uploadTestCV(cvType: 'minimal_projects' | 'no_projects' | 'good_projects' = 'minimal_projects') {
    await this.page.goto('/developer/cv-management');
    
    // Wait for upload area
    await this.page.waitForSelector('[data-testid="cv-management-upload-form-container"]');
    
    // For now, simulate CV upload with different characteristics
    // In real implementation, we'd upload actual test CV files
    console.log(`Uploading test CV of type: ${cvType}`);
    
    // Click upload button
    await this.page.click('[data-testid="cv-management-button-upload-trigger"]');
    
    // Simulate file selection (would need actual test files)
    const fileInput = this.page.locator('[data-testid="cv-management-upload-file-input"]');
    
    // For testing purposes, we'd set up actual CV files
    // await fileInput.setInputFiles(`tests/fixtures/cv-${cvType}.pdf`);
    
    // Wait for upload completion
    await this.page.waitForSelector('[data-testid="cv-management-upload-status-success"]');
  }

  /**
   * Set up user profile with specific experience level
   */
  async setupUserProfile(profileType: 'junior' | 'experienced' | 'no_experience') {
    const profiles = {
      junior: {
        yearsExperience: 1.5,
        skills: ['JavaScript', 'React', 'Node.js'],
        projects: ['Personal Blog', 'Todo App']
      },
      experienced: {
        yearsExperience: 5,
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
        projects: ['E-commerce Platform', 'Microservices Architecture', 'Mobile App']
      },
      no_experience: {
        yearsExperience: 0,
        skills: ['HTML', 'CSS'],
        projects: []
      }
    };

    const profile = profiles[profileType];
    
    // Navigate to profile
    await this.page.goto('/developer/profile');
    
    // This would involve filling out the profile form
    // Implementation depends on actual profile form structure
    console.log(`Setting up ${profileType} profile:`, profile);
  }

  /**
   * Mock GitHub repositories for testing
   */
  async mockGitHubRepositories(repoType: 'empty_readmes' | 'good_readmes' | 'no_repos') {
    // This would involve intercepting GitHub API calls
    const mockData = {
      empty_readmes: [
        { name: 'project1', description: 'A simple project', readme: 'Basic readme' },
        { name: 'project2', description: 'Another project', readme: 'Minimal content' }
      ],
      good_readmes: [
        { 
          name: 'awesome-project', 
          description: 'A full-featured web application',
          readme: 'Comprehensive project with features, tech stack, and deployment info'
        },
        { 
          name: 'api-service', 
          description: 'RESTful API service',
          readme: 'Well-documented API with endpoints, authentication, and examples'
        }
      ],
      no_repos: []
    };

    await this.page.route('**/api/github/repositories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData[repoType])
      });
    });
  }

  /**
   * Set up project ideas questionnaire responses
   */
  async fillProjectIdeasQuestionnaire(responses: {
    problemStatement?: string;
    projectScope?: string;
    learningGoals?: string[];
    targetUsers?: string;
    platformPreference?: string;
  }) {
    await this.page.goto('/developer/projects/ideas');
    
    // Fill problem statement
    if (responses.problemStatement) {
      await this.page.fill(
        '[data-testid="project-ideas-input-problem-statement"]', 
        responses.problemStatement
      );
    }

    // Select project scope pill
    if (responses.projectScope) {
      await this.page.click(
        `[data-testid="project-ideas-pill-scope-${responses.projectScope}"]`
      );
    }

    // Select learning goals
    if (responses.learningGoals) {
      for (const goal of responses.learningGoals) {
        await this.page.click(
          `[data-testid="project-ideas-pill-learning-${goal}"]`
        );
      }
    }

    // Select target users
    if (responses.targetUsers) {
      await this.page.click(
        `[data-testid="project-ideas-pill-users-${responses.targetUsers}"]`
      );
    }

    // Select platform preference
    if (responses.platformPreference) {
      await this.page.click(
        `[data-testid="project-ideas-pill-platform-${responses.platformPreference}"]`
      );
    }
  }

  /**
   * Mock AI generation responses
   */
  async mockAIResponses(responseType: 'success' | 'failure' | 'malformed') {
    const mockResponses = {
      success: {
        projects: [
          {
            id: '1',
            title: 'Personal Finance Tracker',
            difficulty: 'Beginner',
            skills: ['React', 'Node.js', 'MongoDB'],
            tools: ['VS Code', 'npm', 'Postman'],
            description: 'A web application to track personal expenses and income',
            timeEstimate: '2-3 weeks',
            keyFeatures: ['Expense tracking', 'Budget visualization', 'Report generation']
          },
          {
            id: '2',
            title: 'Recipe Sharing Platform',
            difficulty: 'Intermediate',
            skills: ['React', 'Express', 'PostgreSQL'],
            tools: ['VS Code', 'Docker', 'pgAdmin'],
            description: 'A platform for sharing and discovering new recipes',
            timeEstimate: '1 month',
            keyFeatures: ['Recipe upload', 'Search and filter', 'User ratings']
          }
        ]
      },
      failure: { error: 'AI service unavailable' },
      malformed: { invalid: 'response format' }
    };

    await this.page.route('**/api/project-ideas/session/*/generate', async route => {
      const response = mockResponses[responseType];
      await route.fulfill({
        status: responseType === 'success' ? 200 : 500,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Wait for auto-save to complete
   */
  async waitForAutoSave() {
    // Wait for auto-save indicator to appear and disappear
    await this.page.waitForSelector('[data-testid="project-ideas-autosave-indicator"]');
    await this.page.waitForSelector('[data-testid="project-ideas-autosave-indicator"]', { 
      state: 'hidden',
      timeout: 10000 
    });
  }
} 