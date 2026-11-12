export const RoleCode = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SALES_MANAGER: 'sales_manager',
  EMPLOYEE: 'employee',
  CUSTOMER: 'customer',
  LEAD: 'leads',
});

export const DEFAULT_ROLES = Object.freeze([
  {
    name: 'Super Admin',
    code: RoleCode.SUPER_ADMIN,
    description: 'Full access to all system features.',
  },
  {
    name: 'Admin',
    code: RoleCode.ADMIN,
    description: 'Administrative access to the system.',
  },
  {
    name: 'Sales Manager',
    code: RoleCode.SALES_MANAGER,
    description: 'Manages sales operations and employees.',
  },
  {
    name: 'Employee',
    code: RoleCode.EMPLOYEE,
    description: 'Standard internal employee access.',
  },
  {
    name: 'Customer',
    code: RoleCode.CUSTOMER,
    description: 'Customer account access.',
  },
  {
    name: 'Lead',
    code: RoleCode.LEAD,
    description: 'Potential customer who has not yet converted.',
  },
]);
