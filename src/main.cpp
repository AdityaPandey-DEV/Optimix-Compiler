#include "optimix/codegen/Interpreter.h"
#include "optimix/common.h"
#include "optimix/lexer/Lexer.h"
#include "optimix/parser/Parser.h"
#include <iostream>
#include <string>
#include <vector>

void printUsage() {
  std::cout << "Usage: optimix [command] [options]\n"
            << "Commands:\n"
            << "  compile <file>  Compile source file\n"
            << "Options:\n"
            << "  --help          Show this help message\n"
            << "  --version       Show version info\n";
}

int main(int argc, char *argv[]) {
  if (argc < 2) {
    printUsage();
    return 0;
  }

  std::string command = argv[1];
  if (command == "--help") {
    printUsage();
    return 0;
  } else if (command == "--version") {
    std::cout << "Optimix Compiler v1.0.0\n";
    return 0;
  } else if (command == "compile") {
    if (argc < 3) {
      std::cerr << "Error: No input file specified.\n";
      return 1;
    }
    std::string filename = argv[2];
    std::cout << "Compiling " << filename << "...\n";

    // Read file
    std::FILE *fp = std::fopen(filename.c_str(), "rb");
    if (!fp) {
      std::cerr << "Error: Could not open file " << filename << "\n";
      return 1;
    }
    std::fseek(fp, 0, SEEK_END);
    size_t size = std::ftell(fp);
    std::string content(size, '\0');
    std::rewind(fp);
    std::fread(&content[0], 1, size, fp);
    std::fclose(fp);

    try {
      optimix::Lexer lexer(content);
      optimix::Parser parser(lexer);
      auto ast = parser.parseTopLevel();
      std::cout << "Parsing successful!\n";
      ast->print(0);

      std::cout << "Executing...\n";
      optimix::Interpreter interpreter;
      int result = interpreter.execute(*ast);
      std::cout << "Program returned: " << result << "\n";

    } catch (const std::exception &e) {
      std::cerr << "Compilation failed: " << e.what() << "\n";
      return 1;
    }
  } else {
    std::cerr << "Unknown command: " << command << "\n";
    return 1;
  }

  return 0;
}
