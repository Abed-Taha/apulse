# @apulse/shared

Shared domain types, contracts, constants, and interfaces for the Apulse monorepo.

---

## Overview

`@apulse/shared` is an internal workspace package that serves as the single source of truth for data contracts and domain definitions shared between the backend (`apps/api`) and frontend (`apps/web`). It eliminates duplicated type declarations, guarantees type safety across network boundaries, and keeps domain models consistent across applications.

---

## Package Structure

```
shared/
├── types/
│   ├── role/
│   │   ├── role.ts           # Source definition for Role constants and types
│   │   ├── role.d.ts         # TypeScript declaration file
│   │   └── role.js           # Compiled JavaScript output (ESM)
│   └── authenticated-user/
│       ├── authenticated-user.d.ts   # Authenticated user session contract
│       └── authenticated-user.js     # Compiled JavaScript output (ESM)
├── index.ts                  # Main barrel export source
├── index.d.ts                # Main declaration file
├── index.js                  # Main ESM entry point
├── package.json              # Package definition with subpath exports
└── README.md                 # Package documentation
```

---

## Exported Definitions

### 1. Role Definitions (`types/role`)

Defines role codes, role entity interfaces, and default seeded system roles.

- **`RoleCode`**: Constant map and union type of system roles:
  - `SUPER_ADMIN`: `'super_admin'`
  - `ADMIN`: `'admin'`
  - `SALES_MANAGER`: `'sales_manager'`
  - `EMPLOYEE`: `'employee'`
  - `CUSTOMER`: `'customer'`
  - `LEAD`: `'leads'`
- **`Role`**: Full domain model for a role:
  - `id`: `string`
  - `name`: `string`
  - `code`: `RoleCode`
  - `description`: `string | null`
  - `createdAt`: `Date`
  - `updatedAt`: `Date`
- **`DefaultRole`**: Projection used for database seeding (`Pick<Role, 'name' | 'code' | 'description'>`).
- **`DEFAULT_ROLES`**: Readonly array containing system seed configurations for initial roles.

### 2. Authenticated User (`types/authenticated-user`)

Represents the JWT payload and authenticated user context propagated through guards and request decorators:

- **`AuthenticatedUser`**:
  - `id`: `string`
  - `firstName`: `string`
  - `lastName`: `string`
  - `email`: `string`
  - `roleId`: `string`
  - `roleCode`: `string`

---

## Usage in Monorepo Applications

### Installation / Workspace Link

Each consuming application specifies `@apulse/shared` in its `package.json`:

```json
{
  "dependencies": {
    "@apulse/shared": "workspace:*"
  }
}
```

### Consuming in Backend (`apps/api`)

Used in authentication strategies, role guards, seeders, and controllers:

```typescript
import { DEFAULT_ROLES, RoleCode } from '@apulse/shared';
import type { AuthenticatedUser, Role } from '@apulse/shared';

// Enforce role authorization
@Roles(RoleCode.ADMIN, RoleCode.SUPER_ADMIN)
@Get('admin/dashboard')
getDashboard(@CurrentUser() user: AuthenticatedUser) {
  return { message: `Welcome ${user.firstName}` };
}
```

### Consuming in Frontend (`apps/web`)

Used for UI state typing, role-based component rendering, and session handling:

```typescript
import { RoleCode } from '@apulse/shared';
import type { AuthenticatedUser } from '@apulse/shared';

export function AdminBadge({ user }: { user: AuthenticatedUser }) {
  if (user.roleCode !== RoleCode.ADMIN && user.roleCode !== RoleCode.SUPER_ADMIN) {
    return null;
  }
  return <span className="badge badge-admin">Administrator</span>;
}
```

---

## Responsibilities & Design Standards

1. **Zero External Dependencies**: Keep this package free of framework dependencies (no React, NestJS, or heavy ORM imports). It must remain pure TypeScript/JavaScript.
2. **ESM Standard**: The package targets native ES Modules (`"type": "module"`). Relative imports within the package must explicitly use `.js` extensions.
3. **Immutability of Constants**: Shared enums and configurations (such as `DEFAULT_ROLES`) should be typed with `as const` or `readonly` to prevent accidental mutation.
4. **Backward Compatibility**: Modifying existing types must be backwards-compatible to prevent breaking API contracts or frontend consumers unexpectedly.

---

## Adding New Shared Definitions

When creating a new shared type or constant:

1. Create a dedicated folder under `shared/types/<domain-concept>/`.
2. Define the TypeScript interface and implementation.
3. Export the new definitions from `shared/index.ts`, `shared/index.d.ts`, and `shared/index.js`.
4. Update `package.json` exports if a custom subpath is required.
5. Document the new types in this `README.md`.
6. Run `pnpm check` from the monorepo root to verify types and formatting across all workspaces.
