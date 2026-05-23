import { formatDateVN } from '~/lib/time';

const VN_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

interface Props { dayKey: string; sampleIso: string; }

export function DayDivider({ dayKey: _dayKey, sampleIso }: Props) {
  const weekday = VN_WEEKDAYS[new Date(sampleIso).getUTCDay()];
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="h-px bg-white/10 flex-1" />
      <div className="text-xs tracking-[4px] text-[var(--text-muted)] uppercase">{weekday} · {formatDateVN(sampleIso)}</div>
      <div className="h-px bg-white/10 flex-1" />
    </div>
  );
}
