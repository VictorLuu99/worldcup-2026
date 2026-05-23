import type { Match } from './schemas';
import { LIVE_WINDOW_MS, PHASES } from './constants';

export type MatchStatus = 'past' | 'live' | 'upcoming';

export function getMatchStatus(match: Match, nowMs: number): MatchStatus {
  const kickoff = new Date(match.kickoff).getTime();
  if (nowMs < kickoff) return 'upcoming';
  if (nowMs < kickoff + LIVE_WINDOW_MS) return 'live';
  return 'past';
}

export function getNextUpcomingMatch(matches: Match[], nowMs: number): Match | null {
  const sorted = [...matches].sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const live = sorted.find(m => getMatchStatus(m, nowMs) === 'live');
  if (live) return live;
  const upcoming = sorted.find(m => getMatchStatus(m, nowMs) === 'upcoming');
  return upcoming ?? null;
}

export function groupMatchesByPhase(matches: Match[]): Array<{ phase: Match['phase']; matches: Match[] }> {
  const byPhase = new Map<Match['phase'], Match[]>();
  for (const m of matches) {
    if (!byPhase.has(m.phase)) byPhase.set(m.phase, []);
    byPhase.get(m.phase)!.push(m);
  }
  for (const list of byPhase.values()) {
    list.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  }
  return PHASES
    .filter(p => byPhase.has(p))
    .map(p => ({ phase: p, matches: byPhase.get(p)! }));
}

export function groupMatchesByDay(matches: Match[], tz: string): Array<{ dayKey: string; matches: Match[] }> {
  const byDay = new Map<string, Match[]>();
  for (const m of matches) {
    const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit' })
      .format(new Date(m.kickoff));
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(m);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, matches]) => ({ dayKey, matches }));
}

