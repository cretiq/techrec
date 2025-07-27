#!/usr/bin/env node

/**
 * E2E Test Runner for TechRec
 * Provides easy commands for running different test scenarios
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

interface TestConfig {
  name: string;
  description: string;
  command: string;
}

const testConfigs: TestConfig[] = [
  {
    name: 'all',
    description: 'Run all E2E tests',
    command: 'npx playwright test --project=chromium'
  },
  {
    name: 'fr23',
    description: 'Run FR 23 (Project Enhancement) tests only',
    command: 'npx playwright test project-enhancement.spec.ts --project=chromium'
  },
  {
    name: 'fr24', 
    description: 'Run FR 24 (Project Ideas) tests only',
    command: 'npx playwright test project-ideas-generation.spec.ts --project=chromium'
  },
  {
    name: 'fr24-simple',
    description: 'Run simplified FR 24 tests (works with actual implementation)',
    command: 'npx playwright test project-ideas-simple.spec.ts --project=chromium'
  },
  {
    name: 'auth-isolation',
    description: 'Test authentication state isolation between tests',
    command: 'npx playwright test auth-isolation.spec.ts --project=chromium'
  },
  {
    name: 'mobile',
    description: 'Run mobile responsive tests',
    command: 'npx playwright test --project="Mobile Chrome"'
  },
  {
    name: 'cross-browser',
    description: 'Run tests across all browsers',
    command: 'npx playwright test --project=chromium --project=firefox --project=webkit'
  },
  {
    name: 'headed',
    description: 'Run tests in headed mode (visible browser)',
    command: 'npx playwright test --headed --project=chromium'
  },
  {
    name: 'debug',
    description: 'Run tests in debug mode with browser developer tools',
    command: 'npx playwright test --debug --project=chromium'
  },
  {
    name: 'ui',
    description: 'Run tests with Playwright UI (interactive mode)',
    command: 'npx playwright test --ui'
  }
];

function showHelp() {
  console.log(chalk.blue.bold('\n🎭 TechRec E2E Test Runner\n'));
  console.log(chalk.yellow('Available test configurations:\n'));
  
  testConfigs.forEach(config => {
    console.log(chalk.green(`  ${config.name.padEnd(15)}`), config.description);
  });
  
  console.log(chalk.yellow('\nUsage:'));
  console.log(chalk.gray('  npm run test:e2e <config>'));
  console.log(chalk.gray('  npx tsx tests/e2e/run-tests.ts <config>'));
  
  console.log(chalk.yellow('\nExamples:'));
  console.log(chalk.gray('  npm run test:e2e fr23        # Test project enhancement'));
  console.log(chalk.gray('  npm run test:e2e fr24        # Test project ideas'));
  console.log(chalk.gray('  npm run test:e2e mobile      # Test mobile responsiveness'));
  console.log(chalk.gray('  npm run test:e2e headed      # Run with visible browser'));
  console.log(chalk.gray('  npm run test:e2e debug       # Debug mode with DevTools'));
  console.log(chalk.gray('  npm run test:e2e ui          # Interactive UI mode'));
  
  console.log(chalk.yellow('\nBefore running tests:'));
  console.log(chalk.gray('  1. Make sure your dev server is running: npm run dev'));
  console.log(chalk.gray('  2. Install Playwright browsers: npx playwright install'));
  console.log('');
}

function runTest(configName: string) {
  const config = testConfigs.find(c => c.name === configName);
  
  if (!config) {
    console.log(chalk.red(`❌ Unknown test configuration: ${configName}`));
    showHelp();
    process.exit(1);
  }

  console.log(chalk.blue.bold(`\n🚀 Running: ${config.description}\n`));
  console.log(chalk.gray(`Command: ${config.command}\n`));

  try {
    execSync(config.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log(chalk.green.bold('\n✅ Tests completed successfully!\n'));
  } catch (error) {
    console.log(chalk.red.bold('\n❌ Tests failed!\n'));
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const configName = args[0];

  if (!configName || configName === 'help' || configName === '--help' || configName === '-h') {
    showHelp();
    return;
  }

  // Check if Playwright is installed
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
  } catch (error) {
    console.log(chalk.red('❌ Playwright not found. Please install it first:'));
    console.log(chalk.yellow('npm install -D @playwright/test'));
    console.log(chalk.yellow('npx playwright install'));
    process.exit(1);
  }

  runTest(configName);
}

// Run if this file is executed directly (ES module equivalent)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runTest, testConfigs }; 