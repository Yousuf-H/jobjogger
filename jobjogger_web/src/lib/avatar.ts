const AVATAR_COLORS = [
  'bg-avatar-1/15 text-avatar-1',
  'bg-avatar-2/15 text-avatar-2',
  'bg-avatar-3/15 text-avatar-3',
  'bg-avatar-4/15 text-avatar-4',
  'bg-avatar-5/15 text-avatar-5',
  'bg-avatar-6/15 text-avatar-6',
]

/**
 * Returns a deterministic Tailwind colour class pair for a numeric ID.
 *
 * The colour cycles through 6 values using `id % 6`, so the same ID always
 * maps to the same colour class across renders and page loads.
 *
 * @param id - A positive integer (e.g. a database record ID).
 * @returns A Tailwind class string of the form `"bg-avatar-N/15 text-avatar-N"`.
 */
export function avatarColorById(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

/**
 * Returns a deterministic Tailwind colour class pair derived from a name string.
 *
 * Uses the char code of the first character (`name.charCodeAt(0) % 6`) so that
 * the same name always produces the same colour, regardless of the record ID.
 * Useful when only a display name is available (e.g. organisation initials).
 *
 * @param name - Any non-empty string (typically a contact or org name).
 * @returns A Tailwind class string of the form `"bg-avatar-N/15 text-avatar-N"`.
 */
export function avatarColorByName(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
