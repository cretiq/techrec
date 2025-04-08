import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(body), init)
      response.json = () => Promise.resolve(body)
      return response
    },
  },
}))

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