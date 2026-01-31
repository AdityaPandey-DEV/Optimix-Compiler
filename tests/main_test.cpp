#include <iostream>

#include "test_lexer.h"

int main() {
  std::cout << "Running tests...\n";
  test_basic_tokens();
  std::cout << "All tests passed!\n";
  return 0;
}
