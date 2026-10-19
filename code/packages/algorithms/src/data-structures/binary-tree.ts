/**
 * 二叉树遍历：前序 / 中序 / 层序 / 最大深度。
 * 前序、中序使用显式栈；层序使用队列（BFS）。
 */
export class TreeNode<T> {
  constructor(
    public value: T,
    public left: TreeNode<T> | null = null,
    public right: TreeNode<T> | null = null,
  ) {}
}

export function preorder<T>(root: TreeNode<T> | null): T[] {
  const result: T[] = []
  const stack: TreeNode<T>[] = root === null ? [] : [root]

  while (stack.length > 0) {
    const node = stack.pop()
    if (node === undefined) break
    result.push(node.value)
    // 栈是后进先出，先压右子树才能先访问左子树
    if (node.right !== null) stack.push(node.right)
    if (node.left !== null) stack.push(node.left)
  }

  return result
}

export function inorder<T>(root: TreeNode<T> | null): T[] {
  const result: T[] = []
  const stack: TreeNode<T>[] = []
  let current = root

  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current)
      current = current.left
    }
    const node = stack.pop()
    if (node === undefined) break
    result.push(node.value)
    current = node.right
  }

  return result
}

export function levelOrder<T>(root: TreeNode<T> | null): T[][] {
  if (root === null) return []

  const result: T[][] = []
  const queue: TreeNode<T>[] = [root]

  while (queue.length > 0) {
    const level: T[] = []
    const size = queue.length
    for (let index = 0; index < size; index += 1) {
      const node = queue.shift()
      if (node === undefined) break
      level.push(node.value)
      if (node.left !== null) queue.push(node.left)
      if (node.right !== null) queue.push(node.right)
    }
    result.push(level)
  }

  return result
}

export function maxDepth<T>(root: TreeNode<T> | null): number {
  if (root === null) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}
