import type { Phase } from '../App';

const PHASES: { id: Phase; label: string; icon: string }[] = [
  { id: 'source', label: 'Source', icon: '📝' },
  { id: 'tokens', label: 'Lexer', icon: '🔤' },
  { id: 'ast', label: 'Parser', icon: '🌳' },
  { id: 'ir', label: 'IR Gen', icon: '📋' },
  { id: 'ssa', label: 'SSA', icon: '🔀' },
  { id: 'execution', label: 'Execute', icon: '⚡' },
];

interface PhaseNavigatorProps {
  activePhase: Phase;
  completedPhases: Phase[];
  onPhaseClick: (phase: Phase) => void;
  hasResult: boolean;
}

export default function PhaseNavigator({ activePhase, completedPhases, onPhaseClick, hasResult }: PhaseNavigatorProps) {
  return (
    <div className="phase-nav">
      {PHASES.map((phase, i) => {
        const isCompleted = completedPhases.includes(phase.id);
        const isActive = activePhase === phase.id;
        const isClickable = phase.id === 'source' || isCompleted;

        return (
          <div key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {i > 0 && <span className="phase-arrow">→</span>}
            <button
              className={`phase-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => isClickable && onPhaseClick(phase.id)}
              style={{ opacity: !hasResult && phase.id !== 'source' ? 0.4 : 1 }}
            >
              <span className="phase-step-number">
                {isCompleted && !isActive ? '✓' : i + 1}
              </span>
              <span>{phase.icon} {phase.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
