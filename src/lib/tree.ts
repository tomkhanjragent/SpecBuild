import { Member, TreeNode } from '../types/app.types';

/**
 * Builds the hierarchical tree structure for members within an app.
 * - Root nodes have parent_id === null.
 * - Active children are in node.children.
 * - Inactive children are in node.noWork (rendered inside the parent's No Work folder only).
 */
export function buildTree(members: Member[]): TreeNode[] {
  const byParent = new Map<string | null, Member[]>();

  for (const m of members) {
    const key = m.parent_id ?? null;
    if (!byParent.has(key)) {
      byParent.set(key, []);
    }
    byParent.get(key)!.push(m);
  }

  const make = (m: Member): TreeNode => {
    const rawChildren = byParent.get(m.id) ?? [];
    return {
      member: m,
      // Active direct children only
      children: rawChildren.filter((c) => c.status === 'active').map(make),
      // Inactive direct children only (per-parent No Work folder)
      noWork: rawChildren.filter((c) => c.status === 'no_work').map(make),
    };
  };

  return (byParent.get(null) ?? []).map(make);
}

/**
 * Returns all direct children of a given parent node
 */
export function getDirectChildren(members: Member[], parentId: string | null): Member[] {
  return members.filter((m) => (m.parent_id ?? null) === parentId);
}

/**
 * Returns all descendant IDs of a member recursively.
 */
export function getDescendantIds(members: Member[], memberId: string): Set<string> {
  const descendants = new Set<string>();
  const queue = [memberId];

  while (queue.length > 0) {
    const currId = queue.shift()!;
    const directChildren = members.filter((m) => m.parent_id === currId);
    for (const child of directChildren) {
      if (!descendants.has(child.id)) {
        descendants.add(child.id);
        queue.push(child.id);
      }
    }
  }

  return descendants;
}

/**
 * Validates whether memberId can be moved under targetParentId without causing cycles.
 * Returns true if valid, false if invalid (e.g. self or descendant).
 */
export function canMoveMember(
  members: Member[],
  memberId: string,
  targetParentId: string | null
): boolean {
  if (targetParentId === null) return true; // Moving to root is always cycle-safe
  if (targetParentId === memberId) return false; // Cannot be parent of oneself

  const descendants = getDescendantIds(members, memberId);
  if (descendants.has(targetParentId)) {
    return false; // Cannot move under own descendant
  }

  return true;
}

/**
 * Calculates direct active count for a node
 */
export function getDirectActiveCount(node: TreeNode): number {
  return node.children.length;
}

/**
 * Calculates total active count in the subtree
 */
export function getTotalActiveCount(node: TreeNode): number {
  let count = node.member.status === 'active' ? 1 : 0;
  for (const child of node.children) {
    count += getTotalActiveCount(child);
  }
  for (const nw of node.noWork) {
    count += getTotalActiveCount(nw);
  }
  return count;
}
