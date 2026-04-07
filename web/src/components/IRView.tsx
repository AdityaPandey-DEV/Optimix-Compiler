import { useState } from 'react';
import type { IRFunction } from '../compiler/ir';
import { instrToString } from '../compiler/ir';

interface IRViewProps {
  rawIR: IRFunction | null;
  ssaIR: IRFunction | null;
  rawIRText: string;
  ssaIRText: string;
  activeTab: 'raw' | 'ssa';
}

function renderIRBlocks(ir: any) {
  if (!ir || !ir.blocks) return null;

  return (
    <div className="ir-view">
      {ir.blocks.map((block: any, bi: number) => (
        <div key={bi} className="ir-block">
          <div className="ir-block-header">{block.label}:</div>
          {block.instructions?.map((inst: any, ii: number) => {
            // Use .text if available (WASM path), otherwise format via TS
            const text = inst.text || (inst.op ? instrToString(inst) : '');
            return (
              <div key={ii} className="ir-instruction">
                <span className="ir-opcode">{inst.op}</span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-code)', fontSize: '0.75rem' }}>
                  {text.replace(/^\w+\s*/, '')}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      {/* CFG Edges */}
      {ir.blocks.some((b: any) => b.succs?.length > 0 || b.preds?.length > 0) && (
        <div className="ir-block" style={{ background: 'var(--bg-secondary)' }}>
          <div className="ir-block-header" style={{ background: 'hsla(145, 60%, 40%, 0.1)', color: 'var(--accent-green)' }}>
            🔀 Control Flow Graph (CFG)
          </div>
          <div style={{ padding: '8px 12px' }}>
            {ir.blocks.map((block: any, bi: number) => {
              const succs = block.succs || [];
              if (succs.length === 0) return null;
              return (
                <div key={bi} className="cfg-edge">
                  <span style={{ color: 'var(--accent-violet)', fontFamily: 'var(--font-code)', fontSize: '0.72rem', fontWeight: 600 }}>
                    {block.label}
                  </span>
                  <span className="cfg-edge-arrow">→</span>
                  {succs.map((s: string, si: number) => (
                    <span key={si} style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)', fontSize: '0.72rem' }}>
                      {s}{si < succs.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function IRView({ rawIR, ssaIR, rawIRText, ssaIRText, activeTab }: IRViewProps) {
  const [tab, setTab] = useState<'raw' | 'ssa' | 'diff'>(activeTab);

  return (
    <>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">📋</span>
          Intermediate Representation
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`btn btn-sm ${tab === 'raw' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('raw')}
          >
            Raw IR
          </button>
          <button
            className={`btn btn-sm ${tab === 'ssa' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('ssa')}
          >
            SSA IR
          </button>
          <button
            className={`btn btn-sm ${tab === 'diff' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab('diff')}
          >
            Compare
          </button>
        </div>
      </div>

      <div className="panel-body">
        {tab === 'raw' && renderIRBlocks(rawIR)}
        {tab === 'ssa' && renderIRBlocks(ssaIR)}
        {tab === 'diff' && (
          <div className="ir-columns">
            <div className="ir-column">
              <div className="ir-column-header">Raw IR (Before SSA)</div>
              {renderIRBlocks(rawIR)}
            </div>
            <div className="ir-column">
              <div className="ir-column-header">SSA IR (After SSA)</div>
              {renderIRBlocks(ssaIR)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
