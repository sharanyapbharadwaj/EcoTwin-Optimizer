# EcoTwin

EcoTwin is a local, simulated energy-monitoring and optimization platform for four independent digital-twin demonstrations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ecotwin/src/lib/engine.ts` — deterministic simulation and metric calculations
- `artifacts/ecotwin/src/lib/sampleData.ts` and `types.ts` — demo inputs and shared data types
- `artifacts/ecotwin/src/pages/` — overview, four module routes, and methodology page
- `artifacts/ecotwin/src/components/` — shared app shell, module controls, charts, and UI
- `artifacts/ecotwin/src/index.css` — EcoTwin theme and responsive styling

## Architecture decisions

- The current MVP uses browser-local simulated inputs and saved scenarios; it does not call the API server or database.
- Keep module calculations deterministic and separate from presentation components.
- The four twins are independent models. Dashboard totals are illustrative and must not treat renewable generation or battery discharge as new consumption/generation.
- Recommendations are local rule-based estimates, not live diagnoses or machine-learning output.

## Product

The overview aggregates the cold-chain warehouse, solar optimizer, data-center scheduler, and home energy reuse hub. Each module supports editable inputs, baseline/optimized estimates, charts, reset, and an explainable simulated recommendation. The methodology page documents model assumptions and limits.

## User preferences

- Keep this version usable without accounts, paid APIs, a database, or connected hardware; label all values as simulated.
- Preserve a deep navy energy-tech interface with emerald and cyan accents.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
