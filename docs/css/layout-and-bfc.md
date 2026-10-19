# 盒模型、BFC 与布局

## 盒模型

每个元素都是一个盒子，由 `content + padding + border + margin` 组成。

```css
/* 标准盒模型：width 只包含 content */
.box {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 10px solid;
  /* 实际占用宽度 = 200 + 40 + 20 = 260px */
}

/* 常用：width 包含 padding 和 border */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

- `width`/`height` 的最小值受 `min-width`/`min-height` 约束；Flex/Grid 项目还需要注意自动最小尺寸。
- `margin` 可以为负；`padding` 不能。
- 百分比宽度相对包含块宽度，百分比高度的行为取决于父元素是否有确定高度。

## BFC（块级格式化上下文）

BFC 是一块独立的渲染区域，内部布局不会影响外部。

### 触发条件（常见）

- 根元素 `<html>`
- `float` 不为 `none`
- `position: absolute` / `fixed`
- `display: inline-block` / `flow-root` / `flex` / `grid` / `table-cell` 等
- `overflow` 不为 `visible`
- `contain: layout` / `paint` / `strict` / `content`
- `display: flow-root` 是最干净的方式（无副作用）

### 特性

1. **包含浮动**：BFC 会计算内部浮动元素的高度，父元素不会高度塌陷。
2. **不与浮动元素重叠**：BFC 区域不会与外部 float 重叠，可做自适应两栏。
3. **阻止 margin 折叠**：BFC 内部子元素的 margin 不会与外部（含父元素）折叠。
4. **独立布局**：内部元素的布局不影响外部。

### 应用

```css
/* 清除浮动：父元素创建 BFC */
.clearfix {
  display: flow-root;
}

/* 自适应两栏：左侧浮动，右侧创建 BFC 避免文字环绕 */
.sidebar {
  float: left;
  width: 200px;
}
.content {
  overflow: hidden; /* 或 display: flow-root */
}

/* 阻止父子 margin 折叠 */
.parent {
  display: flow-root;
}
```

## margin 折叠

垂直方向上相邻的 margin 会合并，取较大值。

| 场景 | 是否折叠 |
| --- | --- |
| 相邻兄弟元素 | ✅ 折叠 |
| 父元素与第一个/最后一个子元素 | ✅ 折叠（无 border/padding/内容阻挡时） |
| 空元素自身 | ✅ 上下 margin 折叠 |
| 水平方向 | ❌ 不折叠 |
| 浮动 / 绝对定位 / inline-block / BFC 元素 | ❌ 不折叠（不是普通流中的块级盒子） |

修复父子 margin 折叠：

- 父元素创建 BFC（`overflow: hidden` / `display: flow-root`）。
- 父元素加 `padding` 或 `border`。
- 子元素改为 `display: inline-block` 或浮动（会改变布局语义，慎用）。

## 定位与包含块

| 定位 | 参照 |
| --- | --- |
| `static` | 正常流，不参与定位 |
| `relative` | 相对自身原位置偏移，保留占位 |
| `absolute` | 最近的**已定位祖先**（position 非 static）的 padding box；没有则初始包含块 |
| `fixed` | 视口；祖先有 `transform`/`filter`/`perspective`/`will-change` 时，以该祖先为包含块 |
| `sticky` | 正常流占位，滚动到阈值后吸附；受最近滚动容器的 `overflow` 影响 |

```css
/* 绝对定位元素居中 */
.center {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}
```

`sticky` 失效的常见原因：

- 祖先 `overflow: hidden/auto/scroll`，导致滚动容器不是预期的。
- 没有设置 `top`/`bottom` 等阈值。
- 父元素高度不够，元素没有可吸附的空间。

## Flex 核心

```css
.container {
  display: flex;
  justify-content: space-between; /* 主轴对齐 */
  align-items: center;           /* 交叉轴对齐 */
  flex-wrap: wrap;
}

.item {
  flex: 1 1 0%; /* grow shrink basis */
  min-width: 0; /* 允许收缩到内容宽度以下 */
}
```

- `flex-direction` 决定主轴；`justify-content` 作用于主轴，`align-items` 作用于交叉轴。
- `flex: 1` 等价于 `flex: 1 1 0%`（不同浏览器历史实现有差异，推荐写完整）。
- Flex 项目的 `min-width` 默认是 `auto`，内容较长时不会收缩；常见修复是 `min-width: 0` 或 `overflow: hidden`。
- `flex` 项目创建了格式化上下文，但**不是**传统 BFC 的替代；它对浮动包含等行为需具体分析。

## 居中方案

```css
/* 1. Flex */
.parent { display: flex; justify-content: center; align-items: center; }

/* 2. Grid */
.parent { display: grid; place-items: center; }

/* 3. 绝对定位 + transform */
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 4. 绝对定位 + inset + margin auto（需要确定宽高） */
.child {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}

/* 5. line-height（单行文本） */
.parent { height: 40px; line-height: 40px; text-align: center; }
```

## z-index 与层叠上下文

`z-index` 只在**同一个层叠上下文**中比较。创建层叠上下文的常见方式：

- 根元素
- `position` 非 static 且 `z-index` 不为 auto
- `opacity` 小于 1
- `transform` / `filter` / `perspective` / `clip-path` 不为 none
- `isolation: isolate`
- Flex/Grid 子项且 `z-index` 不为 auto
- `will-change` 指定相关属性

层叠顺序（从低到高，简化）：

```text
背景/边框 → 负 z-index → 块级盒 → 浮动 → 行内盒 → z-index: 0/auto → 正 z-index
```

常见问题：父元素设置了 `transform`，子元素的 `position: fixed` 会相对父元素定位；`z-index` 再大也可能被另一个层叠上下文压住。

## 高频问题

**1. BFC 是什么？能解决什么问题？**
独立的块级渲染区域；解决高度塌陷、清除浮动、避免 margin 折叠、实现自适应两栏。

**2. 为什么 flex 子元素设置 `width` 不生效？**
可能被 `flex-basis`/`flex` 覆盖，或 `flex-shrink` 导致收缩；检查 `flex` 简写和 `min-width: auto`。

**3. `position: sticky` 不生效？**
检查阈值、父容器高度、祖先 overflow、滚动容器。

**4. 为什么 z-index 不生效？**
元素不是定位元素，或不在同一层叠上下文；先检查是否被祖先的层叠上下文限制。

**5. 两栏布局怎么做？**
flex 最常用；也可以左 float + 右 BFC；grid 用 `grid-template-columns: 200px 1fr`。

## 易错点

- `box-sizing` 不影响 margin。
- 百分比 margin/padding 都相对包含块**宽度**计算（即使 padding-top）。
- `absolute` 的包含块是祖先的 padding box，不是 content box。
- inline 元素设置宽高无效（`display: inline-block` 后有效）。
- `overflow: hidden` 会裁剪内容，也可能影响滚动容器与 sticky。
- `transform` 会创建新的包含块与层叠上下文。

## 延伸

- Grid 的 `auto-fit` / `minmax()` 自适应卡片布局。
- 容器查询 `@container`。
- 逻辑属性（`margin-inline`、`inset-inline`）。
- 现代 CSS：`:has()`、嵌套、`clamp()`、`dvh`。
