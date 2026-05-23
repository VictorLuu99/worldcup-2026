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
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const next = getNextUpcomingMatch(matches, nowMs);
  const phases = groupMatchesByPhase(matches);

  // Auto-scroll once on first mount
  useEffect(() => {
    if (!next) return;
    const el = document.getElementById(`match-${next.id}`);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {phases.map(({ phase, matches }) => (
        <PhaseSection
          key={phase}
          phase={phase}
          matches={matches}
          teams={teams}
          venues={venues}
          venueImageMap={venueImageMap}
          nowMs={nowMs}
          nextMatchId={next?.id ?? null}
        />
      ))}
    </>
  );
}
