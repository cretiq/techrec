import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Configure React Testing Library for React 19 compatibility
process.env.RTL_SKIP_AUTO_CLEANUP = 'true'

// Ensure DOM is properly set up for React 19
if (typeof document !== 'undefined') {
  // Create a root element if it doesn't exist
  if (!document.getElementById('root')) {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)
  }
}

// Set up DOM globals that jsdom should provide
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Set up test environment variables
process.env.AWS_S3_BUCKET_NAME = 'test-bucket'
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock NextResponse and NextRequest
jest.mock('next/server', () => {
  class MockNextResponse extends Response {
    constructor(body?: any, init?: ResponseInit) {
      super(body, init)
    }
    
    static json(body: any, init?: ResponseInit) {
      const response = new MockNextResponse(JSON.stringify(body), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      })
      response.json = () => Promise.resolve(body)
      return response
    }
  }

  return {
    NextResponse: MockNextResponse,
    NextRequest: class NextRequest {
      constructor(public url: string, public init?: RequestInit) {}
      json() {
        return Promise.resolve(this.init?.body ? JSON.parse(this.init.body as string) : {})
      }
      get method() {
        return this.init?.method || 'GET'
      }
    },
  }
})

// Add Web API types
global.Request = class Request {
  constructor(public url: string, public init?: RequestInit) {}
  json() {
    return Promise.resolve(this.init?.body ? JSON.parse(this.init.body as string) : {})
  }
} as any

global.Response = class Response {
  constructor(public body?: any, public init?: ResponseInit) {}
  json() {
    return Promise.resolve(this.body ? JSON.parse(this.body) : {})
  }
  get status() {
    return this.init?.status || 200
  }
} as any

// Mock the MongoDB client
const mockCollection = {
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockResolvedValue(null),
  insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  project: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  maxTimeMS: jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue([]),
}

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
}

const mockClient = {
  db: jest.fn().mockReturnValue(mockDb),
}

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(mockClient),
}))

// Mock Redis/ioredis
const mockRedisClient = {
  status: 'ready',
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue('OK'),
  ping: jest.fn().mockResolvedValue('PONG'),
  get: jest.fn().mockResolvedValue(null),
  setex: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  scanStream: jest.fn().mockReturnValue((async function* () {
    yield ['key1', 'key2'];
  })()),
  on: jest.fn().mockImplementation((event: string, handler: Function) => {
    if (event === 'ready') {
      setTimeout(() => handler(), 10);
    }
    return mockRedisClient;
  }),
}

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
})

// Mock Redis module functions for most tests
jest.mock('@/lib/redis', () => ({
  getReadyRedisClient: jest.fn().mockResolvedValue(mockRedisClient),
  setCache: jest.fn().mockResolvedValue(undefined),
  getCache: jest.fn().mockResolvedValue(null),
  deleteCache: jest.fn().mockResolvedValue(true),
  clearCachePattern: jest.fn().mockResolvedValue(0),
  disconnectRedis: jest.fn().mockResolvedValue(undefined),
}))

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
  getSession: jest.fn(),
}))

// Mock Prisma client
const mockPrismaClient = {
  developer: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
  },
  cv: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  experience: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  education: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  skill: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  skillCategory: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
  },
  developerSkill: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  achievement: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  contactInfo: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
  },
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
  SkillLevel: {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE', 
    ADVANCED: 'ADVANCED',
    EXPERT: 'EXPERT',
  },
}))

// Mock AWS S3
const mockS3Client = {
  send: jest.fn().mockResolvedValue({ 
    $metadata: { httpStatusCode: 200 },
    ETag: '"test-etag"'
  }),
}

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => mockS3Client),
  PutObjectCommand: jest.fn((params) => ({ input: params })),
  GetObjectCommand: jest.fn((params) => ({ input: params })),
  DeleteObjectCommand: jest.fn((params) => ({ input: params })),
}))

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://test-presigned-url.com'),
}))

// Mock aws-sdk-client-mock to avoid ESM issues
jest.mock('aws-sdk-client-mock', () => ({
  mockClient: jest.fn(() => ({
    send: jest.fn(),
    on: jest.fn(),
    calls: jest.fn(() => []),
    reset: jest.fn(),
  })),
}))

// Mock AI providers
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: '{"test": "response"}' } }],
        }),
      },
    },
  })),
}))

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('{"test": "response"}'),
        },
      }),
    }),
  })),
}))

// Mock Stripe
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    customers: {
      retrieve: jest.fn(),
      update: jest.fn(),
    },
  })),
}))

// Create mock session for authentication tests
global.mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: '2025-12-31',
}

// Mock UI components that might cause rendering issues
jest.mock('@/components/ui-daisy/button', () => ({
  Button: jest.fn(({ children, onClick, disabled, loading, leftIcon, ...props }) => {
    const React = require('react');
    // Filter out non-DOM props
    const { variant, size, ...domProps } = props;
    return React.createElement('button', {
      onClick,
      disabled: disabled || loading,
      'data-loading': loading,
      ...domProps
    }, loading ? 'Loading...' : children);
  }),
}))

