#pragma once

#include "optimix/ir/IR.h"
#include <map>
#include <set>
#include <string>
#include <vector>

namespace optimix {
namespace ir {

class SSAPass {
public:
  void run(Function &func);

private:
  std::map<std::string, int> counter;
  std::map<std::string, std::vector<int>> stack;

  // Simple dominance-based converter
  void computeDominance(Function &func);
  void insertPhiNodes(Function &func);
  void renameVariables(Function &func, BasicBlock *bb);

  std::string newName(std::string name);

  std::set<BasicBlock *> visited;
};

} // namespace ir
} // namespace optimix
