#include "optimix/ir/IRBuilder.h"

namespace optimix {

std::unique_ptr<ir::Function> IRBuilder::generate(const FunctionAST &ast) {
  auto func = std::make_unique<ir::Function>(ast.name);
  currentFunc = func.get();
  currentBB = currentFunc->createBlock("entry");

  for (const auto &stmt : ast.body) {
    genStmt(stmt.get());
  }

  return func;
}

ir::Operand IRBuilder::genExpr(const Expr *expr) {
  if (auto *num = dynamic_cast<const NumberExpr *>(expr)) {
    return ir::Operand::makeConst(num->value);
  }
  if (auto *var = dynamic_cast<const VariableExpr *>(expr)) {
    return ir::Operand::makeVar(var->name);
  }
  if (auto *bin = dynamic_cast<const BinaryExpr *>(expr)) {
    auto lhs = genExpr(bin->left.get());
    auto rhs = genExpr(bin->right.get());
    auto dest = ir::Operand::makeVar(newTemp());

    ir::OpCode op;
    if (bin->op == "+")
      op = ir::OpCode::ADD;
    else if (bin->op == "-")
      op = ir::OpCode::SUB;
    else if (bin->op == "*")
      op = ir::OpCode::MUL;
    else if (bin->op == "/")
      op = ir::OpCode::DIV;
    else if (bin->op == "<")
      op = ir::OpCode::LT;
    else if (bin->op == ">")
      op = ir::OpCode::GT;
    else if (bin->op == "==")
      op = ir::OpCode::EQ;
    else if (bin->op == "!=")
      op = ir::OpCode::NEQ;
    else
      op = ir::OpCode::ADD; // Default/Error

    emit(ir::Instruction(op, dest, lhs, rhs));
    return dest;
  }

  if (auto *arrAcc = dynamic_cast<const ArrayAccessExpr *>(expr)) {
    auto index = genExpr(arrAcc->index.get());
    auto dest = ir::Operand::makeVar(newTemp());
    // LOAD dest, arrName, index
    ir::Instruction inst(ir::OpCode::LOAD, dest);
    inst.operands = {ir::Operand::makeVar(arrAcc->name), index};
    emit(inst);
    return dest;
  }

  return ir::Operand::makeConst(0);
}

void IRBuilder::genStmt(const Stmt *stmt) {
  if (auto *ret = dynamic_cast<const ReturnStmt *>(stmt)) {
    auto val =
        ret->value ? genExpr(ret->value.get()) : ir::Operand::makeConst(0);
    emit(ir::Instruction::createRet(val));
  } else if (auto *assign = dynamic_cast<const Assignment *>(stmt)) {
    auto val = genExpr(assign->value.get());
    emit(ir::Instruction(ir::OpCode::MOV, ir::Operand::makeVar(assign->name),
                         val));
  } else if (auto *arrAssign = dynamic_cast<const ArrayAssignment *>(stmt)) {
    auto idx = genExpr(arrAssign->index.get());
    auto val = genExpr(arrAssign->value.get());
    // STORE arrName, idx, val
    ir::Instruction inst(ir::OpCode::STORE, {ir::Operand::CONSTANT, ""});
    inst.operands = {ir::Operand::makeVar(arrAssign->name), idx, val};
    emit(inst);
  } else if (auto *decl = dynamic_cast<const VarDecl *>(stmt)) {
    if (decl->init) {
      auto val = genExpr(decl->init.get());
      emit(ir::Instruction(ir::OpCode::MOV, ir::Operand::makeVar(decl->name),
                           val));
    }
  } else if (auto *arrDecl = dynamic_cast<const ArrayDecl *>(stmt)) {
    // ALLOCA arrName, size
    ir::Instruction inst(ir::OpCode::ALLOCA, {ir::Operand::CONSTANT, ""});
    inst.operands = {ir::Operand::makeVar(arrDecl->name),
                     ir::Operand::makeConst(arrDecl->size)};
    emit(inst);
  } else if (auto *loop = dynamic_cast<const WhileStmt *>(stmt)) {
    auto loopInfo = currentFunc->createBlock("loop_" + newLabel());
    auto bodyBB = currentFunc->createBlock("loop_body_" + newLabel());
    auto exitBB = currentFunc->createBlock("loop_exit_" + newLabel());

    // Jump to loop condition check
    emit(ir::Instruction::createBranch(
        ir::OpCode::JMP, ir::Operand::makeLabel(loopInfo->label)));

    // Loop Condition
    currentBB = loopInfo;
    auto cond = genExpr(loop->condition.get());
    emit(ir::Instruction::createCondBranch(
        ir::OpCode::JMP_IF, ir::Operand::makeLabel(bodyBB->label),
        cond)); // If true, body
    emit(ir::Instruction::createBranch(
        ir::OpCode::JMP, ir::Operand::makeLabel(exitBB->label))); // Else exit

    // Loop Body
    currentBB = bodyBB;
    for (const auto &s : loop->body) {
      genStmt(s.get());
    }
    // Jump back to condition
    emit(ir::Instruction::createBranch(
        ir::OpCode::JMP, ir::Operand::makeLabel(loopInfo->label)));

    // Exit
    currentBB = exitBB;
  } else if (auto *print = dynamic_cast<const PrintStmt *>(stmt)) {
    auto val = genExpr(print->value.get());
    // Instruction(OpCode o, Operand res) where res is unused for void
    // instructions? Our Instruction structure assumes 'result' is the
    // destination. For void ops, we can use a dummy.
    ir::Instruction inst(ir::OpCode::PRINT, {ir::Operand::CONSTANT, ""});
    inst.operands = {val};
    emit(inst);
  }
}

} // namespace optimix
