# Optimix Compiler 🚀

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Language](https://img.shields.io/badge/language-C%2B%2B17-orange)
![Stage](https://img.shields.io/badge/stage-SSA--IR-purple)

**Optimix** is a high-performance, handcrafted compiler implementing modern optimization techniques found in industrial compilers like LLVM and GCC. It is built from scratch in C++17, featuring a custom 3-Address Code IR and **Static Single Assignment (SSA)** form.

## 🌟 Key Features (Placement Highlights)
*   **3-Stage Architecture**: Separation of Frontend (AST), Mid-end (IR), and Backend (Interpreter).
*   **Static Single Assignment (SSA)**: Implements variable versioning and dominance analysis for optimization.
*   **Control Flow Graph (CFG)**: Lowers structured code (`while`, `if`) into flat basic blocks with jump transitions.
*   **Operator Precedence Parsing**: Hand-written recursive descent parser handling complex mathematical expressions.
*   **Zero Dependencies**: Built with pure C++ Standard Library (no Flex/Bison/LLVM deps).

## 🛠 Architecture
1.  **Lexer**: Tokenizes source code (ignoring comments/whitespace).
2.  **Parser**: Builds an **Abstract Syntax Tree (AST)** using Operator Precedence.
3.  **IR Builder**: Lowers AST to **Linear IR** (3-Address Code).
4.  **Optimizer**:
    *   **SSA Pass**: Renames variables (`x` -> `x_1`, `x_2`) to enable data-flow analysis.
5.  **Interpreter**: Virtual Machine execution of the generated IR.

## 🚀 Quick Start
```bash
# Clone the repo
git clone https://github.com/AdityaPandey-DEV/Optimix-Compiler.git
cd optimix

# Compile the compiler
clang++ -std=c++17 -I include src/main.cpp src/lexer/Lexer.cpp src/parser/Parser.cpp src/codegen/Interpreter.cpp src/ir/IR.cpp src/ir/IRBuilder.cpp src/ir/SSA.cpp -o optimix

# Run an example
./optimix compile examples/factorial.optx
```

## 📝 Example Code (`factorial.optx`)
```c
int main() {
    int n = 5;
    int result = 1;
    int i = 1;

    // Complex loop with math
    while (i < n + 1) {
        result = result * i; // Multiplication binds tighter
        i = i + 1;
    }
    return result;
}
```
**Output**: `120`

## 👨‍💻 Author
**Aditya Pandey**
*Passionate about Systems Engineering and Compiler Design.*
