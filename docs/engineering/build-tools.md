# 构建工具：Webpack 与 Vite

## 一句话回答

Webpack 是「一切皆模块」的打包器，通过 loader 转换文件、plugin 扩展构建流程；Vite 开发阶段利用浏览器原生 ESM **不做打包**，冷启动快，生产构建使用 Rollup。两者解决的核心问题都是：模块解析、资源转换、优化与产物输出。

## Webpack 核心概念

| 概念 | 作用 |
| --- | --- |
| entry | 入口，构建依赖图的起点 |
| output | 产物路径与文件名 |
| loader | 把非 JS 文件转换成模块（链式、从右到左） |
| plugin | 介入构建生命周期，做更复杂的事 |
| mode | development / production，影响内置优化 |
| devServer | 本地开发服务器，支持 HMR |
| module.rules | 匹配文件并应用 loader |
| resolve | 模块解析规则（extensions、alias） |
| optimization | 代码分割、Tree Shaking、压缩 |

```js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './index.html' })],
}
```

### loader 与 plugin 的区别

- **loader**：文件级转换，输入源码/资源，输出 JS 模块；如 `babel-loader`、`css-loader`。
- **plugin**：构建流程级扩展，通过钩子监听生命周期；如 `HtmlWebpackPlugin`、`MiniCssExtractPlugin`、`DefinePlugin`。
- loader 在 `module.rules` 中配置，plugin 在 `plugins` 数组中实例化。

### HMR

- 通过 WebSocket 通知浏览器哪些模块变化。
- 只替换变化模块，保留应用状态。
- 需要模块自身实现 `module.hot.accept`，框架 loader 通常已处理。

### Tree Shaking

依赖 ES Module 的静态结构：

1. 标记未使用的导出（usedExports）。
2. 生产模式下由压缩工具删除死代码。
3. `package.json` 的 `sideEffects: false` 告诉打包器可以安全删除无副作用模块。
4. 避免 CommonJS `require`、动态访问、顶层副作用。

### 代码分割

```js
// 动态导入
import('./module').then((module) => module.init())

// React
const Page = React.lazy(() => import('./Page'))

// 配置 splitChunks 提取公共依赖
optimization: {
  splitChunks: { chunks: 'all' }
}
```

### 文件名 hash

| hash | 范围 |
| --- | --- |
| `[hash]` | 整个 compilation，任一文件变化都会变 |
| `[chunkhash]` | 单个 chunk |
| `[contenthash]` | 文件内容，最精确，适合长期缓存 |

生产环境静态资源推荐 `[contenthash]` 配合 `Cache-Control: immutable`。

## Vite 原理

### 开发阶段

- 启动时不做全量打包，浏览器直接请求 ES Module。
- 依赖预构建（pre-bundling）：用 esbuild 把 CommonJS/深层依赖转成 ESM，减少请求数，缓存到 `node_modules/.vite`。
- 按需编译：浏览器请求哪个模块，服务器才编译哪个模块。
- HMR：基于模块图，精确到单模块更新，速度与项目规模基本解耦。
- 原生 ESM 的限制：裸模块需要重写路径，浏览器不支持 TypeScript/JSX，需要服务器转换。

### 生产阶段

- 使用 Rollup 打包（Vite 生态正在向 Rust 实现的 Rolldown 演进，具体以版本为准）。
- 产物仍然是传统静态资源，支持 Tree Shaking、代码分割、压缩。
- 可以通过插件扩展。

### 为什么 Vite 开发快

1. 不打包整个应用，只按需转换请求的模块。
2. esbuild 预构建依赖，速度快。
3. 缓存依赖与转换结果。
4. HMR 只更新变化的模块。

## Webpack 与 Vite 对比

| 维度 | Webpack | Vite |
| --- | --- | --- |
| 开发模式 | 先打包再启动 | 原生 ESM，按需编译 |
| 冷启动 | 随项目规模变慢 | 基本恒定 |
| HMR | 依赖打包图，通常较慢 | 模块级更新，很快 |
| 生产构建 | 自身打包 | Rollup（逐步接入 Rolldown） |
| 生态 | 成熟、插件极多 | 插件生态增长快，Vite 插件兼容 Rollup |
| 配置复杂度 | 高，灵活 | 低，约定优于配置 |
| 适用场景 | 复杂老项目、深度定制 | 新项目、现代框架 |

## Babel / SWC / esbuild

| 工具 | 语言 | 作用 |
| --- | --- | --- |
| Babel | JS | 语法转换、polyfill，生态成熟 |
| SWC | Rust | 高速替代 Babel（Next.js 等使用） |
| esbuild | Go | 极快的打包/转换，Vite 预构建使用 |

- 语法转换与 polyfill 是两件事：新 API（如 `Promise.any`）需要 core-js 等 polyfill，新语法由转换器降级。
- `browserslist` 决定目标浏览器与转换范围。

## Monorepo 相关

本仓库就是一个 pnpm workspace：

```yaml
# pnpm-workspace.yaml
packages:
  - "code/packages/*"

catalog:
  typescript: ^7.0.2
  vitest: ^5.0.5
```

- `workspace:*` 用于内部包互相依赖（本仓库暂无跨包依赖）。
- `catalog:` 统一依赖版本，避免各包版本漂移。
- `pnpm -r` 递归执行脚本。
- 优点：统一管理、代码复用、原子提交；缺点：构建缓存、权限与版本管理更复杂。
- 大型仓库可引入 Turborepo / Nx 做任务编排与缓存。

## 高频问题

**1. loader 和 plugin 的区别？**
loader 转换单个文件；plugin 监听构建生命周期，可修改产物、注入代码、做资源分析等。

**2. Tree Shaking 的前提？**
ES Module 静态导入导出、无副作用标记、生产模式压缩、避免 CommonJS 与动态访问。

**3. 为什么 Vite 开发快？**
不打包、按需编译、esbuild 预构建依赖、原生 ESM、模块级 HMR。

**4. Vite 生产环境为什么还要打包？**
原生 ESM 会产生大量请求、依赖转换成本高、需要 Tree Shaking/压缩/兼容旧浏览器，因此生产用 Rollup 打包。

**5. HMR 的原理？**
开发服务器监听文件变化，通过 WebSocket 推送更新模块；浏览器替换模块并执行 accept 回调，保留应用状态。

**6. 如何做持久化缓存？**
资源文件名带 contenthash、HTML 不缓存或协商缓存、CDN 长缓存、包拆分稳定。

## 易错点

- `[hash]` 与 `[contenthash]` 混用导致缓存失效。
- `sideEffects` 配置错误会误删有副作用的代码（如 polyfill、样式）。
- Vite 开发正常但生产报错：可能是 Rollup 与 esbuild 行为差异、CJS 兼容问题。
- 动态导入路径不能是纯运行时变量（无法静态分析）。
- 预构建缓存异常时，可删除 `node_modules/.vite` 重试。

## 延伸

- Module Federation 与微前端。
- 构建缓存（webpack filesystem cache、Turborepo remote cache）。
- 产物分析：webpack-bundle-analyzer、rollup-plugin-visualizer。
- 增量构建与 Rust 工具链（Rolldown、Rspack）。
