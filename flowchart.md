# Optimix Compiler: Detailed Architecture

## Project Overview
Optimix follows the standard compiler design pipeline, transforming high-level source code into executable instructions.

## Detailed Flowchart

This diagram illustrates the complete compilation process, from Source Code to Machine Code.

```mermaid
graph TD
    classDef phase fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,stroke-dasharray: 5 5;
    classDef artifact fill:#333,stroke:#fff,stroke-width:2px,color:#fff;

    %% Source Code
    Source([Source Code .optx]) --> Lexer
    
    %% 1. Lexical Analysis
    subgraph "Lexical Analyzer (Scanner/Lexer)"
        Lexer(Lexer)
        LexerDetails[Remove Whitespaces<br/>Remove Comments<br/>Generate Tokens<br/>Update Symbol Table]
        Lexer --- LexerDetails
    end
    
    Lexer -->|Tokens| Parser
    Lexer -.->|Error| LexError(Lexical Errors)
    LexError -.-> ErrorHandler(Error Handling)

    %% 2. Syntax Analysis
    subgraph "Syntax Analysis (Parser)"
        Parser(Parser)
        ParserDetails[Grammar Checking<br/>Parse Tree<br/>AST Generation<br/>Syntax Error Handling]
        Parser --- ParserDetails
    end
    
    Parser -->|AST| Semantic
    Parser -.->|Error| SynError(Syntax Errors)
    SynError -.-> ErrorHandler

    %% 3. Semantic Analysis
    subgraph "Semantic Analysis"
        Semantic(Visitor + Symbol Table)
        SemanticDetails[Type Checking<br/>Scope Resolution<br/>Declaration Checking<br/>Semantic Error]
        Semantic --- SemanticDetails
    end
    
    Semantic -->|Validated AST| ICG
    Semantic -.->|Error| SemError(Semantic Errors)
    SemError -.-> ErrorHandler

    %% 4. Intermediate Code Generation
    subgraph "Intermediate Code Gen"
        ICG(IR Generator)
        ICGDetails[Three Address Code<br/>Temp Variables<br/>Machine Independent]
        ICG --- ICGDetails
    end
    
    ICG -->|IR| Optimizer

    %% 5. Code Optimization
    subgraph "Code Optimization"
        Optimizer(Optimizer)
        OptDetails[Constant Folding<br/>Dead Code Elimination<br/>Loop Optimization<br/>Strength Reduction]
        Optimizer --- OptDetails
    end
    
    Optimizer -->|Optimized IR| AssemblyGen

    %% 6. Assembly Code Generation
    subgraph "Assembly Code Generation"
        AssemblyGen(Assembly Generator)
        AsmDetails[x86-like ASM]
        AssemblyGen --- AsmDetails
    end
    
    AssemblyGen --> MachineCode([Machine Code / Executable])

    %% Styling
    class Source,MachineCode artifact;
    class Lexer,Parser,Semantic,ICG,Optimizer,AssemblyGen phase;
    class LexError,SynError,SemError,ErrorHandler error;
```

---

## Phase Breakdown

### 1. Lexical Analysis (Scanner)
*   **Input**: Source Code (Text)
*   **Tasks**:
    *   Scans code character by character.
    *   Removes whitespace and comments.
    *   Generates **Tokens** (Keywords, Identifiers, Operators).
    *   Updates the **Symbol Table**.
*   **Output**: Stream of Tokens.

### 2. Syntax Analysis (Parser)
*   **Input**: Tokens
*   **Tasks**:
    *   Checks against Grammar rules.
    *   Builds a **Parse Tree** or **Abstract Syntax Tree (AST)**.
    *   Handles Syntax Errors (e.g., missing semicolon).
*   **Output**: Abstract Syntax Tree (AST).

### 3. Semantic Analysis
*   **Input**: AST
*   **Tasks**:
    *   **Type Checking**: Ensures types match (e.g., `int + string` is invalid).
    *   **Scope Resolution**: Checks if variables are declared before use.
    *   **Declaration Checking**: Verifies function signatures.
*   **Output**: Validated / Annotated AST.

### 4. Intermediate Code Generation (ICG)
*   **Input**: Validated AST
*   **Tasks**:
    *   Converts AST to a linear sequence of instructions.
    *   Uses **Three Address Code** (e.g., `t1 = a + b`).
    *   Generates temporary variables.
    *   Keeps code **Machine Independent**.
*   **Output**: Intermediate Representation (IR).

### 5. Code Optimization
*   **Input**: IR
*   **Tasks**:
    *   **Constant Folding**: `3 + 5` -> `8`.
    *   **Dead Code Elimination**: Removes unused variables or unreachable code.
    *   **Loop Optimization**: Moves invariant code out of loops.
    *   **Strength Reduction**: Replaces expensive operations (multiply) with cheaper ones (shift).
*   **Output**: Optimized IR.

### 6. Assembly Code Generation
*   **Input**: Optimized IR
*   **Tasks**:
    *   Maps IR instructions to specific CPU instructions (e.g., x86 Assembly).
    *   Allocates registers.
*   **Output**: Assembly Code / Machine Code.
