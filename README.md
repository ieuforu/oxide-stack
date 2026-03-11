# Next-Gen Fullstack Monorepo

[![CI Status](https://github.com/ieuforu/monorepo-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/ieuforu/monorepo-starter/actions)

An industrial-grade, high-performance Fullstack Monorepo boilerplate powered by Bun, Turborepo, and a 100% Rust-driven toolchain. Engineered for sub-millisecond feedback loops and end-to-end type safety.

## Performance at a Glance

| Action              | Traditional Toolchain | Our Rust-Powered Stack     | Improvement     |
| :------------------ | :-------------------- | :------------------------- | :-------------- |
| **Linting**         | ~6.5s (ESLint)        | **~15ms (Oxlint)**         | **400x Faster** |
| **Formatting**      | ~3.2s (Prettier)      | **~8ms (Biome)**           | **400x Faster** |
| **Type Checking**   | ~12.0s (tsc)          | **~200ms (Turbo + Cache)** | **60x Faster**  |
| **Build (UI Pack)** | ~2.5s (tsup)          | **~450ms (tsdown)**        | **5x Faster**   |

## Tech Stack

### Runtime & Orchestration

- **Runtime**: [Bun](https://bun.sh/) – Sub-millisecond startup, native TypeScript execution, and high-performance package management.
- **Orchestration**: [Turborepo 2](https://turbo.build/) – Intelligent task scheduling with aggressive local/remote caching.
- **Dependency Management**: **pnpm catalogs** – Unified version management across 11+ packages, ensuring zero version drift.

### Rust-Driven Toolchain

- **Linting & Formatting**: [Biome](https://biomejs.dev/) – Unified, ultra-fast toolchain replacing ESLint and Prettier. ~10ms for full-project analysis.
- **Deep Logic Analysis**: [Oxlint](https://oxc-project.github.io/) – High-performance Linter focusing on correctness, running 100x faster than ESLint.
- **Bundling**: [tsdown](https://github.com/rolldown/tsdown) – Next-gen bundler for shared packages, offering Rust-level build speeds via Rolldown.
- **Frontend Engine**: Next.js 15+ with **Turbopack** – Optimized for instant Hot Module Replacement (HMR).
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) – Zero-runtime CSS engine with native modern CSS support.
- **Automation Engine**: scripts-rs – A custom Rust-powered workspace controller. Handles dynamic package.json synchronization, environmental path switching (Dev/Build), and automated index generation for DB schemas and API routers.

### Backend & Data Layer

- **API Framework**: [Hono](https://hono.dev/) – Lightweight, Web-standard framework optimized for Bun.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) – Headless, type-safe ORM with automated migrations.
- **Validation**: [Zod](https://zod.dev/) – Shared schemas across frontend, backend, and database layers.

## Project Structure

```
├── scripts-rs/             # 🦀 The "Brain" - Rust-powered workspace controller & codegen
├── apps/
│   ├── web/                # Next.js (Main SSR Application)
│   ├── react-app/          # Vite + React (Client-side Dashboard)
│   └── server/             # Hono API (Edge-ready Backend via Bun)
├── packages/
│   ├── api/                # tRPC router definitions & business logic
│   ├── db/                 # Drizzle ORM, multi-step migrations & schemas
│   ├── auth/               # Unified Auth.js configuration & providers
│   ├── ui/                 # React 19 component library (Shadcn UI based)
│   ├── validators/         # Global Zod schemas for E2E validation
│   ├── utils/              # Shared high-performance TS utilities
│   └── tooling/            # Centrally managed configs (TS, Vite, Tailwind, Vitest)
├── turbo.json              # Topological task pipeline & caching rules
└── pnpm-workspace.yaml     # Workspace member definitions
```

## Development Workflow

```shell
# Start full-stack development (Next.js + Hono)
pnpm dev

# Trigger Full Turbo incremental build
pnpm build

# Millisecond-speed static analysis via Oxlint + Biome
pnpm lint

# Automatic fix and code cleanup
pnpm lint:fix

# Standardized code formatting
pnpm format

# Cross-package type safety check
pnpm typecheck

# Synchronize exports, generate API routers & DB schemas (Rust-powered)
pnpm codegen # Link to src/*.ts (Development)

# Prepare package.json for production distribution
pnpm codegen:build # Link to dist/*.d.mts (Production)
```

## Database Operations

```shell
# Generate SQL migrations based on Schema changes
pnpm db:generate

# Push Schema changes to local database (Development)
pnpm db:push

# Run idempotent database seeding
pnpm db:seed

# Launch Drizzle Studio
pnpm db:studio

```

## Architectural Principles

1. **Single Source of Truth (SSOT)**: Database Schemas, Zod Validators, and TS definitions are declared in packages/ and consumed everywhere. A schema change instantly propagates errors to the frontend via the build pipeline.

2. **Topological Pipeline**: Turborepo ensures strict task ordering. Modifying a DB schema automatically triggers db:generate before any dependent app build starts, keeping types always in sync.

3. **Standard-Based Source Redirect**: Uses Node.js standard exports in package.json to route development imports to `src/*.ts`. This eliminates tsconfig paths pollution and ensures unified resolution across Bun, Turbopack, and Rolldown.

4. **Rust-First Tooling**: Legacy Node.js tools are replaced by Rust-based alternatives (Biome, Oxlint, Rolldown). Static analysis for the entire codebase typically completes in under 20ms.

5. **Unified Code Quality**: Biome handles formatting and style, while Oxlint ensures deep code correctness. This duo provides a zero-config, ultra-fast quality gate.

6. **Dynamic Source Redirect**: Powered by scripts-rs, `package.json` exports are dynamically synchronized based on the environment. In Dev Mode, it routes to `src/*.ts` for instant HMR; in Build Mode, it redirects to `dist/*.d.mts` for production compliance.

7. **Self-Healing Architecture**: The Rust toolchain performs real-time Architecture Audits. It enforces strict dependency boundaries (e.g., UI packages are physically blocked from importing DB packages) and automatically organizes imports via Biome after code generation.

## Architecture Decision Records (ADR)

We maintain a rigorous record of architectural decisions to ensure long-term maintainability and technical clarity.

- **[ADR 001: Transitioning to Oxlint for High-Performance Static Analysis](docs/adr/001-transition-to-oxlint.md)**
- **[ADR 002: End-to-End Type Safety via Drizzle-Zod SSOT](docs/adr/002-drizzle-zod-ssot.md)**
- **[ADR 003: Monorepo Source Redirect for Seamless DX](docs/adr/003-source-redirect-mode.md)**
- **[ADR 004: Factory-Based Vite Configuration for Multi-App Consistency](docs/adr/004-factory-based-vite-config.md)**
- **[ADR 005: Transitioning to a Rust-First Engineering Toolchain](docs/adr/005-rust-toolchain-revolution.md)**

## 🦀 The "Crab-Gen" Automation Engine

Unlike traditional monorepos that rely on fragile manual configuration, this project uses a custom Rust-based controller (scripts-rs) to manage the workspace:

- **Zero-Config Exports**: Automatically scans `src/` and populates `package.json` exports.

- **Environment Awareness**: Switches between TypeScript source and `d.mts` declarations seamlessly.

- **Guardrail Enforcement**: Hard-coded architectural rules prevent circular dependencies and layer violations before code even hits the CI.

# Built with 🦀 by the Rust Toolchain Revolution.
