import { describe, it, expect } from 'vitest'
import { extractErrorMessage } from '@/lib/errors'

function makeAxiosError(data: unknown, status = 422) {
  return {
    response: { data, status },
  }
}

describe('extractErrorMessage', () => {
  it('extracts status.message when present', () => {
    const error = makeAxiosError({ status: { message: 'Email is taken' } })
    expect(extractErrorMessage(error, 'fallback')).toBe('Email is taken')
  })

  it('extracts errors[0] when status.message is absent', () => {
    const error = makeAxiosError({ errors: ['Name is too short'] })
    expect(extractErrorMessage(error, 'fallback')).toBe('Name is too short')
  })

  it('extracts error field when status.message and errors are absent', () => {
    const error = makeAxiosError({ error: 'Record not found' })
    expect(extractErrorMessage(error, 'fallback')).toBe('Record not found')
  })

  it('returns fallback when response data has none of the known fields', () => {
    const error = makeAxiosError({})
    expect(extractErrorMessage(error, 'Something went wrong')).toBe('Something went wrong')
  })

  it('returns fallback for a non-Axios error (plain Error object)', () => {
    const error = new Error('network error')
    expect(extractErrorMessage(error, 'Default message')).toBe('Default message')
  })

  it('returns fallback when response is undefined', () => {
    const error = { response: undefined }
    expect(extractErrorMessage(error, 'no response')).toBe('no response')
  })

  it('returns fallback when error is null', () => {
    expect(extractErrorMessage(null, 'null fallback')).toBe('null fallback')
  })

  it('returns fallback when error is undefined', () => {
    expect(extractErrorMessage(undefined, 'undef fallback')).toBe('undef fallback')
  })

  it('prefers status.message over errors[0]', () => {
    const error = makeAxiosError({
      status: { message: 'Primary message' },
      errors: ['Secondary message'],
    })
    expect(extractErrorMessage(error, 'fallback')).toBe('Primary message')
  })
})
