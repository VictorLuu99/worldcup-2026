import type { Match, Team } from '~/lib/schemas';
import { PHASE_META } from '~/lib/constants';
import { BracketMatch } from './BracketMatch';

interface Props { phase: Match['phase']; matches: Match[]; teams: Team[]; }

export function KnockoutColumn({ phase, matches, teams }: Props) {
  const meta = PHASE_META[phase];
  return (
    <div className="flex-1 min-w-[180px]">
      <div className="text-[10px] tracking-[3px] font-bold mb-3 text-center" style={{ color: phase === 'final' ? '#fff' : meta.color }}>
        {meta.labelVi}
      </div>
      <div className="space-y-3">
        {matches.map(m => <BracketMatch key={m.id} match={m} teams={teams} />)}
      </div>
    </div>
  );
}
