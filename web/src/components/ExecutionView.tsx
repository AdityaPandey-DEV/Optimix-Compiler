import { useState, useEffect, useRef } from 'react';
import type { ExecutionStep } from '../compiler/interpreter';

interface ExecutionViewProps {
  steps: ExecutionStep[];
  output: string[];
  returnValue: number;
  error?: string;
  success: boolean;
}

export default function ExecutionView({ steps, output, returnValue, error, success }: ExecutionViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(200);
  const intervalRef = useRef<number | null>(null);

  const step = steps.length > 0 ? steps[Math.min(currentStep, steps.length - 1)] : null;

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, steps.length, currentStep]);

  // Stop when reaching end
  useEffect(() => {
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length]);

  const registers = step ? Object.entries(step.registers) : [];
  const memory = step ? Object.entries(step.memory) : [];
  const currentOutput = step ? step.output : output;

  if (!success && error) {
    return (
      <>
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-icon">⚡</span>
            Execution
          </div>
        </div>
        <div className="panel-body panel-body-padded">
          <div className="console">
            <div className="console-line error">❌ Compilation Error:</div>
            <div className="console-line error">{error}</div>
          </div>
        </div>
      </>
    );
  }

  if (steps.length === 0) {
    // Show just the output if no steps (WASM path doesn't provide steps)
    return (
      <>
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-icon">⚡</span>
            Execution Result
          </div>
        </div>
        <div className="panel-body panel-body-padded">
          <div className="console">
            {output.map((line, i) => (
              <div key={i} className="console-line output">
                {line}
              </div>
            ))}
            <div className="console-return">
              Program returned: {returnValue}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">⚡</span>
          Step-Through Execution
        </div>
      </div>

      {/* Controls */}
      <div className="exec-controls">
        <button className="btn btn-sm btn-icon" onClick={() => { setCurrentStep(0); setIsPlaying(false); }} title="Reset">
          ⏮
        </button>
        <button className="btn btn-sm btn-icon" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} title="Step Back">
          ◀
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="btn btn-sm btn-icon" onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} title="Step Forward">
          ▶
        </button>
        <button className="btn btn-sm btn-icon" onClick={() => { setCurrentStep(steps.length - 1); setIsPlaying(false); }} title="End">
          ⏭
        </button>

        <input
          type="range"
          min={50}
          max={1000}
          step={50}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          title={`Speed: ${speed}ms/step`}
          style={{ width: 80, marginLeft: 8 }}
        />

        <span className="exec-step-counter">
          Step {currentStep + 1} / {steps.length}
          {step && ` • ${step.blockLabel}`}
        </span>
      </div>

      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
        {/* Current Instruction */}
        {step && (
          <div className="ir-block">
            <div className="ir-block-header">
              Current: {step.blockLabel} [#{step.instructionIndex}]
            </div>
            <div className="ir-instruction active">
              <span className="ir-opcode">{step.opCode}</span>
            </div>
          </div>
        )}

        {/* Registers */}
        {registers.length > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Virtual Registers
            </div>
            <table className="register-table">
              <thead>
                <tr><th>Name</th><th>Value</th></tr>
              </thead>
              <tbody>
                {registers.map(([name, val]) => (
                  <tr key={name}>
                    <td className="register-name">{name}</td>
                    <td className="register-value">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Memory */}
        {memory.length > 0 && (
          <div className="memory-grid">
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Array Memory
            </div>
            {memory.map(([name, cells]) => (
              <div key={name} className="memory-array">
                <span className="memory-array-name">{name}[]</span>
                <div className="memory-cells">
                  {(cells as number[]).map((val, i) => (
                    <div key={i} className="memory-cell">{val}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Output */}
        {currentOutput.length > 0 && (
          <div className="console" style={{ marginTop: 8 }}>
            {currentOutput.map((line, i) => (
              <div key={i} className="console-line output">{line}</div>
            ))}
          </div>
        )}

        {/* Return value (if at last step) */}
        {step?.returnValue !== undefined && (
          <div className="console-return" style={{ marginTop: 4 }}>
            Program returned: {step.returnValue}
          </div>
        )}
      </div>
    </>
  );
}
