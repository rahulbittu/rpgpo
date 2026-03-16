# Subtask Output — Research Persistent Data Structures
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Persistent Data Structures Overview
Persistent data structures enable immutable updates by creating new versions that share unchanged parts of the original structure via **structural sharing**, minimizing memory overhead in functional programming where data cannot mutate.[2] They are key in languages like F# (with built-in `list`, `Map`, `Set`) and crates like Rust's `imbl`, supporting efficient functional pipelines without borrow checker issues.[2]

## Immutable Lists
Immutable lists in functional programming use **cons cells** (pairs of head and tail) for persistence: appending or updating creates a new list sharing the unchanged tail, achieving O(1) prepend and O(n) append with logarithmic sharing depth.[2]  
**TypeScript Example** (using nested objects for persistence):
```typescript
interface Cons<T> {
  head: T;
  tail: Cons<T> | null;
}

const emptyList: Cons<any> = null as any;

function cons<T>(head: T, tail: Cons<T> | null): Cons<T> {
  return { head, tail };
}

function append<T>(list: Cons<T> | null, item: T): Cons<T> | null {
  if (!list) return cons(item, emptyList);
  return cons(list.head, append(list.tail, item));
}

// Usage: New list shares structure
const list1 = cons(1, cons(2, emptyList));
const list2 = cons(0, list1);  // Shares tail with list1
```
This mirrors F#'s `list` behavior, where "modification" reuses nodes.[2]

## Immutable Trees
Persistent trees (e.g., binary search trees) update by copying the path from root to modified node (O(log n) new nodes), sharing the rest; ideal for versioned data in functional apps.[2] No recent TypeScript-specific tree examples found in results (searched "persistent trees TypeScript functional programming 2026"); general pattern uses recursive nodes.  
**TypeScript Example** (persistent binary tree):
```typescript
interface TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
}

function insert<T>(node: TreeNode<T> | null, value: T): TreeNode<T> | null {
  if (!node) return { value, left: null, right: null };
  if (value < node.value) {
    return { ...node, left: insert(node.left, value) };
  }
  return { ...node, right: insert(node.right, value) };
}
```
Supports functional transforms with sharing, similar to `imbl` crate trees in Rust.[2]

## Immutable Hash Maps
Persistent hash maps (e.g., hash array mapped tries or HAMTs) update in O(log n) by sharing unchanged buckets/paths; F#'s `Map` and Rust's `imbl::HashMap` exemplify this for functional state management.[2] No TypeScript
