import { z } from 'zod';
import { PHASES } from './constants';

const isoDate = z.string().date();        // validates YYYY-MM-DD AND that the calendar date is real
const isoUtc = z.string().datetime({ offset: false });  // requires Z suffix and valid time

export const tournamentSchema = z.object({
  name: z.string().min(1),
  hosts: z.array(z.string().length(3)).min(1),
  startDate: isoDate,
  endDate: isoDate,
  lastUpdated: isoDate,
});
export type Tournament = z.infer<typeof tournamentSchema>;

export const teamSchema = z.object({
  code: z.string().regex(/^[A-Z]{3}$/, 'code must be uppercase 3 letters').or(z.string().regex(/^TBD-[A-L][1-4]$/)),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  flagClass: z.string().regex(/^[a-z]{2}(-[a-z]{2,3})?$/, 'flag-icons CSS class must be ISO 3166-1 alpha-2 (optionally with subdivision)').nullable(),
  qualified: z.boolean(),
  group: z.string().regex(/^[A-L]$/).nullable(),
});
export type Team = z.infer<typeof teamSchema>;

export const venueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().regex(/^[A-Za-z_]+\/[A-Za-z_\/]+$/, 'IANA tz id'),
  capacity: z.number().int().positive(),
  photo: z.string().min(1),
});
export type Venue = z.infer<typeof venueSchema>;

export const groupSchema = z.object({
  letter: z.string().regex(/^[A-L]$/),
  teams: z.array(z.string()).length(4),
});
export type Group = z.infer<typeof groupSchema>;

const teamRef = z.discriminatedUnion('type', [
  z.object({ type: z.literal('team'), code: z.string() }),
  z.object({ type: z.literal('placeholder'), label: z.string().min(1) }),
]);
export type TeamRef = z.infer<typeof teamRef>;

export const matchSchema = z.object({
  id: z.number().int().positive(),
  matchNumber: z.number().int().min(1).max(104),
  phase: z.enum(PHASES as [string, ...string[]]),
  group: z.string().regex(/^[A-L]$/).nullable(),
  kickoff: isoUtc,
  venueId: z.string().min(1),
  home: teamRef,
  away: teamRef,
  bracketSlot: z.string().nullable(),
}).superRefine((m, ctx) => {
  if (m.phase === 'group' && m.group === null) {
    ctx.addIssue({ code: 'custom', message: 'group phase requires group letter' });
  }
  if (m.phase !== 'group' && m.bracketSlot === null) {
    ctx.addIssue({ code: 'custom', message: 'knockout phase requires bracketSlot' });
  }
});
export type Match = z.infer<typeof matchSchema>;
