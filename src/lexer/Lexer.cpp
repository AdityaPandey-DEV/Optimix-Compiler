#include "optimix/lexer/Lexer.h"
#include <cctype>
#include <unordered_map>

namespace optimix {

Lexer::Lexer(std::string_view source) : m_source(source) {}

char Lexer::peek() const {
  if (m_pos >= m_source.length())
    return '\0';
  return m_source[m_pos];
}

char Lexer::advance() {
  char current = peek();
  m_pos++;
  m_column++;
  if (current == '\n') {
    m_line++;
    m_column = 1;
  }
  return current;
}

bool Lexer::match(char expected) {
  if (peek() == expected) {
    advance();
    return true;
  }
  return false;
}

void Lexer::skipWhitespace() {
  while (true) {
    char c = peek();
    if (c == ' ' || c == '\t' || c == '\n' || c == '\r') {
      advance();
    } else if (c == '/' && m_pos + 1 < m_source.length() &&
               m_source[m_pos + 1] == '/') {
      // Comment
      while (peek() != '\n' && peek() != '\0') {
        advance();
      }
    } else {
      break;
    }
  }
}

Token Lexer::nextToken() {
  skipWhitespace();

  if (m_pos >= m_source.length()) {
    return {TokenType::END_OF_FILE, "", m_line, m_column};
  }

  char c = peek();
  int startColumn = m_column;

  if (isalpha(c) || c == '_') {
    Token t = identifierOrKeyword();
    t.column = startColumn;
    return t;
  }

  if (isdigit(c)) {
    Token t = number();
    t.column = startColumn;
    return t;
  }

  advance();
  switch (c) {
  case '+':
    return {TokenType::PLUS, "+", m_line, startColumn};
  case '-':
    return {TokenType::MINUS, "-", m_line, startColumn};
  case '*':
    return {TokenType::STAR, "*", m_line, startColumn};
  case '/':
    return {TokenType::SLASH, "/", m_line, startColumn};
  case '(':
    return {TokenType::LPAREN, "(", m_line, startColumn};
  case ')':
    return {TokenType::RPAREN, ")", m_line, startColumn};
  case '{':
    return {TokenType::LBRACE, "{", m_line, startColumn};
  case '}':
    return {TokenType::RBRACE, "}", m_line, startColumn};
  case ';':
    return {TokenType::SEMICOLON, ";", m_line, startColumn};
  case ',':
    return {TokenType::COMMA, ",", m_line, startColumn};
  case '=':
    if (match('='))
      return {TokenType::EQ, "==", m_line, startColumn};
    return {TokenType::ASSIGN, "=", m_line, startColumn};
  case '!':
    if (match('='))
      return {TokenType::NEQ, "!=", m_line, startColumn};
    return {TokenType::ERROR, "Unexpected character '!'", m_line, startColumn};
  case '<':
    return {TokenType::LT, "<", m_line, startColumn};
  case '>':
    return {TokenType::GT, ">", m_line, startColumn};

  default:
    break;
  }

  return {TokenType::ERROR, std::string(1, c), m_line, startColumn};
}

Token Lexer::identifierOrKeyword() {
  std::string text;
  while (isalnum(peek()) || peek() == '_') {
    text += advance();
  }

  static const std::unordered_map<std::string, TokenType> keywords = {
      {"int", TokenType::KW_INT},     {"return", TokenType::KW_RETURN},
      {"if", TokenType::KW_IF},       {"else", TokenType::KW_ELSE},
      {"while", TokenType::KW_WHILE}, {"void", TokenType::KW_VOID},
      {"print", TokenType::KW_PRINT}};

  if (keywords.find(text) != keywords.end()) {
    return {keywords.at(text), text, m_line, m_column};
  }

  return {TokenType::IDENTIFIER, text, m_line, m_column};
}

Token Lexer::number() {
  std::string text;
  while (isdigit(peek())) {
    text += advance();
  }
  return {TokenType::NUMBER, text, m_line, m_column};
}

} // namespace optimix
