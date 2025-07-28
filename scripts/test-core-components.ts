// Core Components Test for Project Enhancement System
// Tests core logic without external dependencies

import { PrismaClient } from '@prisma/client';
import { calculateTotalExperience } from '../utils/experienceCalculator';
import { PointsManager } from '../lib/gamification/pointsManager';
import { CVDescriptionGenerator } from '../utils/cvDescriptionGenerator';

const prisma = new PrismaClient();

interface TestResult {
  component: string;
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

/**
 * Core Components Tester (No External Dependencies)
 */
class CoreComponentsTester {
  private results: TestResult[] = [];

  /**
   * Run all core tests
   */
  async runTests(): Promise<void> {
    console.log('🧪 Testing Core Components of Project Enhancement System');
    console.log('=' .repeat(60));

    await this.testExperienceCalculator();
    await this.testPointsManagerLogic();
    await this.testCVGeneratorValidation();
    await this.testDatabaseSchema();
    await this.testAPISchemas();

    this.generateReport();
    await prisma.$disconnect();
  }

  /**
   * Test experience calculator logic
   */
  async testExperienceCalculator(): Promise<void> {
    console.log('\n📊 Testing Experience Calculator');

    // Test 1: Basic experience calculation
    await this.runTest('ExperienceCalculator', 'Basic calculation', async () => {
      const experiences = [
        {
          title: 'Software Developer',
          company: 'Tech Corp',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-01-01'),
          current: false
        }
      ];

      const total = calculateTotalExperience(experiences);
      
      if (total < 0.9 || total > 1.1) {
        throw new Error(`Expected ~1 year, got ${total}`);
      }

      return { totalExperience: total };
    });

    // Test 2: Overlapping experience
    await this.runTest('ExperienceCalculator', 'Overlapping periods', async () => {
      const experiences = [
        {
          title: 'Full Stack Developer',
          company: 'Company A',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2024-01-01'),
          current: false
        },
        {
          title: 'Part-time Developer',
          company: 'Company B',
          startDate: new Date('2023-06-01'),
          endDate: new Date('2023-12-01'),
          current: false
        }
      ];

      const total = calculateTotalExperience(experiences);
      
      // Should merge overlapping periods to ~1 year
      if (total < 0.9 || total > 1.1) {
        throw new Error(`Expected ~1 year (merged), got ${total}`);
      }

      return { totalExperience: total };
    });

    // Test 3: Current position
    await this.runTest('ExperienceCalculator', 'Current position', async () => {
      const experiences = [
        {
          title: 'Senior Developer',
          company: 'Current Corp',
          startDate: new Date('2023-01-01'),
          endDate: null,
          current: true
        }
      ];

      const total = calculateTotalExperience(experiences);
      
      if (total < 1.0) {
        throw new Error(`Expected at least 1 year, got ${total}`);
      }

      return { totalExperience: total };
    });
  }

