#pragma once

#include "optimix/ast/AST.h"
#include "optimix/ir/IR.h"
#include "optimix/lexer/Token.h"
#include <sstream>
#include <string>
#include <vector>

namespace optimix {
namespace api {

// Minimal JSON builder — no external dependencies
class JsonBuilder {
public:
  // Primitives
  static std::string string(const std::string &s) {
    std::string escaped;
    escaped += '"';
    for (char c : s) {
      switch (c) {
      case '"':
        escaped += "\\\"";
        break;
      case '\\':
        escaped += "\\\\";
        break;
      case '\n':
        escaped += "\\n";
        break;
      case '\r':
        escaped += "\\r";
        break;
      case '\t':
        escaped += "\\t";
        break;
      default:
        escaped += c;
      }
    }
    escaped += '"';
    return escaped;
  }

  static std::string number(int n) { return std::to_string(n); }

  static std::string boolean(bool b) { return b ? "true" : "false"; }

  // Containers
  static std::string array(const std::vector<std::string> &items) {
    std::string result = "[";
    for (size_t i = 0; i < items.size(); ++i) {
      if (i > 0)
        result += ",";
      result += items[i];
    }
    result += "]";
    return result;
  }

  static std::string object(
      const std::vector<std::pair<std::string, std::string>> &fields) {
    std::string result = "{";
    for (size_t i = 0; i < fields.size(); ++i) {
      if (i > 0)
        result += ",";
      result += string(fields[i].first) + ":" + fields[i].second;
    }
    result += "}";
    return result;
  }
};

// ------ Serializers for each compiler data structure ------

// Token serialization
std::string serializeToken(const Token &tok);
std::string serializeTokens(const std::vector<Token> &tokens);

// AST serialization (recursive)
std::string serializeExpr(const Expr *expr);
std::string serializeStmt(const Stmt *stmt);
std::string serializeAST(const FunctionAST *ast);

// IR serialization
std::string serializeOperand(const ir::Operand &op);
std::string serializeInstruction(const ir::Instruction &inst);
std::string serializeBasicBlock(const ir::BasicBlock *bb);
std::string serializeIR(const ir::Function *func);

// Execution result
std::string serializeExecutionResult(int returnValue,
                                     const std::vector<std::string> &output);

// Full pipeline result
std::string serializeFullResult(const std::string &tokensJson,
                                const std::string &astJson,
                                const std::string &rawIRJson,
                                const std::string &ssaIRJson,
                                int returnValue,
                                const std::vector<std::string> &output,
                                bool success,
                                const std::string &error = "");

} // namespace api
} // namespace optimix
