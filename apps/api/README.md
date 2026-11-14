# Apulse Backend API (`apps/api`)

The core backend REST API service for the Apulse platform, built with **NestJS 12**, **TypeORM**, **PostgreSQL 17**, **MinIO (S3)**, and **Passport JWT**.

---

## Overview

`apps/api` delivers the business logic, data persistence, file storage, security, email delivery, and administrative services for the Apulse platform. It is built as a pure ECMAScript Module (ESM) application running on Node.js 22, consuming shared domain models and contracts from `@apulse/shared`.

---

## Tech Stack

| Technology              | Purpose                                                              |
| :---------------------- | :------------------------------------------------------------------- |
| **NestJS 12**           | Scalable enterprise Node.js framework (ESM native)                   |
| **TypeORM**             | Object-Relational Mapper for PostgreSQL                              |
| **PostgreSQL 17**       | Relational database for core transactional data                      |
| **MinIO (AWS SDK S3)**  | S3-compatible object storage for media, assets, and uploads          |
| **Passport & JWT**      | Stateless authentication and role-based token validation             |
| **Nodemailer**          | SMTP-based email transport                                           |
| **Handlebars**          | Dynamic HTML and plain-text email templates                          |
| **Mailpit**             | Local SMTP server and web interface for capturing development emails |
| **NestJS Observe**      | Tracing, performance metrics, and application observability          |
| **Oxlint & TypeScript** | Ultra-fast linting and static type checking                          |

---

## Directory Structure

```text
apps/api/
├── src/
│   ├── core/                        # Core infrastructure and transversal features
│   │   ├── database/                # TypeORM PostgreSQL module & connection lifecycle
│   │   ├── decorators/              # Decorators (e.g., @Roles, @Public)
│   │   ├── guards/                  # Security guards (JWT, roles, permissions)
│   │   └── modules/                 # Aggregated CoreModules loader
│   ├── modules/                     # Business domain modules
│   │   ├── analytics/               # Visitor sessions, daily summaries, analytics events
│   │   ├── auth/                    # JWT authentication, Passport strategy, auth controller
│   │   ├── cart/                    # Shopping cart management
│   │   ├── category/                # Product categories
│   │   ├── email/                   # Centralized email delivery and templates
│   │   │   ├── templates/           # Email template rendering and definitions
│   │   │   ├── email.constants.ts   # SMTP configuration keys
│   │   │   ├── email.module.ts      # Email module registration and exports
│   │   │   ├── email.service.ts     # Reusable email sending service
│   │   │   ├── email.transport.ts   # Nodemailer SMTP transport
│   │   │   └── email.types.ts       # Email message and recipient types
│   │   ├── invoice/                 # Invoices and order invoice tracking
│   │   ├── notification/            # System and user notifications
│   │   ├── offer/                   # Discounts, product offers, order promotions
│   │   ├── order/                   # Orders and order item fulfillment
│   │   ├── payment/                 # Payment records and states
│   │   ├── permission/              # Granular permissions and user assignments
│   │   ├── product/                 # Product catalog and product favorites/likes
│   │   ├── role/                    # Role entities, RBAC controller, startup role seed
│   │   ├── task/                    # Operational task management
│   │   ├── user/                    # User accounts and profile management
│   │   └── visitor/                 # Anonymous visitor tracking
│   ├── storage/                     # MinIO S3 object storage service & client factory
│   ├── app.controller.ts            # Root health controller
│   ├── app.module.ts                # Root application module with Observe instrumentation
│   ├── app.service.ts               # Root application service
│   └── main.ts                      # Application bootstrap entry point
├── nest-cli.json                    # Nest CLI configuration
├── package.json                     # API manifest, dependencies, and scripts
├── tsconfig.json                    # Base TypeScript compiler settings
├── tsconfig.build.json              # Production build TypeScript configuration
└── README.md                        # API service documentation
```

---

## Core Architecture & Domain Modules

### 1. Authentication, RBAC & Domain Permissions

