interface OutputConsoleProps {
  output: string[];
  returnValue: number;
  error?: string;
  success: boolean;
}

export default function OutputConsole({ output, returnValue, error, success }: OutputConsoleProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">💻</span>
          Program Output
        </div>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: success ? 'var(--accent-green)' : 'var(--accent-red)',
        }}>
          {success ? '✅ Compilation Successful' : '❌ Compilation Failed'}
        </span>
      </div>
      <div className="panel-body panel-body-padded">
        <div className="console">
          {error && (
            <div className="console-line error">Error: {error}</div>
          )}
          {output.length === 0 && !error && (
            <div className="console-line info">(no print output)</div>
          )}
          {output.map((line, i) => (
            <div key={i} className="console-line output">
              {line}
            </div>
          ))}
          {success && (
            <div className="console-return">
              Program returned: {returnValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
