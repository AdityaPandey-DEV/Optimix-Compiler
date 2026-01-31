import subprocess
import os
import sys

# Configuration
import argparse

# Configuration
DEFAULT_COMPILER = "./optimix"
EXAMPLES_DIR = "examples"

TESTS = [
    {
        "file": "factorial.optx",
        "expected_output": ["Program returned: 120"]
    },
    {
        "file": "fibonacci.optx",
        "expected_output": ["Program returned: 55"]
    },
    {
        "file": "print_loop.optx",
        "expected_output": ["1", "2", "3", "4", "5", "Program returned: 0"]
    },
    {
        "file": "comprehensive.optx",
        "expected_output": ["0", "10", "20", "30", "40", "Program returned: 0"]
    }
]

def run_test(compiler, test):
    file_path = os.path.join(EXAMPLES_DIR, test["file"])
    print(f"Testing {test['file']}...", end=" ")
    
    try:
        # Run compiler
        result = subprocess.run(
            [compiler, "compile", file_path],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode != 0:
            print("❌ FAILED (Crash)")
            print(result.stderr)
            return False

        # Check output
        output_lines = [line.strip() for line in result.stdout.split('\n') if line.strip()]
        
        match = True
        for expected in test["expected_output"]:
            found = False
            for line in output_lines:
                if expected in line:
                    found = True
                    break
            if not found:
                match = False
                print(f"\n❌ FAILED. Missing expected output: '{expected}'")
                print("Got:")
                print(result.stdout)
                break
        
        if match:
            print("✅ PASSED")
            return True
            
    except subprocess.TimeoutExpired:
        print("❌ FAILED (Timeout)")
        return False
    except Exception as e:
        print(f"❌ FAILED ({e})")
        return False

def main():
    parser = argparse.ArgumentParser(description="Run Optimix regression tests")
    parser.add_argument("--compiler", default=DEFAULT_COMPILER, help="Path to optimix executable")
    args = parser.parse_args()

    compiler_path = os.path.abspath(args.compiler)

    if not os.path.exists(compiler_path):
        print(f"Compiler binary '{compiler_path}' not found. Please build it first.")
        sys.exit(1)
        
    passed = 0
    for test in TESTS:
        if run_test(compiler_path, test):
            passed += 1
            
    print(f"\nResults: {passed}/{len(TESTS)} tests passed.")
    if passed != len(TESTS):
        sys.exit(1)

if __name__ == "__main__":
    main()
