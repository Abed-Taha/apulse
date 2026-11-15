# Components

This directory contains reusable UI components used throughout the Apulse frontend.

## Structure

```text
components/
├── ui/
│   └── loading-state.tsx
└── index.ts
```

## UI Components

| Component      | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `LoadingState` | Displays a top-level loading indicator using MUI `LinearProgress`. |

## Component Exports

The root `index.ts` acts as the central export point for reusable components.

Export new components from this file to simplify imports across the application.

Example:

```ts
export { LoadingState } from './ui/loading-state';
```

Usage:

```tsx
import { LoadingState } from '@/components';
```

## Guidelines

- Keep components reusable and independent of business logic.
- Use Material UI components where appropriate.
- Keep feature-specific components inside their respective feature directories.
- Export shared components through the root `index.ts`.
- Add components when a repeated UI pattern needs to be shared.
