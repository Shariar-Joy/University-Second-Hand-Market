/** Mirrors backend/app/schemas/auth.py::PERSONAL_EMAIL_DOMAINS — a heuristic block-list, not a strict `.edu`-only rule. */
const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'live.com',
  'mail.com',
])

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isUniversityEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain !== undefined && !PERSONAL_EMAIL_DOMAINS.has(domain)
}