- **JWT Authentication**: Validates Bearer tokens via `JwtAuthGuard` and `JwtStrategy`.
- **Role Enforcement**: Protected routes use `@Roles('admin', ...)` paired with `RolesGuard`.
- **Domain Permission Enforcement**: Protected domain routes use `@RequirePermissions(PermissionCode.PRODUCTS, ...)` paired with `PermissionsGuard`. Super Admins automatically bypass domain checks.
- **System Roles**: Default roles are imported from `@apulse/shared` (`RoleCode`) and automatically seeded into the database on bootstrap via `RolesSeed`:
  - `super_admin`, `admin`, `sales_manager`, `employee`, `customer`, `leads`.
- **Domain Permissions**: Default domain modules are imported from `@apulse/shared` (`PermissionCode`, `DEFAULT_PERMISSIONS`) and automatically seeded on bootstrap via `PermissionsSeed`. The seeder is idempotent and preserves any customized permission display names.
- **Role-Permission Association**: Roles can be assigned multiple domain permissions through a many-to-many relationship (`role_permissions`).

### 2. Database & Data Access

- Configured in `DatabaseModule` using TypeORM for PostgreSQL 17.
- Automatically handles reconnection retries with configurable delay.
- Schema auto-synchronization is enabled during development (`synchronize: true`) and disabled in production.

### 3. Object Storage (MinIO)

- Abstracted by `StorageService` using `@aws-sdk/client-s3`.
- Handles bucket creation, presigned upload URLs, asset retrieval, and public object endpoint resolution.

### 4. Centralized Email Service

The Email module provides a reusable email delivery abstraction that can be injected into other business modules without coupling them to a specific SMTP provider.

- **EmailService**: Exposes reusable methods for sending individual messages and predefined email templates.
- **EmailTransport**: Encapsulates Nodemailer and manages the SMTP connection.
- **EmailTemplateService**: Renders dynamic HTML and plain-text templates using Handlebars.
- **Reusable Templates**: Includes welcome, email verification, password reset, order confirmation, and general notification templates.
- **Multiple Recipients**: Supports individual and multiple recipients, including CC and BCC.
- **Configuration Validation**: Validates SMTP settings and recipient addresses.
- **Startup Verification**: Verifies the SMTP connection during application initialization.
- **Provider Independence**: Business modules depend on `EmailService`, not directly on Nodemailer, Mailpit, or Mailtrap.

The `EmailModule` exports `EmailService` so other modules can import it and send emails through dependency injection.

Example:

```typescript
await this.emailService.sendTemplate({
  to: 'customer@example.com',
  template: 'verification',
  context: {
    name: 'Customer',
    verificationUrl: 'https://example.com/verify-email?token=...',
    expiresIn: '30 minutes',
  },
});
```

#### Development Email Testing with Mailpit

Mailpit is included in the development Docker Compose configuration as a local SMTP testing service.