  /**
   * Test points manager calculations
   */
  async testPointsManagerLogic(): Promise<void> {
    console.log('\n💎 Testing Points Manager Logic');

    // Test 1: Available points calculation
    await this.runTest('PointsManager', 'Available points calculation', async () => {
      const available1 = PointsManager.calculateAvailablePoints(30, 5, 10); // 30 + 10 - 5 = 35
      const available2 = PointsManager.calculateAvailablePoints(10, 15, 3); // max(0, 10 + 3 - 15) = 0

      if (available1 !== 35) {
        throw new Error(`Expected 35 available points, got ${available1}`);
      }

      if (available2 !== 0) {
        throw new Error(`Expected 0 available points (clamped), got ${available2}`);
      }

      return { test1: available1, test2: available2 };
    });

    // Test 2: Efficiency multipliers
    await this.runTest('PointsManager', 'Efficiency multipliers', async () => {
      const freeEfficiency = await PointsManager.getPointsEfficiencyMultiplier('FREE');
      const starterEfficiency = await PointsManager.getPointsEfficiencyMultiplier('STARTER');
      const expertEfficiency = await PointsManager.getPointsEfficiencyMultiplier('EXPERT');

      if (freeEfficiency !== 1.0) {
        throw new Error(`Expected FREE efficiency 1.0, got ${freeEfficiency}`);
      }

      if (starterEfficiency >= freeEfficiency) {
        throw new Error('STARTER should have better efficiency than FREE');
      }

      if (expertEfficiency >= starterEfficiency) {
        throw new Error('EXPERT should have better efficiency than STARTER');
      }

      return { free: freeEfficiency, starter: starterEfficiency, expert: expertEfficiency };
    });

    // Test 3: Points reset calculation
    await this.runTest('PointsManager', 'Points reset logic', async () => {
      const needsReset1 = PointsManager.isPointsResetNeeded(null);
      const needsReset2 = PointsManager.isPointsResetNeeded(new Date(Date.now() - 86400000)); // 1 day ago
      const needsReset3 = PointsManager.isPointsResetNeeded(new Date(Date.now() + 86400000)); // 1 day future

      if (!needsReset1) {
        throw new Error('Should need reset when resetDate is null');
      }

      if (!needsReset2) {
        throw new Error('Should need reset when resetDate is in the past');
      }

      if (needsReset3) {
        throw new Error('Should NOT need reset when resetDate is in the future');
      }

      return { nullDate: needsReset1, pastDate: needsReset2, futureDate: needsReset3 };
    });
  }

  /**
   * Test CV generator validation logic
   */
  async testCVGeneratorValidation(): Promise<void> {
    console.log('\n📝 Testing CV Generator Validation');

    // Test 1: Valid request validation
    await this.runTest('CVGenerator', 'Valid request validation', async () => {
      const validRequest = {
        userId: 'test-user-123',
        projectInput: {
          type: 'manual' as const,
          projectData: {
            name: 'Portfolio Website',
            description: 'A personal portfolio website showcasing projects',
            technologies: ['React', 'CSS', 'JavaScript']
          }
        }
      };

      const validation = CVDescriptionGenerator.validateRequest(validRequest);
      
      if (!validation.isValid) {
        throw new Error(`Valid request rejected: ${validation.reason}`);
      }

      return { validation: 'passed' };
    });

    // Test 2: Invalid request rejection
    await this.runTest('CVGenerator', 'Invalid request rejection', async () => {
      const invalidRequests = [
        { userId: '', projectInput: { type: 'manual', projectData: { name: 'test', description: 'test', technologies: [] } } },
        { userId: 'test', projectInput: null },
        { userId: 'test', projectInput: { type: 'github' } }, // Missing repository
        { userId: 'test', projectInput: { type: 'idea' } }, // Missing projectIdea
        { userId: 'test', projectInput: { type: 'manual' } } // Missing projectData
      ] as any[];

      let rejectedCount = 0;
      
      for (const request of invalidRequests) {
        const validation = CVDescriptionGenerator.validateRequest(request);
        if (!validation.isValid) {
          rejectedCount++;
        }
      }

      if (rejectedCount !== invalidRequests.length) {
        throw new Error(`Expected all ${invalidRequests.length} invalid requests to be rejected, only ${rejectedCount} were`);
      }

      return { totalInvalid: invalidRequests.length, rejected: rejectedCount };
    });
  }

