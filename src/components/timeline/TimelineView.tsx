import { useEffect, useState } from 'react';
import type { Match, Team, Venue } from '~/lib/schemas';
import { getNextUpcomingMatch, groupMatchesByPhase } from '~/lib/matches';
import { PhaseSection } from './PhaseSection';

interface Props {
  matches: Match[];
  teams: Team[];
  venues: Venue[];
  venueImageMap: Record<string, string>;
}

export function TimelineView({ matches, teams, venues, venueImageMap }: Props) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const next = nowMs !== null ? getNextUpcomingMatch(matches, nowMs) : null;
  const phases = groupMatchesByPhase(matches);

  // Auto-scroll once when nowMs becomes available (post-mount)
  useEffect(() => {
    if (!next || nowMs === null) return;
    const el = document.getElementById(`match-${next.id}`);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
    // Run only once when next first resolves — guarded by ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowMs === null]);

  return (
    <>
      {phases.map(({ phase, matches: phaseMatches }) => (
        <PhaseSection
          key={phase}
          phase={phase}
          matches={phaseMatches}
          teams={teams}
          venues={venues}
          venueImageMap={venueImageMap}
          nowMs={nowMs ?? 0}
          nextMatchId={next?.id ?? null}
        />
      ))}
    </>
  );
}
