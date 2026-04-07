// Faithful port of src/ir/IRBuilder.cpp
import { Expr, Stmt, FunctionAST } from './ast';
import {
  OpCode, Operand, Instruction, BasicBlock, IRFunction,
  makeVar, makeConst, makeLabel,
  createBranch, createCondBranch, createRet, createInstruction
} from './ir';

export class IRBuilder {
  private blocks: BasicBlock[] = [];
  private currentBBIndex: number = -1;
  private tempCounter: number = 0;
  private labelCounter: number = 0;

  private newTemp(): string { return `t${this.tempCounter++}`; }
  private newLabel(): string { return `L${this.labelCounter++}`; }

  private get currentBB(): BasicBlock | null {
    return this.currentBBIndex >= 0 ? this.blocks[this.currentBBIndex] : null;
  }

  private createBlock(label: string): number {
    const bb: BasicBlock = { label, instructions: [], preds: [], succs: [] };
    this.blocks.push(bb);
    return this.blocks.length - 1;
  }

  private emit(inst: Instruction): void {
    if (this.currentBB) {
      this.currentBB.instructions.push(inst);
    }
  }

  generate(ast: FunctionAST): IRFunction {
    this.blocks = [];
    this.tempCounter = 0;
    this.labelCounter = 0;
    this.currentBBIndex = this.createBlock('entry');

    for (const stmt of ast.body) {
      this.genStmt(stmt);
    }

    return { name: ast.name, blocks: this.blocks };
  }

  private genExpr(expr: Expr): Operand {
    switch (expr.type) {
      case 'NumberExpr':
        return makeConst(expr.value);

      case 'VariableExpr':
        return makeVar(expr.name);

      case 'BinaryExpr': {
        const lhs = this.genExpr(expr.left);
        const rhs = this.genExpr(expr.right);
        const dest = makeVar(this.newTemp());

        let op: OpCode;
        switch (expr.op) {
          case '+': op = OpCode.ADD; break;
          case '-': op = OpCode.SUB; break;
          case '*': op = OpCode.MUL; break;
          case '/': op = OpCode.DIV; break;
          case '<': op = OpCode.LT; break;
          case '>': op = OpCode.GT; break;
          case '==': op = OpCode.EQ; break;
          case '!=': op = OpCode.NEQ; break;
          default: op = OpCode.ADD;
        }

        this.emit(createInstruction(op, dest, lhs, rhs));
        return dest;
      }

      case 'ArrayAccessExpr': {
        const index = this.genExpr(expr.index);
        const dest = makeVar(this.newTemp());
        const inst: Instruction = {
          op: OpCode.LOAD,
          result: dest,
          operands: [makeVar(expr.name), index],
        };
        this.emit(inst);
        return dest;
      }
    }
  }

  private genStmt(stmt: Stmt): void {
    switch (stmt.type) {
      case 'ReturnStmt': {
        const val = this.genExpr(stmt.value);
        this.emit(createRet(val));
        break;
      }

      case 'Assignment': {
        const val = this.genExpr(stmt.value);
        this.emit(createInstruction(OpCode.MOV, makeVar(stmt.name), val));
        break;
      }

      case 'ArrayAssignment': {
        const idx = this.genExpr(stmt.index);
        const val = this.genExpr(stmt.value);
        const inst: Instruction = {
          op: OpCode.STORE,
          result: makeConst(0),
          operands: [makeVar(stmt.name), idx, val],
        };
        this.emit(inst);
        break;
      }

      case 'VarDecl': {
        const val = this.genExpr(stmt.init);
        this.emit(createInstruction(OpCode.MOV, makeVar(stmt.name), val));
        break;
      }

      case 'ArrayDecl': {
        const inst: Instruction = {
          op: OpCode.ALLOCA,
          result: makeConst(0),
          operands: [makeVar(stmt.name), makeConst(stmt.size)],
        };
        this.emit(inst);
        break;
      }

      case 'WhileStmt': {
        const loopLabel = `loop_${this.newLabel()}`;
        const bodyLabel = `loop_body_${this.newLabel()}`;
        const exitLabel = `loop_exit_${this.newLabel()}`;

        const loopIdx = this.createBlock(loopLabel);
        const bodyIdx = this.createBlock(bodyLabel);
        const exitIdx = this.createBlock(exitLabel);

        // Jump to loop condition check
        this.emit(createBranch(makeLabel(loopLabel)));

        // Loop Condition
        this.currentBBIndex = loopIdx;
        const cond = this.genExpr(stmt.condition);
        this.emit(createCondBranch(makeLabel(bodyLabel), cond));
        this.emit(createBranch(makeLabel(exitLabel)));

        // Loop Body
        this.currentBBIndex = bodyIdx;
        for (const s of stmt.body) {
          this.genStmt(s);
        }
        // Jump back to condition
        this.emit(createBranch(makeLabel(loopLabel)));

        // Exit
        this.currentBBIndex = exitIdx;
        break;
      }

      case 'PrintStmt': {
        const val = this.genExpr(stmt.value);
        const inst: Instruction = {
          op: OpCode.PRINT,
          result: makeConst(0),
          operands: [val],
        };
        this.emit(inst);
        break;
      }
    }
  }
}