  /**
   * Test database schema operations
   */
  async testDatabaseSchema(): Promise<void> {
    console.log('\n🗃️ Testing Database Schema');

    let testUserId: string | undefined;
    let testPortfolioId: string | undefined;
    let testEnhancementId: string | undefined;

    try {
      // Test 1: Create test user
      await this.runTest('Database', 'Create developer', async () => {
        const testUser = await prisma.developer.create({
          data: {
            email: 'test-core@techrec.com',
            profileEmail: 'test-core@techrec.com',
            name: 'Test Core User',
            title: 'Junior Developer',
            totalXP: 100,
            pointsUsed: 0,
            pointsEarned: 5,
            monthlyPoints: 30,
            subscriptionTier: 'FREE'
          }
        });

        testUserId = testUser.id;
        return { userId: testUser.id };
      });

      // Test 2: Create project portfolio
      await this.runTest('Database', 'Create project portfolio', async () => {
        if (!testUserId) throw new Error('Test user not created');

        const portfolio = await prisma.projectPortfolio.create({
          data: {
            developerId: testUserId,
            title: 'Test Core Project',
            description: 'A test project for core testing',
            sourceType: 'manual',
            sourceId: 'test-core-1',
            technologies: ['TypeScript', 'Node.js'],
            achievements: ['Implemented testing', 'Built core logic'],
            cvDescription: 'Developed core testing framework for project enhancement system',
            isPublic: false,
            metadata: { testProject: true, coreTest: true }
          }
        });

        testPortfolioId = portfolio.id;
        return { portfolioId: portfolio.id };
      });

      // Test 3: Create project enhancement
      await this.runTest('Database', 'Create project enhancement', async () => {
        if (!testPortfolioId) throw new Error('Test portfolio not created');

        const enhancement = await prisma.projectEnhancement.create({
          data: {
            portfolioId: testPortfolioId,
            enhancementType: 'cv_description',
            originalContent: 'Basic core project description',
            enhancedContent: 'Professional CV-ready core project description with testing framework impact',
            pointsUsed: 5,
            confidence: 90,
            metadata: { testEnhancement: true, coreTest: true }
          }
        });

        testEnhancementId = enhancement.id;
        return { enhancementId: enhancement.id };
      });

      // Test 4: Query relationships
      await this.runTest('Database', 'Query with relationships', async () => {
        if (!testPortfolioId) throw new Error('Test portfolio not created');

        const portfolioWithEnhancements = await prisma.projectPortfolio.findUnique({
          where: { id: testPortfolioId },
          include: {
            enhancements: true,
            developer: {
              select: { name: true, email: true }
            }
          }
        });

        if (!portfolioWithEnhancements) {
          throw new Error('Portfolio not found');
        }

        if (portfolioWithEnhancements.enhancements.length === 0) {
          throw new Error('Enhancements not found');
        }

        if (!portfolioWithEnhancements.developer) {
          throw new Error('Developer relationship not working');
        }

        return {
          portfolioTitle: portfolioWithEnhancements.title,
          enhancementCount: portfolioWithEnhancements.enhancements.length,
          developerName: portfolioWithEnhancements.developer.name
        };
      });

    } finally {
      // Cleanup test data
      await this.runTest('Database', 'Cleanup test data', async () => {
        let cleaned = 0;

        if (testEnhancementId) {
          await prisma.projectEnhancement.delete({ where: { id: testEnhancementId } });
          cleaned++;
        }

        if (testPortfolioId) {
          await prisma.projectPortfolio.delete({ where: { id: testPortfolioId } });
          cleaned++;
        }

        if (testUserId) {
          await prisma.developer.delete({ where: { id: testUserId } });
          cleaned++;
        }

        return { recordsCleaned: cleaned };
      });
    }
  }

