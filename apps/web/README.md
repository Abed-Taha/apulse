# Apulse Web Application (`apps/web`)

The frontend web client for the Apulse platform, built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**.

---

## Overview

`apps/web` provides the user interface for the Apulse ecosystem, catering to customers, employees, sales managers, and administrators. It communicates with the backend REST service (`apps/api`) and consumes shared domain contracts and roles directly from the workspace package `@apulse/shared`.

---

## Tech Stack

| Technology          | Purpose                                                     |
| :------------------ | :---------------------------------------------------------- |
| **Next.js 16**      | Full-stack React framework with App Router architecture     |
| **React 19**        | Modern UI rendering library with Server & Client components |
| **Tailwind CSS v4** | Utility-first CSS framework using Turbopack compiler        |
| **TypeScript 5**    | Strict static type checking                                 |
| **ESLint 9**        | Code quality and linting rules                              |
| **Prettier 3**      | Code style formatting                                       |

---

## Directory Structure

```
apps/web/
├── app/                      # Next.js App Router directory
│   ├── favicon.ico           # Application favicon
│   ├── globals.css           # Global Tailwind CSS imports & styles
│   ├── layout.tsx            # Root HTML layout with Geist font loading
│   └── page.tsx              # Application home landing page
├── public/                   # Static public assets (SVGs, branding)
├── eslint.config.mjs         # ESLint 9 flat configuration
├── next.config.ts            # Next.js runtime & bundler configuration
├── package.json              # Package manifest and workspace scripts
├── pnpm-workspace.yaml       # Local workspace configuration
├── tsconfig.json             # TypeScript compiler settings
└── README.md                 # Package documentation
```

---

## Architecture & Responsibilities

1. **User Interface & Interaction**: Renders modern, responsive interfaces for product catalogs, shopping carts, orders, and dashboards.
2. **Backend Communication**: Communicates with `apps/api` via REST endpoints using `NEXT_PUBLIC_API_URL`.
3. **Shared Contracts & Domain Permissions**: Uses `@apulse/shared` for role codes (`RoleCode`), domain permission codes (`PermissionCode`), authenticated user session interfaces (`AuthenticatedUser`), and common schemas. Module and tab visibility is managed via `lib/permissions.ts` utilities (`canAccessDomain`).
4. **Performance & Optimization**: Leverages Next.js font optimization (`next/font`), image optimization (`next/image`), and Turbopack for fast builds.

---

## Configuration & Environment Variables

The web application is configured via environment variables defined in the root `.env` file (or passed via Docker):

| Variable              | Description                                             | Default                 |
| :-------------------- | :------------------------------------------------------ | :---------------------- |
| `WEB_PORT`            | Port exposed by the web server container/process        | `3000`                  |
| `NEXT_PUBLIC_API_URL` | Public URL endpoint for backend REST API calls          | `http://localhost:3001` |
| `NODE_ENV`            | Application environment (`development` \| `production`) | `development`           |

---

## Development Scripts

Run these scripts from the repository root using `pnpm --filter web <command>` or directly inside `apps/web/`:

| Script         | Command             | Purpose                                                                  |
| :------------- | :------------------ | :----------------------------------------------------------------------- |
| `dev`          | `pnpm dev`          | Starts the Next.js development server with Turbopack                     |
| `build`        | `pnpm build`        | Compiles the production build                                            |
| `start`        | `pnpm start`        | Runs the compiled Next.js production server                              |
| `lint`         | `pnpm lint`         | Runs ESLint analysis across the application                              |
| `typecheck`    | `pnpm typecheck`    | Generates route types and runs TypeScript type checking (`tsc --noEmit`) |
| `format`       | `pnpm format`       | Auto-formats code using Prettier                                         |
| `format:check` | `pnpm format:check` | Checks code formatting against Prettier standards                        |

---

## Running Locally

### Prerequisites

- Node.js `22.x`
- pnpm `11.20.0`
- Configured root `.env` file

### Native Local Execution

1. Ensure root dependencies are installed:

   ```bash
   pnpm install
   ```

2. Start the web application in development mode:

   ```bash
   pnpm --filter web dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker Workflows

### Development with Docker Compose

When running via Docker Compose from the project root:

```bash
pnpm docker:dev:start
```

The web service container (`apulse-web`):

- Mounts source code from the host for real-time hot reloading.
- Preserves container-specific `node_modules` and `.next` build caches using named volumes.
- Forwards port `3000` to the host.

### Production Container Build

Production containerization uses `docker/web-prod.Dockerfile`:

- **Builder Stage**: Installs dependencies with frozen lockfile, passes `NEXT_PUBLIC_API_URL`, and compiles production assets with `pnpm --filter web build`.
- **Runner Stage**: Minimal Alpine Node.js 22 runtime exposing port `3000` and executing `pnpm --filter web start`.
