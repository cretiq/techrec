import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/user-flows/',
    '<rootDir>/tests/smoke/',
  ],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
    '!**/*.spec.ts', // Exclude Playwright spec files
    '!**/*.skip.*', // Exclude skipped test files
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        isolatedModules: true,
      },
      useESM: false,
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(aws-sdk-client-mock|sinon)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  preset: 'ts-jest',
}

export default config 