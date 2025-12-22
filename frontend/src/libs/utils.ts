import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Decode JWT token to extract payload
 * JWT structure: header.payload.signature
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Extract userId from JWT token (subject claim)
 */
export function getUserIdFromToken(token: string): string | null {
  const decoded = decodeJWT(token)
  return decoded?.sub || null
}

/**
 * Extract role from JWT token (role claim)
 */
export function getRoleFromToken(token: string): string | null {
  const decoded = decodeJWT(token)
  return decoded?.role || null
}
