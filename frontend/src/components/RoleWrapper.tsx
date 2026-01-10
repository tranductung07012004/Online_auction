import React from "react";
import { useAuthStore } from "../stores/authStore";
import { isOnlyRole, hasRolePermission, UserRole } from "../libs/utils";

interface RoleWrapperProps {
  children: React.ReactNode;
  /**
   * Only allow specific role (exact match)
   * Use this for "only X" scenarios
   */
  onlyRole?: "BIDDER" | "SELLER" | "ADMIN";
  /**
   * Minimum required role (hierarchical)
   * Guest can access GUEST, BIDDER can access GUEST+BIDDER, SELLER can access GUEST+BIDDER+SELLER
   * Admin is separate and can only access ADMIN
   */
  requiredRole?: "GUEST" | "BIDDER" | "SELLER" | "ADMIN";
  /**
   * What to render if user doesn't have permission
   * If not provided, renders nothing
   */
  fallback?: React.ReactNode;
}

/**
 * RoleWrapper - Component-level permission guard
 * 
 * Usage examples:
 * - <RoleWrapper onlyRole="SELLER">...</RoleWrapper> - Only sellers can see
 * - <RoleWrapper requiredRole="BIDDER">...</RoleWrapper> - Bidders and sellers can see
 * - <RoleWrapper requiredRole="GUEST">...</RoleWrapper> - Everyone can see
 */
const RoleWrapper: React.FC<RoleWrapperProps> = ({
  children,
  onlyRole,
  requiredRole,
  fallback = null,
}) => {
  const role: UserRole = useAuthStore((state) => state.role);

  // Check "only" permission (exact match)
  if (onlyRole) {
    if (!isOnlyRole(role, onlyRole)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // Check hierarchical permission
  if (requiredRole) {
    if (!hasRolePermission(role, requiredRole)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // If no permission specified, render children
  return <>{children}</>;
};

export default RoleWrapper;



