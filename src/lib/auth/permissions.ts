"use client";

import { useSession } from "./session-provider";
import type { PermissionAction } from "./types";

/**
 * Hook to check if the current user has a specific permission on a screen.
 * Returns false if no session or permission not found.
 */
export function usePermission(screenKey: string, action: PermissionAction = "view"): boolean {
  const { user } = useSession();
  if (!user) return false;
  return user.permissions[screenKey]?.[action] ?? false;
}

/**
 * Hook to get all permissions for a given screen.
 */
export function useScreenPermissions(screenKey: string) {
  const { user } = useSession();
  const defaults = { view: false, create: false, edit: false, delete: false };
  if (!user) return defaults;
  return user.permissions[screenKey] ?? defaults;
}
