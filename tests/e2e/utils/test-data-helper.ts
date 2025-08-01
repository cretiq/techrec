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

  /**
   * Mock role search results for testing
   */
  async mockRoleSearchResults(resultType: 'multiple_roles' | 'single_role' | 'no_results' = 'multiple_roles') {
    const mockResults = {
      multiple_roles: {
        roles: [
          {
            id: 'test-role-1',
            title: 'Senior Frontend Developer',
            company: {
              name: 'TechCorp',
              industry: 'Technology',
              size: '100-500 employees'
            },
            location: 'San Francisco, CA',
            type: 'FULL_TIME',
            remote: true,
            description: 'Looking for a senior frontend developer with React experience...',
            requirements: ['React', 'TypeScript', 'Node.js'],
            salary: '$120,000 - $150,000',
            url: 'https://example.com/jobs/1',
            applicationInfo: {
              applicationUrl: 'https://example.com/apply/1'
            }
          },
          {
            id: 'test-role-2',
            title: 'Full Stack Engineer',
            company: {
              name: 'StartupCo',
              industry: 'Technology',
              size: '10-50 employees'
            },
            location: 'Remote',
            type: 'FULL_TIME',
            remote: true,
            description: 'Join our growing team as a full stack engineer...',
            requirements: ['JavaScript', 'Python', 'AWS'],
            salary: '$100,000 - $140,000',
            url: 'https://example.com/jobs/2',
            applicationInfo: {
              applicationUrl: 'https://example.com/apply/2'
            }
          },
          {
            id: 'test-role-3',
            title: 'Backend Developer',
            company: {
              name: 'Enterprise Inc',
              industry: 'Finance',
              size: '1000+ employees'
            },
            location: 'New York, NY',
            type: 'FULL_TIME',
            remote: false,
            description: 'Backend developer position for financial services...',
            requirements: ['Java', 'Spring Boot', 'PostgreSQL'],
            salary: '$110,000 - $160,000',
            url: 'https://example.com/jobs/3'
          }
        ],
        totalCount: 3,
        cached: false
      },
      single_role: {
        roles: [
          {
            id: 'test-role-single',
            title: 'JavaScript Developer',
            company: {
              name: 'WebDev Co',
              industry: 'Technology'
            },
            location: 'Austin, TX',
            type: 'FULL_TIME',
            remote: true,
            description: 'JavaScript developer position...',
            requirements: ['JavaScript', 'React'],
            salary: '$90,000 - $120,000',
            url: 'https://example.com/jobs/single'
          }
        ],
        totalCount: 1,
        cached: false
      },
      no_results: {
        roles: [],
        totalCount: 0,
        cached: false
      }
    };

    await this.page.route('**/api/roles/search*', async route => {
      const result = mockResults[resultType];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(result)
      });
    });
  }

  /**
   * Mock saved roles API responses
   */
  async mockSavedRolesAPI(responseType: 'success' | 'error' = 'success') {
    if (responseType === 'success') {
      // Mock successful save role response
      await this.page.route('**/api/developer/me/saved-roles', async route => {
        const method = route.request().method();
        
        if (method === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              savedRoleId: `saved-${Date.now()}`,
              message: 'Role saved successfully'
            })
          });
        } else if (method === 'DELETE') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              message: 'Role removed successfully'
            })
          });
        } else {
          route.continue();
        }
      });

      // Mock successful mark as applied response
      await this.page.route('**/api/developer/saved-roles/mark-applied', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            appliedAt: new Date().toISOString(),
            data: {
              role: { title: 'Test Role' }
            }
          })
        });
      });
    } else {
      // Mock error responses
      await this.page.route('**/api/developer/me/saved-roles', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal server error'
          })
        });
      });

      await this.page.route('**/api/developer/saved-roles/mark-applied', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Failed to mark role as applied'
          })
        });
      });
    }
  }

  /**
   * Set up role search page with initial data
   */
  async setupRoleSearchPage(options: {
    withRoles?: boolean;
    roleCount?: number;
    withSavedRoles?: boolean;
  } = {}) {
    const { withRoles = true, roleCount = 3, withSavedRoles = false } = options;

    // Navigate to role search page
    await this.page.goto('/developer/roles/search');
    await this.page.waitForSelector('[data-testid="role-search-container-main"]');

    if (withRoles) {
      // Mock role search results based on count
      if (roleCount === 0) {
        await this.mockRoleSearchResults('no_results');
      } else if (roleCount === 1) {
        await this.mockRoleSearchResults('single_role');
      } else {
        await this.mockRoleSearchResults('multiple_roles');
      }

      // If no roles are visible, trigger a search
      if (await this.page.locator('[data-testid="role-search-card-no-results"]').isVisible()) {
        const searchButton = this.page.locator('[data-testid="role-search-button-start-search"]');
        await searchButton.click();
        await this.page.waitForLoadState('networkidle');
      }
    }

    if (withSavedRoles) {
      await this.mockSavedRolesAPI('success');
    }
  }

  /**
   * Trigger role search with specific filters
   */
  async performRoleSearch(filters: {
    keywords?: string;
    location?: string;
    remote?: boolean;
    jobType?: string;
  } = {}) {
    // Wait for advanced filters to be available
    await this.page.waitForSelector('[data-testid="role-search-container-filters"]');

    // Fill in filters if provided
    if (filters.keywords) {
      await this.page.fill('[data-testid*="search-input-keywords"]', filters.keywords);
    }

    if (filters.location) {
      await this.page.fill('[data-testid*="search-input-location"]', filters.location);
    }

    if (filters.remote !== undefined) {
      const remoteToggle = this.page.locator('[data-testid*="search-toggle-remote"]');
      const isChecked = await remoteToggle.isChecked();
      if (isChecked !== filters.remote) {
        await remoteToggle.click();
      }
    }

    if (filters.jobType) {
      await this.page.selectOption('[data-testid*="search-select-job-type"]', filters.jobType);
    }

    // Click search button
    const searchButton = this.page.locator('[data-testid*="search-button"], [data-testid*="role-search-button-start-search"]');
    await searchButton.click();

    // Wait for search to complete
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select multiple roles for batch operations
   */
  async selectRoles(roleIndices: number[]) {
    const rolesGrid = this.page.locator('[data-testid="role-search-container-roles-grid"]');
    
    for (const index of roleIndices) {
      const roleCard = rolesGrid.locator('[data-testid*="role-search-card-role-item-"]').nth(index);
      await roleCard.click();
      
      // Verify role is selected
      await this.page.waitForSelector(`[data-testid*="role-search-indicator-selected-"]`, { state: 'visible' });
    }
  }

  /**
   * Wait for role search operation to complete
   */
  async waitForRoleSearchComplete() {
    // Wait for loading to disappear
    await this.page.waitForSelector('[data-testid="role-search-container-loading"]', { 
      state: 'hidden',
      timeout: 30000 
    });

    // Wait for results to appear or no-results card
    await this.page.waitForFunction(() => {
      const resultsGrid = document.querySelector('[data-testid="role-search-container-roles-grid"]');
      const noResultsCard = document.querySelector('[data-testid="role-search-card-no-results"]');
      return resultsGrid || noResultsCard;
    }, { timeout: 10000 });
  }

  /**
   * Verify role application status in UI
   */
  async verifyRoleApplicationStatus(roleId: string, isApplied: boolean) {
    const roleCard = this.page.locator(`[data-testid="role-search-card-role-item-${roleId}"]`);
    const markAsAppliedButton = roleCard.locator('[data-testid*="role-search-button-mark-applied"]');
    
    if (isApplied) {
      await this.page.waitForSelector(`[data-testid*="mark-applied-button-applied"]`, { state: 'visible' });
      const appliedButton = roleCard.locator('[data-testid*="mark-applied-button-applied"]');
      await this.page.waitForFunction(
        (button) => button.textContent?.includes('Applied'),
        appliedButton
      );
    } else {
      await this.page.waitForFunction(
        (button) => button.textContent?.includes('Mark as Applied'),
        markAsAppliedButton
      );
    }
  }
} 