jest.mock('@/components/ui-daisy/confirmation-dialog', () => ({
  ConfirmationDialog: jest.fn(({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }) => {
    if (!isOpen) return null;
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'confirmation-dialog' }, [
      React.createElement('h3', { key: 'title' }, title),
      React.createElement('p', { key: 'message' }, message),
      React.createElement('button', { key: 'cancel', onClick: onCancel }, cancelText || 'Cancel'),
      React.createElement('button', { key: 'confirm', onClick: onConfirm }, confirmText || 'Confirm')
    ]);
  }),
}))

// Mock custom hooks
jest.mock('@/hooks/useSavedRoles', () => ({  
  useSavedRoles: jest.fn(() => ({
    savedRoles: [],
    status: 'idle',
    error: null,
    isLoading: false,
  })),
  useSavedRoleStatus: jest.fn((roleId: string) => ({
    savedRole: { id: roleId, appliedFor: false }, // Mock as saved but not applied
    isSaved: true,
    isApplied: false, // Can be overridden in individual tests
    isMarkingAsApplied: false,
    isUnApplying: false,
    appliedAt: null,
  })),
  useApplicationActivity: jest.fn(() => ({
    activityData: [],
    summary: null,
    totalApplications: 0,
    daysWithActivity: 0,
  })),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Check: jest.fn(() => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'check-icon' }, '✓');
  }),
  ArrowRight: jest.fn(() => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'arrow-right-icon' }, '→');
  }),
  X: jest.fn(() => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'x-icon' }, '✕');
  }),
  AlertTriangle: jest.fn(() => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'alert-triangle-icon' }, '⚠️');
  }),
  Loader2: jest.fn(() => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'loader-icon' }, '⟳');
  }),
  Upload: jest.fn(() => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'upload-icon' }, '↑');
  }),
  Download: jest.fn(() => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'download-icon' }, '↓');
  }),
  File: jest.fn(() => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'file-icon' }, '📄');
  }),
  Trash2: jest.fn(() => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'trash-icon' }, '🗑️');
  }),
}))

// Mock utility modules for matching
jest.mock('@/utils/matching/skillTaxonomy', () => ({
  normalizeSkillName: jest.fn((skill: string) => skill.toLowerCase()),
  fuzzyMatchSkills: jest.fn(() => []),
  isValidSkillName: jest.fn(() => true),
  cleanSkillName: jest.fn((skill: string) => skill.trim()),
}))

jest.mock('@/utils/matching/descriptionSkillExtractor', () => ({
  extractSkillsFromDescription: jest.fn((description: string) => {
    // Return realistic skills based on description content
    const skills = [];
    if (description.includes('JavaScript')) skills.push('JavaScript');
    if (description.includes('React')) skills.push('React');
    if (description.includes('Python')) skills.push('Python');
    if (description.includes('TypeScript')) skills.push('TypeScript');
    if (description.includes('Node.js')) skills.push('Node.js');
    return skills;
  }),
  extractSkillsWithExperience: jest.fn(() => []),
  scoreDescriptionSkillRichness: jest.fn(() => ({ score: 0.5, breakdown: {} })),
  categorizeExtractedSkills: jest.fn(() => ({})),
}))

jest.mock('@/utils/matching/simpleSkillMatcher', () => ({
  calculateSimpleMatch: jest.fn(() => ({ score: 75, matchedSkills: ['React', 'TypeScript'] })),
  extractAllSkillsFromRole: jest.fn((role: any) => {
    // Extract skills from various role sources
    const skills = [];
    if (role.ai_key_skills) skills.push(...role.ai_key_skills);
    if (role.skills) skills.push(...(role.skills.map ? role.skills.map((s: any) => s.name || s) : []));
    if (role.requirements) skills.push(...role.requirements);
    if (role.description) {
      if (role.description.includes('React')) skills.push('React');
      if (role.description.includes('TypeScript')) skills.push('TypeScript');
      if (role.description.includes('Node.js')) skills.push('Node.js');
    }
    return [...new Set(skills)]; // Remove duplicates
  }),
}))

// Mock file parsing utilities
jest.mock('pdf-parse', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({ text: 'Mock PDF content' }),
}))

jest.mock('mammoth', () => ({
  extractRawText: jest.fn().mockResolvedValue({ value: 'Mock DOCX content' }),
}))

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}))

// Suppress console errors for cleaner test output
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: React.createFactory()') ||
     args[0].includes('act(...)') ||
     args[0].includes('[Redis]') ||
     args[0].includes('[Gemini Analysis]'))
  ) {
    return
  }
  originalConsoleError.call(console, ...args)
} 