- **SMTP Host**: `mailpit` when the API runs inside Docker; `localhost` when running natively.
- **SMTP Port**: `1025`.
- **Web Interface**: [http://localhost:8025](http://localhost:8025).
- **Email Capture**: Captures outgoing messages for inspection without delivering them to real recipients.
- **Authentication**: No SMTP credentials are required with the default local configuration.

Mailpit allows developers to inspect email recipients, subjects, HTML content, and plain-text content during development.

#### Production Email Delivery

Mailpit is not included in the production Docker Compose configuration. Production deployments should configure a real SMTP provider, such as Mailtrap, using the same SMTP environment variables.

This keeps business email logic independent of the email provider.

### 5. Observability

- Integrated with [NestJS Observe](https://observe.nestjs.com) in `AppModule` to report traces, slow operations, and system metrics.

---

## Configuration & Environment Variables

The API reads environment variables from the root `.env` file.

| Variable                   | Description                                             | Example / Default                             |
| :------------------------- | :------------------------------------------------------ | :-------------------------------------------- |
| `API_PORT`                 | HTTP port the API listens on                            | `3001`                                        |
| `NODE_ENV`                 | Application environment (`development` or `production`) | `development`                                 |
| `DATABASE_URL`             | PostgreSQL connection URL                               | `postgresql://apulse:password@db:5432/apulse` |
| `POSTGRES_HOST`            | Database hostname or Docker service name                | `db` (Docker) / `localhost`                   |
| `POSTGRES_PORT`            | PostgreSQL port                                         | `5432`                                        |
| `POSTGRES_USER`            | PostgreSQL username                                     | `apulse`                                      |
| `POSTGRES_PASSWORD`        | PostgreSQL password                                     | `change_me`                                   |
| `POSTGRES_DB`              | PostgreSQL database name                                | `apulse`                                      |
| `MINIO_ENDPOINT`           | MinIO server hostname or Docker service name            | `minio` (Docker) / `localhost`                |
| `MINIO_PORT`               | MinIO S3 API port                                       | `9000`                                        |
| `MINIO_USE_SSL`            | Enable SSL for MinIO connection                         | `false`                                       |
| `MINIO_ROOT_USER`          | MinIO root/access key                                   | `apulse_admin`                                |
| `MINIO_ROOT_PASSWORD`      | MinIO secret key                                        | `your-strong-password`                        |
| `MINIO_BUCKET`             | Default S3 bucket name                                  | `apulse-images`                               |
| `MINIO_REGION`             | MinIO region identifier                                 | `us-east-1`                                   |
| `MINIO_PUBLIC_ENDPOINT`    | Public URL for media access                             | `http://localhost:9000`                       |
| `JWT_SECRET`               | Secret key used to sign and verify JWT tokens           | `your-strong-random-secret`                   |
| `JWT_EXPIRES_IN`           | JWT token expiration timeframe                          | `1h`                                          |
| `REFRESH_TOKEN_SECRET`     | Secret key used to sign and verify refresh tokens       | `your-refresh-token-secret`                   |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration timeframe                      | `1h`                                          |
| `SMTP_HOST`                | SMTP server hostname                                    | `mailpit` (Docker) / `localhost` (native)     |
| `SMTP_PORT`                | SMTP server port                                        | `1025` (Mailpit) / `587` (Mailtrap)           |
| `SMTP_SECURE`              | Enable secure SMTP connection                           | `false`                                       |
| `SMTP_USER`                | SMTP authentication username                            | Empty for Mailpit                             |
| `SMTP_PASSWORD`            | SMTP authentication password                            | Empty for Mailpit                             |
| `MAIL_FROM`                | Default sender name and email address                   | `Apulse <hello@apulse.local>`                 |
| `OBSERVE_APP_KEY`          | NestJS Observe telemetry application key                | Optional                                      |
| `OBSERVE_APP_SECRET`       | NestJS Observe telemetry secret key                     | Optional                                      |

### Mailpit Docker Port Variables

These variables configure the host ports exposed by the development Mailpit container:

| Variable            | Description                               | Default |
| :------------------ | :---------------------------------------- | :------ |
| `MAILPIT_SMTP_PORT` | Host port mapped to Mailpit SMTP port     | `1025`  |
| `MAILPIT_UI_PORT`   | Host port mapped to Mailpit web interface | `8025`  |

**Important:** The API uses `mailpit:1025` when running inside Docker. When running natively on the host machine, use `localhost:1025`.

Never commit actual passwords, SMTP credentials, JWT secrets, or private keys to source control.

---

## Development Scripts

Run these scripts from the repository root using `pnpm --filter api <command>` or within `apps/api/`:

| Script         | Command             | Purpose                                                                |
| :------------- | :------------------ | :--------------------------------------------------------------------- |
| `start:dev`    | `pnpm start:dev`    | Starts the API in watch mode with live reloading                       |
| `start:debug`  | `pnpm start:debug`  | Starts the API with debugging enabled on port 9229                     |
| `build`        | `pnpm build`        | Compiles the NestJS application to `dist/`                             |
| `start:prod`   | `pnpm start:prod`   | Runs the compiled production build from `dist/main.js`                 |
| `lint`         | `pnpm lint`         | Runs type-aware Oxlint across `src/`                                   |
| `typecheck`    | `pnpm typecheck`    | Checks TypeScript compilation without emitting output (`tsc --noEmit`) |
| `format`       | `pnpm format`       | Auto-formats source code using Prettier                                |
| `format:check` | `pnpm format:check` | Checks code formatting against Prettier                                |

---

## Running Locally

### Prerequisites

- Node.js `22.x`
- pnpm `11.20.0`
- Running PostgreSQL database (port `5432`)
- Running MinIO service (port `9000`)
- Running Mailpit service for email testing (SMTP port `1025`)

### Native Local Execution

1. Ensure root dependencies are installed:

   ```bash
   pnpm install
   ```

2. Start PostgreSQL, MinIO, and Mailpit using Docker Compose:

   ```bash
   docker compose -f docker/docker-compose.dev.yml up -d db minio minio-init mailpit
   ```

3. Configure your root `.env` for native API execution:

   ```env
   POSTGRES_HOST=localhost
   MINIO_ENDPOINT=localhost

   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_SECURE=false
   SMTP_USER=
   SMTP_PASSWORD=
   MAIL_FROM="Apulse <hello@apulse.local>"
   ```

4. Launch the API development server:

   ```bash
   pnpm --filter api start:dev
   ```

5. The API will be accessible at [http://localhost:3001](http://localhost:3001).

6. Open [http://localhost:8025](http://localhost:8025) to inspect captured emails.

---

## Docker Workflows

### Development Container

When launched via `pnpm docker:dev` or `pnpm docker:dev:start`:

- **Build configuration**: `docker/api-dev.Dockerfile`.
- **Orchestration**: `docker/docker-compose.dev.yml`.
- **Database**: Connects to PostgreSQL through the internal Docker service hostname `db`.
- **Object Storage**: Connects to MinIO through `minio:9000`.
- **Email Testing**: Connects to Mailpit through `mailpit:1025`.
- **Dependencies**: The API waits for PostgreSQL and MinIO healthchecks and Mailpit to start.
- **Live Reloading**: Source code is mounted into the container through development volumes.

Useful commands:

```bash
# Start the development environment
pnpm docker:dev:start

# Follow API logs
docker logs -f apulse-api

# Follow Mailpit logs
docker logs -f apulse-mailpit

# Open the Mailpit web interface
open http://localhost:8025
```

### Production Container Build

The production Dockerfile is located at `docker/api-prod.Dockerfile`:

- **Builder Stage**: Installs dependencies with a frozen lockfile and runs `pnpm --filter api build`.
- **Runner Stage**: Minimal Node.js 22 runtime exposing port `3001` and starting the production server with `pnpm --filter api start:prod`.
- **Email Provider**: Uses an externally configured SMTP provider through environment variables.
- **Mailpit**: Excluded from the production Compose configuration.

---

## Email Testing Troubleshooting

### SMTP Connection Refused

- Confirm that the Mailpit container is running:

  ```bash
  docker ps --filter name=apulse-mailpit
  ```

- Check Mailpit logs:

  ```bash
  docker logs -f apulse-mailpit
  ```

- When the API runs inside Docker, use `SMTP_HOST=mailpit`.
- When the API runs natively, use `SMTP_HOST=localhost`.
- Confirm that `SMTP_PORT=1025` and `SMTP_SECURE=false`.

### Emails Are Not Appearing in Mailpit

- Verify that the API successfully initialized its SMTP transport.
- Check the API logs:

  ```bash
  docker logs -f apulse-api
  ```

- Verify that the API is configured to use Mailpit rather than an external SMTP provider.
- Open [http://localhost:8025](http://localhost:8025) and refresh the inbox.

### Production SMTP Errors

- Verify the production SMTP hostname, port, username, and password with your email provider.
- Ensure `MAIL_FROM` uses an address or domain authorized by the provider.
- Do not use Mailpit's local SMTP configuration in production.

---

## Development Standards

- Keep email delivery centralized in `EmailService`.
- Business modules must not create their own Nodemailer transports.
- Add new reusable email templates through the email template service and its template context types.
- Keep SMTP credentials and provider-specific configuration in environment variables.
- Use Mailpit for local development and testing; use a configured external SMTP provider in production.
- Do not expose temporary email-testing endpoints in production.
- Update this README whenever the email module, supported templates, SMTP configuration, or provider integration changes.
