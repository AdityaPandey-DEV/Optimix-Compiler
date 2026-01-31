# 📘 Optimix Project Guide & C++ Concepts

This document provides a deep dive into the **Optimix Compiler** codebase and explains the modern C++ features used to build it. It is designed to help students and engineers understand *why* we used certain features.

---

## 🏗 Project Architecture

The compiler is built in **4 Stages**:

1.  **Lexer (`src/lexer`)**:
    *   Takes raw source code (strings) and converts them into **Tokens** (Words).
    *   *Example*: `int x = 5;` becomes `[KW_INT, IDENTIFIER("x"), ASSIGN, NUMBER(5), SEMICOLON]`.
2.  **Parser (`src/parser`)**:
    *   Takes Tokens and builds an **Abstract Syntax Tree (AST)**.
    *   *Example*: Creates a tree where `ASSIGN` is the root, `x` is the left child, and `5` is the right child.
3.  **IR Builder (`src/ir`)**:
    *   Converts the AST into **Intermediate Representation (IR)**.
    *   This is a flat, assembly-like list of instructions (e.g., `MOV t0, 5`).
4.  **Interpreter (`src/codegen`)**:
    *   Executes the IR instructions one by one, simulating a CPU.
    *   Uses `std::vector` to simulate memory (RAM).

---

## 🚀 Advanced C++ Concepts Explained

We use **Modern C++ (C++17)** to make the code safe, fast, and readable. Here are the key concepts:

### 1. `#pragma once`
*   **What it is**: A preprocessor directive found at the top of `.h` files.
*   **Why we use it**: It tells the compiler to include this file **only once** per compilation.
*   **Without it**: If `A.h` includes `B.h`, and `C.h` includes `B.h`, your main program including both A and C would try to define B twice, causing a "Redefinition Error".

### 2. `namespace optimix { ... }`
*   **What it is**: A wrapper around our code.
*   **Why we use it**: To prevent **Name Collisions**.
*   **Example**: If we define a class called `Parser`, and you include a library that *also* has a `Parser` class, they would clash. By wrapping ours in `namespace optimix`, our class becomes `optimix::Parser`, keeping it unique.

### 3. `enum class TokenType`
*   **What it is**: A "scoped enumeration".
*   **Old C++**: `enum Color { RED, BLUE };` lets you accidentally do `int x = RED;` (bad!).
*   **Modern C++**: `enum class` is strongly typed. You *must* use `TokenType::LPAREN`. You cannot accidentally compare it to an integer or another enum type. This prevents bugs.

### 4. Smart Pointers (`#include <memory>`)
We use `std::unique_ptr<T>` extensively in the AST.

*   **The Problem with `new/delete`**: In old C++, you had to manually `delete` every object. If you forgot -> **Memory Leak**.
*   **The Solution (`unique_ptr`)**:
    *   It owns the object.
    *   When the pointer goes out of scope (e.g., the function ends), it **automatically deletes** the object for you.
    *   **Ownership**: There can be only *one* `unique_ptr` to an object.
*   **Usage**:
    ```cpp
    std::unique_ptr<Expr> expr = std::make_unique<NumberExpr>(5);
    ```

### 5. `std::move()`
*   **What it is**: A way to transfer ownership of resources without copying them.
*   **Why we use it**: Since `unique_ptr` cannot be copied (because only one owner is allowed), we must *move* it to a new owner (like passing a child node to a parent node).
    ```cpp
    // Passes ownership of 'expr' to 'ReturnStmt'. 'expr' is now empty.
    return std::make_unique<ReturnStmt>(std::move(expr));
    ```

### 6. `dynamic_cast`
*   **What it is**: A way to check specific types at runtime in an inheritance hierarchy.
*   **Why we use it**: Our AST is a tree of `Stmt*` (base class). But specifically, we need to know if a statement is a `VarDecl` or a `WhileStmt`.
    ```cpp
    if (auto *loop = dynamic_cast<const WhileStmt *>(stmt)) {
        // It IS a loop! We can safely access loop->condition
    }
    ```
    If the cast fails, it returns `nullptr`, so we can skip it.

### 7. Virtual Memory (`std::vector` & `std::unordered_map`)
*   **Std::vector**: A dynamic array that resizes itself. We use it to simulate the Stack/Heap in our interpreter.
*   **Std::unordered_map**: A Hash Map. We use it for the **Symbol Table** (mapping variable names like `"x"` to their values like `42`).

---

## 🛠 Compilation Flags
*   `-std=c++17`: We force C++17 standard to use these modern features.
*   `-I include`: Tells the compiler to look in the `include` folder for header files.
