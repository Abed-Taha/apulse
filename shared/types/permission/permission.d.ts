export declare const PermissionCode: {
  readonly DASHBOARD: 'dashboard';
  readonly USERS: 'users';
  readonly ROLES: 'roles';
  readonly PERMISSIONS: 'permissions';
  readonly PRODUCTS: 'products';
  readonly OFFERS: 'offers';
  readonly ORDERS: 'orders';
  readonly CUSTOMERS: 'customers';
  readonly LEADS: 'leads';
  readonly ANALYTICS: 'analytics';
  readonly EMPLOYEES: 'employees';
};

export type PermissionCode = (typeof PermissionCode)[keyof typeof PermissionCode];

export interface Permission {
  id: string;
  name: string;
  code: PermissionCode;
}

export type DefaultPermission = Pick<Permission, 'name' | 'code'>;

export declare const DEFAULT_PERMISSIONS: readonly DefaultPermission[];
