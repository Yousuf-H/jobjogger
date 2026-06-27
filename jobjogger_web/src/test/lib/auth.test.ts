import { describe, it, expect, beforeEach } from 'vitest'
import { getCurrentUserId } from '@/lib/auth'

describe('getCurrentUserId', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns string id for a numeric stored id', () => {
    localStorage.setItem('user', JSON.stringify({ id: 42 }))
    expect(getCurrentUserId()).toBe('42')
  })

  it('returns string id for a string stored id', () => {
    localStorage.setItem('user', JSON.stringify({ id: '99' }))
    expect(getCurrentUserId()).toBe('99')
  })

  it('returns null when localStorage key is missing', () => {
    expect(getCurrentUserId()).toBeNull()
  })

  it('returns null when stored value is not valid JSON', () => {
    localStorage.setItem('user', 'not-json')
    expect(getCurrentUserId()).toBeNull()
  })

  it('returns null when stored object has no id field', () => {
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }))
    expect(getCurrentUserId()).toBeNull()
  })

  it('returns null when id is null', () => {
    localStorage.setItem('user', JSON.stringify({ id: null }))
    expect(getCurrentUserId()).toBeNull()
  })

  it('returns null when stored value is an array', () => {
    localStorage.setItem('user', JSON.stringify([1, 2, 3]))
    expect(getCurrentUserId()).toBeNull()
  })
})
