export const PermissionCode = Object.freeze({
  DASHBOARD: 'dashboard',
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  PRODUCTS: 'products',
  OFFERS: 'offers',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  LEADS: 'leads',
  ANALYTICS: 'analytics',
  EMPLOYEES: 'employees',
});

export type PermissionCode = (typeof PermissionCode)[keyof typeof PermissionCode];

export interface Permission {
  id: string;
  name: string;
  code: PermissionCode;
}

export type DefaultPermission = Pick<Permission, 'name' | 'code'>;

export const DEFAULT_PERMISSIONS: readonly DefaultPermission[] = Object.freeze([
  { name: 'Dashboard', code: PermissionCode.DASHBOARD },
  { name: 'User Management', code: PermissionCode.USERS },
  { name: 'Role Management', code: PermissionCode.ROLES },
  { name: 'Permission Management', code: PermissionCode.PERMISSIONS },
  { name: 'Product Management', code: PermissionCode.PRODUCTS },
  { name: 'Offer Management', code: PermissionCode.OFFERS },
  { name: 'Order Management', code: PermissionCode.ORDERS },
  { name: 'Customer Management', code: PermissionCode.CUSTOMERS },
  { name: 'Lead Management', code: PermissionCode.LEADS },
  { name: 'Visitor Analytics', code: PermissionCode.ANALYTICS },
  { name: 'Employee Management', code: PermissionCode.EMPLOYEES },
]);
