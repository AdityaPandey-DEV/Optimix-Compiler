file(GLOB_RECURSE TEST_SOURCES "*.cpp")

add_executable(optimix_tests ${TEST_SOURCES})
target_link_libraries(optimix_tests PRIVATE optimix_lib)
target_include_directories(optimix_tests PRIVATE ${CMAKE_SOURCE_DIR}/src)

add_test(NAME OptimixTests COMMAND optimix_tests)
