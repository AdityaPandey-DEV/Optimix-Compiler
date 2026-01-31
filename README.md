# Optimix Compiler 🚀

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Language](https://img.shields.io/badge/language-C%2B%2B17-orange)
![Stage](https://img.shields.io/badge/stage-SSA--IR-purple)

**Optimix** is a high-performance, handcrafted compiler implementing modern optimization techniques found in industrial compilers like LLVM and GCC. It is built from scratch in C++17, featuring a custom 3-Address Code IR and **Static Single Assignment (SSA)** form.

## 🌟 Key Features (Placement Highlights)
*   **3-Stage Architecture**: Separation of Frontend (AST), Mid-end (IR), and Backend (Interpreter).
*   **Static Single Assignment (SSA)**: Implements variable versioning and dominance analysis for optimization.
*   **Memory Management**: Supports Stack Allocation (`int arr[10]`) and Heap Simulation for array storage.
*   **Intrinsic I/O**: Built-in `print()` statement for runtime output and debugging.
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
## 📥 Download & Installation
You don't need to build from source! Download the latest binary for your OS:

*   🐧 **Linux**: [Download `optimix`](https://github.com/AdityaPandey-DEV/Optimix-Compiler/raw/main/compiler/Linux/optimix)
*   🪟 **Windows**: [Download `optimix.exe`](https://github.com/AdityaPandey-DEV/Optimix-Compiler/raw/main/compiler/Windows/optimix.exe)
*   🍎 **macOS**: [Download `optimix`](https://github.com/AdityaPandey-DEV/Optimix-Compiler/raw/main/compiler/Mac/optimix)

### 🏃‍♂️ How to Run
1.  **Download** the compiler file above.
2.  **Move** it to a folder (e.g., `Downloads` or your project folder).
3.  **Run** it with your source code.

**On Linux/Mac:**
Open Terminal:
```bash
# Give permission (only needed once)
chmod +x optimix

# Run it
./optimix compile examples/factorial.optx
```

**On Windows:**
Open Command Prompt (cmd) or PowerShell:
```powershell
# Run it
.\optimix.exe compile examples\factorial.optx
```
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
```
**Output**: `120`

## 📊 Comprehensive Example (`comprehensive.optx`)
```c
int main() {
    int arr[10]; // Array Declaration
    int i = 0;
    
    // Fill array loop
    while (i < 5) {
        arr[i] = i * 10;
        i = i + 1;
    }

    // Print loop
    int j = 0;
    while (j < 5) {
        print(arr[j]); // Array Access & I/O
        j = j + 1;
    }
    return 0;
}
```
**Output**:
```
0
10
20
30
40
```

## 👨‍💻 Author
**Aditya Pandey**
*Passionate about Systems Engineering and Compiler Design.*
