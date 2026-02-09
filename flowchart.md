# Optimix Compiler: Project Architecture

## 1. Problem Statement
Many students learn Compiler Design using automated tools (like Flex and Bison), which hide the actual internal working of a compiler.

The **Main Problem** is to understand what actually happens inside a compiler.
**Solution**: To solve this, the **Optimix** project builds a compiler **completely from scratch** using C++.
It demonstrates:
1.  **Lexing & Parsing**: Reading code without external tools.
2.  **Simulation**: Running code directly (Interpreter).
3.  **Optimization**: Making code faster using advanced math (SSA Form).

---

## 2. Detailed System Flowchart
This diagram represents the complete lifecycle of a program in Optimix, inspired by standard compiler design phases.

```mermaid
graph TD
    %% Styles
    classDef phase fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,rx:10,ry:10;
    classDef artifact fill:#fff3e0,stroke:#e65100,stroke-width:2px,stroke-dasharray: 5 5;
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px;
    classDef memory fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    %% Source
    User([User]) --> Source["Source Code (.optx)"]
    
    %% Phase 1: Lexical Analysis
    subgraph "Phase 1: Lexical Analysis (Lexer)"
        Source --> ReadChar[Read Characters]
        ReadChar --> RmWS[Remove Whitespace]
        RmWS --> Tokenize[Generate Tokens]
        Tokenize --> LexErr{"Valid?"}
        LexErr -- No --> ErrHandler[Error Handling]
        LexErr -- Yes --> Tokens["Token Stream"]
    end

    %% Phase 2: Syntax Analysis
    subgraph "Phase 2: Syntax Analysis (Parser)"
        Tokens --> CheckGrammar[Check Grammar Rules]
        CheckGrammar --> BuildAST["Build Parse Tree (AST)"]
        BuildAST --> SynErr{"Syntax OK?"}
        SynErr -- No --> ErrHandler
        SynErr -- Yes --> AST["Abstract Syntax Tree"]
    end
    
    %% Symbol Table Interaction
    Tokens -.-> SymTable[("Symbol Table")]
    AST -.-> SymTable

    %% Phase 3: Semantic & IR Gen
    subgraph "Phase 3: IR Generation (IRBuilder)"
        AST --> WalkAST[Walk AST]
        WalkAST --> GenTemps["Generate Temp Vars (t0, t1...)"]
        GenTemps --> GenQuad[Generate Quadruples/Instructions]
        GenQuad --> RawIR["Raw Intermediate Code"]
    end

    %% Phase 4: Optimization
    subgraph "Phase 4: Optimization (SSA)"
        RawIR --> AnalyzeCFG[Analyze Control Flow]
        AnalyzeCFG --> RenameVars["Rename Variables (SSA)"]
        RenameVars --> OptIR["Optimized IR (SSA Form)"]
    end

    %% Phase 5: Execution
    subgraph "Phase 5: Execution (IR Interpreter)"
        OptIR --> Fetch[Fetch Instruction]
        Fetch --> Decode{Decode OpCode}
        Decode --> Execute[Execute Logic/Math]
        Execute --> UpdateMem[Update Virtual Memory]
        UpdateMem --> Output[("Program Output")]
    end

    %% Styling classes
    class ReadChar,RmWS,Tokenize,CheckGrammar,BuildAST,WalkAST,GenTemps,GenQuad,AnalyzeCFG,RenameVars,Fetch,Decode,Execute,UpdateMem phase;
    class Source,Tokens,AST,RawIR,OptIR artifact;
    class ErrHandler error;
    class SymTable,Output memory;
```

---

## 3. Module Breakdown

### 3.1 Lexical Analysis (The Scanner)
*   **Goal**: specific reading of the source file.
*   **Actions**:
    *   Skips comments and whitespaces.
    *   Converts characters `i`, `n`, `t` into keyword token `int`.
    *   Converts `1`, `0`, `0` into number token `100`.
*   **Output**: A list of `Token` objects.

### 3.2 Syntax Analysis (The Parser)
*   **Goal**: Understanding the structure.
*   **Actions**:
    *   Ensures code follows the language grammar.
    *   Example: Checks that `if` is followed by `(...)` and then `{...}`.
    *   Constructs the **Abstract Syntax Tree (AST)**, which represents the code logic hierarchically.

### 3.3 IR Generation & Optimization
*   **Goal**: Simplifying and Improving.
*   **Actions**:
    *   **IR Builder**: Flattens the tree into a linear list of simple instructions (like Assembly).
    *   **SSA Optimizer**: Renames variables (`x` -> `x_1`, `x_2`) to make data flow explicit, simplifying further analysis.

### 3.4 Execution (The Virtual Machine)
*   **Goal**: Running the program.
*   **Actions**:
    *   The **IR Interpreter** acts as a virtual CPU.
    *   It fetches each IR instruction and performs the operation.
    *   It manages a virtual memory space for variables.

---
