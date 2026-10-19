# 前端面试复习手册

> 代码在 [`code/`](../code)、可以运行、有测试；笔记在 `docs/`，负责知识体系与答题话术。
> 建议先看清单确认弱项，再读笔记，最后手写代码并跑测试。

## 用 Obsidian 阅读

推荐把 `docs/` 单独作为 vault 打开，避免 Obsidian 扫描根目录的 `node_modules`：

1. 安装 [Obsidian](https://obsidian.md)。
2. 打开 Obsidian，点击左下角的仓库图标 → **Open folder as vault（打开文件夹作为仓库）**。
3. 选择 `fe-agent/docs` 目录（即本文件所在目录）。
4. 点击「信任并打开」即可。

仓库已经附带 `docs/.obsidian/app.json`，默认行为：

- 新链接使用 Markdown 语法、相对路径；
- 附件统一放在 `docs/assets/`；
- 开启可读行宽。

建议再开启核心插件：**大纲（Outline）**、**反向链接（Backlinks）**、**关系图（Graph）**、**搜索**。
用 `Cmd/Ctrl + O` 可以快速跳转到任意笔记。

> 注意：笔记里指向 `../../code/...` 的源码链接超出了 vault 范围，Obsidian 无法直接打开。代码请用 VS Code / 终端查看。若想让 Obsidian 同时显示代码，可以把项目根目录作为 vault，但务必在「设置 → 文件与链接 → 排除的文件」中加入 `node_modules`、`.git`、`pnpm-lock.yaml`；`.ts` 文件仍建议在 IDE 中编辑。

## 怎么使用这个仓库

1. 打开各知识域的 `README.md`，按清单给自己打分（✅ 熟练 / 🟡 有印象 / ⬜ 不会）。
2. 对 ⬜ 和 🟡 的主题读对应笔记，合上后用自己的话复述一遍。
3. 打开代码包，遮住实现手写一遍，再运行测试验证。
4. 每个周末回滚一次错题与不熟悉的清单项。
5. 面试前一天只看「一句话回答」和「易错点」。

## 知识地图

| 知识域 | 入口 | 核心内容 |
| --- | --- | --- |
| JavaScript | [javascript/README.md](javascript/README.md) | 事件循环、原型、this、闭包、Promise、手写题 |
| TypeScript | [typescript/README.md](typescript/README.md) | 类型系统、条件类型、类型体操 |
| CSS | [css/README.md](css/README.md) | 盒模型、BFC、Flex/Grid、层叠上下文 |
| 浏览器 | [browser/README.md](browser/README.md) | 渲染流程、重排重绘、缓存 |
| 网络 | [network/README.md](network/README.md) | HTTP/HTTPS、HTTP/2/3、跨域、Cookie |
| 框架 | [framework/README.md](framework/README.md) | React、Vue 原理与性能 |
| 工程化 | [engineering/README.md](engineering/README.md) | 性能优化、Webpack/Vite |
| 算法 | [algorithms/README.md](algorithms/README.md) | 数据结构、排序、查找、链表、树、堆 |

## 4 周复习路线

**第 1 周：JavaScript 核心**

- 执行上下文、作用域链、闭包
- this 绑定、原型与原型链、继承
- 事件循环（浏览器与 Node）
- Promise / async-await
- 手写：debounce、throttle、deepClone、call/apply/bind、new、curry、EventEmitter、Promise

**第 2 周：浏览器、网络与 CSS**

- 从输入 URL 到页面展示
- DOM/CSSOM、渲染树、布局、绘制、合成
- HTTP 缓存、强缓存与协商缓存
- HTTP/1.1 → HTTP/2 → HTTP/3、HTTPS 握手
- 同源策略、CORS、Cookie 与 CSRF
- 盒模型、BFC、Flex/Grid、层叠上下文

**第 3 周：框架与工程化**

- React Fiber、Diff、Hooks、性能优化
- Vue 响应式、Diff、编译优化
- 性能指标与优化手段（LCP、INP、CLS）
- Webpack / Vite 原理与对比
- 构建产物、Tree Shaking、代码分割

**第 4 周：算法与模拟面试**

- 数组、链表、栈队列、哈希、树、堆
- 二分、排序、双指针、滑动窗口、DFS/BFS、DP
- 每天 2 道手写 + 1 道算法
- 录音回答高频题，控制在 2 分钟内讲清「是什么 → 原理 → 应用 → 注意点」

## 代码地图

| 包 | 内容 |
| --- | --- |
| [`@fe-agent/javascript`](../code/packages/javascript) | 手写题与 JS 核心机制 |
| [`@fe-agent/typescript`](../code/packages/typescript) | 手写工具类型、类型体操 |
| [`@fe-agent/algorithms`](../code/packages/algorithms) | 排序、查找、链表、LRU、树、堆 |
| [`@fe-agent/design-patterns`](../code/packages/design-patterns) | 单例、观察者、策略模式 |

常用命令：

```bash
pnpm test          # 全部测试
pnpm typecheck     # 全部类型检查
pnpm check         # 两者都跑
```

## 面试答题框架

回答任何一个技术问题，可以套用这个结构：

1. **一句话定义**：先给结论，让面试官知道你知道。
2. **原理/机制**：按「输入 → 处理 → 输出」或「触发条件 → 内部流程 → 结果」讲。
3. **应用场景**：结合项目举例，说明为什么用它。
4. **边界与易错点**：主动补充限制、性能代价、替代方案。
5. **延伸**：一句话连接到相关知识点，引导面试官继续问。

> 面试不是背书比赛。能画出图、写出最小可运行代码、讲清取舍，比堆术语更有说服力。
