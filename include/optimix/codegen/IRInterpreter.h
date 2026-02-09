#pragma once

#include "optimix/ir/IR.h"
#include <map>
#include <string>
#include <vector>

namespace optimix {

class IRInterpreter {
public:
  int execute(const ir::Function &function);

private:
  // Memory for variables (virtual registers)
  // Since SSA variables are unique, we can just map name -> value
  std::map<std::string, int> registers;

  // For recursion support, we would need a stack of frames.
  // But since the current AST interpreter is also simple,
  // we'll start with a single frame for the main function.

  // Last visited block (needed for PHI nodes)
  ir::BasicBlock *lastBlock = nullptr;

  int getVal(const ir::Operand &op);
  void setVal(const std::string &name, int val);
};

} // namespace optimix
