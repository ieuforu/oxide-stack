# ADR 001: Transitioning to Oxlint for High-Performance Static Analysis

## Status

Accepted

## Context

随着 Monorepo 内 Packages 数量的增加，基于 Node.js 构建的传统 ESLint 在执行静态分析时表现出明显的性能退化。在本地开发（lint-staged）和 CI 流水线中，Lint 环节占据了不必要的等待时间，拖慢了整体的交付频率。

## Decision

我们决定引入基于 Rust 开发的 **Oxlint** 作为全仓库的核心逻辑校验工具（Logic Linter），并配合 **Biome** 处理代码格式化（Formatting）。

### Implementation Details:

- **Core Linter**: 使用 `oxlint` 执行深层逻辑扫描，主要关注代码正确性（Correctness）。
- **Fallback Strategy**: 仅在 Oxlint 无法覆盖的极少数框架特定规则下（如复杂的 React Hooks 边缘 Case）才按需调用原生 ESLint。

## Rationale

1. **极致性能 (Peak Performance)**: Oxlint 采用 Rust 编写，具备零分配（Zero-allocation）的 AST 解析能力。其实测速度比 ESLint 快 50-100 倍，可在 20ms 内完成全量扫描。
2. **降低心智负担 (Zero-Config)**: Oxlint 内置了超过 90% 的 ESLint 核心规则，无需维护臃肿且易冲突的 `.eslintrc` 配置文件。
3. **针对性校验**: 相比于 Biome 的 Lint，Oxlint 在捕获潜在运行时错误（如不安全的 Regex、未定义引用）方面更为深入。

| Tool       | Analysis Speed (Total Repo) |
| :--------- | :-------------------------- |
| ESLint     | ~12,400ms                   |
| **Oxlint** | **~18ms**                   |

## Consequences

- **Instant Feedback**: 结合 `lint-staged`，开发者在提交代码时几乎感知不到校验的存在，极大提升了开发心流。
- **CI Pipeline Optimization**: 显著缩减了 CI 中 `lint` 阶段的耗时，节省了计算资源。
- **Future Proofing**: 拥抱以 Rust 为代表的 Native Tooling 趋势，确保工具链在未来 3-5 年保持领先。
