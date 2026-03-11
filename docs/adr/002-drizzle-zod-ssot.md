# ADR 002: Achieving End-to-End Type Safety via Drizzle-Zod SSOT

## Status

Accepted

## Context

在传统全栈架构中，数据库表结构（SQL）、后端请求校验（Zod/Joi）以及前端组件类型（TypeScript Interfaces）往往是独立维护的。这种手工同步模式在项目规模扩大或频繁迭代时，会引发明显的“类型漂移”问题（Type Drift），导致字段缺失或类型不匹配的运行时错误在生产环境下才被发现。

## Decision

我们决定引入 `drizzle-zod` 库，建立以 **Drizzle Schema** 为核心的“单一事实源 (SSOT)”架构。所有的业务逻辑验证和前端类型定义必须直接或间接从数据库模型中衍生。

### Technical Workflow:

1. **Define**: 在 `packages/db` 中定义物理表结构。
2. **Derive**: 在 `packages/validators` 中使用 `createInsertSchema` 等工具自动生成 Zod Schemas。
3. **Consume**: 前端（`apps/web`）和 API（`apps/server`）直接引用这些衍生出的 Schema 和类型。

### Type Flow Diagram:

```
[ Database Schema ] (Source of Truth)
│
▼ (via drizzle-zod)
[ Zod Schemas ] (Validation Layer)
│
├─▶ [ Backend API ] (Request Parsing)
└─▶ [ Frontend UI ] (Form Types & API Client)

```

## Rationale

1. **自动同步与类型传播 (Type Propagation)**: 修改数据库字段后，下游的校验逻辑和前端 UI 绑定会在编译阶段自动抛出类型错误，实现“修改一处，全局响应”。
2. **消除代码冗余 (Dry Principle)**: 利用 Zod 的 `.extend()`、`.pick()` 和 `.omit()` 能力，开发者可以在原始数据库模型的基础上轻松定制业务专用的 DTO（数据传输对象），无需重复手写字段。
3. **零运行时开销 (Zero Runtime Overhead)**: 复杂的类型推导主要发生在 TypeScript 静态分析阶段，不会对生产环境的执行效率产生负面影响。

## Consequences

- **Robustness**: 极大地提升了系统健壮性，确保了“代码即契约（Code as Contract）”的开发范式。
- **Developer Velocity**: 开发者无需在多个文件间同步字段名，显著降低了心智负担。
- **Managed Coupling**: 尽管 `validators` 包与 `db` 包产生了逻辑耦合，但在 Monorepo 的 Workspace 协议管理下，这种依赖路径是清晰且可控的，符合领域驱动设计（DDD）的原则。
