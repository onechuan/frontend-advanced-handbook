# 算法与数据结构复习清单

> 代码：[`code/packages/algorithms`](../../code/packages/algorithms)
> 前端面试的算法通常不难，重点是把思路讲清楚、写出边界正确的代码、说明复杂度。

## 复杂度速查

| 复杂度 | 典型场景 |
| --- | --- |
| O(1) | 哈希表查找、栈/队列操作 |
| O(log n) | 二分查找、平衡树、堆操作 |
| O(n) | 一次遍历、双指针、哈希计数 |
| O(n log n) | 排序、分治、堆排序 |
| O(n²) | 双层循环、朴素字符串匹配 |
| O(2ⁿ) | 子集枚举、朴素递归 |
| O(n!) | 全排列 |

空间复杂度同样重要：递归栈、哈希表、结果数组都要算。

## 已实现主题

| 主题 | 状态 | 代码 |
| --- | --- | --- |
| 二分查找 | ✅ | [binary-search.ts](../../code/packages/algorithms/src/array/binary-search.ts) |
| 两数之和 | ✅ | [two-sum.ts](../../code/packages/algorithms/src/array/two-sum.ts) |
| 快速排序 | ✅ | [sort.ts](../../code/packages/algorithms/src/array/sort.ts) |
| 归并排序 | ✅ | [sort.ts](../../code/packages/algorithms/src/array/sort.ts) |
| 链表构建/反转/中点/判环 | ✅ | [linked-list.ts](../../code/packages/algorithms/src/data-structures/linked-list.ts) |
| LRU 缓存 | ✅ | [lru-cache.ts](../../code/packages/algorithms/src/data-structures/lru-cache.ts) |
| 二叉树遍历/深度 | ✅ | [binary-tree.ts](../../code/packages/algorithms/src/data-structures/binary-tree.ts) |
| 最小堆 | ✅ | [min-heap.ts](../../code/packages/algorithms/src/data-structures/min-heap.ts) |
| 栈与队列 | ⬜ | — |
| 哈希表 | ⬜ | — |
| 双指针 / 滑动窗口 | ⬜ | — |
| DFS / BFS | ⬜ | — |
| 动态规划 | ⬜ | — |
| 回溯 | ⬜ | — |
| 并查集 | ⬜ | — |
| Trie | ⬜ | — |
| 拓扑排序 | ⬜ | — |

## 核心模板

### 二分查找

```ts
let left = 0
let right = arr.length - 1
while (left <= right) {
  const mid = left + ((right - left) >> 1)
  if (arr[mid] === target) return mid
  if (arr[mid] < target) left = mid + 1
  else right = mid - 1
}
return -1
```

要点：循环不变量、区间开闭、`mid` 防溢出、边界与空数组。

### 快慢指针

```ts
let slow = head
let fast = head
while (fast !== null && fast.next !== null) {
  slow = slow.next
  fast = fast.next.next
}
```

用途：判环、找中点、找倒数第 k 个节点。

### BFS

```ts
const queue = [start]
const visited = new Set([start])
while (queue.length > 0) {
  const size = queue.length
  for (let i = 0; i < size; i++) {
    const node = queue.shift()!
    for (const next of neighbors(node)) {
      if (visited.has(next)) continue
      visited.add(next)
      queue.push(next)
    }
  }
}
```

用途：最短路径（无权图）、层序遍历、拓扑排序（配合入度）。

### DFS

```ts
function dfs(node: Node, visited: Set<Node>) {
  if (visited.has(node)) return
  visited.add(node)
  for (const next of neighbors(node)) dfs(next, visited)
}
```

注意递归深度；必要时改显式栈。

### 动态规划

1. 定义状态 `dp[i]` 的含义。
2. 找状态转移方程。
3. 确定初始条件与边界。
4. 确定遍历顺序。
5. 必要时做空间压缩。

## 刷题策略

- 按主题刷，不按题号刷；每个主题先掌握模板再做题。
- 每题写完后复述：暴力解 → 优化思路 → 复杂度 → 边界。
- 高频题优先：数组、字符串、链表、二叉树、哈希、双指针、滑动窗口、BFS/DFS、简单 DP。
- 面试时先沟通思路和复杂度，再写代码；写完主动跑样例与边界。
- 不会的最优解，可以先给可行解，再逐步优化。

## 常见边界

- 空数组 / 空链表 / 空树。
- 单元素、重复元素、负数、极值。
- 越界访问、循环终止条件。
- 递归栈溢出。
- 哈希冲突与键的可比较性。
- 原地修改是否允许。

## 面试前速记

- 看到「有序」先想二分、双指针。
- 看到「子数组/子串」先想滑动窗口、前缀和。
- 看到「第 k 个」想堆、快速选择。
- 看到「所有组合/排列」想回溯。
- 看到「最短路径」想 BFS（无权）或 Dijkstra（带权）。
- 看到「最近使用」想 LRU（哈希 + 双向链表）。
- 写出代码后，主动说时间与空间复杂度。
