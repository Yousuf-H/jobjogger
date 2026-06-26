import { z } from 'zod'

const storedUserSchema = z.object({
  id: z.union([z.number(), z.string()]),
})

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
