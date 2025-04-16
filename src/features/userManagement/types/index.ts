export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  users: User[];
}

// Permission types based on capabilities
export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  EXECUTE_WORKFLOW = 'execute_workflow',
  VIEW_EXECUTIONS = 'view_executions',
  MANAGE_USERS = 'manage_users',
  MANAGE_SETTINGS = 'manage_settings',
  CONFIGURE_WORKFLOWS = 'configure_workflows'
}

// Map roles to permissions
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.EXECUTE_WORKFLOW,
    Permission.VIEW_EXECUTIONS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SETTINGS,
    Permission.CONFIGURE_WORKFLOWS
  ],
  [UserRole.MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.EXECUTE_WORKFLOW,
    Permission.VIEW_EXECUTIONS,
    Permission.CONFIGURE_WORKFLOWS
  ],
  [UserRole.OPERATOR]: [
    Permission.VIEW_DASHBOARD,
    Permission.EXECUTE_WORKFLOW,
    Permission.VIEW_EXECUTIONS
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_EXECUTIONS
  ]
}; 