## Explanation

### Structural vs. Nominal Typing

- **Structural Typing**: This type system checks compatibility based on the structure or shape of data rather than explicit declarations. TypeScript is a prime example, where types are determined by their members rather than their explicit names. This allows for more flexible code reuse and polymorphism.
  
- **Nominal Typing**: This system relies on explicit declarations and names to determine type compatibility. Rust uses nominal typing, emphasizing memory safety and explicitness with constructs like enums and structs. This ensures clear boundaries and immutability by default.

### Type Inference Algorithms (Hindley-Milner)

- **Hindley-Milner (HM)**: A foundational type inference algorithm used in languages like Haskell and ML. It allows for determining the most general type of expressions without requiring explicit type annotations. Modern languages like Swift and Crystal incorporate variants of HM to streamline development, offering clear syntax and early error detection.

### Dependent Types

- **Dependent Types**: These types depend on values, allowing for more expressive type systems that can encode more invariants in the type itself. Languages like Idris and Agda use dependent types to ensure more robust and error-free code by checking properties at compile time.

### Refinement Types

- **Refinement Types**: These types allow for specifying more precise constraints on data types, often used to enforce additional invariants beyond what is possible with standard type systems. They are useful for catching logical errors early in the development process.

### Gradual Typing

- **Gradual Typing**: This approach allows mixing of static and dynamic typing within the same program. It provides flexibility to developers by enabling them to choose which parts of the codebase should be statically typed and which should be dynamically typed, facilitating a smoother transition from dynamic to static typing.

## Examples

- **TypeScript (Structural Typing)**:
  ```typescript
  interface Point { x: number; y: number; }
  function logPoint(p: Point) { console.log(`${p.x}, ${p.y}`); }
  const point = { x: 1, y: 2 };
  logPoint(point); // Valid due to structural typing
  ```

- **Rust (Nominal Typing)**:
  ```rust
  struct Point { x: i32, y: i32 }
  fn log_point(p: Point) { println!("{}, {}", p.x, p.y); }
  let point = Point { x: 1, y: 2 };
  log_point(point); // Requires explicit struct
  ```

- **Hindley-Milner (Haskell)**:
  ```haskell
  add :: Num a => a -> a -> a
  add x y = x + y
  ```

## Practice Questions

1. How does structural typing enhance flexibility in TypeScript compared to nominal typing in Rust?
2. What are the benefits of using Hindley-Milner type inference in functional programming languages?
3. Provide an example of how dependent types can improve code correctness in a language like Idris.

## Further Reading

- **TypeScript Handbook on Structural Typing**: [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- **Rust Programming Language Book on Enums and Structs**: [Enums](https://doc.rust-lang.org/book/ch06-00-enums.html)
- **Algorithm W Tutorial for Hindley-Milner**: [Algorithm W](http://okmij.org/ftp/papers/AlgoM.pdf)

These resources will provide deeper insights and practical examples to better understand and apply these modern type systems.