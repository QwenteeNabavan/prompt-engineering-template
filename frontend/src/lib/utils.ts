import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getClientFingerprint(): string {
  const storageKey = 'agenthub_client_fingerprint'
  try {
    const existing = localStorage.getItem(storageKey)
    if (existing) return existing
    const generated =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `fp-${crypto.randomUUID()}`
        : `fp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(storageKey, generated)
    return generated
  } catch {
    return 'fp-anonymous-session'
  }
}
