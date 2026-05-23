import { describe, it, expect } from 'vitest';
import { formatVNTime, formatLocalTime, formatDateVN, daysUntil } from '~/lib/time';

describe('time helpers', () => {
  it('formatVNTime: converts UTC to VN (UTC+7)', () => {
    // 2026-06-11 19:00 UTC = 2026-06-12 02:00 VN
    expect(formatVNTime('2026-06-11T19:00:00Z')).toMatch(/02:00.*12\/6/);
  });

  it('formatVNTime: includes weekday in Vietnamese', () => {
    const out = formatVNTime('2026-06-11T19:00:00Z');
    expect(out).toMatch(/(Thứ|CN)/);
  });

  it('formatLocalTime: converts UTC to venue tz with abbreviation', () => {
    expect(formatLocalTime('2026-06-11T19:00:00Z', 'America/Los_Angeles')).toMatch(/12:00 PDT/);
  });

  it('formatDateVN: returns short DD/M', () => {
    expect(formatDateVN('2026-06-11T19:00:00Z')).toBe('12/6');
  });

  it('daysUntil: calculates whole days between dates', () => {
    const result = daysUntil('2026-06-11T00:00:00Z', new Date('2026-05-23T00:00:00Z').getTime());
    expect(result).toBe(19);
  });

  it('daysUntil: zero when same day', () => {
    expect(daysUntil('2026-06-11T12:00:00Z', new Date('2026-06-11T08:00:00Z').getTime())).toBe(0);
  });

  it('daysUntil: negative when in the past', () => {
    expect(daysUntil('2026-05-23T00:00:00Z', new Date('2026-06-11T00:00:00Z').getTime())).toBe(-19);
  });
});
