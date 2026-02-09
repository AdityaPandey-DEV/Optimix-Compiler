#include "optimix/codegen/IRInterpreter.h"
#include <iostream>

namespace optimix {

int IRInterpreter::execute(const ir::Function &function) {
  registers.clear();
  memory.clear();
  lastBlock = nullptr;

  if (function.blocks.empty())
    return 0;

  ir::BasicBlock *currentBlock = function.blocks.front().get();

  while (currentBlock) {
    // PHI Node Handling:
    // We must process PHI nodes *before* executing other instructions in the
    // block, but based on where we came from (lastBlock). However, in this
    // simple IR, PHI nodes are just instructions at the start. Real CPU/VMs
    // execute them in parallel. We'll do a lookahead or just standard execution
    // if the PHI instruction correctly grabs values based on 'lastBlock'.
    // Let's rely on the instruction execution loop to handle PHI.

    // Save current block as 'prev' for the next transition,
    // BUT we need to update 'lastBlock' only after we *leave* this block.
    // So we'll use a temp variable.
    ir::BasicBlock *nextBlock = nullptr;
    ir::BasicBlock *prevBlockForPhi = lastBlock;

    // Execute instructions
    for (const auto &inst : currentBlock->instructions) {
      if (inst.op == ir::OpCode::PHI) {
        // PHI args are (value, label), (value, label)...
        // We find the label passing the match
        std::string labelNeeded = prevBlockForPhi ? prevBlockForPhi->label : "";

        // Find the operand corresponding to the predecessor label
        bool found = false;
        // The operands in PHI are pairs: [Value, Label, Value, Label...]
        // Wait, looking at IRBuilder/SSA, how are PHI nodes constructed?
        // Usually PHIs have a list of (Value, Block).
        // Let's assume operands are stored as: [Val1, Label1, Val2, Label2...]
        // We need to check IR definition.
        // Based on typical SSA, we look for the value coming from
        // 'labelNeeded'.

        // IR.h: Instruction has std::vector<Operand> operands.
        // We need to verify how we emit PHI in SSA.cpp.
        // Assuming standard (Val, Label) pairs.

        for (size_t i = 0; i < inst.operands.size(); i += 2) {
          if (i + 1 < inst.operands.size()) {
            std::string valLabel = inst.operands[i + 1].value;
            if (valLabel == labelNeeded) {
              int val = getVal(inst.operands[i]);
              setVal(inst.result.value, val);
              found = true;
              break;
            }
          }
        }

        // If not found (e.g. entry block or missing path), maybe default to 0
        // or error? In valid SSA, it should be found.
        if (!found && !prevBlockForPhi) {
          // Entry block PHI? Should not happen usually unless loops back to
          // entry.
        }
        continue;
      }

      // Arithmetic
      if (inst.op == ir::OpCode::ADD) {
        setVal(inst.result.value,
               getVal(inst.operands[0]) + getVal(inst.operands[1]));
      } else if (inst.op == ir::OpCode::SUB) {
        setVal(inst.result.value,
               getVal(inst.operands[0]) - getVal(inst.operands[1]));
      } else if (inst.op == ir::OpCode::MUL) {
        setVal(inst.result.value,
               getVal(inst.operands[0]) * getVal(inst.operands[1]));
      } else if (inst.op == ir::OpCode::DIV) {
        int r = getVal(inst.operands[1]);
        setVal(inst.result.value, r != 0 ? getVal(inst.operands[0]) / r : 0);
      }
      // Moves / Copy
      else if (inst.op == ir::OpCode::MOV) {
        setVal(inst.result.value, getVal(inst.operands[0]));
      }
      // I/O
      else if (inst.op == ir::OpCode::PRINT) {
        std::cout << getVal(inst.operands[0]) << "\n";
      }
      // Control Flow
      else if (inst.op == ir::OpCode::JMP) {
        // Unconditional jump
        // Target is in operands[0] (Label)
        std::string targetLabel = inst.operands[0].value;
        // Find block
        for (auto &b : function.blocks) {
          if (b->label == targetLabel) {
            nextBlock = b.get();
            break;
          }
        }
        break; // Stop executing instructions in this block
      } else if (inst.op == ir::OpCode::JMP_IF) {
        // Condition is op[1], Target is op[0]
        // Wait, usually JMP_IF target, cond.
        // Let's check IR.h: createCondBranch(OpCode o, Operand target, Operand
        // cond) so operands[0] = target, operands[1] = cond.

        // Actually JMP_IF usually implies "Jump if False" or "Jump if True"?
        // Let's assume Jump if True (Non-zero).
        // But usually we have a fallthrough.
        // Blocks end with specific terminators.

        int cond = getVal(inst.operands[1]);
        if (cond) {
          std::string targetLabel = inst.operands[0].value;
          for (auto &b : function.blocks) {
            if (b->label == targetLabel) {
              nextBlock = b.get();
              break;
            }
          }
          break; // Taken branch
        }
        // Fallthrough if not taken?
        // In strict BasicBlock structure, we might fallthrough to the strictly
        // next block if the JMP_IF doesn't have an 'else'. But usually blocks
        // end with JMP_IF ... then JMP ... Or simply fall through to the
        // textually next block. We need to implement finding the next block in
        // the list if we don't jump.
      } else if (inst.op == ir::OpCode::RET) {
        int val = inst.operands.empty() ? 0 : getVal(inst.operands[0]);
        return val;
      }
      // Comparisons
      else if (inst.op == ir::OpCode::LT) {
        setVal(inst.result.value,
               getVal(inst.operands[0]) < getVal(inst.operands[1]));
      } else if (inst.op == ir::OpCode::GT) {
        setVal(inst.result.value,
               getVal(inst.operands[0]) > getVal(inst.operands[1]));
      } else if (inst.op == ir::OpCode::EQ) {
        setVal(inst.result.value,
               getVal(inst.operands[0]) == getVal(inst.operands[1]));
      } else if (inst.op == ir::OpCode::NEQ) {
        setVal(inst.result.value,
               getVal(inst.operands[0]) != getVal(inst.operands[1]));
      }
      // Memory / Arrays
      else if (inst.op == ir::OpCode::ALLOCA) {
        // ALLOCA name, size
        std::string name = inst.operands[0].value;
        int size = getVal(inst.operands[1]);
        memory[name] = std::vector<int>(size, 0);
      } else if (inst.op == ir::OpCode::STORE) {
        // STORE name, idx, val
        std::string name = inst.operands[0].value;
        int idx = getVal(inst.operands[1]);
        int val = getVal(inst.operands[2]);
        if (memory.find(name) == memory.end()) {
          // Runtime error: Array not found
          std::cerr << "Runtime Error: Array " << name << " not found.\n";
          return -1;
        }
        if (idx < 0 || idx >= memory[name].size()) {
          std::cerr << "Runtime Error: Index out of bounds.\n";
          return -1;
        }
        memory[name][idx] = val;
      } else if (inst.op == ir::OpCode::LOAD) {
        // LOAD dest, name, idx
        std::string name = inst.operands[0].value;
        int idx = getVal(inst.operands[1]);
        if (memory.find(name) == memory.end()) {
          std::cerr << "Runtime Error: Array " << name << " not found.\n";
          return -1;
        }
        if (idx < 0 || idx >= memory[name].size()) {
          std::cerr << "Runtime Error: Index out of bounds.\n";
          return -1;
        }
        setVal(inst.result.value, memory[name][idx]);
      }
    }

    lastBlock = currentBlock;

    if (nextBlock) {
      currentBlock = nextBlock;
    } else {
      // Fallthrough logic: Find the next block in the list
      bool foundCurrent = false;
      ir::BasicBlock *fallthrough = nullptr;
      for (auto &b : function.blocks) {
        if (foundCurrent) {
          fallthrough = b.get();
          break;
        }
        if (b.get() == currentBlock)
          foundCurrent = true;
      }
      currentBlock = fallthrough;
    }
  }
  return 0;
}

int IRInterpreter::getVal(const ir::Operand &op) {
  if (op.type == ir::Operand::CONSTANT) {
    return std::stoi(op.value);
  }
  return registers[op.value];
}

void IRInterpreter::setVal(const std::string &name, int val) {
  registers[name] = val;
}

} // namespace optimix
