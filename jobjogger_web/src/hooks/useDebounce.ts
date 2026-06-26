import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of inactivity.
 *
 * Commonly used to delay search queries while the user is still typing, preventing
 * a network request on every keystroke.
 *
 * @param value - The value to debounce (any type).
 * @param delay - Debounce delay in milliseconds.
 * @returns The debounced value — same type as `value`.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
