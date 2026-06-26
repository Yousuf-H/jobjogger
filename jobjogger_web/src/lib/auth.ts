export function getCurrentUserId(): string {
  return JSON.parse(localStorage.getItem('user') || '{}').id
}
