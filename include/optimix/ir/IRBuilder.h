#pragma once

#include "optimix/ast/AST.h"
#include "optimix/ir/IR.h"
#include <map>

namespace optimix {

class IRBuilder {
public:
  std::unique_ptr<ir::Function> generate(const FunctionAST &ast);

private:
  ir::Function *currentFunc = nullptr;
  ir::BasicBlock *currentBB = nullptr;
  int tempCounter = 0;
  int labelCounter = 0;

  ir::Operand genExpr(const Expr *expr);
  void genStmt(const Stmt *stmt);

  std::string newTemp() { return "t" + std::to_string(tempCounter++); }
  std::string newLabel() { return "L" + std::to_string(labelCounter++); }

  void emit(ir::Instruction inst) {
    if (currentBB)
      currentBB->addInst(inst);
  }
};

} // namespace optimix
