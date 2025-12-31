import { randomUUID } from 'crypto'

/**
 * Génère un UID unique pour identifier un utilisateur
 * Format: UUID v4
 */
export function generateUID(): string {
  return randomUUID()
}

/**
 * Valide qu'une chaîne est un UUID valide
 */
export function isValidUID(uid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uid)
}

