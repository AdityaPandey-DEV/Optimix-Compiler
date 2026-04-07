// Faithful port of src/codegen/IRInterpreter.cpp
// With added step-by-step execution support for visualization
import { OpCode, OperandType, Operand, IRFunction, BasicBlock, operandToString } from './ir';

export interface ExecutionStep {
  blockLabel: string;
  instructionIndex: number;
  instructionText: string;
  opCode: OpCode;
  registers: Record<string, number>;
  memory: Record<string, number[]>;
  output: string[];
  returnValue?: number;
}

export class IRInterpreter {
  private registers: Map<string, number> = new Map();
  private memory: Map<string, number[]> = new Map();
  private lastBlock: BasicBlock | null = null;
  private outputLines: string[] = [];
  private steps: ExecutionStep[] = [];

  execute(func: IRFunction): { returnValue: number; output: string[]; steps: ExecutionStep[] } {
    this.registers.clear();
    this.memory.clear();
    this.lastBlock = null;
    this.outputLines = [];
    this.steps = [];

    if (func.blocks.length === 0) {
      return { returnValue: 0, output: [], steps: [] };
    }

    let currentBlock: BasicBlock | null = func.blocks[0];
    let maxSteps = 10000; // Prevent infinite loops

    while (currentBlock && maxSteps-- > 0) {
      let nextBlock: BasicBlock | null = null;

      for (let i = 0; i < currentBlock.instructions.length; i++) {
        const inst = currentBlock.instructions[i];

        // Record step BEFORE execution
        this.captureStep(currentBlock.label, i, inst.op);

        // PHI node handling
        if (inst.op === OpCode.PHI) {
          const labelNeeded = this.lastBlock ? this.lastBlock.label : '';
          for (let j = 0; j < inst.operands.length; j += 2) {
            if (j + 1 < inst.operands.length) {
              if (inst.operands[j + 1].value === labelNeeded) {
                this.setVal(inst.result.value, this.getVal(inst.operands[j]));
                break;
              }
            }
          }
          continue;
        }

        // Arithmetic
        if (inst.op === OpCode.ADD) {
          this.setVal(inst.result.value, this.getVal(inst.operands[0]) + this.getVal(inst.operands[1]));
        } else if (inst.op === OpCode.SUB) {
          this.setVal(inst.result.value, this.getVal(inst.operands[0]) - this.getVal(inst.operands[1]));
        } else if (inst.op === OpCode.MUL) {
          this.setVal(inst.result.value, this.getVal(inst.operands[0]) * this.getVal(inst.operands[1]));
        } else if (inst.op === OpCode.DIV) {
          const r = this.getVal(inst.operands[1]);
          this.setVal(inst.result.value, r !== 0 ? Math.trunc(this.getVal(inst.operands[0]) / r) : 0);
        }
        // MOV
        else if (inst.op === OpCode.MOV) {
          this.setVal(inst.result.value, this.getVal(inst.operands[0]));
        }
        // PRINT
        else if (inst.op === OpCode.PRINT) {
          const val = this.getVal(inst.operands[0]);
          this.outputLines.push(String(val));
        }
        // JMP
        else if (inst.op === OpCode.JMP) {
          const targetLabel = inst.operands[0].value;
          nextBlock = func.blocks.find(b => b.label === targetLabel) || null;
          break;
        }
        // JMP_IF
        else if (inst.op === OpCode.JMP_IF) {
          const cond = this.getVal(inst.operands[1]);
          if (cond) {
            const targetLabel = inst.operands[0].value;
            nextBlock = func.blocks.find(b => b.label === targetLabel) || null;
            break;
          }
          // Fallthrough if not taken
        }
        // RET
        else if (inst.op === OpCode.RET) {
          const val = inst.operands.length > 0 ? this.getVal(inst.operands[0]) : 0;
          this.captureStep(currentBlock.label, i, inst.op, val);
          return { returnValue: val, output: [...this.outputLines], steps: this.steps };
        }
        // Comparisons
        else if (inst.op === OpCode.LT) {
          this.setVal(inst.result.value, this.getVal(inst.operands[0]) < this.getVal(inst.operands[1]) ? 1 : 0);
        } else if (inst.op === OpCode.GT) {
          this.setVal(inst.result.value, this.getVal(inst.operands[0]) > this.getVal(inst.operands[1]) ? 1 : 0);
        } else if (inst.op === OpCode.EQ) {
          this.setVal(inst.result.value, this.getVal(inst.operands[0]) === this.getVal(inst.operands[1]) ? 1 : 0);
        } else if (inst.op === OpCode.NEQ) {
          this.setVal(inst.result.value, this.getVal(inst.operands[0]) !== this.getVal(inst.operands[1]) ? 1 : 0);
        }
        // Memory
        else if (inst.op === OpCode.ALLOCA) {
          const name = inst.operands[0].value;
          const size = this.getVal(inst.operands[1]);
          this.memory.set(name, new Array(size).fill(0));
        } else if (inst.op === OpCode.STORE) {
          const name = inst.operands[0].value;
          const idx = this.getVal(inst.operands[1]);
          const val = this.getVal(inst.operands[2]);
          const arr = this.memory.get(name);
          if (arr && idx >= 0 && idx < arr.length) {
            arr[idx] = val;
          }
        } else if (inst.op === OpCode.LOAD) {
          const name = inst.operands[0].value;
          const idx = this.getVal(inst.operands[1]);
          const arr = this.memory.get(name);
          if (arr && idx >= 0 && idx < arr.length) {
            this.setVal(inst.result.value, arr[idx]);
          }
        }
      }

      this.lastBlock = currentBlock;

      if (nextBlock) {
        currentBlock = nextBlock;
      } else {
        // Fallthrough: find next block in list
        const currentIdx = func.blocks.indexOf(currentBlock);
        currentBlock = currentIdx + 1 < func.blocks.length ? func.blocks[currentIdx + 1] : null;
      }
    }

    return { returnValue: 0, output: [...this.outputLines], steps: this.steps };
  }

  private getVal(op: Operand): number {
    if (op.type === OperandType.CONSTANT) {
      return parseInt(op.value, 10) || 0;
    }
    return this.registers.get(op.value) ?? 0;
  }

  private setVal(name: string, val: number): void {
    this.registers.set(name, val);
  }

  private captureStep(blockLabel: string, instrIdx: number, opCode: OpCode, returnValue?: number): void {
    const regs: Record<string, number> = {};
    for (const [k, v] of this.registers) regs[k] = v;

    const mem: Record<string, number[]> = {};
    for (const [k, v] of this.memory) mem[k] = [...v];

    this.steps.push({
      blockLabel,
      instructionIndex: instrIdx,
      instructionText: `${opCode}`,
      opCode,
      registers: regs,
      memory: mem,
      output: [...this.outputLines],
      returnValue,
    });
  }
}
