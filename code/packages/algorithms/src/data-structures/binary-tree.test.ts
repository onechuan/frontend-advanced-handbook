import { describe, expect, it } from 'vitest'
import { inorder, levelOrder, maxDepth, preorder, TreeNode } from './binary-tree'

const buildTree = (): TreeNode<number> =>
  new TreeNode(
    4,
    new TreeNode(2, new TreeNode(1), new TreeNode(3)),
    new TreeNode(6, new TreeNode(5), new TreeNode(7)),
  )

describe('binary tree', () => {
  it('前序遍历（根左右）', () => {
    expect(preorder(buildTree())).toEqual([4, 2, 1, 3, 6, 5, 7])
    expect(preorder(null)).toEqual([])
  })

  it('中序遍历（左根右）', () => {
    expect(inorder(buildTree())).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(inorder(null)).toEqual([])
  })

  it('层序遍历（BFS）', () => {
    expect(levelOrder(buildTree())).toEqual([[4], [2, 6], [1, 3, 5, 7]])
    expect(levelOrder(null)).toEqual([])
  })

  it('最大深度', () => {
    expect(maxDepth(buildTree())).toBe(3)
    expect(maxDepth(new TreeNode(1))).toBe(1)
    expect(maxDepth(null)).toBe(0)
  })
})
