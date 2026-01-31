#pragma once

#include <iostream>
#include <string>

namespace optimix {

enum class TokenType {
  END_OF_FILE,
  ERROR,

  // Literals
  IDENTIFIER,
  NUMBER,

  // Keywords
  KW_INT,
  KW_RETURN,
  KW_IF,
  KW_ELSE,
  KW_WHILE,
  KW_VOID,
  KW_PRINT, // New keyword

  // Operators & Punctuation
  PLUS,
  MINUS,
  STAR,
  SLASH,
  ASSIGN,
  EQ,     // ==
  NEQ,    // !=
  LT,     // <
  GT,     // >
  LPAREN, // (
  RPAREN, // )
  LBRACE, // {
  RBRACE, // }
  SEMICOLON,
  COMMA
};

struct Token {
  TokenType type;
  std::string text;
  int line;
  int column;

  std::string toString() const {
    return "Token(" + std::to_string((int)type) + ", '" + text + "')";
  }
};

} // namespace optimix
