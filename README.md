# Optimix Compiler

**Handcrafted optimizing compiler in C++17 — custom IR, Static Single Assignment (SSA), zero external dependencies.**

![C++17](https://img.shields.io/badge/C++-17-00599C?style=flat-square&logo=cplusplus&logoColor=white)
![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)

---

## What It Does

Optimix is a 3-stage compiler implementing optimization techniques from LLVM and GCC — built entirely from scratch with zero dependencies (no Flex, Bison, or LLVM).

**Technical Highlights:**
- **3-stage pipeline** — Frontend (AST) → Mid-end (IR) → Backend (Interpreter)
- **SSA form** — variable versioning and dominance analysis
- **Custom 3-Address Code IR** — linear intermediate representation
- **CFG lowering** — structured code → flat basic blocks with jump transitions
- **Recursive descent parser** — hand-written operator precedence parsing
- **Memory management** — stack allocation + heap simulation
- **Cross-platform** — pre-built binaries for Linux, macOS, Windows

## Architecture

```
Source (.optx) → Lexer → Parser (AST) → IR Builder (3-Address Code)
                                              → SSA Pass (x → x_1, x_2)
                                                    → Interpreter (VM execution)
```

## Tech Stack

| Component | Technology |
|---|---|
| Language | C++17 (pure standard library) |
| Build | CMake + Makefile |
| Parser | Hand-written recursive descent |
| IR | Custom 3-Address Code |
| Optimization | SSA with variable versioning |
| Web | WebAssembly playground |

## My Role

I designed the 3-stage compilation pipeline, chose SSA over basic data-flow analysis, defined the IR format, and planned the CFG lowering strategy. Code generation was accelerated using AI tools; compiler design decisions and cross-platform testing are mine.

## Quick Start

**Download pre-built binary:** [Linux](https://github.com/AdityaPandey-DEV/Optimix-Compiler/raw/main/compiler/Linux/optimix) · [macOS](https://github.com/AdityaPandey-DEV/Optimix-Compiler/raw/main/compiler/Mac/optimix) · [Windows](https://github.com/AdityaPandey-DEV/Optimix-Compiler/raw/main/compiler/Windows/optimix.exe)

```bash
chmod +x optimix
./optimix compile examples/factorial.optx   # Output: 120
```

**Build from source:**
```bash
git clone https://github.com/AdityaPandey-DEV/Optimix-Compiler.git && cd Optimix-Compiler
clang++ -std=c++17 -I include src/main.cpp src/lexer/Lexer.cpp src/parser/Parser.cpp \
  src/codegen/Interpreter.cpp src/ir/IR.cpp src/ir/IRBuilder.cpp src/ir/SSA.cpp -o optimix
```

---

<div align="center">

*Architected & built by [Aditya Pandey](https://github.com/AdityaPandey-DEV) — AI-augmented development*

</div>
