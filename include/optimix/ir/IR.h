#pragma once

#include <iostream>
#include <list>
#include <memory>
#include <string>
#include <vector>

namespace optimix {
namespace ir {

enum class OpCode {
  ADD,
  SUB,
  MUL,
  DIV,
  MOV,
  LT,
  GT,
  EQ,
  NEQ,
  JMP,    // Unconditional jump
  JMP_IF, // Conditional jump
  PHI,    // SSA Phi node
  RET,
  PRINT, // Print intrinsic
  CALL,
  ALLOCA, // Stack allocation
  LOAD,   // Load from memory
  STORE   // Store to memory
};

struct Operand {
  enum Type { VARIABLE, CONSTANT, LABEL } type;
  std::string value; // Var name or int value
  int version = 0;   // SSA version

  std::string toString() const {
    if (type == CONSTANT)
      return value;
    if (type == LABEL)
      return value;
    return value + (version > 0 ? "_" + std::to_string(version) : "");
  }

  static Operand makeVar(std::string name) { return {VARIABLE, name}; }
  static Operand makeConst(int val) { return {CONSTANT, std::to_string(val)}; }
  static Operand makeLabel(std::string label) { return {LABEL, label}; }
};

struct Instruction {
  OpCode op;
  Operand result;
  std::vector<Operand> operands;

  Instruction(OpCode o, Operand res) : op(o), result(res) {}
  Instruction(OpCode o, Operand res, Operand op1)
      : op(o), result(res), operands{op1} {}
  Instruction(OpCode o, Operand res, Operand op1, Operand op2)
      : op(o), result(res), operands{op1, op2} {}

  // Static factories for control flow to avoid ambiguity
  static Instruction createBranch(OpCode o, Operand target) {
    Instruction inst(o, {Operand::CONSTANT, ""});
    inst.operands = {target};
    return inst;
  }

  static Instruction createCondBranch(OpCode o, Operand target, Operand cond) {
    Instruction inst(o, {Operand::CONSTANT, ""});
    inst.operands = {target, cond};
    return inst;
  }

  static Instruction createRet(Operand val) {
    Instruction inst(OpCode::RET, {Operand::CONSTANT, ""});
    inst.operands = {val};
    return inst;
  }

  std::string toString() const;
};

class BasicBlock {
public:
  std::string label;
  std::list<Instruction> instructions;
  std::vector<BasicBlock *> preds;
  std::vector<BasicBlock *> succs;

  BasicBlock(std::string l) : label(l) {}

  void addInst(Instruction inst) { instructions.push_back(inst); }
};

class Function {
public:
  std::string name;
  std::list<std::unique_ptr<BasicBlock>> blocks;

  Function(std::string n) : name(n) {}

  BasicBlock *createBlock(std::string label) {
    blocks.push_back(std::make_unique<BasicBlock>(label));
    return blocks.back().get();
  }

  void print() const;
};

} // namespace ir
} // namespace optimix
