// Faithful port of include/optimix/lexer/Token.h

export enum TokenType {
  END_OF_FILE = 'END_OF_FILE',
  ERROR = 'ERROR',

  // Literals
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',

  // Keywords
  KW_INT = 'KW_INT',
  KW_RETURN = 'KW_RETURN',
  KW_IF = 'KW_IF',
  KW_ELSE = 'KW_ELSE',
  KW_WHILE = 'KW_WHILE',
  KW_VOID = 'KW_VOID',
  KW_PRINT = 'KW_PRINT',

  // Operators & Punctuation
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  ASSIGN = 'ASSIGN',
  EQ = 'EQ',       // ==
  NEQ = 'NEQ',     // !=
  LT = 'LT',       // <
  GT = 'GT',       // >
  LPAREN = 'LPAREN',   // (
  RPAREN = 'RPAREN',   // )
  LBRACE = 'LBRACE',   // {
  RBRACE = 'RBRACE',   // }
  LBRACKET = 'LBRACKET', // [
  RBRACKET = 'RBRACKET', // ]
  SEMICOLON = 'SEMICOLON',
  COMMA = 'COMMA',
}

export interface Token {
  type: TokenType;
  text: string;
  line: number;
  column: number;
}

export const TOKEN_CATEGORIES: Record<string, TokenType[]> = {
  keyword: [TokenType.KW_INT, TokenType.KW_RETURN, TokenType.KW_IF, TokenType.KW_ELSE, TokenType.KW_WHILE, TokenType.KW_VOID, TokenType.KW_PRINT],
  literal: [TokenType.NUMBER],
  identifier: [TokenType.IDENTIFIER],
  operator: [TokenType.PLUS, TokenType.MINUS, TokenType.STAR, TokenType.SLASH, TokenType.ASSIGN, TokenType.EQ, TokenType.NEQ, TokenType.LT, TokenType.GT],
  punctuation: [TokenType.LPAREN, TokenType.RPAREN, TokenType.LBRACE, TokenType.RBRACE, TokenType.LBRACKET, TokenType.RBRACKET, TokenType.SEMICOLON, TokenType.COMMA],
};

export function getTokenCategory(type: TokenType): string {
  for (const [cat, types] of Object.entries(TOKEN_CATEGORIES)) {
    if (types.includes(type)) return cat;
  }
  return 'unknown';
}
