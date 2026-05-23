import { useMemo } from 'react';
import type { Match, Team, Venue } from '~/lib/schemas';
import { PHASE_META, VN_TZ } from '~/lib/constants';
import { groupMatchesByDay } from '~/lib/matches';
import { MatchRow } from './MatchRow';
import { DayDivider } from './DayDivider';

interface Props {
  phase: Match['phase'];
  matches: Match[];
  teams: Team[];
  venues: Venue[];
  venueImageMap: Record<string, string>;
  nowMs: number;
  nextMatchId: number | null;
}

export function PhaseSection({ phase, matches, teams, venues, venueImageMap, nowMs, nextMatchId }: Props) {
  const meta = PHASE_META[phase];
  const days = useMemo(() => groupMatchesByDay(matches, VN_TZ), [matches]);
  return (
    <section className="my-12">
      <div className="container">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-1" style={{ background: meta.color }} />
          <h2 className="font-display text-3xl tracking-[3px]" style={{ color: phase === 'final' ? '#fff' : meta.color }}>
            {meta.labelVi}
          </h2>
        </div>
        <p className="text-xs tracking-[3px] text-[var(--text-muted)] uppercase">{matches.length} trận</p>
        <div className="mt-6 space-y-2">
          {days.map(({ dayKey, matches: dayMatches }) => (
            <div key={dayKey}>
              <DayDivider dayKey={dayKey} sampleIso={dayMatches[0].kickoff} />
              <div className="space-y-3">
                {dayMatches.map(m => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    teams={teams}
                    venues={venues}
                    venueImageMap={venueImageMap}
                    nowMs={nowMs}
                    isNext={m.id === nextMatchId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
