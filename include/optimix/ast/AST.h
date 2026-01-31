#pragma once

#include <iostream>
#include <memory>
#include <string>
#include <vector>

namespace optimix {

// Base class for all AST nodes
class ASTNode {
public:
  virtual ~ASTNode() = default;
  virtual void print(int indent = 0) const = 0;
};

// Expressions
class Expr : public ASTNode {};

class NumberExpr : public Expr {
public:
  int value;
  NumberExpr(int v) : value(v) {}
  void print(int indent) const override {
    std::cout << std::string(indent, ' ') << "NumberExpr(" << value << ")\n";
  }
};

class VariableExpr : public Expr {
public:
  std::string name;
  VariableExpr(std::string n) : name(std::move(n)) {}
  void print(int indent) const override {
    std::cout << std::string(indent, ' ') << "VariableExpr(" << name << ")\n";
  }
};

class BinaryExpr : public Expr {
public:
  std::string op;
  std::unique_ptr<Expr> left, right;
  BinaryExpr(std::string o, std::unique_ptr<Expr> l, std::unique_ptr<Expr> r)
      : op(std::move(o)), left(std::move(l)), right(std::move(r)) {}

  void print(int indent) const override {
    std::cout << std::string(indent, ' ') << "BinaryExpr(" << op << ")\n";
    left->print(indent + 2);
    right->print(indent + 2);
  }
};

// Statements
class Stmt : public ASTNode {};

class ReturnStmt : public Stmt {
public:
  std::unique_ptr<Expr> value;
  ReturnStmt(std::unique_ptr<Expr> v) : value(std::move(v)) {}
  void print(int indent) const override {
    std::cout << std::string(indent, ' ') << "ReturnStmt\n";
    if (value)
      value->print(indent + 2);
  }
};

class VarDecl : public Stmt {
public:
  std::string name;
  std::unique_ptr<Expr> init;
  VarDecl(std::string n, std::unique_ptr<Expr> i)
      : name(std::move(n)), init(std::move(i)) {}
  void print(int indent) const override {
    std::cout << std::string(indent, ' ') << "VarDecl(" << name << ")\n";
    if (init)
      init->print(indent + 2);
  }
};

class Assignment : public Stmt {
public:
  std::string name;
  std::unique_ptr<Expr> value;
  Assignment(std::string n, std::unique_ptr<Expr> v)
      : name(std::move(n)), value(std::move(v)) {}
  void print(int indent) const override {
    std::cout << std::string(indent, ' ') << "Assignment(" << name << ")\n";
    value->print(indent + 2);
  }
};

class WhileStmt : public Stmt {
public:
  std::unique_ptr<Expr> condition;
  std::vector<std::unique_ptr<Stmt>> body;
  WhileStmt(std::unique_ptr<Expr> c, std::vector<std::unique_ptr<Stmt>> b)
      : condition(std::move(c)), body(std::move(b)) {}
  void print(int indent) const override {
    std::cout << std::string(indent, ' ') << "WhileStmt\n";
    condition->print(indent + 2);
    for (const auto &s : body)
      s->print(indent + 2);
  }
};

class FunctionAST : public ASTNode {
public:
  std::string name;
  std::vector<std::string> args;
  std::vector<std::unique_ptr<Stmt>> body;

  FunctionAST(std::string n, std::vector<std::string> a,
              std::vector<std::unique_ptr<Stmt>> b)
      : name(std::move(n)), args(std::move(a)), body(std::move(b)) {}

  void print(int indent) const override {
    std::cout << std::string(indent, ' ') << "FunctionAST(" << name << ")\n";
    for (const auto &stmt : body) {
      stmt->print(indent + 2);
    }
  }
};

} // namespace optimix
