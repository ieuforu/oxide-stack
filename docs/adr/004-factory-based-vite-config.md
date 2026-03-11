# ADR 004: Factory-Based Vite Configuration for Multi-App Consistency

## Status

Accepted

## Context

在包含多个 React 应用（如 `apps/web`, `apps/react-app`）的 Monorepo 架构中，若每个应用独立维护其 `vite.config.ts`，会导致以下工程痛点：

1. **配置碎片化 (Configuration Drift)**: 插件配置、Tailwind 注入、以及 Build 优化策略在不同应用间产生碎片化差异。
2. **环境注入不统一**: 环境变量的加载逻辑（loadEnv）和全局常量定义（Define）实现不一致，导致调试困难。
3. **维护成本指数增长**: 每当需要升级 Vite 版本或调整 Terser 混淆策略时，必须手动同步修改所有子应用。

## Decision

我们决定在 `packages/vite-config`（或 tooling 层）实现一套 **“配置工厂模式 (Factory Pattern)”**。通过封装一个通用的 `createViteConfig` 函数，为所有子应用提供高度抽象且一致的构建基座。

```typescript
// 示例：子应用只需如此调用
export default createViteConfig(__dirname, {
  plugins: [customPlugin()],
  // 业务差异化配置
})
```

### Core Design Patterns:

- **Two-Dimensional Layering (双维度逻辑分层)**:
  - 使用 `command` 维度区分 **工程行为**（产物清理、SourceMap、Minification）。
  - 使用 `mode` 维度区分 **业务环境**（环境变量加载、生产/测试路径隔离）。
- **Root Steering (根目录锁定)**: 显式注入 `appDir` 参数，确保 Vite 进程在正确的子包工作区（CWD）解析 `index.html` 和 `.env`。
- **Global Injection & Shim**: 自动通过 `define` 将环境变量映射至 `process.env`，解决 legacy 依赖在纯 ESM 环境下的兼容性冲突。
- **Unified Aliasing**: 默认注入全仓库统一的路径映射（如 `@/` -> `src/`），确保跨包引用的一致性。

## Rationale

1. **DRY (Don't Repeat Yourself)**: 将 80% 的共有构建逻辑下沉到工具包，子应用只需声明式地传入 20% 的差异化配置。
2. **Standardization (强制规范化)**: 强制所有应用遵循相同的构建输出规范（如 `dist/prod`），为后续 CI/CD 自动化流水线提供可预测的路径。
3. **Enhanced Developer Experience (DX)**: 集成了色彩增强的控制台输出（Console Logger），自动提取子包名称并展示当前构建上下文，大幅降低调试门槛。

## Consequences

- **Rapid Scaffolding**: 创建新应用时，构建配置可秒级就绪，无需从零拷贝重复代码。
- **Centralized Maintenance**: 任何构建层面的优化（如启用 `manualChunks` 拆包策略）只需在工厂函数中修改一次，即可自动同步至全仓库。
- **Constraint**: 由于采用了抽象封装，若某个特殊应用需要极度个性化的 Vite 插件链，可能需要额外暴露 `override` 接口，这在一定程度上增加了工厂函数的复杂度。
