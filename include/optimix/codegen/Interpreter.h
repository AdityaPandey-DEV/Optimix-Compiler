#pragma once

#include "optimix/ast/AST.h"
#include <stdexcept>
#include <string>
#include <unordered_map>

namespace optimix {

class Interpreter {
public:
  int execute(const FunctionAST &function);

private:
  std::unordered_map<std::string, int> environment;

  int evaluate(const Expr *expr);
  void executeStmt(const Stmt *stmt);
};

} // namespace optimix
