# Apulse

An enterprise-grade, modular e-commerce and operational management platform built on a scalable **pnpm monorepo** architecture.

---

## Table of Contents

- [Overview](#overview)
- [Main Features](#main-features)
- [Monorepo Architecture](#monorepo-architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Environment Setup](#installation--environment-setup)
- [Running the Project Locally](#running-the-project-locally)
- [Docker Workflows & Commands](#docker-workflows--commands)
- [Applications & Packages](#applications--packages)
- [Available Development Scripts](#available-development-scripts)
- [Database & Storage Configuration](#database--storage-configuration)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)
- [Development & Documentation Standards](#development--documentation-standards)

---

## Overview

Apulse is designed to streamline commerce, order processing, and administrative workflows. The platform combines a high-performance **Next.js 16** frontend, a robust **NestJS 12** modular backend, **PostgreSQL 17** for transactional storage, and **MinIO** for S3-compatible media storage. Cross-cutting domain models, role definitions, and contracts are centralized in a shared workspace package (`@apulse/shared`) to ensure complete type safety and maintainability across the entire stack.

---

## Main Features

- **Authentication & RBAC**: Stateless JWT authentication with role-based route protection (`JwtAuthGuard`, `RolesGuard`). Seeded system roles include Super Admin, Admin, Sales Manager, Employee, Customer, and Leads.
- **User & Permission Management**: Fine-grained user profiles and custom authorization permissions.
- **Product & Category Catalog**: Hierarchical product categories, item specifications, and customer product favorites.
- **Cart & Order Processing**: Dynamic shopping cart operations and complete order fulfillment workflows with line items.
- **Offers & Promotions**: Order-level and product-level discount structures.
- **Billing & Invoices**: Generation and tracking of customer and order invoices with payment records.
- **Operations & Tasks**: Internal task tracking for staff and operational teams.
- **Notifications**: System and transactional notification dispatching.
- **Visitor Tracking & Analytics**: Anonymous session tracking, interaction events, and daily summarized metrics.
- **S3 Object Storage**: MinIO integration for asset uploads, pre-signed download URLs, and bucket management.
- **Observability**: Live tracing, telemetry, and error reporting via NestJS Observe.

---

## Monorepo Architecture

The repository is organized as a pnpm workspace with strict boundary isolation:

```
apulse/
├── .github/                  # CI workflows and repository standards
│   ├── workflows/ci.yml      # Automated CI pipeline (lint, typecheck, build)
│   └── BRANCH_PROTECTION.md  # Branch protection rules & merge standards
├── apps/                     # Deployable applications
│   ├── api/                  # NestJS backend REST API service
│   └── web/                  # Next.js 16 App Router frontend client
├── docker/                   # Dockerfiles and Docker Compose configurations
│   ├── api-dev.Dockerfile    # API development container definition
│   ├── api-prod.Dockerfile   # API multi-stage production container
│   ├── web-dev.Dockerfile    # Web development container definition
│   ├── web-prod.Dockerfile   # Web multi-stage production container
│   ├── docker-compose.dev.yml # Local development orchestration
│   └── docker-compose.prod.yml# Production container orchestration
├── shared/                   # Shared workspace package (@apulse/shared)
│   ├── types/                # Domain models, contracts, and role definitions
│   └── index.ts              # Central barrel export
├── .env.example              # Environment variable template
├── package.json              # Monorepo root scripts and tooling dependencies
├── pnpm-lock.yaml            # Monorepo lockfile
└── pnpm-workspace.yaml       # pnpm workspace definition
```

### Dependency Flow

```
┌──────────────────────────────────────────┐
│              @apulse/shared              │
│       (Role contracts & domain types)    │
└─────────────────────┬────────────────────┘
                      │ workspace:*
          ┌───────────┴───────────┐
          ▼                       ▼
┌───────────────────┐   ┌───────────────────┐
│     apps/api      │   │     apps/web      │
│  (NestJS Backend) │   │ (Next.js Frontend)│
└───────────────────┘   └───────────────────┘
```

Consuming applications import shared contracts through `@apulse/shared`, keeping models synchronized between client and server without code duplication.

---

## Technology Stack

| Domain                   | Technology                                                | Version     | Purpose                                                |
| :----------------------- | :-------------------------------------------------------- | :---------- | :----------------------------------------------------- |
| **Monorepo Engine**      | [pnpm](https://pnpm.io/)                                  | `11.20.0`   | Fast, disk-efficient package management and workspaces |
| **Runtime**              | [Node.js](https://nodejs.org/)                            | `22.x`      | Modern JavaScript runtime (ESM native)                 |
| **Frontend Framework**   | [Next.js](https://nextjs.org/)                            | `16.4.5`    | React framework with App Router & Turbopack            |
| **Frontend Library**     | [React](https://react.dev/)                               | `19.3.0`    | UI component architecture                              |
| **Styling**              | [Tailwind CSS](https://tailwindcss.com/)                  | `4.x`       | Utility-first responsive design                        |
| **Backend Framework**    | [NestJS](https://nestjs.com/)                             | `12.0.1`    | Modular enterprise server architecture                 |
| **ORM**                  | [TypeORM](https://typeorm.io/)                            | `1.1.2`     | Database modeling and schema management                |
| **Database**             | [PostgreSQL](https://www.postgresql.org/)                 | `17-alpine` | Relational transactional database                      |
| **Object Storage**       | [MinIO](https://min.io/)                                  | S3 API      | S3-compatible media and document storage               |
| **Authentication**       | [Passport JWT](http://www.passportjs.org/)                | `4.0.1`     | Stateless token validation and RBAC guards             |
| **Linters & Formatters** | [Oxlint](https://oxc.rs/) & [ESLint](https://eslint.org/) | Latest      | High-speed static analysis & code style enforcement    |
| **Formatting**           | [Prettier](https://prettier.io/)                          | `3.9.10`    | Automated code formatting                              |
| **Git Hooks**            | [Husky](https://typicode.github.io/husky/)                | `9.1.7`     | Pre-commit validation gates (`pnpm check`)             |

---

## Prerequisites

Before starting, ensure the following software is installed on your workstation:

- **Node.js**: `v22.0.0` or higher ([Download](https://nodejs.org/))
- **pnpm**: `v11.20.0` (Install via Corepack: `corepack enable && corepack prepare pnpm@11.20.0 --activate`)
- **Docker**: Docker Engine or Docker Desktop with Compose support ([Download](https://www.docker.com/))
- **Git**: For version control

---

## Installation & Environment Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Abed-Taha/apulse.git
   cd apulse
   ```

2. **Install project dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a local `.env` file from the provided template:
   ```bash
   cp .env.example .env
   ```

### Environment Variables Reference

| Variable                | Description                                                  | Default / Example                                   | Required For   |
| :---------------------- | :----------------------------------------------------------- | :-------------------------------------------------- | :------------- |
| `NODE_ENV`              | Application environment (`development` \| `production`)      | `development`                                       | All            |
| `WEB_PORT`              | Port exposed by the web client                               | `3000`                                              | Web            |
| `NEXT_PUBLIC_API_URL`   | Base REST API URL accessed by the web client                 | `http://localhost:3001`                             | Web            |
| `API_PORT`              | Port exposed by the backend API                              | `3001`                                              | API            |
| `POSTGRES_HOST`         | PostgreSQL host (`db` inside Docker, `localhost` for native) | `db`                                                | Database / API |
| `POSTGRES_PORT`         | PostgreSQL port                                              | `5432`                                              | Database / API |
| `POSTGRES_USER`         | PostgreSQL username                                          | `apulse`                                            | Database / API |
| `POSTGRES_PASSWORD`     | PostgreSQL password                                          | `change_me`                                         | Database / API |
| `POSTGRES_DB`           | PostgreSQL database name                                     | `apulse`                                            | Database / API |
| `MINIO_IMAGE`           | Docker image for MinIO server                                | `docker.io/pgsty/silo:RELEASE.2026-11-09T00-00-00Z` | Docker         |
| `MINIO_CLIENT_IMAGE`    | Docker image for MinIO Client (`mc`)                         | `quay.io/minio/mc:latest`                           | Docker         |
| `MINIO_ROOT_USER`       | MinIO admin user / S3 access key                             | `apulse_admin`                                      | Storage / API  |
| `MINIO_ROOT_PASSWORD`   | MinIO admin password / S3 secret key                         | `your-strong-password`                              | Storage / API  |
| `MINIO_BUCKET`          | Default storage bucket name                                  | `apulse-images`                                     | Storage / API  |
| `MINIO_API_PORT`        | MinIO S3 API port                                            | `9000`                                              | Storage / API  |
| `MINIO_CONSOLE_PORT`    | MinIO Web Console port                                       | `9001`                                              | Storage        |
| `MINIO_ENDPOINT`        | MinIO host (`minio` inside Docker, `localhost` natively)     | `minio`                                             | Storage / API  |
| `MINIO_PORT`            | MinIO port                                                   | `9000`                                              | Storage / API  |
| `MINIO_USE_SSL`         | Enable SSL for MinIO connection                              | `false`                                             | Storage / API  |
| `MINIO_REGION`          | S3 region identifier                                         | `us-east-1`                                         | Storage / API  |
| `MINIO_PUBLIC_ENDPOINT` | Public URL for media access                                  | `http://localhost:9000`                             | Storage / Web  |
| `JWT_SECRET`            | Secret key used to sign and verify JWT tokens                | `your-strong-random-secret`                         | API            |
| `JWT_EXPIRES_IN`        | JWT token validity duration                                  | `1h`                                                | API            |

> [!IMPORTANT]
> Never commit actual passwords or private keys to source control. Keep `.env` git-ignored at all times.

---

## Running the Project Locally

You can run Apulse either **natively** with pnpm (running database and storage in Docker) or entirely via **Docker Compose**.

### Option A: Native Local Development (Recommended for Fast Iteration)

1. **Start database and storage services**:

   ```bash
   docker compose -f docker/docker-compose.dev.yml up -d db minio minio-init
   ```

2. **Update your `.env` for local hosts**:
   Ensure `POSTGRES_HOST=localhost` and `MINIO_ENDPOINT=localhost` when running the API outside Docker.

3. **Start the API service**:

   ```bash
   pnpm --filter api start:dev
   ```

4. **Start the Web service** (in a separate terminal):

   ```bash
   pnpm --filter web dev
   ```

5. **Access the services**:
   - Web application: [http://localhost:3000](http://localhost:3000)
   - API endpoints: [http://localhost:3001](http://localhost:3001)
   - MinIO Console: [http://localhost:9001](http://localhost:9001) (User: `apulse_admin`, Password: `your-strong-password`)

---

## Docker Workflows & Commands

The project includes pre-configured Docker scripts in root `package.json` for both development and production workflows:

### Development Docker Scripts

| Command                   | Description                                                                   |
| :------------------------ | :---------------------------------------------------------------------------- |
| `pnpm docker:dev`         | Builds and starts all development containers in the foreground with live logs |
| `pnpm docker:dev:start`   | Starts development containers in detached background mode (`-d`)              |
| `pnpm docker:dev:stop`    | Stops running development containers without removing them                    |
| `pnpm docker:dev:restart` | Restarts all development containers                                           |
| `pnpm docker:dev:logs`    | Follows real-time logs from all running development containers                |
| `pnpm docker:dev:down`    | Stops and removes development containers and networks                         |

### Production Docker Scripts

| Command                    | Description                                                |
| :------------------------- | :--------------------------------------------------------- |
| `pnpm docker:prod`         | Builds and launches production containers in detached mode |
| `pnpm docker:prod:start`   | Starts existing production containers                      |
| `pnpm docker:prod:stop`    | Stops running production containers                        |
| `pnpm docker:prod:restart` | Restarts production containers                             |
| `pnpm docker:prod:logs`    | Follows production container logs                          |
| `pnpm docker:prod:down`    | Stops and removes production containers                    |

### Container Architecture & Healthchecks

- **`apulse-db`**: PostgreSQL 17 database. Uses healthcheck `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}` to verify readiness before starting dependent services.
- **`apulse-minio`**: MinIO S3 object storage server. Uses healthcheck `mc ready local` to verify availability.
- **`apulse-minio-init`**: Transient helper container that provisions the default bucket (`MINIO_BUCKET`) and sets public read permissions upon startup.
- **`apulse-api`**: Depends on `apulse-db` and `apulse-minio` passing healthchecks before launching.
- **`apulse-web`**: Depends on `apulse-api`.

---

## Applications & Packages

Each package in the monorepo has dedicated documentation detailing its internal design, responsibilities, configuration, and scripts:

- 🌐 [**apps/web**](apps/web/README.md): Next.js 16 frontend web application with React 19, Tailwind CSS v4, and App Router.
- ⚡ [**apps/api**](apps/api/README.md): NestJS 12 backend REST API service with TypeORM, PostgreSQL, MinIO storage, and JWT RBAC.
- 📦 [**shared**](shared/README.md): Centralized domain types, role definitions (`RoleCode`), and cross-boundary contracts.

---

## Available Development Scripts

The following scripts can be executed from the root of the repository:

| Script         | Command             | Purpose                                                                      |
| :------------- | :------------------ | :--------------------------------------------------------------------------- |
| `lint`         | `pnpm lint`         | Runs linters across both `apps/api` (Oxlint) and `apps/web` (ESLint)         |
| `typecheck`    | `pnpm typecheck`    | Validates TypeScript types across `apps/api` and `apps/web` (`tsc --noEmit`) |
| `check`        | `pnpm check`        | Comprehensive quality check: runs `lint`, `typecheck`, and `format:check`    |
| `format`       | `pnpm format`       | Auto-formats the entire repository using Prettier                            |
| `format:check` | `pnpm format:check` | Verifies that all repository files match Prettier standards                  |
| `build`        | `pnpm build`        | Compiles production builds for `apps/api` and `apps/web`                     |
| `prepare`      | `pnpm prepare`      | Initializes Husky git hooks                                                  |

> [!NOTE]
> Every commit is automatically validated against `pnpm check` via Husky pre-commit hooks to keep code formatting and type safety consistent.

---

## Database & Storage Configuration

### PostgreSQL & TypeORM

- **Auto-Synchronization**: In development (`NODE_ENV=development`), TypeORM entity changes are automatically synchronized to PostgreSQL (`synchronize: true`). In production, synchronization is disabled to prevent accidental data loss.
- **Connection Retries**: The database module incorporates automatic reconnection retry logic (up to 5 attempts with a 3-second delay).
- **Default Role Seeding**: Upon API bootstrap, `RolesSeed` automatically populates default system roles (`super_admin`, `admin`, `sales_manager`, `employee`, `customer`, `leads`) sourced from `@apulse/shared`.

### MinIO Object Storage

- **S3 Compatibility**: Built using `@aws-sdk/client-s3` with `forcePathStyle: true`.
- **Pre-signed URLs**: Allows secure direct uploads and temporary access without exposing S3 root credentials to public clients.
- **Web Console**: Accessible by default at [http://localhost:9001](http://localhost:9001) for bucket browsing and manual file management.

---

## Troubleshooting Common Issues

### 1. Port Conflicts (Address Already in Use)

- **Symptoms**: `listen EADDRINUSE: address already in use :::3000` or `:::3001` or `:::5432`.
- **Resolution**:
  - Identify the occupying process:
    ```bash
    lsof -i :3000 # or :3001, :5432, :9000, :9001
    ```
  - Terminate the process or adjust the respective port variable (`WEB_PORT`, `API_PORT`, `POSTGRES_PORT`, `MINIO_API_PORT`) in `.env`.

### 2. Database Connection Errors (`ENOTFOUND db`)

- **Symptoms**: `Database connection failed: getaddrinfo ENOTFOUND db`.
- **Resolution**:
  - When running `apps/api` **natively** on your host, set `POSTGRES_HOST=localhost` in `.env`.
  - When running inside **Docker**, ensure `POSTGRES_HOST=db` so Docker resolves the internal container network.

### 3. MinIO S3 Connection Refused / Bucket Missing

- **Symptoms**: `Error: MinIO credentials are required` or S3 upload failures.
- **Resolution**:
  - Verify that MinIO credentials in `.env` match `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`.
  - Ensure the `apulse-minio-init` container ran successfully to create `MINIO_BUCKET`. Check logs:
    ```bash
    docker compose -f docker/docker-compose.dev.yml logs minio-init
    ```

### 4. `pnpm install` Lockfile Discrepancies

- **Symptoms**: `ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile"`.
- **Resolution**: Run `pnpm install --no-frozen-lockfile` locally to update `pnpm-lock.yaml`, then run `pnpm check`.

### 5. Pre-commit Hook Blocks Commit

- **Symptoms**: Git commit fails during `pnpm check`.
- **Resolution**:
  - Run `pnpm format` to auto-fix styling discrepancies.
  - Run `pnpm typecheck` and `pnpm lint` to address specific TypeScript or lint errors reported.

---

## Development & Documentation Standards

To maintain high code quality, predictability, and ease of onboarding, all contributors must adhere to the following standards:

### 1. Package Documentation Requirement

Whenever a new application or package is introduced into `apps/`, `packages/`, or `shared/`:

- It **must** include a dedicated `README.md` file following the established structure (Overview, Structure, Responsibilities, Dependencies, Configuration, Available Scripts).
- The root `README.md` must be updated to reference the new package.

### 2. Docker Configuration Standards

- Any new package or structural modification **must** be reflected across:
  - `docker/api-dev.Dockerfile` and `docker/web-dev.Dockerfile` (for dependency resolution and caching).
  - Production Dockerfiles (`docker/api-prod.Dockerfile`, `docker/web-prod.Dockerfile`).
  - `docker/docker-compose.dev.yml` and `docker/docker-compose.prod.yml` (services, volumes, healthchecks, and environment variables).
- Docker builds and compose setups must be verified before merging structural changes.

### 3. CI Merge Gate & Branch Protection Standards

- All changes must be submitted via Pull Requests targeting `main`.
- **Branch Protection**: The `main` branch enforces required status checks (`Quality Checks` via `.github/workflows/ci.yml`).
- PRs **cannot be merged** if linting, typechecking, formatting, or build steps fail.
- For complete branch protection configuration details, consult [`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md).

### 4. Continuous Documentation Synchronization

- Architecture updates, new environment variables, modified scripts, or workflow adjustments must be immediately documented in the relevant package README and the root `README.md`.
- Documentation and code must never diverge.
