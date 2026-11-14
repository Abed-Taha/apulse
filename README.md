# Apulse

Apulse is a full-stack application built as a pnpm monorepo, with a Next.js frontend, NestJS backend, and shared packages.

## Project Structure

```text
apulse/
├── apps/
│   ├── api/              # NestJS backend
│   └── web/              # Next.js frontend
├── shared/               # Shared types, interfaces, and utilities
├── docker/
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── api-dev.Dockerfile
│   ├── api-prod.Dockerfile
│   ├── web-dev.Dockerfile
│   └── web-prod.Dockerfile
├── .env.example
├── package.json
└── pnpm-workspace.yaml
```

## Technology Stack

| Part            | Technologies                             |
| --------------- | ---------------------------------------- |
| Web             | Next.js, React, TypeScript, Tailwind CSS |
| API             | NestJS, TypeScript, TypeORM              |
| Database        | PostgreSQL                               |
| Shared          | TypeScript                               |
| Storage         | S3-compatible storage (MinIO)            |
| Email           | Nodemailer, Handlebars, Mailpit          |
| Package Manager | pnpm                                     |
| Containers      | Docker, Docker Compose                   |

## Prerequisites

Make sure you have installed:

- Node.js 22+
- pnpm 11+
- Docker Desktop

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd apulse
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env
```

Update the required values in `.env`, especially database credentials, JWT secrets, and storage settings.

### 4. Start the project with Docker

Start all development containers:

```bash
pnpm docker:dev
```

Or start them in the background:

```bash
pnpm docker:dev:start
```

The development environment includes:

| Container        | Purpose             | URL                   |
| ---------------- | ------------------- | --------------------- |
| `apulse-web`     | Next.js frontend    | http://localhost:3000 |
| `apulse-api`     | NestJS backend      | http://localhost:3001 |
| `apulse-db`      | PostgreSQL database | localhost:5432        |
| `apulse-minio`   | Object storage      | http://localhost:9000 |
| `apulse-mailpit` | Email testing       | http://localhost:8025 |

MinIO Console: http://localhost:9001

Mailpit is used only in development to capture and inspect outgoing emails.

## Running Without Docker

You can also run the applications locally.

Start the required infrastructure services:

```bash
docker compose --env-file .env -f docker/docker-compose.dev.yml up -d db minio minio-init mailpit
```

Then start the applications:

```bash
pnpm dev
```

Make sure your local environment configuration uses `localhost` for services running inside Docker when accessed from your host machine.

## Docker Commands

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `pnpm docker:dev`         | Start development containers                   |
| `pnpm docker:dev:start`   | Start development containers in the background |
| `pnpm docker:dev:stop`    | Stop development containers                    |
| `pnpm docker:dev:restart` | Restart development containers                 |
| `pnpm docker:dev:logs`    | View development logs                          |
| `pnpm docker:dev:down`    | Stop and remove development containers         |
| `pnpm docker:prod`        | Start production containers                    |

## Useful Commands

```bash
pnpm lint
pnpm typecheck
pnpm check
pnpm format
pnpm build
```

## Documentation

For application-specific instructions, see:

- [API Documentation](apps/api/README.md)
- [Web Documentation](apps/web/README.md)

## Development

- Keep shared types and utilities inside `shared/` when they are used by multiple applications.
- Keep API-specific logic inside `apps/api/`.
- Keep frontend-specific logic inside `apps/web/`.
- Update the relevant README when introducing significant setup or architectural changes.
