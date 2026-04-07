import type { Token } from '../compiler/token';
import { TokenType, getTokenCategory } from '../compiler/token';

interface TokenViewProps {
  tokens: Token[];
}

export default function TokenView({ tokens }: TokenViewProps) {
  const filtered = tokens.filter(t => t.type !== TokenType.END_OF_FILE);

  return (
    <>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">🔤</span>
          Lexer Output — Token Stream
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {filtered.length} tokens
        </span>
      </div>
      <div className="panel-body">
        <div className="token-grid">
          {filtered.map((tok, i) => {
            const cat = getTokenCategory(tok.type);
            return (
              <div
                key={i}
                className={`token-pill ${cat}`}
                style={{ animationDelay: `${i * 30}ms` }}
                title={`${tok.type} at line ${tok.line}:${tok.column}`}
              >
                <span className="token-type-label">{cat}</span>
                <span>{tok.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
