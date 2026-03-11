# ADR 003: Monorepo Source Redirect for Seamless DX

## Status

Accepted

## Context

在传统的 TypeScript Monorepo 中，当 `apps/web` 引用 `packages/ui` 时，构建工具（如 Vite 或 Turbopack）通常会去读取 `packages/ui/dist` 里的编译产物。
这导致了一个极其糟糕的开发体验：

1. **二次编译**：修改 UI 组件后，必须手动或通过 watch 运行 `build`，外部应用才能看到更新。
2. **调试困难**：由于引用的是编译后的 `.mjs`，点击“跳转到定义”会跳到混淆后的代码，而非源代码。
3. **缓存失效**：频繁的 `dist` 更新会导致 Turborepo 缓存频繁失效。

## Decision

我们决定采用 **"Source Redirect" (源码重定向)** 模式。
通过在各 `packages/*/package.json` 中配置特殊的导出字段，强制开发工具链（Bun, Vite, Turbopack, tsdown）直接读取 `src/*.ts` 源码。

### Implementation:

在 `package.json` 中定义 `exports`：

```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./src/index.ts"
      }
    }
  }
}
```

> 在生产构建（Production Build）时，打包工具（如 Rolldown/Vite）会根据 exports 协议优先处理代码压缩与转换，确保产物性能。”

## Rationale

1. **消除构建依赖 (Decoupling Build)**: 使得子包在开发环境下不再依赖 `build` 任务，彻底解决了“修改代码后必须先 build 才能生效”的陈旧流转模式。
2. **优化 IO 与内存 (Performance)**: 直接读取内存中的 TS 源码树，避免了频繁读写磁盘 `dist` 目录带来的 IO 开销。

## Consequences

- **Instant HMR**: 修改任何 Package 的源码，`apps/web` 都会实现毫秒级的热更新。
- **True SSOT**: 源码即是唯一的真相，彻底告别“忘记 build”导致的类型报错。
- **Enhanced Debugging**: IDE 会直接跳转到 TypeScript 源码，支持完美的断点调试。
- **Complexity**: 需要消费端工具链（如 Vite）具备解析 TS 源码的能力。
