// Faithful port of src/ir/SSA.cpp
import { OpCode, OperandType, IRFunction, BasicBlock } from './ir';

export class SSAPass {
  private counter: Map<string, number> = new Map();
  private stack: Map<string, number[]> = new Map();
  private visited: Set<string> = new Set();

  run(func: IRFunction): IRFunction {
    // Deep clone IR so we don't mutate original for Raw IR display
    const ssaFunc: IRFunction = JSON.parse(JSON.stringify(func));

    // 1. Compute CFG edges
    for (const bb of ssaFunc.blocks) {
      bb.preds = [];
      bb.succs = [];
    }

    for (const bb of ssaFunc.blocks) {
      for (const inst of bb.instructions) {
        if (inst.op === OpCode.JMP || inst.op === OpCode.JMP_IF) {
          const targetLabel = inst.operands[0].value;
          const target = ssaFunc.blocks.find(b => b.label === targetLabel);
          if (target) {
            if (!bb.succs.includes(target.label)) bb.succs.push(target.label);
            if (!target.preds.includes(bb.label)) target.preds.push(bb.label);
          }
        }
      }
    }

    // 2. Reset state
    this.counter.clear();
    this.stack.clear();
    this.visited.clear();

    // 3. Rename variables
    if (ssaFunc.blocks.length > 0) {
      this.renameVariables(ssaFunc, ssaFunc.blocks[0]);
    }

    return ssaFunc;
  }

  private getCounter(name: string): number {
    return this.counter.get(name) ?? 0;
  }

  private getStack(name: string): number[] {
    if (!this.stack.has(name)) this.stack.set(name, []);
    return this.stack.get(name)!;
  }

  private renameVariables(func: IRFunction, bb: BasicBlock): void {
    for (const inst of bb.instructions) {
      // Rename uses (RHS / operands)
      for (const op of inst.operands) {
        if (op.type === OperandType.VARIABLE) {
          const stk = this.getStack(op.value);
          if (stk.length > 0) {
            op.version = stk[stk.length - 1];
          }
        }
      }

      // Rename defs (LHS / result)
      if (inst.op === OpCode.MOV || inst.op === OpCode.ADD || inst.op === OpCode.SUB ||
          inst.op === OpCode.MUL || inst.op === OpCode.DIV || inst.op === OpCode.LT ||
          inst.op === OpCode.GT || inst.op === OpCode.EQ || inst.op === OpCode.NEQ ||
          inst.op === OpCode.LOAD) {
        if (inst.result.type === OperandType.VARIABLE) {
          const i = this.getCounter(inst.result.value);
          this.counter.set(inst.result.value, i + 1);
          inst.result.version = i;
          this.getStack(inst.result.value).push(i);
        }
      }
    }

    // Recurse to successors
    this.visited.add(bb.label);
    for (const succLabel of bb.succs) {
      if (!this.visited.has(succLabel)) {
        const succ = func.blocks.find(b => b.label === succLabel);
        if (succ) {
          this.renameVariables(func, succ);
        }
      }
    }
  }
}
