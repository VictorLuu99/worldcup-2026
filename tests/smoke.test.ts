import { describe, it, expect } from 'vitest';
import { loadAllData } from '~/lib/data';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('loadAllData', () => {
  it('returns expected entity counts', () => {
    const data = loadAllData();
    expect(data.matches).toHaveLength(104);
    expect(data.venues).toHaveLength(16);
    expect(data.teams).toHaveLength(48);
    expect(data.groups).toHaveLength(12);
    expect(data.tournament.hosts).toEqual(['USA', 'CAN', 'MEX']);
  });
});
