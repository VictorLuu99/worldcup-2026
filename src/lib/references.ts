import type { Team, Venue, Match, TeamRef } from './schemas';

export interface ResolvedTeam { display: string; flagClass: string | null; qualified: boolean; }

export function resolveTeamRef(ref: TeamRef, teams: Team[]): ResolvedTeam {
  if (ref.type === 'placeholder') {
    return { display: ref.label, flagClass: null, qualified: false };
  }
  const t = teams.find(x => x.code === ref.code);
  if (!t) throw new Error(`Unknown team code: ${ref.code}`);
  return { display: t.nameVi, flagClass: t.flagClass, qualified: t.qualified };
}

export function resolveVenue(id: string, venues: Venue[]): Venue {
  const v = venues.find(x => x.id === id);
  if (!v) throw new Error(`Unknown venue id: ${id}`);
  return v;
}

export function validateCrossRefs(data: { teams: Team[]; venues: Venue[]; matches: Match[] }): void {
  const teamCodes = new Set(data.teams.map(t => t.code));
  const venueIds = new Set(data.venues.map(v => v.id));
  for (const m of data.matches) {
    if (!venueIds.has(m.venueId)) throw new Error(`Match ${m.id} references unknown venue: ${m.venueId}`);
    for (const ref of [m.home, m.away]) {
      if (ref.type === 'team' && !teamCodes.has(ref.code)) {
        throw new Error(`Match ${m.id} references unknown team: ${ref.code}`);
      }
    }
  }
}
