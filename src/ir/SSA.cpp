#include "optimix/ir/SSA.h"
#include <iostream>

namespace optimix {
namespace ir {

void SSAPass::run(Function &func) {
  std::cout << "Running SSA Pass on " << func.name << "...\n";
  // 1. Compute CFG Predecessors (already done dynamically?)
  for (auto &bb : func.blocks) {
    bb->preds.clear();
    bb->succs.clear();
  }
  // Rebuild CFG edges naive (O(N^2) but fine for mini compiler)
  for (auto &bb : func.blocks) {
    for (auto &inst : bb->instructions) {
      if (inst.op == OpCode::JMP || inst.op == OpCode::JMP_IF) {
        // Find target
        std::string targetLabel = inst.operands[0].value;
        for (auto &potentialSucc : func.blocks) {
          if (potentialSucc->label == targetLabel) {
            bb->succs.push_back(potentialSucc.get());
            potentialSucc->preds.push_back(bb.get());
          }
        }
      }
    }
  }

  // 2. Insert Phi Nodes (Simplified: Insert Phi for all vars at all merge
  // points) In a real compiler we use Dominance Frontiers.
  std::set<std::string> globals;
  // Find vars defined in multiple blocks...
  // For this demo, we'll assume 'a', 'b', 'i', 'temp' need Phis at loop headers

  for (auto &bb : func.blocks) {
    if (bb->preds.size() > 1) {
      // Merge point (e.g., loop header)
      // Insert dummy Phi for likely variables
      // Heuristic: if it's a loop header, insert Phis for live-ins
      // This is a placeholder for the complex algorithm
      // For the demo output, we will simulate the effect of Phi insertion

      // std::cout << "Detected Merge Point: " << bb->label << "\n";
    }
  }

  // 3. Rename Variables (The most visual part of SSA)
  // We will traverse and version the variables

  // Reset counters
  counter.clear();
  stack.clear();
  visited.clear();

  if (!func.blocks.empty()) {
    renameVariables(func, func.blocks.front().get());
  }
}

std::string SSAPass::newName(std::string name) {
  int i = counter[name];
  stack[name].push_back(i);
  counter[name] += 1;
  return name + "_" + std::to_string(i);
}

void SSAPass::renameVariables(Function &func, BasicBlock *bb) {
  // 1. Rename Phi node LHS (not implemented fully in this basic pass)

  // 2. Rename instructions
  for (auto &inst : bb->instructions) {
    // Rename uses (RHS)
    for (auto &op : inst.operands) {
      if (op.type == Operand::VARIABLE) {
        if (!stack[op.value].empty()) {
          op.version = stack[op.value].back(); // Use current version
        }
      }
    }

    // Rename defs (LHS)
    if (inst.op == OpCode::MOV || inst.op == OpCode::ADD ||
        inst.op == OpCode::LT) {
      // If it writes to a variable
      if (inst.result.type == Operand::VARIABLE) {
        int i = counter[inst.result.value]++;
        inst.result.version = i;
        stack[inst.result.value].push_back(i);
      }
    }
  }

  // 3. Rename Phi node RHS in successors

  // 4. Recurse to children
  // Simplified: Use a visited set to traverse CFG (approximating DomTree
  // traversal) The visited set is now a member of SSAPass and cleared in run()

  visited.insert(bb);

  for (auto *succ : bb->succs) {
    if (visited.find(succ) == visited.end()) {
      renameVariables(func, succ);
    }
  }
}

} // namespace ir
} // namespace optimix
