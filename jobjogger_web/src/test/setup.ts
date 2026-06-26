import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './server'

// Silence expected console.error calls from React during error-boundary tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ') || args[0].includes('Error: Uncaught'))
    ) {
      return
    }
    originalError(...args)
  }
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
})

afterAll(() => {
  console.error = originalError
  server.close()
})

// Seed a default user in localStorage so getCurrentUserId() returns '1'
beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@example.com', name: 'Test User' }))
})