  /**
   * Test API request schemas
   */
  async testAPISchemas(): Promise<void> {
    console.log('\n🔌 Testing API Schemas');

    // Test 1: Valid API request schema
    await this.runTest('APISchemas', 'Valid request parsing', async () => {
      const { ProjectEnhancementRequestSchema } = await import('../app/api/project-enhancement/route');

      const validRequest = {
        action: 'generate-cv-description',
        data: {
          projectInput: {
            type: 'manual',
            projectData: {
              name: 'Test API Project',
              description: 'A project for testing API schemas',
              technologies: ['JavaScript', 'API Design']
            }
          },
          userProfile: {
            name: 'Test User',
            title: 'Developer'
          },
          options: {
            style: 'professional',
            length: 'detailed'
          }
        }
      };

      const validation = ProjectEnhancementRequestSchema.safeParse(validRequest);
      
      if (!validation.success) {
        throw new Error(`Valid API request rejected: ${JSON.stringify(validation.error.flatten())}`);
      }

      return { schemaValidation: 'passed' };
    });

    // Test 2: Invalid API request rejection
    await this.runTest('APISchemas', 'Invalid request rejection', async () => {
      const { ProjectEnhancementRequestSchema } = await import('../app/api/project-enhancement/route');

      const invalidRequests = [
        { action: 'invalid-action', data: {} },
        { action: 'generate-cv-description' }, // Missing data
        { data: {} }, // Missing action
        { action: 'generate-cv-description', data: null }
      ];

      let rejectedCount = 0;
      
      for (const request of invalidRequests) {
        const validation = ProjectEnhancementRequestSchema.safeParse(request);
        if (!validation.success) {
          rejectedCount++;
        }
      }

      if (rejectedCount !== invalidRequests.length) {
        throw new Error(`Expected all ${invalidRequests.length} invalid requests to be rejected, only ${rejectedCount} were`);
      }

      return { totalInvalid: invalidRequests.length, rejected: rejectedCount };
    });

    // Test 3: Portfolio schema validation
    await this.runTest('APISchemas', 'Portfolio schema validation', async () => {
      const { CreateProjectPortfolioSchema } = await import('../app/api/project-portfolio/route');

      const validPortfolio = {
        title: 'Test Portfolio Project',
        description: 'A comprehensive test project demonstrating various skills',
        sourceType: 'github',
        sourceId: 'user/test-repo',
        technologies: ['React', 'TypeScript', 'Node.js'],
        achievements: ['Built responsive UI', 'Implemented real-time features'],
        cvDescription: 'Developed a full-stack application with modern technologies',
        metadata: { testData: true }
      };

      const validation = CreateProjectPortfolioSchema.safeParse(validPortfolio);
      
      if (!validation.success) {
        throw new Error(`Valid portfolio rejected: ${JSON.stringify(validation.error.flatten())}`);
      }

      return { portfolioSchemaValidation: 'passed' };
    });
  }

  /**
   * Run individual test with error handling
   */
  private async runTest(
    component: string,
    testName: string,
    testFunction: () => Promise<any>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`  ⏳ ${testName}`);
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.push({
        component,
        test: testName,
        passed: true,
        duration,
        details: result
      });
      
      console.log(`  ✅ ${testName} (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        component,
        test: testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      console.log(`  ❌ ${testName} (${duration}ms): ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate test report
   */
  private generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CORE COMPONENTS TEST REPORT');
    console.log('='.repeat(60));

    const byComponent: Record<string, TestResult[]> = {};
    this.results.forEach(result => {
      if (!byComponent[result.component]) {
        byComponent[result.component] = [];
      }
      byComponent[result.component].push(result);
    });

    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;

    Object.entries(byComponent).forEach(([component, results]) => {
      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      const duration = results.reduce((sum, r) => sum + r.duration, 0);

      totalPassed += passed;
      totalFailed += failed;
      totalDuration += duration;

      console.log(`\n📁 ${component}`);
      console.log(`   Tests: ${results.length} | ✅ ${passed} | ❌ ${failed} | ⏱️ ${duration}ms`);
      
      if (failed > 0) {
        results.filter(r => !r.passed).forEach(test => {
          console.log(`   ❌ ${test.test}: ${test.error}`);
        });
      }
    });

    console.log('\n' + '-'.repeat(60));
    console.log('📈 SUMMARY');
    console.log('-'.repeat(60));
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${totalPassed} (${Math.round(totalPassed / this.results.length * 100)}%)`);
    console.log(`❌ Failed: ${totalFailed} (${Math.round(totalFailed / this.results.length * 100)}%)`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);

    if (totalFailed === 0) {
      console.log('\n🎉 ALL CORE TESTS PASSED!');
      console.log('✨ Project Enhancement System core components are functioning correctly.');
    } else {
      console.log(`\n⚠️ ${totalFailed} test(s) failed. Please review the issues above.`);
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Execute tests
async function main() {
  const tester = new CoreComponentsTester();
  await tester.runTests();
}

// Check if this file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch(console.error);
}

export { CoreComponentsTester };