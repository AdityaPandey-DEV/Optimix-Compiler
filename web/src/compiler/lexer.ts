// Faithful port of src/lexer/Lexer.cpp
import { Token, TokenType } from './token';

const KEYWORDS: Record<string, TokenType> = {
  'int': TokenType.KW_INT,
  'return': TokenType.KW_RETURN,
  'if': TokenType.KW_IF,
  'else': TokenType.KW_ELSE,
  'while': TokenType.KW_WHILE,
  'void': TokenType.KW_VOID,
  'print': TokenType.KW_PRINT,
};

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  private peek(): string {
    if (this.pos >= this.source.length) return '\0';
    return this.source[this.pos];
  }

  private advance(): string {
    const current = this.peek();
    this.pos++;
    this.column++;
    if (current === '\n') {
      this.line++;
      this.column = 1;
    }
    return current;
  }

  private match(expected: string): boolean {
    if (this.peek() === expected) {
      this.advance();
      return true;
    }
    return false;
  }

  private skipWhitespace(): void {
    while (true) {
      const c = this.peek();
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
        this.advance();
      } else if (c === '/' && this.pos + 1 < this.source.length && this.source[this.pos + 1] === '/') {
        // Comment
        while (this.peek() !== '\n' && this.peek() !== '\0') {
          this.advance();
        }
      } else {
        break;
      }
    }
  }

  nextToken(): Token {
    this.skipWhitespace();

    if (this.pos >= this.source.length) {
      return { type: TokenType.END_OF_FILE, text: '', line: this.line, column: this.column };
    }

    const c = this.peek();
    const startColumn = this.column;
    const startLine = this.line;

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(c)) {
      return this.identifierOrKeyword(startColumn);
    }

    // Number
    if (/[0-9]/.test(c)) {
      return this.number(startColumn);
    }

    this.advance();
    switch (c) {
      case '+': return { type: TokenType.PLUS, text: '+', line: startLine, column: startColumn };
      case '-': return { type: TokenType.MINUS, text: '-', line: startLine, column: startColumn };
      case '*': return { type: TokenType.STAR, text: '*', line: startLine, column: startColumn };
      case '/': return { type: TokenType.SLASH, text: '/', line: startLine, column: startColumn };
      case '(': return { type: TokenType.LPAREN, text: '(', line: startLine, column: startColumn };
      case ')': return { type: TokenType.RPAREN, text: ')', line: startLine, column: startColumn };
      case '{': return { type: TokenType.LBRACE, text: '{', line: startLine, column: startColumn };
      case '}': return { type: TokenType.RBRACE, text: '}', line: startLine, column: startColumn };
      case '[': return { type: TokenType.LBRACKET, text: '[', line: startLine, column: startColumn };
      case ']': return { type: TokenType.RBRACKET, text: ']', line: startLine, column: startColumn };
      case ';': return { type: TokenType.SEMICOLON, text: ';', line: startLine, column: startColumn };
      case ',': return { type: TokenType.COMMA, text: ',', line: startLine, column: startColumn };
      case '=':
        if (this.match('=')) return { type: TokenType.EQ, text: '==', line: startLine, column: startColumn };
        return { type: TokenType.ASSIGN, text: '=', line: startLine, column: startColumn };
      case '!':
        if (this.match('=')) return { type: TokenType.NEQ, text: '!=', line: startLine, column: startColumn };
        return { type: TokenType.ERROR, text: "Unexpected character '!'", line: startLine, column: startColumn };
      case '<': return { type: TokenType.LT, text: '<', line: startLine, column: startColumn };
      case '>': return { type: TokenType.GT, text: '>', line: startLine, column: startColumn };
    }

    return { type: TokenType.ERROR, text: c, line: startLine, column: startColumn };
  }

  private identifierOrKeyword(startColumn: number): Token {
    let text = '';
    while (/[a-zA-Z0-9_]/.test(this.peek())) {
      text += this.advance();
    }

    const kw = KEYWORDS[text];
    if (kw !== undefined) {
      return { type: kw, text, line: this.line, column: startColumn };
    }

    return { type: TokenType.IDENTIFIER, text, line: this.line, column: startColumn };
  }

  private number(startColumn: number): Token {
    let text = '';
    while (/[0-9]/.test(this.peek())) {
      text += this.advance();
    }
    return { type: TokenType.NUMBER, text, line: this.line, column: startColumn };
  }

  /** Tokenize the entire source — returns all tokens */
  tokenizeAll(): Token[] {
    const tokens: Token[] = [];
    while (true) {
      const tok = this.nextToken();
      tokens.push(tok);
      if (tok.type === TokenType.END_OF_FILE) break;
    }
    return tokens;
  }
}
