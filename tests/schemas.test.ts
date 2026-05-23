import { describe, it, expect } from 'vitest';
import {
  tournamentSchema,
  teamSchema,
  venueSchema,
  groupSchema,
  matchSchema,
} from '~/lib/schemas';

describe('schemas', () => {
  it('tournament: parses valid object', () => {
    const parsed = tournamentSchema.parse({
      name: 'FIFA World Cup 2026',
      hosts: ['USA', 'CAN', 'MEX'],
      startDate: '2026-06-11',
      endDate: '2026-07-19',
      lastUpdated: '2026-05-23',
    });
    expect(parsed.hosts).toHaveLength(3);
  });

  it('tournament: rejects invalid date', () => {
    expect(() =>
      tournamentSchema.parse({
        name: 'X',
        hosts: ['USA'],
        startDate: 'not-a-date',
        endDate: '2026-07-19',
        lastUpdated: '2026-05-23',
      })
    ).toThrow();
  });

  it('team: parses team with placeholder qualification', () => {
    const parsed = teamSchema.parse({
      code: 'USA',
      nameVi: 'Mỹ',
      nameEn: 'United States',
      flagClass: 'us',
      qualified: true,
      group: 'D',
    });
    expect(parsed.code).toBe('USA');
  });

  it('team: code must be uppercase 3 letters', () => {
    expect(() =>
      teamSchema.parse({
        code: 'usa',
        nameVi: 'Mỹ',
        nameEn: 'United States',
        flagClass: 'us',
        qualified: true,
        group: null,
      })
    ).toThrow();
  });

  it('venue: requires IANA timezone', () => {
    const ok = venueSchema.parse({
      id: 'sofi',
      name: 'SoFi Stadium',
      city: 'Los Angeles',
      country: 'USA',
      timezone: 'America/Los_Angeles',
      capacity: 70240,
      photo: 'venues/sofi.jpg',
    });
    expect(ok.timezone).toContain('/');
  });

  it('group: letter must be A-L', () => {
    expect(() =>
      groupSchema.parse({ letter: 'M', teams: ['A', 'B', 'C', 'D'] })
    ).toThrow();
    expect(() =>
      groupSchema.parse({ letter: 'A', teams: ['MEX', 'TBD-A2', 'TBD-A3', 'TBD-A4'] })
    ).not.toThrow();
  });

  it('match: accepts team ref and placeholder ref', () => {
    const m = matchSchema.parse({
      id: 1,
      matchNumber: 1,
      phase: 'group',
      group: 'A',
      kickoff: '2026-06-11T19:00:00Z',
      venueId: 'azteca',
      home: { type: 'team', code: 'MEX' },
      away: { type: 'placeholder', label: 'Đội A2' },
      bracketSlot: null,
    });
    expect(m.away.type).toBe('placeholder');
  });

  it('match: knockout requires bracketSlot', () => {
    expect(() =>
      matchSchema.parse({
        id: 73,
        matchNumber: 73,
        phase: 'r32',
        group: null,
        kickoff: '2026-06-28T19:00:00Z',
        venueId: 'sofi',
        home: { type: 'placeholder', label: 'Nhất A' },
        away: { type: 'placeholder', label: 'Nhì B' },
        bracketSlot: null,
      })
    ).toThrow();
  });

  it('match: kickoff must be ISO UTC ending in Z', () => {
    expect(() =>
      matchSchema.parse({
        id: 1,
        matchNumber: 1,
        phase: 'group',
        group: 'A',
        kickoff: '2026-06-11T19:00:00+07:00',
        venueId: 'azteca',
        home: { type: 'team', code: 'MEX' },
        away: { type: 'placeholder', label: 'Đội A2' },
        bracketSlot: null,
      })
    ).toThrow();
  });
});
