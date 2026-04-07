// Pipeline orchestrator — runs all compilation phases and captures results
import { Token } from './token';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { FunctionAST } from './ast';
import { IRFunction, printIR } from './ir';
import { IRBuilder } from './ir-builder';
import { SSAPass } from './ssa';
import { IRInterpreter, ExecutionStep } from './interpreter';

export interface CompilationResult {
  success: boolean;
  error?: string;

  // Phase 1: Tokens
  tokens: Token[];

  // Phase 2: AST
  ast: FunctionAST | null;

  // Phase 3: Raw IR
  rawIR: IRFunction | null;
  rawIRText: string;

  // Phase 4: SSA IR
  ssaIR: IRFunction | null;
  ssaIRText: string;

  // Phase 5: Execution
  returnValue: number;
  output: string[];
  executionSteps: ExecutionStep[];
}

export function compile(source: string): CompilationResult {
  const result: CompilationResult = {
    success: false,
    tokens: [],
    ast: null,
    rawIR: null,
    rawIRText: '',
    ssaIR: null,
    ssaIRText: '',
    returnValue: 0,
    output: [],
    executionSteps: [],
  };

  try {
    // Phase 1: Lexical Analysis
    const lexer = new Lexer(source);
    result.tokens = lexer.tokenizeAll();

    // Phase 2: Parsing (need a fresh lexer)
    const lexer2 = new Lexer(source);
    const parser = new Parser(lexer2);
    result.ast = parser.parseTopLevel();

    // Phase 3: IR Generation
    const builder = new IRBuilder();
    result.rawIR = builder.generate(result.ast);
    result.rawIRText = printIR(result.rawIR);

    // Phase 4: SSA Pass
    const ssa = new SSAPass();
    result.ssaIR = ssa.run(result.rawIR);
    result.ssaIRText = printIR(result.ssaIR);

    // Phase 5: Execution (on SSA IR)
    const interpreter = new IRInterpreter();
    const execResult = interpreter.execute(result.ssaIR);
    result.returnValue = execResult.returnValue;
    result.output = execResult.output;
    result.executionSteps = execResult.steps;

    result.success = true;
  } catch (e: unknown) {
    result.error = e instanceof Error ? e.message : String(e);
  }

  return result;
}

// Example programs from the compiler repo
export const EXAMPLES: { name: string; description: string; code: string }[] = [
  {
    name: 'Factorial',
    description: 'Compute 5! = 120 using a while loop',
    code: `int main() {
    int n = 5;
    int result = 1;
    int i = 1;
    while (i < n + 1) {
        result = result * i;
        i = i + 1;
    }
    return result;
}
`,
  },
  {
    name: 'Fibonacci',
    description: 'Compute the 10th Fibonacci number (55)',
    code: `int main() {
    int a = 0;
    int b = 1;
    int i = 0;
    while (i < 10) {
        int temp = a + b;
        a = b;
        b = temp;
        i = i + 1;
    }
    return a;
}
`,
  },
  {
    name: 'Print Loop',
    description: 'Print numbers 1 through 5',
    code: `int main() {
    int i = 1;
    while (i < 6) {
        print(i);
        i = i + 1;
    }
    return 0;
}
`,
  },
  {
    name: 'Array Operations',
    description: 'Fill and print an array: 0, 10, 20, 30, 40',
    code: `int main() {
    int arr[10];
    int i = 0;

    // Fill array: 0, 10, 20, 30...
    while (i < 5) {
        arr[i] = i * 10;
        i = i + 1;
    }

    // Print array
    int j = 0;
    while (j < 5) {
        print(arr[j]);
        j = j + 1;
    }

    return 0;
}
`,
  },
];
