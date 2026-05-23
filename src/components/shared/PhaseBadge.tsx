import { PHASE_META } from '~/lib/constants';
import type { Phase } from '~/lib/constants';

interface Props { phase: Phase; }

export function PhaseBadge({ phase }: Props) {
  const meta = PHASE_META[phase];
  const isFinal = phase === 'final';
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest"
      style={{
        background: isFinal ? meta.color : 'transparent',
        color: isFinal ? '#fff' : meta.color,
        border: `1px solid ${isFinal ? 'rgba(255,255,255,0.3)' : meta.color}`,
      }}
    >
      {meta.labelVi}
    </span>
  );
}
