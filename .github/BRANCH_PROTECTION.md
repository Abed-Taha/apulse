# CI and Branch Protection Standards

This document establishes the repository branch protection rules, Continuous Integration (CI) merge gates, and development standards for the Apulse project.

---

## 1. Branch Protection Configuration for `main`

The `main` branch represents production-ready code. Direct pushes to `main` are strictly forbidden. All modifications must arrive via Pull Requests that pass all automated quality checks and review criteria.

### GitHub Repository Ruleset / Branch Protection Settings

Configure the following rules on GitHub under **Settings > Branches > Branch protection rules** (or **Settings > Rules > Rulesets**) for the `main` branch:

| Setting                                              | Configuration          | Rationale                                          |
| :--------------------------------------------------- | :--------------------- | :------------------------------------------------- |
| **Branch name pattern**                              | `main`                 | Targets the primary branch                         |
| **Require a pull request before merging**            | **Enabled**            | Enforces code review and discussion before merging |
| **Required approvals**                               | `1` (or team standard) | Ensures at least one peer has reviewed the change  |
| **Dismiss stale pull request approvals**             | **Enabled**            | Invalidates approval when new commits are pushed   |
| **Require status checks to pass before merging**     | **Enabled**            | Guarantees code meets quality gates before merge   |
| **Require branches to be up to date before merging** | **Enabled** (Strict)   | Ensures the PR is verified against current `main`  |
| **Required Status Check Jobs**                       | `Quality Checks`       | CI job defined in `.github/workflows/ci.yml`       |
| **Require conversation resolution before merging**   | **Enabled**            | Ensures all review comments are addressed          |
| **Require signed commits**                           | Optional (Recommended) | Enforces cryptographic commit provenance           |
| **Do not allow bypassing the above settings**        | **Enabled**            | Enforces rules even for repository administrators  |
| **Restrict force pushes**                            | **Enabled**            | Prevents history rewrites on `main`                |
| **Restrict deletions**                               | **Enabled**            | Prevents accidental deletion of `main`             |

---

## 2. CI Workflow Pipeline (`Apulse CI`)

Continuous Integration runs automatically via GitHub Actions on:

1. Every `push` to `main`.
2. Every `pull_request` targeting `main`.

### Workflow Specification (`.github/workflows/ci.yml`)

The CI pipeline executes the `Quality Checks` job:

```yaml
name: Apulse CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.20.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint, typecheck and format
        run: pnpm check

      - name: Build applications
        run: pnpm build
```

### Checks Performed

1. **Dependency Integrity**: Verified with `pnpm install --frozen-lockfile` to ensure `pnpm-lock.yaml` is clean and up to date.
2. **Linting**:
   - `apps/api`: Type-aware analysis with Oxlint.
   - `apps/web`: ESLint 9 analysis.
3. **Type Checking**:
   - `apps/api`: `tsc --noEmit`.
   - `apps/web`: `next typegen && tsc --noEmit`.
4. **Code Formatting**: Prettier verification (`prettier --check . --ignore-path .prettierignore`).
5. **Production Build**: Compiles both `apps/api` and `apps/web` to verify build reproducibility.

---

## 3. Pull Request Guidelines

1. **Branch Naming**:
   - Feature branches: `feat/<feature-name>` or `<ticket-id>-<short-description>`
   - Bug fixes: `fix/<issue-name>`
   - Documentation: `docs/<description>`
2. **Pre-commit Verification**:
   - Husky automatically runs `pnpm check` on commit.
   - Ensure `pnpm check` and `pnpm build` pass locally before opening a PR:
     ```bash
     pnpm check
     pnpm build
     ```
3. **Merge Requirement**:
   - All CI checks must turn green (`Quality Checks`).
   - PR must be rebased or merged with latest `main`.
