// Simple hash function for passcode (not cryptographically secure, for demo use only)
// In production, use bcrypt on the backend
export function hashPasscode(passcode: string): string {
  let hash = 0
  for (let i = 0; i < passcode.length; i++) {
    const char = passcode.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

export function verifyPasscode(passcode: string, hash: string): boolean {
  return hashPasscode(passcode) === hash
}

export function generatePasscode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatMonth(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getTodayString(): string {
  return formatDate(new Date())
}

export function getCurrentMonth(): string {
  return formatMonth(new Date())
}
