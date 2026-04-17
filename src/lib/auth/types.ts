export type PermissionAction = "view" | "create" | "edit" | "delete";

export interface ScreenPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type PermissionsMap = Record<string, ScreenPermissions>;

export interface BackofficeSession {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  roleId: string;
  roleName: string;
  homeScreen: string | null;
  permissions: PermissionsMap;
  impersonating?: boolean;
  originalEmail?: string;
}
