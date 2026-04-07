// WASM Compiler Wrapper — tries real C++ WASM first, falls back to TypeScript
// This is the SINGLE entry point for all compiler operations in the frontend

import { compile as tsFallbackCompile, type CompilationResult } from '../compiler/pipeline';

// WASM module reference
let wasmModule: any = null;
let engineType: 'wasm' | 'typescript' = 'typescript';

/**
 * Initialize the compiler engine.
 * Attempts to load the real C++ compiler via WASM.
 * Falls back to TypeScript engine if WASM is unavailable.
 */
export async function initCompiler(): Promise<'wasm' | 'typescript'> {
  try {
    // Try loading the WASM module from public/
    const moduleFactory = (window as any).OptimixModule;
    if (moduleFactory) {
      wasmModule = await moduleFactory();
      engineType = 'wasm';
      console.log('✅ Optimix: Using real C++ compiler via WebAssembly');
      return 'wasm';
    }
    throw new Error('OptimixModule not found on window');
  } catch (err) {
    console.warn('⚠️ Optimix: WASM unavailable, using TypeScript fallback engine');
    console.warn('   (To use real C++, build with: make -f Makefile.wasm)');
    engineType = 'typescript';
    return 'typescript';
  }
}

/**
 * Get the current engine type
 */
export function getEngineType(): 'wasm' | 'typescript' {
  return engineType;
}

/**
 * Compile source code — uses WASM if available, TypeScript otherwise
 */
export function compile(source: string): CompilationResult {
  if (engineType === 'wasm' && wasmModule) {
    return compileViaWASM(source);
  }
  return tsFallbackCompile(source);
}

/**
 * Compile via the real C++ WASM module
 */
function compileViaWASM(source: string): CompilationResult {
  try {
    const jsonStr = wasmModule.compile(source);
    const data = JSON.parse(jsonStr);

    if (data.error && !data.success) {
      return {
        success: false,
        error: data.error,
        tokens: data.tokens || [],
        ast: data.ast || null,
        rawIR: data.rawIR || null,
        rawIRText: '',
        ssaIR: data.ssaIR || null,
        ssaIRText: '',
        returnValue: 0,
        output: [],
        executionSteps: [],
      };
    }

    // Reconstruct IR text from blocks
    const rawIRText = data.rawIR ? formatIR(data.rawIR) : '';
    const ssaIRText = data.ssaIR ? formatIR(data.ssaIR) : '';

    // Parse execution steps from real C++ execution
    const executionSteps = (data.executionSteps || []).map((step: any) => ({
      blockLabel: step.blockLabel || '',
      instructionIndex: step.instructionIndex || 0,
      opCode: step.opCode || '',
      registers: step.registers || {},
      memory: step.memory || {},
      output: step.output || [],
      returnValue: step.hasReturn ? step.returnValue : undefined,
    }));

    return {
      success: data.success,
      error: data.error || undefined,
      tokens: data.tokens || [],
      ast: data.ast || null,
      rawIR: data.rawIR || null,
      rawIRText,
      ssaIR: data.ssaIR || null,
      ssaIRText,
      returnValue: data.returnValue || 0,
      output: data.output || [],
      executionSteps,
    };
  } catch (e) {
    // If WASM call fails, fall back to TypeScript
    console.warn('WASM compile failed, falling back to TypeScript:', e);
    return tsFallbackCompile(source);
  }
}

/**
 * Format IR function data into text representation
 */
function formatIR(irData: any): string {
  if (!irData || !irData.blocks) return '';
  let output = `Function ${irData.name}:\n`;
  for (const block of irData.blocks) {
    output += `${block.label}:\n`;
    for (const inst of block.instructions) {
      output += `  ${inst.text}\n`;
    }
  }
  return output;
}

/**
 * Tokenize only — for phase-by-phase display
 */
export function tokenize(source: string) {
  if (engineType === 'wasm' && wasmModule) {
    try {
      const jsonStr = wasmModule.tokenize(source);
      return JSON.parse(jsonStr);
    } catch {
      // fallback
    }
  }
  // Use TS fallback
  const result = tsFallbackCompile(source);
  return result.tokens;
}

/**
 * Parse only — for AST display
 */
export function parse(source: string) {
  if (engineType === 'wasm' && wasmModule) {
    try {
      const jsonStr = wasmModule.parse(source);
      return JSON.parse(jsonStr);
    } catch {
      // fallback
    }
  }
  const result = tsFallbackCompile(source);
  return result.ast;
}
