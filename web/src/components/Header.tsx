interface HeaderProps {
  engineType: 'wasm' | 'typescript';
  isLoading: boolean;
}

export default function Header({ engineType, isLoading }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">⚙</div>
        <div>
          <div className="header-title">Optimix Playground</div>
          <div className="header-subtitle">Interactive Compiler Visualization</div>
        </div>
      </div>

      <div className="header-actions">
        <div className={`engine-badge ${engineType}`}>
          <span className="engine-badge-dot" />
          {isLoading ? 'Loading...' : engineType === 'wasm' ? 'C++ WASM Engine' : 'TypeScript Engine'}
        </div>

        <a
          href="https://github.com/AdityaPandey-DEV/Optimix-Compiler"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          ⭐ GitHub
        </a>
      </div>
    </header>
  );
}
