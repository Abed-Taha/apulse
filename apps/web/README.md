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

## Application Structure

```
apps/web/
├── app/                 # Next.js App Router entry points and styles
├── context/             # Shared React contexts
├── router/              # React Router setup and route guards
├── public/              # Static assets
└── lib/                 # Shared frontend utilities
```

### Pages

| URL / route           | File                      | Purpose                                                                               |
| --------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| `/`                   | `app/page.tsx`            | Mounts the client-side application router.                                            |
| `/<any client route>` | `app/[...slugs]/page.tsx` | Catch-all Next.js page that serves direct visits and refreshes for React Router URLs. |
| `/login`              | `router/AppRouter.tsx`    | Public login route, rendered by React Router.                                         |
| `/` and future routes | `router/AppRouter.tsx`    | Defines the protected application routes and authentication guard.                    |

The `[...slugs]` directory uses Next.js catch-all route syntax. It captures one
or more URL segments so React Router can resolve nested routes when a user opens
a URL directly or refreshes the browser.

### Components

| Component / file          | Responsibility                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| `app/providers.tsx`       | Wraps the application in shared providers.                                                      |
| `router/ClientRouter.tsx` | Loads React Router on the client, where `BrowserRouter` can access the browser URL.             |
| `router/AppRouter.tsx`    | Configures public and protected routes, loading UI, and auth guards.                            |
| `context/AuthContext.tsx` | Provides centralized auth status, user state, and sign-in/sign-out actions through `useAuth()`. |

Pages and components are documented separately so Next.js URL entry points are
easy to distinguish from the React Router components that render those routes.

---

## Architecture & Responsibilities

1. **User Interface & Interaction**: Renders modern, responsive interfaces for product catalogs, shopping carts, orders, and dashboards.
2. **Backend Communication**: Communicates with `apps/api` via REST endpoints using `NEXT_PUBLIC_API_URL`.
3. **Shared Contracts & Domain Permissions**: Uses `@apulse/shared` for role codes (`RoleCode`), domain permission codes (`PermissionCode`), authenticated user session interfaces (`AuthenticatedUser`), and common schemas. Module and tab visibility is managed via `lib/permissions.ts` utilities (`canAccessDomain`).
4. **Performance & Optimization**: Leverages Next.js font optimization (`next/font`), image optimization (`next/image`), and Turbopack for fast builds.

## Authentication and Routing

The root and catch-all Next.js pages render `ClientRouter`, which loads
`router/AppRouter.tsx` on the client (where `BrowserRouter` is available).
The `/login` route is public; application routes are nested under
`RequireAuth`, which waits for session initialization and preserves the
requested path, query, and hash when redirecting to login.

`AuthProvider` exposes `useAuth()` with `status`, `user`, `signIn`, and
`signOut`. Pass an asynchronous `resolveSession` function to `ClientRouter`
from a client component to restore and verify a session at startup. Until
login/session integration is implemented, the resolver defaults to signed out;
it intentionally does not treat a client-side storage flag as proof of
authentication. Add future protected routes as children of the authenticated
route group in `router/AppRouter.tsx`.

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
