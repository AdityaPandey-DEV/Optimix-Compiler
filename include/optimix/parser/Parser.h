#pragma once

#include "optimix/ast/AST.h"
#include "optimix/lexer/Lexer.h"
#include <memory>
#include <vector>

namespace optimix {

class Parser {
public:
  Parser(Lexer &lexer);
  std::unique_ptr<FunctionAST> parseTopLevel();

private:
  Lexer &lexer;
  Token currentToken;

  void eat(TokenType type);

  std::unique_ptr<Expr> parsePrimary();
  std::unique_ptr<Expr> parseMultiplicative();
  std::unique_ptr<Expr> parseAdditive();
  std::unique_ptr<Expr> parseRelational();
  std::unique_ptr<Expr>
  parseExpression(); // Ensures public API remains consistent
  // parseExpression will just call parseRelational (lowest precedence)

  std::unique_ptr<Stmt> parseStatement();
  std::vector<std::unique_ptr<Stmt>> parseBlock();
};

} // namespace optimix
