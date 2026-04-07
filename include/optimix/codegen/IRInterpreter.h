#pragma once

#include "optimix/ir/IR.h"
#include <map>
#include <string>
#include <vector>

namespace optimix {

// Captured state at each instruction for step-through visualization
struct ExecutionStep {
  std::string blockLabel;
  int instructionIndex;
  std::string opCode;
  std::string instructionText;
  std::map<std::string, int> registers;
  std::map<std::string, std::vector<int>> memory;
  std::vector<std::string> output;
  int returnValue;
  bool hasReturn;
};

// Full execution result with step-by-step data
struct ExecutionResult {
  int returnValue;
  std::vector<std::string> output;
  std::vector<ExecutionStep> steps;
};

class IRInterpreter {
public:
  int execute(const ir::Function &function);

  // Step-through execution: captures state at every instruction
  ExecutionResult executeWithSteps(const ir::Function &function);

private:
  // Memory for variables (virtual registers)
  std::map<std::string, int> registers;

  // Memory for arrays
  std::map<std::string, std::vector<int>> memory;

  // Last visited block (needed for PHI nodes)
  ir::BasicBlock *lastBlock = nullptr;

  // Captured output lines (for WASM API)
  std::vector<std::string> outputLines;

  int getVal(const ir::Operand &op);
  void setVal(const std::string &name, int val);

  // Capture current state as a step
  ExecutionStep captureStep(const std::string &blockLabel, int instrIdx,
                            const std::string &opCode,
                            const std::string &instrText);
};

} // namespace optimix
