#include "serializer.h"
#include <iostream>

namespace optimix {
namespace api {

using J = JsonBuilder;

// ---- Token Serialization ----

static std::string tokenTypeName(TokenType type) {
  switch (type) {
  case TokenType::END_OF_FILE:
    return "END_OF_FILE";
  case TokenType::ERROR:
    return "ERROR";
  case TokenType::IDENTIFIER:
    return "IDENTIFIER";
  case TokenType::NUMBER:
    return "NUMBER";
  case TokenType::KW_INT:
    return "KW_INT";
  case TokenType::KW_RETURN:
    return "KW_RETURN";
  case TokenType::KW_IF:
    return "KW_IF";
  case TokenType::KW_ELSE:
    return "KW_ELSE";
  case TokenType::KW_WHILE:
    return "KW_WHILE";
  case TokenType::KW_VOID:
    return "KW_VOID";
  case TokenType::KW_PRINT:
    return "KW_PRINT";
  case TokenType::PLUS:
    return "PLUS";
  case TokenType::MINUS:
    return "MINUS";
  case TokenType::STAR:
    return "STAR";
  case TokenType::SLASH:
    return "SLASH";
  case TokenType::ASSIGN:
    return "ASSIGN";
  case TokenType::EQ:
    return "EQ";
  case TokenType::NEQ:
    return "NEQ";
  case TokenType::LT:
    return "LT";
  case TokenType::GT:
    return "GT";
  case TokenType::LPAREN:
    return "LPAREN";
  case TokenType::RPAREN:
    return "RPAREN";
  case TokenType::LBRACE:
    return "LBRACE";
  case TokenType::RBRACE:
    return "RBRACE";
  case TokenType::LBRACKET:
    return "LBRACKET";
  case TokenType::RBRACKET:
    return "RBRACKET";
  case TokenType::SEMICOLON:
    return "SEMICOLON";
  case TokenType::COMMA:
    return "COMMA";
  default:
    return "UNKNOWN";
  }
}

std::string serializeToken(const Token &tok) {
  return J::object({{"type", J::string(tokenTypeName(tok.type))},
                    {"text", J::string(tok.text)},
                    {"line", J::number(tok.line)},
                    {"column", J::number(tok.column)}});
}

std::string serializeTokens(const std::vector<Token> &tokens) {
  std::vector<std::string> items;
  for (const auto &tok : tokens) {
    items.push_back(serializeToken(tok));
  }
  return J::array(items);
}

// ---- AST Serialization ----

std::string serializeExpr(const Expr *expr) {
  if (!expr)
    return "null";

  if (auto *num = dynamic_cast<const NumberExpr *>(expr)) {
    return J::object({{"type", J::string("NumberExpr")},
                      {"value", J::number(num->value)}});
  }

  if (auto *var = dynamic_cast<const VariableExpr *>(expr)) {
    return J::object({{"type", J::string("VariableExpr")},
                      {"name", J::string(var->name)}});
  }

  if (auto *bin = dynamic_cast<const BinaryExpr *>(expr)) {
    return J::object({{"type", J::string("BinaryExpr")},
                      {"op", J::string(bin->op)},
                      {"left", serializeExpr(bin->left.get())},
                      {"right", serializeExpr(bin->right.get())}});
  }

  if (auto *arr = dynamic_cast<const ArrayAccessExpr *>(expr)) {
    return J::object({{"type", J::string("ArrayAccessExpr")},
                      {"name", J::string(arr->name)},
                      {"index", serializeExpr(arr->index.get())}});
  }

  return "null";
}

std::string serializeStmt(const Stmt *stmt) {
  if (!stmt)
    return "null";

  if (auto *ret = dynamic_cast<const ReturnStmt *>(stmt)) {
    return J::object({{"type", J::string("ReturnStmt")},
                      {"value", serializeExpr(ret->value.get())}});
  }

  if (auto *decl = dynamic_cast<const VarDecl *>(stmt)) {
    return J::object({{"type", J::string("VarDecl")},
                      {"name", J::string(decl->name)},
                      {"init", serializeExpr(decl->init.get())}});
  }

  if (auto *assign = dynamic_cast<const Assignment *>(stmt)) {
    return J::object({{"type", J::string("Assignment")},
                      {"name", J::string(assign->name)},
                      {"value", serializeExpr(assign->value.get())}});
  }

  if (auto *arrDecl = dynamic_cast<const ArrayDecl *>(stmt)) {
    return J::object({{"type", J::string("ArrayDecl")},
                      {"name", J::string(arrDecl->name)},
                      {"size", J::number(arrDecl->size)}});
  }

  if (auto *arrAssign = dynamic_cast<const ArrayAssignment *>(stmt)) {
    return J::object(
        {{"type", J::string("ArrayAssignment")},
         {"name", J::string(arrAssign->name)},
         {"index", serializeExpr(arrAssign->index.get())},
         {"value", serializeExpr(arrAssign->value.get())}});
  }

  if (auto *loop = dynamic_cast<const WhileStmt *>(stmt)) {
    std::vector<std::string> bodyItems;
    for (const auto &s : loop->body) {
      bodyItems.push_back(serializeStmt(s.get()));
    }
    return J::object({{"type", J::string("WhileStmt")},
                      {"condition", serializeExpr(loop->condition.get())},
                      {"body", J::array(bodyItems)}});
  }

  if (auto *print = dynamic_cast<const PrintStmt *>(stmt)) {
    return J::object({{"type", J::string("PrintStmt")},
                      {"value", serializeExpr(print->value.get())}});
  }

  return "null";
}

std::string serializeAST(const FunctionAST *ast) {
  if (!ast)
    return "null";

  std::vector<std::string> bodyItems;
  for (const auto &stmt : ast->body) {
    bodyItems.push_back(serializeStmt(stmt.get()));
  }

  std::vector<std::string> argItems;
  for (const auto &arg : ast->args) {
    argItems.push_back(J::string(arg));
  }

  return J::object({{"type", J::string("FunctionAST")},
                    {"name", J::string(ast->name)},
                    {"args", J::array(argItems)},
                    {"body", J::array(bodyItems)}});
}

// ---- IR Serialization ----

static std::string operandTypeName(ir::Operand::Type type) {
  switch (type) {
  case ir::Operand::VARIABLE:
    return "VARIABLE";
  case ir::Operand::CONSTANT:
    return "CONSTANT";
  case ir::Operand::LABEL:
    return "LABEL";
  default:
    return "UNKNOWN";
  }
}

static std::string opCodeName(ir::OpCode op) {
  switch (op) {
  case ir::OpCode::ADD:
    return "ADD";
  case ir::OpCode::SUB:
    return "SUB";
  case ir::OpCode::MUL:
    return "MUL";
  case ir::OpCode::DIV:
    return "DIV";
  case ir::OpCode::MOV:
    return "MOV";
  case ir::OpCode::LT:
    return "LT";
  case ir::OpCode::GT:
    return "GT";
  case ir::OpCode::EQ:
    return "EQ";
  case ir::OpCode::NEQ:
    return "NEQ";
  case ir::OpCode::JMP:
    return "JMP";
  case ir::OpCode::JMP_IF:
    return "JMP_IF";
  case ir::OpCode::PHI:
    return "PHI";
  case ir::OpCode::RET:
    return "RET";
  case ir::OpCode::PRINT:
    return "PRINT";
  case ir::OpCode::CALL:
    return "CALL";
  case ir::OpCode::ALLOCA:
    return "ALLOCA";
  case ir::OpCode::LOAD:
    return "LOAD";
  case ir::OpCode::STORE:
    return "STORE";
  default:
    return "UNKNOWN";
  }
}

std::string serializeOperand(const ir::Operand &op) {
  return J::object({{"type", J::string(operandTypeName(op.type))},
                    {"value", J::string(op.value)},
                    {"version", J::number(op.version)}});
}

std::string serializeInstruction(const ir::Instruction &inst) {
  std::vector<std::string> ops;
  for (const auto &op : inst.operands) {
    ops.push_back(serializeOperand(op));
  }

  return J::object({{"op", J::string(opCodeName(inst.op))},
                    {"result", serializeOperand(inst.result)},
                    {"operands", J::array(ops)},
                    {"text", J::string(inst.toString())}});
}

std::string serializeBasicBlock(const ir::BasicBlock *bb) {
  if (!bb)
    return "null";

  std::vector<std::string> insts;
  for (const auto &inst : bb->instructions) {
    insts.push_back(serializeInstruction(inst));
  }

  // Predecessors
  std::vector<std::string> preds;
  for (const auto *p : bb->preds) {
    preds.push_back(J::string(p->label));
  }

  // Successors
  std::vector<std::string> succs;
  for (const auto *s : bb->succs) {
    succs.push_back(J::string(s->label));
  }

  return J::object({{"label", J::string(bb->label)},
                    {"instructions", J::array(insts)},
                    {"preds", J::array(preds)},
                    {"succs", J::array(succs)}});
}

std::string serializeIR(const ir::Function *func) {
  if (!func)
    return "null";

  std::vector<std::string> blocks;
  for (const auto &bb : func->blocks) {
    blocks.push_back(serializeBasicBlock(bb.get()));
  }

  return J::object(
      {{"name", J::string(func->name)}, {"blocks", J::array(blocks)}});
}

// ---- Execution Steps Serialization ----

std::string serializeExecutionStep(const ExecutionStep &step) {
  // Registers
  std::vector<std::string> regItems;
  for (const auto &kv : step.registers) {
    regItems.push_back(J::string(kv.first) + ":" + J::number(kv.second));
  }
  std::string regsJson = "{";
  for (size_t i = 0; i < regItems.size(); ++i) {
    if (i > 0) regsJson += ",";
    regsJson += regItems[i];
  }
  regsJson += "}";

  // Memory (arrays)
  std::vector<std::string> memItems;
  for (const auto &kv : step.memory) {
    std::vector<std::string> cells;
    for (int val : kv.second) {
      cells.push_back(J::number(val));
    }
    memItems.push_back(J::string(kv.first) + ":" + J::array(cells));
  }
  std::string memJson = "{";
  for (size_t i = 0; i < memItems.size(); ++i) {
    if (i > 0) memJson += ",";
    memJson += memItems[i];
  }
  memJson += "}";

  // Output
  std::vector<std::string> outItems;
  for (const auto &line : step.output) {
    outItems.push_back(J::string(line));
  }

  std::vector<std::pair<std::string, std::string>> fields = {
      {"blockLabel", J::string(step.blockLabel)},
      {"instructionIndex", J::number(step.instructionIndex)},
      {"opCode", J::string(step.opCode)},
      {"registers", regsJson},
      {"memory", memJson},
      {"output", J::array(outItems)},
      {"hasReturn", J::boolean(step.hasReturn)},
      {"returnValue", J::number(step.returnValue)}};

  return J::object(fields);
}

std::string serializeExecutionResult(const ExecutionResult &result) {
  std::vector<std::string> outItems;
  for (const auto &line : result.output) {
    outItems.push_back(J::string(line));
  }

  std::vector<std::string> stepItems;
  for (const auto &step : result.steps) {
    stepItems.push_back(serializeExecutionStep(step));
  }

  return J::object({{"returnValue", J::number(result.returnValue)},
                    {"output", J::array(outItems)},
                    {"steps", J::array(stepItems)}});
}

// ---- Full Pipeline Result ----

std::string serializeFullResult(const std::string &tokensJson,
                                const std::string &astJson,
                                const std::string &rawIRJson,
                                const std::string &ssaIRJson,
                                const ExecutionResult &execResult,
                                bool success, const std::string &error) {
  std::vector<std::string> outItems;
  for (const auto &line : execResult.output) {
    outItems.push_back(J::string(line));
  }

  std::vector<std::string> stepItems;
  for (const auto &step : execResult.steps) {
    stepItems.push_back(serializeExecutionStep(step));
  }

  return J::object({{"success", J::boolean(success)},
                    {"error", J::string(error)},
                    {"tokens", tokensJson},
                    {"ast", astJson},
                    {"rawIR", rawIRJson},
                    {"ssaIR", ssaIRJson},
                    {"returnValue", J::number(execResult.returnValue)},
                    {"output", J::array(outItems)},
                    {"executionSteps", J::array(stepItems)}});
}

} // namespace api
} // namespace optimix
