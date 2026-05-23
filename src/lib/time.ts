import { VN_TZ } from './constants';

const VN_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function partsInTz(iso: string, tz: string): { y: number; m: number; d: number; hh: number; mm: number; weekday: number } {
  const date = new Date(iso);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    weekday: 'short',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
  const weekdayMap: Record<string, number> = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
    hh: Number(parts.hour === '24' ? '00' : parts.hour),
    mm: Number(parts.minute),
    weekday: weekdayMap[parts.weekday as string] ?? 0,
  };
}

export function formatVNTime(isoUtc: string): string {
  const p = partsInTz(isoUtc, VN_TZ);
  const hhmm = `${String(p.hh).padStart(2,'0')}:${String(p.mm).padStart(2,'0')}`;
  return `${hhmm} ${VN_WEEKDAYS[p.weekday]}, ${p.d}/${p.m}`;
}

export function formatLocalTime(isoUtc: string, tz: string): string {
  const p = partsInTz(isoUtc, tz);
  return `${String(p.hh).padStart(2,'0')}:${String(p.mm).padStart(2,'0')}`;
}

export function formatDateVN(isoUtc: string): string {
  const p = partsInTz(isoUtc, VN_TZ);
  return `${p.d}/${p.m}`;
}

export function daysUntil(targetIso: string, nowMs: number): number {
  const target = new Date(targetIso).getTime();
  const diffMs = target - nowMs;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
