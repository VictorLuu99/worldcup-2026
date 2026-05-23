import type { Match, Team } from '~/lib/schemas';
import { resolveTeamRef } from '~/lib/references';
import { Flag } from '~/components/shared/Flag';
import { formatDateVN } from '~/lib/time';
import { PHASE_META } from '~/lib/constants';

interface Props { match: Match; teams: Team[]; }

export function BracketMatch({ match, teams }: Props) {
  const meta = PHASE_META[match.phase];
  const home = resolveTeamRef(match.home, teams);
  const away = resolveTeamRef(match.away, teams);
  // `final` phase color is a gradient string — borders don't support gradients, use a solid fallback
  const borderColor = match.phase === 'final' ? '#ef4444' : meta.color;
  return (
    <div className="bg-white/[0.03] border rounded-md p-2 text-xs" style={{ borderColor }}>
      <div className="font-mono text-[9px] text-[var(--text-muted)] mb-1">TRẬN {match.matchNumber} · {formatDateVN(match.kickoff)}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5"><Flag flagClass={home.flagClass} /><span className={home.flagClass ? '' : 'italic text-white/60'}>{home.display}</span></div>
        <div className="flex items-center gap-1.5"><Flag flagClass={away.flagClass} /><span className={away.flagClass ? '' : 'italic text-white/60'}>{away.display}</span></div>
      </div>
    </div>
  );
}
