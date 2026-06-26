import { z } from 'zod'

const storedUserSchema = z.object({
  id: z.union([z.number(), z.string()]),
})

/**
 * Returns the currently authenticated user's ID from localStorage.
 *
 * Reads and Zod-validates the `user` key written by `AuthProvider` on sign-in.
 * The ID is normalised to a string regardless of whether it was stored as a
 * number or string, so callers can always rely on `string | null`.
 *
 * @returns The user ID as a string, or `null` if the key is absent, unparseable,
 *          or missing the `id` field.
 */
export function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const result = storedUserSchema.safeParse(parsed)
    if (!result.success) return null
    return String(result.data.id)
  } catch {
    return null
  }
}
