import { useState, useEffect, useCallback } from 'react';
import { initCompiler, compile, getEngineType } from './wasm/compiler';
import type { CompilationResult } from './compiler/pipeline';
import { EXAMPLES } from './compiler/pipeline';
import Header from './components/Header';
import PhaseNavigator from './components/PhaseNavigator';
import CodeEditor from './components/CodeEditor';
import TokenView from './components/TokenView';
import ASTView from './components/ASTView';
import IRView from './components/IRView';
import ExecutionView from './components/ExecutionView';
import OutputConsole from './components/OutputConsole';

export type Phase = 'source' | 'tokens' | 'ast' | 'ir' | 'ssa' | 'execution';

function App() {
  const [engineType, setEngineType] = useState<'wasm' | 'typescript' | 'loading'>('loading');
  const [source, setSource] = useState(EXAMPLES[0].code);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [activePhase, setActivePhase] = useState<Phase>('source');
  const [isCompiling, setIsCompiling] = useState(false);

  // Initialize compiler engine
  useEffect(() => {
    initCompiler().then((type) => {
      setEngineType(type);
    });
  }, []);

  // Compile handler
  const handleCompile = useCallback(() => {
    if (!source.trim()) return;
    setIsCompiling(true);
    // Use setTimeout to let UI update before blocking on compile
    setTimeout(() => {
      const compResult = compile(source);
      setResult(compResult);
      setIsCompiling(false);
      // Auto-navigate to first phase with data
      if (compResult.success) {
        setActivePhase('tokens');
      }
    }, 50);
  }, [source]);

  // Example selector
  const handleExampleChange = useCallback((code: string) => {
    setSource(code);
    setResult(null);
    setActivePhase('source');
  }, []);

  const completedPhases: Phase[] = [];
  if (result) {
    if (result.tokens.length > 0) completedPhases.push('tokens');
    if (result.ast) completedPhases.push('ast');
    if (result.rawIR) completedPhases.push('ir');
    if (result.ssaIR) completedPhases.push('ssa');
    if (result.success) completedPhases.push('execution');
  }

  return (
    <div className="app-layout">
      <Header
        engineType={engineType === 'loading' ? 'typescript' : engineType}
        isLoading={engineType === 'loading'}
      />

      <main className="app-main">
        <PhaseNavigator
          activePhase={activePhase}
          completedPhases={completedPhases}
          onPhaseClick={setActivePhase}
          hasResult={!!result}
        />

        {/* Left Column — Editor */}
        <div className="panel editor-panel">
          <CodeEditor
            source={source}
            onChange={setSource}
            onCompile={handleCompile}
            isCompiling={isCompiling}
            error={result?.error}
            examples={EXAMPLES}
            onExampleChange={handleExampleChange}
          />
        </div>

        {/* Right Column — Visualization */}
        <div className="panel" style={{ minHeight: 0 }}>
          {!result && (
            <div className="empty-state">
              <div className="empty-state-icon">⚡</div>
              <div className="empty-state-text">Write code and hit Compile</div>
              <div className="empty-state-hint">
                {engineType === 'wasm'
                  ? 'Real C++ compiler via WebAssembly'
                  : engineType === 'loading'
                  ? 'Loading compiler engine...'
                  : 'TypeScript compiler engine (WASM fallback)'}
              </div>
            </div>
          )}

          {result && activePhase === 'source' && (
            <div className="empty-state">
              <div className="empty-state-icon">👆</div>
              <div className="empty-state-text">Select a phase above to explore</div>
            </div>
          )}

          {result && activePhase === 'tokens' && (
            <TokenView tokens={result.tokens} />
          )}

          {result && activePhase === 'ast' && result.ast && (
            <ASTView ast={result.ast} />
          )}

          {result && (activePhase === 'ir' || activePhase === 'ssa') && (
            <IRView
              rawIR={result.rawIR}
              ssaIR={result.ssaIR}
              rawIRText={result.rawIRText}
              ssaIRText={result.ssaIRText}
              activeTab={activePhase === 'ssa' ? 'ssa' : 'raw'}
            />
          )}

          {result && activePhase === 'execution' && (
            <ExecutionView
              steps={result.executionSteps}
              output={result.output}
              returnValue={result.returnValue}
              error={result.error}
              success={result.success}
            />
          )}
        </div>

        {/* Output Console — full width */}
        {result && (
          <div style={{ gridColumn: '1 / -1' }}>
            <OutputConsole
              output={result.output}
              returnValue={result.returnValue}
              error={result.error}
              success={result.success}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
