#include "optimix/ir/IR.h"

namespace optimix {
namespace ir {

std::string Instruction::toString() const {
  std::string s;
  switch (op) {
  case OpCode::ADD:
    s = "ADD";
    break;
  case OpCode::SUB:
    s = "SUB";
    break;
  case OpCode::MUL:
    s = "MUL";
    break;
  case OpCode::DIV:
    s = "DIV";
    break;
  case OpCode::MOV:
    s = "MOV";
    break;
  case OpCode::LT:
    s = "LT";
    break;
  case OpCode::GT:
    s = "GT";
    break;
  case OpCode::EQ:
    s = "EQ";
    break;
  case OpCode::NEQ:
    s = "NEQ";
    break;
  case OpCode::JMP:
    return "JMP " + operands[0].toString();
  case OpCode::JMP_IF:
    return "JMP_IF " + operands[0].toString() + ", " + operands[1].toString();
  case OpCode::RET:
    return "RET " + operands[0].toString();
  case OpCode::PHI:
    s = "PHI";
    break;
  default:
    s = "OP";
  }

  s += " " + result.toString();
  if (!operands.empty()) {
    s += ", ";
    for (size_t i = 0; i < operands.size(); ++i) {
      s += operands[i].toString();
      if (i < operands.size() - 1)
        s += ", ";
    }
  }
  return s;
}

void Function::print() const {
  std::cout << "Function " << name << ":\n";
  for (const auto &bb : blocks) {
    std::cout << bb->label << ":\n";
    for (const auto &inst : bb->instructions) {
      std::cout << "  " << inst.toString() << "\n";
    }
  }
}

} // namespace ir
} // namespace optimix
