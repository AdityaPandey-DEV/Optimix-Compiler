# optimizing-mini-compiler-resume-guide

## Project Description (Resume Bullet Points)
*   **Optimix - Modular Mini Compiler in C++**: Designed and implemented a production-grade compiler pipeline from scratch, featuring **Lexical Analysis**, **Recursive Descent Parsing (AST)**, and **Semantic Analysis**.
*   **Optimization Engine**: Engineered an optimization pass manager supporting **Constant Folding** and **Dead Code Elimination** to reduce IR instruction count by ~15%.
*   **Systems Engineering**: Built a robust C++ ecosystem with **CMake**, **GoogleTest** (integration), and **Docker** for cross-platform reproducibility.
*   **Performance**: Utilized **std::string_view** and efficient memory management (smart pointers) to optimize compiler throughput.

## Interview Talking Points

### 1. Why C++?
> "I chose C++17 for its zero-cost abstractions and control over memory layout. Using `std::unique_ptr` for the AST prevents memory leaks without garbage collection overhead, duplicating how LLVM manages ownership."

### 2. Implementation Challenges
> "The expression parser was initially simple but failing on operator precedence. I refactored it to handle binary operators in a loop, effectively handling left-associativity for standard arithmetic."

### 3. Optimization Strategy
> "I separated the optimization phase from the parser. The AST is lowered to a CFG (Control Flow Graph) or linear IR, where passes like Constant Folding can iteratively simplify the code until convergence."

### 4. Code Quality
> "I strictly followed clean code principles: separated Lexer/Parser logic, used RAII, and implemented a comprehensive test suite to prevent regressions during the optimization phase development."
