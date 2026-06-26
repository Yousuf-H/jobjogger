import { describe, it, expect } from 'vitest'
import { QUERY_KEYS } from '@/lib/queryKeys'

describe('QUERY_KEYS', () => {
  const uid = '1'

  describe('jobs', () => {
    it('all() returns ["jobs"]', () => {
      expect(QUERY_KEYS.jobs.all()).toEqual(['jobs'])
    })

    it('byUser() scopes to user', () => {
      expect(QUERY_KEYS.jobs.byUser(uid)).toEqual(['jobs', uid])
    })

    it('list() includes filters', () => {
      const filters = { status: 'applied' }
      expect(QUERY_KEYS.jobs.list(uid, filters)).toEqual(['jobs', uid, filters])
    })

    it('list() without filters includes undefined', () => {
      expect(QUERY_KEYS.jobs.list(uid)).toEqual(['jobs', uid, undefined])
    })

    it('detail() includes job id', () => {
      expect(QUERY_KEYS.jobs.detail(uid, 42)).toEqual(['jobs', uid, 42])
    })
  })

  describe('contacts', () => {
    it('all() returns ["contacts"]', () => {
      expect(QUERY_KEYS.contacts.all()).toEqual(['contacts'])
    })

    it('forJob() scopes to user + job', () => {
      expect(QUERY_KEYS.contacts.forJob(uid, 7)).toEqual(['contacts', uid, 'job', 7])
    })
  })

  describe('organisations', () => {
    it('similar() appends "similar" suffix', () => {
      expect(QUERY_KEYS.organisations.similar(uid, 5)).toEqual(['organisations', uid, 5, 'similar'])
    })
  })

  describe('analytics', () => {
    it('returns array with resource + userId', () => {
      expect(QUERY_KEYS.analytics(uid)).toEqual(['analytics', uid])
    })
  })

  describe('activity', () => {
    it('detail() includes page and perPage', () => {
      expect(QUERY_KEYS.activity.detail(uid, 2, 20)).toEqual(['activity', uid, 2, 20])
    })
  })

  describe('notifications', () => {
    it('scopes to user', () => {
      expect(QUERY_KEYS.notifications(uid)).toEqual(['notifications', uid])
    })
  })

  describe('referential stability', () => {
    it('returns a new array each call (not cached references)', () => {
      const a = QUERY_KEYS.jobs.all()
      const b = QUERY_KEYS.jobs.all()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })
  })
})
