# FE Agent — 前端面试复习 Monorepo

用「笔记 + 可运行 TypeScript 代码 + 单元测试」的方式系统复习前端面试知识。

- `code/`：按主题拆分的 TypeScript 包，代码可直接运行、可被测试验证。
- `docs/`：纯 Markdown 复习笔记，按知识域组织。
- 根目录用 **pnpm workspace** 统一管理依赖、脚本与版本（catalog）。

## 目录结构

```
fe-agent/
├── code/
│   └── packages/
│       ├── javascript/       # JS 核心机制与手写实现
│       ├── typescript/       # 类型体操与类型工具
│       ├── algorithms/       # 数据结构与算法
│       └── design-patterns/  # 设计模式
├── docs/
│   ├── javascript/           # 闭包、this、原型、事件循环、Promise
│   ├── typescript/           # 类型系统与类型体操
│   ├── css/                  # 布局、BFC、层叠上下文
│   ├── browser/              # 渲染流程、缓存
│   ├── network/              # HTTP/HTTPS、跨域
│   ├── framework/            # React / Vue
│   ├── engineering/          # 性能优化、构建工具
│   └── algorithms/           # 算法与数据结构索引
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

## 环境要求

- Node.js `^22.12.0 || ^24.0.0 || >=26.0.0`（Vitest 5 要求）
- pnpm 10+

## 常用命令

```bash
pnpm install        # 安装全部 workspace 依赖
pnpm test           # 递归运行所有包的测试
pnpm test:watch     # 根目录监听模式，扫描所有包
pnpm typecheck      # 递归执行 TypeScript 类型检查
pnpm check          # typecheck + test
```

只操作某个包：

```bash
pnpm --filter @fe-agent/javascript test
pnpm --filter @fe-agent/algorithms test:watch
```

## 约定

1. **代码全部使用 TypeScript**，测试文件命名为 `*.test.ts`，与实现放在同一目录。
2. 每个手写实现尽量包含：关键注释、边界条件、复杂度说明（适用时）。
3. 新增一个知识包：在 `code/packages/` 下新建目录，复制任一现有包的
   `package.json`、`tsconfig.json` 结构，改包名后执行 `pnpm install`。
4. 笔记统一使用 Markdown；每个知识域的 `README.md` 维护一份复习清单，
   完成一项就勾选，并链接到对应笔记与代码。
5. 笔记与代码互相引用：文档里给出代码路径，代码注释里标注对应文档。

## 从哪开始

打开 [docs/README.md](docs/README.md) 查看知识地图和 4 周复习路线。
