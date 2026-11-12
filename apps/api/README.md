# Apulse Backend API (`apps/api`)

The core backend REST API service for the Apulse platform, built with **NestJS 12**, **TypeORM**, **PostgreSQL 17**, **MinIO (S3)**, and **Passport JWT**.

---

## Overview

`apps/api` delivers the business logic, data persistence, file storage, security, and administrative services for the Apulse platform. It is built as a pure ECMAScript Module (ESM) application running on Node.js 22, consuming shared domain models and contracts from `@apulse/shared`.

---

## Tech Stack

| Technology              | Purpose                                                     |
| :---------------------- | :---------------------------------------------------------- |
| **NestJS 12**           | Scalable enterprise Node.js framework (ESM native)          |
| **TypeORM**             | Object-Relational Mapper for PostgreSQL                     |
| **PostgreSQL 17**       | Relational database for core transactional data             |
| **MinIO (AWS SDK S3)**  | S3-compatible object storage for media, assets, and uploads |
| **Passport & JWT**      | Stateless authentication and role-based token validation    |
| **NestJS Observe**      | Tracing, performance metrics, and application observability |
| **Oxlint & TypeScript** | Ultra-fast linter and static type checking                  |

---

## Directory Structure

```
apps/api/
├── src/
│   ├── core/                        # Core infrastructure and transversal features
│   │   ├── database/                # TypeORM PostgreSQL module & connection lifecycle
│   │   ├── decorators/              # Decorators (e.g., @Roles)
│   │   ├── guards/                  # Security guards (JwtAuthGuard, RolesGuard)
│   │   └── modules/                 # Aggregated CoreModules loader
│   ├── modules/                     # Business domain modules
│   │   ├── analytics/               # Visitor sessions, daily summaries, analytics events
│   │   ├── auth/                    # JWT authentication, Passport strategy, auth controller
│   │   ├── cart/                    # Shopping cart management
│   │   ├── category/                # Product categories
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

### 1. Authentication & Role-Based Access Control (RBAC)

- **JWT Authentication**: Validates Bearer tokens via `JwtAuthGuard` and `JwtStrategy`.
- **Role Enforcement**: Protected routes use `@Roles('admin', ...)` paired with `RolesGuard`.
- **System Roles**: Default roles are imported from `@apulse/shared` (`RoleCode`) and automatically seeded into the database on bootstrap via `RolesSeed`:
  - `super_admin`, `admin`, `sales_manager`, `employee`, `customer`, `leads`.

### 2. Database & Data Access

- Configured in `DatabaseModule` using TypeORM for PostgreSQL 17.
- Automatically handles reconnection retries with configurable delay.
- Schema auto-synchronization is enabled during development (`synchronize: true`) and disabled in production.

### 3. Object Storage (MinIO)

- Abstracted by `StorageService` using `@aws-sdk/client-s3`.
- Handles bucket creation, presigned upload URLs, asset retrieval, and public object endpoint resolution.

### 4. Observability

- Integrated with [NestJS Observe](https://observe.nestjs.com) in `AppModule` to report traces, slow operations, and system metrics.

---

## Configuration & Environment Variables

The API reads environment variables from the root `.env` file:

| Variable                | Description                                             | Example / Default              |
| :---------------------- | :------------------------------------------------------ | :----------------------------- |
| `API_PORT`              | HTTP port the API listens on                            | `3001`                         |
| `NODE_ENV`              | Application environment (`development` \| `production`) | `development`                  |
| `POSTGRES_HOST`         | Database hostname or Docker service name                | `db` (Docker) / `localhost`    |
| `POSTGRES_PORT`         | PostgreSQL port                                         | `5432`                         |
| `POSTGRES_USER`         | PostgreSQL username                                     | `apulse`                       |
| `POSTGRES_PASSWORD`     | PostgreSQL password                                     | `change_me`                    |
| `POSTGRES_DB`           | PostgreSQL database name                                | `apulse`                       |
| `MINIO_ENDPOINT`        | MinIO server hostname or Docker service name            | `minio` (Docker) / `localhost` |
| `MINIO_PORT`            | MinIO S3 API port                                       | `9000`                         |
| `MINIO_USE_SSL`         | Enable SSL for MinIO connection                         | `false`                        |
| `MINIO_ROOT_USER`       | MinIO root/access key                                   | `apulse_admin`                 |
| `MINIO_ROOT_PASSWORD`   | MinIO secret key                                        | `your-strong-password`         |
| `MINIO_BUCKET`          | Default S3 bucket name                                  | `apulse-images`                |
| `MINIO_REGION`          | MinIO region identifier                                 | `us-east-1`                    |
| `MINIO_PUBLIC_ENDPOINT` | Public URL for media access                             | `http://localhost:9000`        |
| `JWT_SECRET`            | Secret key used to sign and verify JWT tokens           | `your-strong-random-secret`    |
| `JWT_EXPIRES_IN`        | JWT token expiration timeframe                          | `1h`                           |
| `OBSERVE_APP_KEY`       | NestJS Observe telemetry application key                | Optional                       |
| `OBSERVE_APP_SECRET`    | NestJS Observe telemetry secret key                     | Optional                       |

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
- Running PostgreSQL database (port 5432)
- Running MinIO service (port 9000)

### Native Local Execution

1. Ensure root dependencies are installed:

   ```bash
   pnpm install
   ```

2. Start dependencies (PostgreSQL and MinIO) using Docker Compose:

   ```bash
   docker compose -f docker/docker-compose.dev.yml up -d db minio minio-init
   ```

3. Launch the API development server:

   ```bash
   pnpm --filter api start:dev
   ```

4. The API will be accessible at [http://localhost:3001](http://localhost:3001).

---

## Docker Workflows

### Development Container

When launched via `pnpm docker:dev` or `pnpm docker:dev:start`:

- Build configuration: `docker/api-dev.Dockerfile`.
- Orchestrated by `docker/docker-compose.dev.yml`.
- Dependencies (`db` and `minio`) must pass healthchecks before the API container starts.
- Automatic live code mounting via volumes.

### Production Container Build

The production Dockerfile is located at `docker/api-prod.Dockerfile`:

- **Builder Stage**: Installs dependencies with frozen lockfile and runs `pnpm --filter api build`.
- **Runner Stage**: Minimal Node.js 22 runtime exposing port `3001` and starting the production server with `pnpm --filter api start:prod`.
