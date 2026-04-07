// Faithful port of include/optimix/ir/IR.h

export enum OpCode {
  ADD = 'ADD',
  SUB = 'SUB',
  MUL = 'MUL',
  DIV = 'DIV',
  MOV = 'MOV',
  LT = 'LT',
  GT = 'GT',
  EQ = 'EQ',
  NEQ = 'NEQ',
  JMP = 'JMP',
  JMP_IF = 'JMP_IF',
  PHI = 'PHI',
  RET = 'RET',
  PRINT = 'PRINT',
  CALL = 'CALL',
  ALLOCA = 'ALLOCA',
  LOAD = 'LOAD',
  STORE = 'STORE',
}

export enum OperandType {
  VARIABLE = 'VARIABLE',
  CONSTANT = 'CONSTANT',
  LABEL = 'LABEL',
}

export interface Operand {
  type: OperandType;
  value: string;
  version: number;
}

export function makeVar(name: string): Operand {
  return { type: OperandType.VARIABLE, value: name, version: 0 };
}

export function makeConst(val: number): Operand {
  return { type: OperandType.CONSTANT, value: String(val), version: 0 };
}

export function makeLabel(label: string): Operand {
  return { type: OperandType.LABEL, value: label, version: 0 };
}

export function operandToString(op: Operand): string {
  if (op.type === OperandType.CONSTANT) return op.value;
  if (op.type === OperandType.LABEL) return op.value;
  return op.value + (op.version > 0 ? `_${op.version}` : '');
}

export interface Instruction {
  op: OpCode;
  result: Operand;
  operands: Operand[];
}

export function instrToString(inst: Instruction): string {
  switch (inst.op) {
    case OpCode.JMP:
      return `JMP ${operandToString(inst.operands[0])}`;
    case OpCode.JMP_IF:
      return `JMP_IF ${operandToString(inst.operands[0])}, ${operandToString(inst.operands[1])}`;
    case OpCode.RET:
      return `RET ${operandToString(inst.operands[0])}`;
    case OpCode.PRINT:
      return `PRINT ${operandToString(inst.operands[0])}`;
    case OpCode.ALLOCA:
      return `ALLOCA ${operandToString(inst.operands[0])}, ${operandToString(inst.operands[1])}`;
    case OpCode.STORE:
      return `STORE ${operandToString(inst.operands[0])}, ${operandToString(inst.operands[1])}, ${operandToString(inst.operands[2])}`;
    case OpCode.LOAD:
      return `LOAD ${operandToString(inst.result)}, ${operandToString(inst.operands[0])}, ${operandToString(inst.operands[1])}`;
    default: {
      let s = `${inst.op} ${operandToString(inst.result)}`;
      if (inst.operands.length > 0) {
        s += ', ' + inst.operands.map(operandToString).join(', ');
      }
      return s;
    }
  }
}

export interface BasicBlock {
  label: string;
  instructions: Instruction[];
  preds: string[]; // labels
  succs: string[]; // labels
}

export interface IRFunction {
  name: string;
  blocks: BasicBlock[];
}

export function createInstruction(op: OpCode, result: Operand, ...operands: Operand[]): Instruction {
  return { op, result, operands };
}

export function createBranch(target: Operand): Instruction {
  return { op: OpCode.JMP, result: makeConst(0), operands: [target] };
}

export function createCondBranch(target: Operand, cond: Operand): Instruction {
  return { op: OpCode.JMP_IF, result: makeConst(0), operands: [target, cond] };
}

export function createRet(val: Operand): Instruction {
  return { op: OpCode.RET, result: makeConst(0), operands: [val] };
}

export function printIR(func: IRFunction): string {
  let output = `Function ${func.name}:\n`;
  for (const bb of func.blocks) {
    output += `${bb.label}:\n`;
    for (const inst of bb.instructions) {
      output += `  ${instrToString(inst)}\n`;
    }
  }
  return output;
}
