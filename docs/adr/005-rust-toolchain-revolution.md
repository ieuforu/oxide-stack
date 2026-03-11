# ADR 005: Transitioning to a Rust-First Engineering Toolchain

## Status

Accepted

## Context

随着项目规模扩大，传统的 Node.js 生态工具（ESLint, Prettier, tsup）在处理大规模拓扑依赖时，其单线程、基于解释执行的特性成为了性能瓶颈。在开发过程中，保存代码后的校验等待时间严重中断了开发者的“心流”状态。同时，Monorepo 的 `package.json` 维护和跨包依赖约束（Guardrails）在纯 JS 环境下难以实现高性能的硬性闭环。

## Decision

我们决定彻底重构工具链，拥抱 **"The Rust Revolution"**。将核心构建、分析及自动化管理链路切换到高性能 Rust 原生工具。

### Toolchain Map:

- **Linter**: 使用 `Oxlint` 处理毫秒级深层逻辑扫描。
- **Formatter & Lint**: 使用 `Biome` 实现全仓库格式化与基础校验的一致性。
- **Bundler**: 引入 `tsdown` (Powered by `Rolldown`) 构建共享包。
- **Workspace Controller**: 自研 `scripts-rs` (Rust)，负责动态 `exports` 同步、架构准入审计以及自动代码生成。

## Rationale

1. **Parallel Execution (并行计算)**: 充分利用现代多核 CPU，通过 Rust 原生线程加速静态分析与文件 IO。
2. **Deterministic Automation**: 通过 Rust 编写工作区控制逻辑，确保 `package.json` 的 Dev/Build 路径切换具有强一致性，执行速度比 Node 脚本快数个量级。
3. **Architectural Guardrails**: 利用 Rust 直接解析工作区拓扑，在代码生成阶段进行依赖审计，物理层面上禁止非法引用（如 UI 包引用 DB 包）。
4. **Zero-Allocation AST**: Oxlint 具备零分配解析能力，极大地降低了内存占用与 GC 压力，使静态分析在百毫秒内完成。

## Consequences

- **Ultra-Fast Feedback Loop**: 反馈速度提升约 400 倍，从秒级缩短至 20ms 以内，实现“感知零延迟”。
- **Self-Healing DX**: 实现“生成即修复”，`scripts-rs` 在自动同步代码后静默调用 Biome 优化格式，确保代码始终符合规范。
- **Unified Path Resolution**: 消灭了复杂的 `tsconfig` paths 污染，通过动态生成的 Node.js 标准 Exports 实现了 Bun、Turbopack 与 Rolldown 的统一路径解析。
- **Production Safety**: 强制性的架构审计确保了生产环境产物的纯净，从源头上杜绝了后端代码或敏感逻辑泄露至前端包的风险。
