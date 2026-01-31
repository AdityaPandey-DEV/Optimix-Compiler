#include "optimix/codegen/Interpreter.h"
#include <iostream>

namespace optimix {

int Interpreter::execute(const FunctionAST &function) {
  environment.clear();
  memory.clear();
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
  if (auto *arrAcc = dynamic_cast<const ArrayAccessExpr *>(expr)) {
    if (memory.find(arrAcc->name) == memory.end())
      throw std::runtime_error("Segfault: Array " + arrAcc->name +
                               " not declared");
    int idx = evaluate(arrAcc->index.get());
    if (idx < 0 || idx >= memory[arrAcc->name].size())
      throw std::runtime_error("Segfault: Out of bounds");
    return memory[arrAcc->name][idx];
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
  if (auto *arrDecl = dynamic_cast<const ArrayDecl *>(stmt)) {
    memory[arrDecl->name] = std::vector<int>(arrDecl->size, 0);
  }
  if (auto *arrAssign = dynamic_cast<const ArrayAssignment *>(stmt)) {
    if (memory.find(arrAssign->name) == memory.end())
      throw std::runtime_error("Segfault: Array " + arrAssign->name +
                               " not declared");
    int idx = evaluate(arrAssign->index.get());
    int val = evaluate(arrAssign->value.get());
    if (idx < 0 || idx >= memory[arrAssign->name].size())
      throw std::runtime_error("Segfault: Out of bounds");
    memory[arrAssign->name][idx] = val;
  }
}

} // namespace optimix
