const AVATAR_COLORS = [
  'bg-avatar-1/15 text-avatar-1',
  'bg-avatar-2/15 text-avatar-2',
  'bg-avatar-3/15 text-avatar-3',
  'bg-avatar-4/15 text-avatar-4',
  'bg-avatar-5/15 text-avatar-5',
  'bg-avatar-6/15 text-avatar-6',
]

export function avatarColorById(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

export function avatarColorByName(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
