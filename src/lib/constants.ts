export type Phase = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';

export const PHASES: Phase[] = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];

export const PHASE_META: Record<Phase, {
  labelVi: string;
  color: string;          // CSS var name, NOT raw color
  glowColor: string;      // rgba for shadow
  order: number;
}> = {
  group:  { labelVi: 'VÒNG BẢNG',     color: 'var(--phase-group)', glowColor: 'rgba(255,214,10,0.4)',  order: 1 },
  r32:    { labelVi: 'VÒNG 32 ĐỘI',   color: 'var(--phase-r32)',   glowColor: 'rgba(168,85,247,0.4)',  order: 2 },
  r16:    { labelVi: 'VÒNG 16 ĐỘI',   color: 'var(--phase-r16)',   glowColor: 'rgba(0,180,216,0.4)',   order: 3 },
  qf:     { labelVi: 'TỨ KẾT',        color: 'var(--phase-qf)',    glowColor: 'rgba(34,197,94,0.4)',   order: 4 },
  sf:     { labelVi: 'BÁN KẾT',       color: 'var(--phase-sf)',    glowColor: 'rgba(244,114,182,0.4)', order: 5 },
  third:  { labelVi: 'TRANH HẠNG BA', color: 'var(--phase-third)', glowColor: 'rgba(148,163,184,0.3)', order: 6 },
  final:  { labelVi: 'CHUNG KẾT',     color: 'var(--phase-final-gradient)', glowColor: 'rgba(239,68,68,0.5)', order: 7 },
};

export const VN_TZ = 'Asia/Ho_Chi_Minh';
export const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours after kickoff
