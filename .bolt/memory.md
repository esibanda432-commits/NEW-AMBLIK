# Project memory

## Product intent & audience

- Vite + React application (specific product/audience not yet determined from interactions).

## Brand personality & voice

- Not yet inferred.

## Visual design & UX direction

- Not yet inferred.

## Decisions, constraints & rationale

- Framework: Vite + React with `vite.config.ts` using ESM (`import { defineConfig } from 'vite'`, `import react from '@vitejs/plugin-react'`).
- Deployment environment installs **production dependencies only** during build; `devDependencies` are not available at build time.
- Build tooling (`vite`, `@vitejs/plugin-react`) moved from `devDependencies` into `dependencies` so the deployment build can resolve them.
- Full local build verified passing after the dependency move.
- Deployment runtime: Node 18 on a WebContainer-based environment (rolldown WASI binding observed).

## Open questions & assumptions

- Assumption: only `vite` and `@vitejs/plugin-react` were misclassified as dev-only; other build-critical devDependencies may still need moving if future failures recur.
- No `.bolt/prompt` provided yet; global instructions may update or override any inferred context above.