// Faithful port of src/parser/Parser.cpp
import { Lexer } from './lexer';
import { Token, TokenType } from './token';
import {
  Expr, Stmt, FunctionAST,
  NumberExpr, VariableExpr, BinaryExpr, ArrayAccessExpr,
  VarDecl, Assignment, ArrayDecl, ArrayAssignment,
  ReturnStmt, WhileStmt, PrintStmt,
  nextNodeId, resetNodeIds
} from './ast';

export class Parser {
  private lexer: Lexer;
  private currentToken: Token;

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.nextToken();
  }

  private eat(type: TokenType): void {
    if (this.currentToken.type === type) {
      this.currentToken = this.lexer.nextToken();
    } else {
      throw new Error(
        `Parser Error [Line ${this.currentToken.line}:${this.currentToken.column}]: ` +
        `Unexpected token '${this.currentToken.text}' (${this.currentToken.type}), expected ${type}`
      );
    }
  }

  private parsePrimary(): Expr {
    if (this.currentToken.type === TokenType.NUMBER) {
      const val = parseInt(this.currentToken.text, 10);
      this.eat(TokenType.NUMBER);
      return { type: 'NumberExpr', value: val, id: nextNodeId() };
    }

    if (this.currentToken.type === TokenType.IDENTIFIER) {
      const name = this.currentToken.text;
      this.eat(TokenType.IDENTIFIER);

      // Array access: arr[i]
      if (this.currentToken.type === TokenType.LBRACKET) {
        this.eat(TokenType.LBRACKET);
        const index = this.parseExpression();
        this.eat(TokenType.RBRACKET);
        return { type: 'ArrayAccessExpr', name, index, id: nextNodeId() };
      }

      return { type: 'VariableExpr', name, id: nextNodeId() };
    }

    if (this.currentToken.type === TokenType.LPAREN) {
      this.eat(TokenType.LPAREN);
      const expr = this.parseExpression();
      this.eat(TokenType.RPAREN);
      return expr;
    }

    throw new Error(
      `Parser Error [Line ${this.currentToken.line}:${this.currentToken.column}]: ` +
      `Unknown token in expression: '${this.currentToken.text}'`
    );
  }

  private parseMultiplicative(): Expr {
    let left = this.parsePrimary();
    while (this.currentToken.type === TokenType.STAR || this.currentToken.type === TokenType.SLASH) {
      const op = this.currentToken.text;
      this.eat(this.currentToken.type);
      const right = this.parsePrimary();
      left = { type: 'BinaryExpr', op, left, right, id: nextNodeId() };
    }
    return left;
  }

  private parseAdditive(): Expr {
    let left = this.parseMultiplicative();
    while (this.currentToken.type === TokenType.PLUS || this.currentToken.type === TokenType.MINUS) {
      const op = this.currentToken.text;
      this.eat(this.currentToken.type);
      const right = this.parseMultiplicative();
      left = { type: 'BinaryExpr', op, left, right, id: nextNodeId() };
    }
    return left;
  }

  private parseRelational(): Expr {
    let left = this.parseAdditive();
    while (
      this.currentToken.type === TokenType.LT ||
      this.currentToken.type === TokenType.GT ||
      this.currentToken.type === TokenType.EQ ||
      this.currentToken.type === TokenType.NEQ
    ) {
      const op = this.currentToken.text;
      this.eat(this.currentToken.type);
      const right = this.parseAdditive();
      left = { type: 'BinaryExpr', op, left, right, id: nextNodeId() };
    }
    return left;
  }

  private parseExpression(): Expr {
    return this.parseRelational();
  }

  private parseStatement(): Stmt {
    // return statement
    if (this.currentToken.type === TokenType.KW_RETURN) {
      this.eat(TokenType.KW_RETURN);
      const expr = this.parseExpression();
      this.eat(TokenType.SEMICOLON);
      return { type: 'ReturnStmt', value: expr, id: nextNodeId() };
    }

    // int declaration (variable or array)
    if (this.currentToken.type === TokenType.KW_INT) {
      this.eat(TokenType.KW_INT);
      const name = this.currentToken.text;
      this.eat(TokenType.IDENTIFIER);

      // Array declaration: int arr[10];
      if (this.currentToken.type === TokenType.LBRACKET) {
        this.eat(TokenType.LBRACKET);
        const size = parseInt(this.currentToken.text, 10);
        this.eat(TokenType.NUMBER);
        this.eat(TokenType.RBRACKET);
        this.eat(TokenType.SEMICOLON);
        return { type: 'ArrayDecl', name, size, id: nextNodeId() };
      }

      // Variable declaration: int x = expr;
      this.eat(TokenType.ASSIGN);
      const init = this.parseExpression();
      this.eat(TokenType.SEMICOLON);
      return { type: 'VarDecl', name, init, id: nextNodeId() };
    }

    // while loop
    if (this.currentToken.type === TokenType.KW_WHILE) {
      this.eat(TokenType.KW_WHILE);
      this.eat(TokenType.LPAREN);
      const cond = this.parseExpression();
      this.eat(TokenType.RPAREN);
      const body = this.parseBlock();
      return { type: 'WhileStmt', condition: cond, body, id: nextNodeId() };
    }

    // identifier (assignment or array assignment)
    if (this.currentToken.type === TokenType.IDENTIFIER) {
      const name = this.currentToken.text;
      this.eat(TokenType.IDENTIFIER);

      // Array assignment: arr[i] = expr;
      if (this.currentToken.type === TokenType.LBRACKET) {
        this.eat(TokenType.LBRACKET);
        const index = this.parseExpression();
        this.eat(TokenType.RBRACKET);
        this.eat(TokenType.ASSIGN);
        const val = this.parseExpression();
        this.eat(TokenType.SEMICOLON);
        return { type: 'ArrayAssignment', name, index, value: val, id: nextNodeId() };
      }

      // Variable assignment: x = expr;
      if (this.currentToken.type === TokenType.ASSIGN) {
        this.eat(TokenType.ASSIGN);
        const val = this.parseExpression();
        this.eat(TokenType.SEMICOLON);
        return { type: 'Assignment', name, value: val, id: nextNodeId() };
      }
    }

    // print
    if (this.currentToken.type === TokenType.KW_PRINT) {
      this.eat(TokenType.KW_PRINT);
      this.eat(TokenType.LPAREN);
      const expr = this.parseExpression();
      this.eat(TokenType.RPAREN);
      this.eat(TokenType.SEMICOLON);
      return { type: 'PrintStmt', value: expr, id: nextNodeId() };
    }

    throw new Error(
      `Parser Error [Line ${this.currentToken.line}:${this.currentToken.column}]: ` +
      `Unexpected token in statement: '${this.currentToken.text}'`
    );
  }

  private parseBlock(): Stmt[] {
    this.eat(TokenType.LBRACE);
    const stmts: Stmt[] = [];
    while (this.currentToken.type !== TokenType.RBRACE && this.currentToken.type !== TokenType.END_OF_FILE) {
      stmts.push(this.parseStatement());
    }
    this.eat(TokenType.RBRACE);
    return stmts;
  }

  parseTopLevel(): FunctionAST {
    resetNodeIds();
    this.eat(TokenType.KW_INT); // return type
    const name = this.currentToken.text;
    this.eat(TokenType.IDENTIFIER);
    this.eat(TokenType.LPAREN);
    this.eat(TokenType.RPAREN);
    const body = this.parseBlock();
    return { type: 'FunctionAST', name, args: [], body, id: nextNodeId() };
  }
}
