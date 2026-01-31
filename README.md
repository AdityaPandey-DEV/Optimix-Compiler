# Optimix — A Modular Mini Compiler with Optimization Passes

Optimix is a production-ready, modular mini compiler written in C++. It features a complete pipeline from Lexical Analysis to Code Generation, with a robust Optimization Engine.

## Features
- **Lexer & Parser**: Efficient tokenization and AST generation.
- **Semantic Analysis**: Type checking and scope verification.
- **IR Generation**: 3-Address Code (Quadruples).
- **Optimization**: Constant folding, Dead Code Elimination, and more.
- **Code Generation**: Target assembly generation.

## Project Structure
- \`src/\`: Source code implementation
- \`include/\`: Header files
- \`tests/\`: Unit tests
- \`examples/\`: Sample programs

## Build Instructions
```bash
mkdir build && cd build
cmake ..
make
./bin/optimix --help
```
