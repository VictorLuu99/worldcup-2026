import { describe, it, expect } from 'vitest';
import { getMatchStatus, getNextUpcomingMatch, groupMatchesByPhase, groupMatchesByDay } from '~/lib/matches';
import type { Match } from '~/lib/schemas';

const make = (id: number, phase: Match['phase'], kickoff: string, opts: Partial<Match> = {}): Match => ({
  id, matchNumber: id, phase, group: phase === 'group' ? 'A' : null,
  kickoff, venueId: 'sofi',
  home: { type: 'team', code: 'USA' },
  away: { type: 'team', code: 'CAN' },
  bracketSlot: phase === 'group' ? null : `${phase}-${id}`,
  ...opts,
});

describe('getMatchStatus', () => {
  it('past: now after kickoff + 2h', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T22:00:00Z').getTime();
    expect(getMatchStatus(m, now)).toBe('past');
  });

  it('live: now within 2h after kickoff', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T20:00:00Z').getTime();
    expect(getMatchStatus(m, now)).toBe('live');
  });

  it('upcoming: now before kickoff', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T18:00:00Z').getTime();
    expect(getMatchStatus(m, now)).toBe('upcoming');
  });

  it('boundary: exactly at kickoff is live', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T19:00:00Z').getTime();
    expect(getMatchStatus(m, now)).toBe('live');
  });

  it('boundary: exactly at kickoff + 2h is past', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T21:00:00Z').getTime();
    expect(getMatchStatus(m, now)).toBe('past');
  });
});

describe('getNextUpcomingMatch', () => {
  it('returns live match if one exists', () => {
    const matches = [
      make(1, 'group', '2026-06-11T19:00:00Z'),
      make(2, 'group', '2026-06-12T00:00:00Z'),
    ];
    const now = new Date('2026-06-11T20:00:00Z').getTime();
    expect(getNextUpcomingMatch(matches, now)?.id).toBe(1);
  });

  it('returns earliest upcoming if no live', () => {
    const matches = [
      make(1, 'group', '2026-06-12T19:00:00Z'),
      make(2, 'group', '2026-06-13T00:00:00Z'),
    ];
    const now = new Date('2026-06-11T20:00:00Z').getTime();
    expect(getNextUpcomingMatch(matches, now)?.id).toBe(1);
  });

  it('returns null if all matches are past', () => {
    const matches = [make(1, 'group', '2026-06-11T19:00:00Z')];
    const now = new Date('2026-07-20T00:00:00Z').getTime();
    expect(getNextUpcomingMatch(matches, now)).toBeNull();
  });

  it('handles unsorted input', () => {
    const matches = [
      make(3, 'group', '2026-06-14T19:00:00Z'),
      make(1, 'group', '2026-06-12T19:00:00Z'),
      make(2, 'group', '2026-06-13T19:00:00Z'),
    ];
    const now = new Date('2026-06-11T20:00:00Z').getTime();
    expect(getNextUpcomingMatch(matches, now)?.id).toBe(1);
  });
});

describe('groupMatchesByPhase', () => {
  it('groups in phase order', () => {
    const matches = [
      make(73, 'r32', '2026-06-28T19:00:00Z'),
      make(1, 'group', '2026-06-11T19:00:00Z'),
      make(104, 'final', '2026-07-19T19:00:00Z'),
    ];
    const grouped = groupMatchesByPhase(matches);
    expect(grouped.map(g => g.phase)).toEqual(['group', 'r32', 'final']);
  });
});

describe('groupMatchesByDay', () => {
  const VN_TZ = 'Asia/Ho_Chi_Minh';

  it('groups matches by VN calendar day', () => {
    const matches = [
      make(1, 'group', '2026-06-11T19:00:00Z'),  // VN: 02:00 12/6
      make(2, 'group', '2026-06-11T22:00:00Z'),  // VN: 05:00 12/6 — same VN day
      make(3, 'group', '2026-06-12T15:00:00Z'),  // VN: 22:00 12/6 — same VN day
      make(4, 'group', '2026-06-12T18:00:00Z'),  // VN: 01:00 13/6 — next VN day
    ];
    const grouped = groupMatchesByDay(matches, VN_TZ);
    expect(grouped).toHaveLength(2);
    expect(grouped[0].matches.map(m => m.id).sort()).toEqual([1, 2, 3]);
    expect(grouped[1].matches.map(m => m.id).sort()).toEqual([4]);
  });

  it('result is chronologically sorted by day', () => {
    const matches = [
      make(3, 'group', '2026-06-15T10:00:00Z'),
      make(1, 'group', '2026-06-11T10:00:00Z'),
      make(2, 'group', '2026-06-13T10:00:00Z'),
    ];
    const grouped = groupMatchesByDay(matches, VN_TZ);
    expect(grouped.map(g => g.dayKey)).toEqual(['2026-06-11', '2026-06-13', '2026-06-15']);
  });

  it('uses the provided timezone, not UTC', () => {
    // 23:00 UTC on 6/11 = 06:00 on 6/12 in VN (+7) but stays on 6/11 in UTC
    const matches = [make(1, 'group', '2026-06-11T23:00:00Z')];
    const vnGrouped = groupMatchesByDay(matches, VN_TZ);
    const utcGrouped = groupMatchesByDay(matches, 'UTC');
    expect(vnGrouped[0].dayKey).toBe('2026-06-12');
    expect(utcGrouped[0].dayKey).toBe('2026-06-11');
  });
});
