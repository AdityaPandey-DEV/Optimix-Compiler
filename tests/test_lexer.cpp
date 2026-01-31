#include "optimix/lexer/Lexer.h"
#include <cassert>
#include <iostream>

void test_basic_tokens() {
  std::string source = "int main() { return 0; }";
  optimix::Lexer lexer(source);

  optimix::Token t1 = lexer.nextToken();
  assert(t1.type == optimix::TokenType::KW_INT);

  optimix::Token t2 = lexer.nextToken();
  assert(t2.type == optimix::TokenType::IDENTIFIER);
  assert(t2.text == "main");

  optimix::Token t3 = lexer.nextToken();
  assert(t3.type == optimix::TokenType::LPAREN);

  optimix::Token t4 = lexer.nextToken();
  assert(t4.type == optimix::TokenType::RPAREN);

  optimix::Token t5 = lexer.nextToken();
  assert(t5.type == optimix::TokenType::LBRACE);

  optimix::Token t6 = lexer.nextToken();
  assert(t6.type == optimix::TokenType::KW_RETURN);

  optimix::Token t7 = lexer.nextToken();
  assert(t7.type == optimix::TokenType::NUMBER);
  assert(t7.text == "0");

  optimix::Token t8 = lexer.nextToken();
  assert(t8.type == optimix::TokenType::SEMICOLON);

  optimix::Token t9 = lexer.nextToken();
  assert(t9.type == optimix::TokenType::RBRACE);

  optimix::Token t10 = lexer.nextToken();
  assert(t10.type == optimix::TokenType::END_OF_FILE);

  std::cout << "test_basic_tokens passed!\n";
}

int main() {
  test_basic_tokens();
  std::cout << "All Lexer tests passed.\n";
  return 0;
}
