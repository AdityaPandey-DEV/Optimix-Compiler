#pragma once

#include "Token.h"
#include <string>
#include <string_view>

namespace optimix {

class Lexer {
public:
  Lexer(std::string_view source);

  Token nextToken();

private:
  char peek() const;
  char advance();
  bool match(char expected);
  void skipWhitespace();
  Token identifierOrKeyword();
  Token number();

  std::string_view m_source;
  size_t m_pos = 0;
  int m_line = 1;
  int m_column = 1;
};

} // namespace optimix
