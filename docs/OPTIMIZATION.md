# Optimization Pipeline

Optimix includes a modular optimization engine designed to transform the Intermediate Representation (IR) for better performance.

## Pipeline Components

### 1. Constant Folding
Evaluates constant expressions at compile-time.
- **Input**: `x = 3 + 4;`
- **Output**: `x = 7;`

### 2. Dead Code Elimination (DCE)
Removes instructions that do not affect the program output.
- **Input**:
  ```c
  int a = 10;
  return 0; // a is never used
  ```
- **Output**: `Variable 'a' removed.`

### 3. Common Subexpression Elimination (CSE)
Identifies and reuses results of repeating expressions.
- **Input**: `x = a + b; y = a + b;`
- **Output**: `temp = a + b; x = temp; y = temp;`

## Future Work
- Loop Invariant Code Motion
- Peephole Optimization
- SSA (Static Single Assignment) Form construction
