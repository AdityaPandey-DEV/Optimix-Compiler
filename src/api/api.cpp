// Optimix WASM API — Emscripten bindings
// This file bridges the real C++ compiler engine to JavaScript via embind.
// Each function runs the actual C++ compiler phases and returns JSON.

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#endif

#include "serializer.h"
#include "optimix/codegen/IRInterpreter.h"
#include "optimix/ir/IRBuilder.h"
#include "optimix/ir/SSA.h"
#include "optimix/lexer/Lexer.h"
#include "optimix/parser/Parser.h"
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

using namespace optimix;

// Helper: Collect all tokens from a source string
static std::vector<Token> collectAllTokens(const std::string &source) {
  Lexer lexer(source);
  std::vector<Token> tokens;
  while (true) {
    Token tok = lexer.nextToken();
    tokens.push_back(tok);
    if (tok.type == TokenType::END_OF_FILE)
      break;
  }
  return tokens;
}

// Phase 1: Tokenize — returns JSON array of tokens
std::string tokenize(const std::string &source) {
  try {
    auto tokens = collectAllTokens(source);
    return api::serializeTokens(tokens);
  } catch (const std::exception &e) {
    return api::JsonBuilder::object(
        {{"error", api::JsonBuilder::string(e.what())}});
  }
}

// Phase 2: Parse — returns JSON AST tree
std::string parse(const std::string &source) {
  try {
    Lexer lexer(source);
    Parser parser(lexer);
    auto ast = parser.parseTopLevel();
    return api::serializeAST(ast.get());
  } catch (const std::exception &e) {
    return api::JsonBuilder::object(
        {{"error", api::JsonBuilder::string(e.what())}});
  }
}

// Phase 3: Generate IR — returns JSON IR with basic blocks
std::string generateIR(const std::string &source) {
  try {
    Lexer lexer(source);
    Parser parser(lexer);
    auto ast = parser.parseTopLevel();

    IRBuilder builder;
    auto ir = builder.generate(*ast);
    return api::serializeIR(ir.get());
  } catch (const std::exception &e) {
    return api::JsonBuilder::object(
        {{"error", api::JsonBuilder::string(e.what())}});
  }
}

// Phase 4: Apply SSA — returns JSON SSA-form IR
std::string applySSA(const std::string &source) {
  try {
    Lexer lexer(source);
    Parser parser(lexer);
    auto ast = parser.parseTopLevel();

    IRBuilder builder;
    auto ir = builder.generate(*ast);

    // Suppress SSA pass stdout output
    std::streambuf *oldCout = std::cout.rdbuf();
    std::ostringstream nullStream;
    std::cout.rdbuf(nullStream.rdbuf());

    ir::SSAPass ssa;
    ssa.run(*ir);

    std::cout.rdbuf(oldCout);

    return api::serializeIR(ir.get());
  } catch (const std::exception &e) {
    return api::JsonBuilder::object(
        {{"error", api::JsonBuilder::string(e.what())}});
  }
}

// Phase 5: Full compile — runs all phases, returns complete result
std::string compile(const std::string &source) {
  std::string tokensJson, astJson, rawIRJson, ssaIRJson;
  int returnValue = 0;
  std::vector<std::string> output;

  try {
    // Phase 1: Tokens
    auto tokens = collectAllTokens(source);
    tokensJson = api::serializeTokens(tokens);

    // Phase 2: Parse
    Lexer lexer2(source);
    Parser parser(lexer2);
    auto ast = parser.parseTopLevel();
    astJson = api::serializeAST(ast.get());

    // Phase 3: IR
    IRBuilder builder;
    auto ir = builder.generate(*ast);
    rawIRJson = api::serializeIR(ir.get());

    // Phase 4: SSA
    // Suppress SSA pass stdout
    std::streambuf *oldCout = std::cout.rdbuf();
    std::ostringstream nullStream;
    std::cout.rdbuf(nullStream.rdbuf());

    ir::SSAPass ssa;
    ssa.run(*ir);

    std::cout.rdbuf(oldCout);

    ssaIRJson = api::serializeIR(ir.get());

    // Phase 5: Execute
    // Capture print() output by redirecting cout
    std::ostringstream execOutput;
    std::cout.rdbuf(execOutput.rdbuf());

    IRInterpreter interpreter;
    returnValue = interpreter.execute(*ir);

    std::cout.rdbuf(oldCout);

    // Parse captured output into lines
    std::string outStr = execOutput.str();
    std::istringstream iss(outStr);
    std::string line;
    while (std::getline(iss, line)) {
      if (!line.empty()) {
        output.push_back(line);
      }
    }

    return api::serializeFullResult(tokensJson, astJson, rawIRJson, ssaIRJson,
                                    returnValue, output, true);
  } catch (const std::exception &e) {
    return api::serializeFullResult(tokensJson, astJson, rawIRJson, ssaIRJson,
                                    returnValue, output, false, e.what());
  }
}

// Emscripten bindings — only compiled when targeting WASM
#ifdef __EMSCRIPTEN__
EMSCRIPTEN_BINDINGS(optimix_module) {
  emscripten::function("tokenize", &tokenize);
  emscripten::function("parse", &parse);
  emscripten::function("generateIR", &generateIR);
  emscripten::function("applySSA", &applySSA);
  emscripten::function("compile", &compile);
}
#endif
