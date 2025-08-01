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