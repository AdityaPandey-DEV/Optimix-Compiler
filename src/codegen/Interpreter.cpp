#include "optimix/codegen/Interpreter.h"
#include <iostream>

namespace optimix {

int Interpreter::execute(const FunctionAST &function) {
  environment.clear();
  try {
    for (const auto &stmt : function.body) {
      executeStmt(stmt.get());
    }
  } catch (int returnValue) {
    return returnValue;
  }
  return 0; // Default return
}

int Interpreter::evaluate(const Expr *expr) {
  if (auto *num = dynamic_cast<const NumberExpr *>(expr)) {
    return num->value;
  }
  if (auto *var = dynamic_cast<const VariableExpr *>(expr)) {
    if (environment.find(var->name) == environment.end()) {
      throw std::runtime_error("Undefined variable: " + var->name);
    }
    return environment[var->name];
  }
  if (auto *bin = dynamic_cast<const BinaryExpr *>(expr)) {
    int l = evaluate(bin->left.get());
    int r = evaluate(bin->right.get());
    if (bin->op == "+")
      return l + r;
    if (bin->op == "-")
      return l - r;
    if (bin->op == "*")
      return l * r;
    if (bin->op == "/")
      return r != 0 ? l / r : 0; // Simple div by zero protection
    if (bin->op == "<")
      return l < r;
    if (bin->op == ">")
      return l > r;
    if (bin->op == "==")
      return l == r;
    if (bin->op == "!=")
      return l != r;
  }
  throw std::runtime_error("Unknown expression type");
}

void Interpreter::executeStmt(const Stmt *stmt) {
  if (auto *ret = dynamic_cast<const ReturnStmt *>(stmt)) {
    int val = ret->value ? evaluate(ret->value.get()) : 0;
    throw val; // Throw return value to unwind stack (simple trick)
               // Note: For a real recursive compiler, we'd execute properly,
               // but for a single-function flat interpreter this works well.
  }
  if (auto *decl = dynamic_cast<const VarDecl *>(stmt)) {
    int val = decl->init ? evaluate(decl->init.get()) : 0;
    environment[decl->name] = val;
  }
  if (auto *assign = dynamic_cast<const Assignment *>(stmt)) {
    if (environment.find(assign->name) == environment.end()) {
      throw std::runtime_error("Undefined variable in assignment: " +
                               assign->name);
    }
    environment[assign->name] = evaluate(assign->value.get());
  }
  if (auto *print = dynamic_cast<const PrintStmt *>(stmt)) {
    std::cout << evaluate(print->value.get()) << "\n";
  }
  if (auto *loop = dynamic_cast<const WhileStmt *>(stmt)) {
    while (evaluate(loop->condition.get())) {
      for (const auto &s : loop->body) {
        executeStmt(s.get());
      }
    }
  }
}

} // namespace optimix
