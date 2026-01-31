# Optix Grammar Specification

The Optix language follows a C-like grammar.

## Lexical Structure
- **Keywords**: `int`, `void`, `return`, `if`, `else`, `while`
- **Operators**: `+`, `-`, `*`, `/`, `=`, `==`, `!=`, `<`, `>`
- **Identifiers**: `[a-zA-Z_][a-zA-Z0-9_]*`
- **Numbers**: `[0-9]+`
- **Comments**: `// ...`

## Syntax Rules
```ebnf
program ::= function*

function ::= type identifier "(" args? ")" block

type ::= "int" | "void"

args ::= type identifier ("," type identifier)*

block ::= "{" statement* "}"

statement ::= return_stmt
            | var_decl
            | assignment
            | while_stmt
            | if_stmt (TODO)
            | expr_stmt (TODO)

return_stmt ::= "return" expression ";"

var_decl ::= type identifier "=" expression ";"

assignment ::= identifier "=" expression ";"

while_stmt ::= "while" "(" expression ")" block

expression ::= primary (op primary)*

primary ::= number | identifier | "(" expression ")"

op ::= "+" | "-" | "*" | "/" | "==" | "!=" | "<" | ">"
```
