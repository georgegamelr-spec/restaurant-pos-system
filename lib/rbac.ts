// Role-Based Access Control (RBAC) System

export type UserRole = 'admin' | 'manager' | 'cashier' | 'kitchen';

export interface Permission {
  resource: string;
  action: string;
  description?: string;
}

export interface RoleDefinition {
  name: UserRole;
  permissions: Permission[];
  hierarchy: number; // Higher number = higher privilege
}

// Define all permissions
export const PERMISSIONS = {
  // User Management
  USERS_VIEW: { resource: 'users', action: 'view', description: 'View users' },
  USERS_CREATE: { resource: 'users', action: 'create', description: 'Create new users' },
  USERS_EDIT: { resource: 'users', action: 'edit', description: 'Edit users' },
  USERS_DELETE: { resource: 'users', action: 'delete', description: 'Delete users' },
  USERS_DEACTIVATE: { resource: 'users', action: 'deactivate', description: 'Deactivate users' },

  // Orders
  ORDERS_VIEW: { resource: 'orders', action: 'view', description: 'View orders' },
  ORDERS_CREATE: { resource: 'orders', action: 'create', description: 'Create orders' },
  ORDERS_EDIT: { resource: 'orders', action: 'edit', description: 'Edit orders' },

  // Inventory
  INVENTORY_VIEW: { resource: 'inventory', action: 'view', description: 'View inventory' },
  INVENTORY_EDIT: { resource: 'inventory', action: 'edit', description: 'Edit inventory' },

  // Suppliers
  SUPPLIERS_VIEW: { resource: 'suppliers', action: 'view', description: 'View suppliers' },
  SUPPLIERS_EDIT: { resource: 'suppliers', action: 'edit', description: 'Edit suppliers' },

  // Reports
  REPORTS_VIEW: { resource: 'reports', action: 'view', description: 'View reports' },

  // Settings
  SETTINGS_VIEW: { resource: 'settings', action: 'view', description: 'View settings' },
  SETTINGS_EDIT: { resource: 'settings', action: 'edit', description: 'Edit settings' },

  // Audit
  AUDIT_VIEW: { resource: 'audit', action: 'view', description: 'View audit logs' },
} as const;

// Define roles with their permissions
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    name: 'admin',
    hierarchy: 4,
    permissions: [
      // Full access to everything
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_EDIT,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_EDIT,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_EDIT,
      PERMISSIONS.AUDIT_VIEW,
    ],
  },
  manager: {
    name: 'manager',
    hierarchy: 3,
    permissions: [
      // Can manage cashiers and kitchen staff, but not admins
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DEACTIVATE,
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_EDIT,
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.AUDIT_VIEW,
    ],
  },
  cashier: {
    name: 'cashier',
    hierarchy: 2,
    permissions: [
      // Can view and create orders only
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.INVENTORY_VIEW,
    ],
  },
  kitchen: {
    name: 'kitchen',
    hierarchy: 1,
    permissions: [
      // Can only view assigned orders
      PERMISSIONS.ORDERS_VIEW,
    ],
  },
};

// Check if user has permission
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const role = ROLE_DEFINITIONS[userRole];
  if (!role) return false;

  return role.permissions.some(
    (p) => p.resource === permission.resource && p.action === permission.action
  );
}

// Check if user can manage another user based on roles
export function canManageUser(userRole: UserRole, targetUserRole: UserRole): boolean {
  const userHierarchy = ROLE_DEFINITIONS[userRole].hierarchy;
  const targetHierarchy = ROLE_DEFINITIONS[targetUserRole].hierarchy;

  // Can only manage users with lower or equal hierarchy
  return userHierarchy > targetHierarchy;
}

// Get role label
export function getRoleLabel(role: UserRole, language: 'en' | 'ar' = 'en'): string {
  const labels: Record<UserRole, Record<'en' | 'ar', string>> = {
    admin: { en: 'Administrator', ar: 'مدير النظام' },
    manager: { en: 'Manager', ar: 'مدير' },
    cashier: { en: 'Cashier', ar: 'كاشير' },
    kitchen: { en: 'Kitchen Staff', ar: 'طاقم المطبخ' },
  };

  return labels[role][language];
}

// Get all roles
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_DEFINITIONS) as UserRole[];
}

// Check if user can access route
export function canAccessRoute(userRole: UserRole, requiredPermission: Permission): boolean {
  return hasPermission(userRole, requiredPermission);
}

// Check permission by user ID and permission string (e.g. 'purchase_orders:read')
export async function checkPermission(
  userId: string,
  permissionString: string
): Promise<boolean> {
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = createClient();
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (!userProfile?.role) return false;
    const [resource, action] = permissionString.split(':');
    return hasPermission(userProfile.role as UserRole, { resource, action });
  } catch {
    return false;
  }
}
