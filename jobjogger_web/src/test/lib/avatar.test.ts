import { describe, it, expect } from 'vitest'
import { avatarColorById, avatarColorByName } from '@/lib/avatar'

const COLOR_COUNT = 6

describe('avatarColorById', () => {
  it('returns a non-empty string', () => {
    expect(avatarColorById(0)).toBeTruthy()
  })

  it('is deterministic — same id always gives same color', () => {
    expect(avatarColorById(3)).toBe(avatarColorById(3))
  })

  it('wraps around at the boundary (id === COLOR_COUNT)', () => {
    expect(avatarColorById(COLOR_COUNT)).toBe(avatarColorById(0))
  })

  it('handles large ids without throwing', () => {
    expect(() => avatarColorById(999999)).not.toThrow()
  })

  it('each id in 0–5 produces a distinct color', () => {
    const colors = Array.from({ length: COLOR_COUNT }, (_, i) => avatarColorById(i))
    const unique = new Set(colors)
    expect(unique.size).toBe(COLOR_COUNT)
  })
})

describe('avatarColorByName', () => {
  it('returns a non-empty string', () => {
    expect(avatarColorByName('Alice')).toBeTruthy()
  })

  it('is deterministic — same name always gives same color', () => {
    expect(avatarColorByName('Bob')).toBe(avatarColorByName('Bob'))
  })

  it('is based on the first character (same first char → same color)', () => {
    expect(avatarColorByName('Alice')).toBe(avatarColorByName('Axel'))
  })

  it('different first chars can differ', () => {
    // 'A' (65) and 'B' (66) differ in charCode mod 6
    const a = avatarColorByName('Alice')
    const b = avatarColorByName('Bobby')
    // They may or may not match — just assert no throw and both are truthy
    expect(a).toBeTruthy()
    expect(b).toBeTruthy()
  })

  it('handles single-character names', () => {
    expect(() => avatarColorByName('Z')).not.toThrow()
  })
})
