const { TextDecoder, TextEncoder } = require('util')
const timers = require('timers')

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder
global.setImmediate = timers.setImmediate
global.clearImmediate = timers.clearImmediate

const { Request, Response, Headers, fetch } = require('next/dist/compiled/@edge-runtime/primitives')
global.Request = Request
global.Response = Response
global.Headers = Headers
global.fetch = fetch

import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'candidate',
      },
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock MongoDB connection
jest.mock('@/lib/mongodb', () => ({
  connectToMongo: jest.fn(() => Promise.resolve()),
}))

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db'
