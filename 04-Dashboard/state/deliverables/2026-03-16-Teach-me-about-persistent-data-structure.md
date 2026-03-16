# Teach me about persistent data structures and their use in functional programmin

**Domain:** learning | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Persistent Data Structures
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

## Synthesize Report on Persistent Data Structures
## Explanation

### Persistent Data Structures Overview
Persistent data structures are designed to maintain previous versions of themselves when modified, making them immutable. This immutability is achieved through **structural sharing**, where unchanged portions of the data structure are reused in new versions. This approach is crucial in functional programming, where data immutability is a core principle. Languages like F# and libraries such as Rust's `imbl` leverage these structures to handle data efficiently without mutation, which is particularly useful in concurrent and parallel computing environments.[2]

### Immutable Lists
Immutable lists are often implemented using **cons cells**, which consist of a head (the current element) and a tail (the rest of the list). This structure allows for efficient operations like prepending elements (O(1) complexity) while appending elements requires traversing the list (O(n) complexity). The use of cons cells enables structural sharing, where new lists can share the unchanged parts of old lists, minimizing memory usage.[2]

### Immutable Trees
Persistent trees, such as binary search trees, are updated by copying the path from the root to the modified node. This ensures that only the necessary parts of the tree are duplicated, maintaining efficiency. The complexity of updates in persistent trees is typically O(log n), where n is the number of nodes in the tree. This efficiency makes them suitable for applications requiring frequent updates and queries.[2]

## Examples

### Immutable Lists in TypeScript
Here's how you can implement immutable lists in TypeScript using cons cells:

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

### Immutable Trees in TypeScript
Here's a simple example of a persistent binary tree in TypeScript:

```typescript
interface TreeNode<T> {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
}

function insert<T>(node: TreeNode<T> | null, value: T): TreeNode<T> {
  if (node === null) {
    return { value, left: null, right: null };
  }
  if (value < node.value) {
    return { value: node.value, left: insert(node.left, value), right: node.right };
  } else {
    return { value: node.value, left: node.left, right: insert(node.right, value) };
  }
}

// Usage
const tree1 = insert(null, 3);
const tree2 = insert(tree1, 5);  // Shares structure with tree1
```

## Practice Questions
1. Explain how structural sharing in persistent data structures minimizes memory usage.
2. Implement a function to remove an element from an immutable list in TypeScript.
3. Describe the time complexity of inserting an element in a persistent binary search tree and why it is efficient.

## Further Reading
- "Purely Functional Data Structures" by Chris Okasaki, which provides an in-depth look at the theory and implementation of persistent data structures.
- Explore the F# documentation on immutable collections to understand how these concepts are applied in a functional programming language.
- Review Rust's `imbl` crate documentation for practical examples of persistent data structures in a systems programming context.