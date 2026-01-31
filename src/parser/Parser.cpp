#include "optimix/parser/Parser.h"
#include <stdexcept>

namespace optimix {

Parser::Parser(Lexer &l) : lexer(l) { currentToken = lexer.nextToken(); }

void Parser::eat(TokenType type) {
  if (currentToken.type == type) {
    currentToken = lexer.nextToken();
  } else {
    throw std::runtime_error("Unexpected token: " + currentToken.text +
                             " expected: " + std::to_string((int)type));
  }
}

std::unique_ptr<Expr> Parser::parsePrimary() {
  if (currentToken.type == TokenType::NUMBER) {
    int val = std::stoi(currentToken.text);
    eat(TokenType::NUMBER);
    return std::make_unique<NumberExpr>(val);
  } else if (currentToken.type == TokenType::IDENTIFIER) {
    std::string name = currentToken.text;
    eat(TokenType::IDENTIFIER);
    return std::make_unique<VariableExpr>(name);
  }
  throw std::runtime_error("Unknown token in expression");
}

std::unique_ptr<Expr> Parser::parseMultiplicative() {
  auto left = parsePrimary();
  while (currentToken.type == TokenType::STAR ||
         currentToken.type == TokenType::SLASH) {
    std::string op = currentToken.text;
    eat(currentToken.type);
    auto right = parsePrimary();
    left = std::make_unique<BinaryExpr>(op, std::move(left), std::move(right));
  }
  return left;
}

std::unique_ptr<Expr> Parser::parseAdditive() {
  auto left = parseMultiplicative();
  while (currentToken.type == TokenType::PLUS ||
         currentToken.type == TokenType::MINUS) {
    std::string op = currentToken.text;
    eat(currentToken.type);
    auto right = parseMultiplicative();
    left = std::make_unique<BinaryExpr>(op, std::move(left), std::move(right));
  }
  return left;
}

std::unique_ptr<Expr> Parser::parseRelational() {
  auto left = parseAdditive();
  while (currentToken.type == TokenType::LT ||
         currentToken.type == TokenType::GT ||
         currentToken.type == TokenType::EQ ||
         currentToken.type == TokenType::NEQ) {
    std::string op = currentToken.text;
    eat(currentToken.type);
    auto right = parseAdditive();
    left = std::make_unique<BinaryExpr>(op, std::move(left), std::move(right));
  }
  return left;
}

std::unique_ptr<Expr> Parser::parseExpression() { return parseRelational(); }

std::unique_ptr<Stmt> Parser::parseStatement() {
  if (currentToken.type == TokenType::KW_RETURN) {
    eat(TokenType::KW_RETURN);
    auto expr = parseExpression();
    eat(TokenType::SEMICOLON);
    return std::make_unique<ReturnStmt>(std::move(expr));
  }

  if (currentToken.type == TokenType::KW_INT) {
    eat(TokenType::KW_INT);
    std::string name = currentToken.text;
    eat(TokenType::IDENTIFIER);
    eat(TokenType::ASSIGN);
    auto init = parseExpression();
    eat(TokenType::SEMICOLON);
    return std::make_unique<VarDecl>(name, std::move(init));
  }

  if (currentToken.type == TokenType::KW_WHILE) {
    eat(TokenType::KW_WHILE);
    eat(TokenType::LPAREN);
    auto cond = parseExpression();
    eat(TokenType::RPAREN);
    auto body = parseBlock();
    return std::make_unique<WhileStmt>(std::move(cond), std::move(body));
  }

  if (currentToken.type == TokenType::IDENTIFIER) {
    std::string name = currentToken.text;
    eat(TokenType::IDENTIFIER);
    if (currentToken.type == TokenType::ASSIGN) {
      eat(TokenType::ASSIGN);
      auto val = parseExpression();
      eat(TokenType::SEMICOLON);
      return std::make_unique<Assignment>(name, std::move(val));
    }
  }

  if (currentToken.type == TokenType::KW_PRINT) {
    eat(TokenType::KW_PRINT);
    eat(TokenType::LPAREN);
    auto expr = parseExpression();
    eat(TokenType::RPAREN);
    eat(TokenType::SEMICOLON);
    return std::make_unique<PrintStmt>(std::move(expr));
  }

  throw std::runtime_error("Unexpected token in statement: " +
                           currentToken.text);
}

std::vector<std::unique_ptr<Stmt>> Parser::parseBlock() {
  eat(TokenType::LBRACE);
  std::vector<std::unique_ptr<Stmt>> stmts;
  while (currentToken.type != TokenType::RBRACE &&
         currentToken.type != TokenType::END_OF_FILE) {
    stmts.push_back(parseStatement());
  }
  eat(TokenType::RBRACE);
  return stmts;
}

std::unique_ptr<FunctionAST> Parser::parseTopLevel() {
  // int main() { ... }
  eat(TokenType::KW_INT); // Return type
  std::string name = currentToken.text;
  eat(TokenType::IDENTIFIER);
  eat(TokenType::LPAREN);
  // Args...
  eat(TokenType::RPAREN);

  auto body = parseBlock();
  return std::make_unique<FunctionAST>(name, std::vector<std::string>{},
                                       std::move(body));
}

} // namespace optimix
