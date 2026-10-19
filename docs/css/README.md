# CSS 复习清单

> 核心笔记：[layout-and-bfc.md](layout-and-bfc.md)

## 布局

| 主题 | 状态 | 关键问题 |
| --- | --- | --- |
| 盒模型 | ✅ | content-box / border-box、宽高计算 |
| BFC | ✅ | 触发条件、特性、应用 |
| margin 折叠 | ✅ | 父子、兄弟、空元素折叠 |
| 定位与包含块 | ✅ | static/relative/absolute/fixed/sticky |
| Flex | ✅ | 主轴、`flex` 简写、`min-width: auto` |
| Grid | ⬜ | 网格线、`fr`、`auto-fit`、区域布局 |
| 水平垂直居中 | ✅ | 至少 5 种方案与适用场景 |
| 两栏 / 三栏布局 | ⬜ | float、flex、grid、圣杯/双飞翼 |
| 响应式 | ⬜ | 媒体查询、容器查询、clamp |

## 层叠与渲染

| 主题 | 状态 | 关键问题 |
| --- | --- | --- |
| z-index 与层叠上下文 | ✅ | 触发条件、层叠顺序 |
| 选择器与优先级 | ⬜ | 权重计算、`!important` |
| 伪类与伪元素 | ⬜ | `:has()`、`::before`、`::marker` |
| transform / animation | ⬜ | 硬件加速、合成层 |
| 重排与重绘 | ✅ | 见 [../browser/rendering.md](../browser/rendering.md) |

## 移动端与适配

| 主题 | 状态 | 关键问题 |
| --- | --- | --- |
| 视口与 meta viewport | ⬜ | vw/vh、dvh、dpr |
| 1px 边框 | ⬜ | transform scale、box-shadow |
| 安全区 | ⬜ | `env(safe-area-inset-*)` |
| 动画性能 | ⬜ | 只改 transform/opacity、`will-change` |

## 面试前速记

- **盒模型**：标准模型宽度不含 padding/border；`border-box` 包含。
- **BFC**：独立布局上下文，能包含浮动、避免与浮动重叠、阻止与子元素 margin 折叠。
- **居中**：`flex + justify/align` 最通用；绝对定位 `inset: 0 + margin: auto`；`grid + place-items`。
- **z-index** 只在同一层叠上下文中比较。
- **sticky** 受最近滚动容器和祖先 `overflow` 影响。
- **性能**：能用 `transform`/`opacity` 就不要动布局属性。
