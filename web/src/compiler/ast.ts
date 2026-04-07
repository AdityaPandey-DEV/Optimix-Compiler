// Faithful port of include/optimix/ast/AST.h

export type ASTNodeType =
  | 'NumberExpr' | 'VariableExpr' | 'BinaryExpr' | 'ArrayAccessExpr'
  | 'VarDecl' | 'Assignment' | 'ArrayDecl' | 'ArrayAssignment'
  | 'ReturnStmt' | 'WhileStmt' | 'PrintStmt' | 'FunctionAST';

// Base interfaces
export interface ASTNode {
  type: ASTNodeType;
  id: string; // Unique ID for visualization
}

// Expressions
export interface NumberExpr extends ASTNode {
  type: 'NumberExpr';
  value: number;
}

export interface VariableExpr extends ASTNode {
  type: 'VariableExpr';
  name: string;
}

export interface BinaryExpr extends ASTNode {
  type: 'BinaryExpr';
  op: string;
  left: Expr;
  right: Expr;
}

export interface ArrayAccessExpr extends ASTNode {
  type: 'ArrayAccessExpr';
  name: string;
  index: Expr;
}

export type Expr = NumberExpr | VariableExpr | BinaryExpr | ArrayAccessExpr;

// Statements
export interface VarDecl extends ASTNode {
  type: 'VarDecl';
  name: string;
  init: Expr;
}

export interface Assignment extends ASTNode {
  type: 'Assignment';
  name: string;
  value: Expr;
}

export interface ArrayDecl extends ASTNode {
  type: 'ArrayDecl';
  name: string;
  size: number;
}

export interface ArrayAssignment extends ASTNode {
  type: 'ArrayAssignment';
  name: string;
  index: Expr;
  value: Expr;
}

export interface ReturnStmt extends ASTNode {
  type: 'ReturnStmt';
  value: Expr;
}

export interface WhileStmt extends ASTNode {
  type: 'WhileStmt';
  condition: Expr;
  body: Stmt[];
}

export interface PrintStmt extends ASTNode {
  type: 'PrintStmt';
  value: Expr;
}

export type Stmt = VarDecl | Assignment | ArrayDecl | ArrayAssignment | ReturnStmt | WhileStmt | PrintStmt;

// Top-level
export interface FunctionAST extends ASTNode {
  type: 'FunctionAST';
  name: string;
  args: string[];
  body: Stmt[];
}

// ID generator
let nodeIdCounter = 0;
export function resetNodeIds() { nodeIdCounter = 0; }
export function nextNodeId(): string { return `n${nodeIdCounter++}`; }
