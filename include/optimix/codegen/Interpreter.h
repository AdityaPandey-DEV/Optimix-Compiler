#pragma once

#include "optimix/ast/AST.h"
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

namespace optimix {

class Interpreter {
public:
  int execute(const FunctionAST &function);

private:
  std::unordered_map<std::string, int> environment;
  std::unordered_map<std::string, std::vector<int>> memory;

  int evaluate(const Expr *expr);
  void executeStmt(const Stmt *stmt);
};

} // namespace optimix
