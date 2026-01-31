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
  Token currentToken;
  Lexer &lexer;

  void eat(TokenType type);
  std::unique_ptr<Expr> parseExpression();
  std::unique_ptr<Expr> parsePrimary();
  std::unique_ptr<Stmt> parseStatement();
  std::vector<std::unique_ptr<Stmt>> parseBlock();
};

} // namespace optimix
