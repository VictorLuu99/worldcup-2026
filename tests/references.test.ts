import { describe, it, expect } from 'vitest';
import { resolveTeamRef, resolveVenue, validateCrossRefs } from '~/lib/references';
import type { Team, Venue, Match } from '~/lib/schemas';

const teams: Team[] = [
  { code: 'USA', nameVi: 'Mỹ', nameEn: 'United States', flagClass: 'us', qualified: true, group: 'D' },
  { code: 'TBD-A2', nameVi: 'Đội A2', nameEn: 'TBD A2', flagClass: null, qualified: false, group: 'A' },
];

const venues: Venue[] = [
  { id: 'sofi', name: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', capacity: 70240, photo: 'venues/sofi.jpg' },
];

describe('resolveTeamRef', () => {
  it('resolves real team', () => {
    const r = resolveTeamRef({ type: 'team', code: 'USA' }, teams);
    expect(r.display).toBe('Mỹ');
    expect(r.flagClass).toBe('us');
  });

  it('resolves placeholder label', () => {
    const r = resolveTeamRef({ type: 'placeholder', label: 'Nhất A' }, teams);
    expect(r.display).toBe('Nhất A');
    expect(r.flagClass).toBeNull();
  });

  it('throws for unknown team code', () => {
    expect(() => resolveTeamRef({ type: 'team', code: 'XYZ' }, teams)).toThrow(/XYZ/);
  });
});

describe('resolveVenue', () => {
  it('resolves valid venue id', () => {
    expect(resolveVenue('sofi', venues).city).toBe('Los Angeles');
  });

  it('throws on unknown id', () => {
    expect(() => resolveVenue('nope', venues)).toThrow(/nope/);
  });
});

describe('validateCrossRefs', () => {
  it('passes when all refs resolve', () => {
    const matches: Match[] = [
      { id:1, matchNumber:1, phase:'group', group:'A', kickoff:'2026-06-11T19:00:00Z', venueId:'sofi',
        home:{type:'team',code:'USA'}, away:{type:'team',code:'TBD-A2'}, bracketSlot:null },
    ];
    expect(() => validateCrossRefs({ teams, venues, matches })).not.toThrow();
  });

  it('throws on broken venueId', () => {
    const matches: Match[] = [
      { id:1, matchNumber:1, phase:'group', group:'A', kickoff:'2026-06-11T19:00:00Z', venueId:'ghost',
        home:{type:'team',code:'USA'}, away:{type:'team',code:'TBD-A2'}, bracketSlot:null },
    ];
    expect(() => validateCrossRefs({ teams, venues, matches })).toThrow(/ghost/);
  });

  it('throws on broken teamCode', () => {
    const matches: Match[] = [
      { id:1, matchNumber:1, phase:'group', group:'A', kickoff:'2026-06-11T19:00:00Z', venueId:'sofi',
        home:{type:'team',code:'XYZ'}, away:{type:'team',code:'USA'}, bracketSlot:null },
    ];
    expect(() => validateCrossRefs({ teams, venues, matches })).toThrow(/XYZ/);
  });
});
