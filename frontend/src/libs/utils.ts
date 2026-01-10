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

/**
 * User roles in the system
 */
export type UserRole = "ADMIN" | "BIDDER" | "SELLER" | null;

/**
 * Check if a role has permission to access a resource
 * Logic: guest < bidder < seller (hierarchical)
 * Admin is separate and cannot access guest/bidder/seller resources
 * 
 * @param userRole - Current user's role (null = guest)
 * @param requiredRole - Required role to access the resource
 * @returns true if user has permission
 */
export function hasRolePermission(
  userRole: UserRole,
  requiredRole: "GUEST" | "BIDDER" | "SELLER" | "ADMIN"
): boolean {
  // Guest (null) can only access GUEST resources
  if (userRole === null) {
    return requiredRole === "GUEST";
  }

  // Admin can only access ADMIN resources
  if (userRole === "ADMIN") {
    return requiredRole === "ADMIN";
  }

  // Admin cannot access non-admin resources
  if (requiredRole === "ADMIN") {
    return false;
  }

  // Hierarchical permission: SELLER > BIDDER > GUEST
  const roleHierarchy: Record<string, number> = {
    GUEST: 0,
    BIDDER: 1,
    SELLER: 2,
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  // User can access if their level >= required level
  return userLevel >= requiredLevel;
}

/**
 * Check if user role matches exactly (for "only" scenarios)
 * Used for routes that only specific roles can access
 * 
 * @param userRole - Current user's role (null = guest)
 * @param onlyRole - The only role allowed
 * @returns true if user role matches exactly
 */
export function isOnlyRole(
  userRole: UserRole,
  onlyRole: "BIDDER" | "SELLER" | "ADMIN"
): boolean {
  return userRole === onlyRole;
}
