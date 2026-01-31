cmake_minimum_required(VERSION 3.15)
project(Optimix VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Output directories
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# Include directories
include_directories(include)

# Source files
file(GLOB_RECURSE SOURCES "src/*.cpp")

# Core library
add_library(optimix_lib ${SOURCES})
target_include_directories(optimix_lib PUBLIC include)

# Main executable
add_executable(optimix src/main.cpp)
target_link_libraries(optimix PRIVATE optimix_lib)

# Testing
enable_testing()
add_subdirectory(tests)
