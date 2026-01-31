#pragma once

#include <iostream>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

namespace optimix {

enum class LogLevel { INFO, WARNING, ERROR, DEBUG };

inline void log(LogLevel level, const std::string &message) {
  switch (level) {
  case LogLevel::INFO:
    std::cout << "[INFO] " << message << "\n";
    break;
  case LogLevel::WARNING:
    std::cerr << "[WARN] " << message << "\n";
    break;
  case LogLevel::ERROR:
    std::cerr << "[ERROR] " << message << "\n";
    break;
  case LogLevel::DEBUG:
    std::cout << "[DEBUG] " << message << "\n";
    break;
  }
}

} // namespace optimix
