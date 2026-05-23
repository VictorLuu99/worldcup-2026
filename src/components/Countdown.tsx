import { useEffect, useState } from 'react';
import { daysUntil } from '~/lib/time';

interface Props { startDateIso: string; }

export function Countdown({ startDateIso }: Props) {
  const [days, setDays] = useState(() => daysUntil(startDateIso, Date.now()));

  useEffect(() => {
    const tick = () => setDays(daysUntil(startDateIso, Date.now()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [startDateIso]);

  if (days > 0) {
    return (
      <div className="inline-flex items-baseline gap-2 mt-6 bg-white/5 border border-white/10 rounded-full px-5 py-2">
        <span className="text-[10px] tracking-[3px] text-[var(--text-muted)] uppercase">Còn</span>
        <span className="font-display text-3xl text-[var(--gold)] leading-none">{days}</span>
        <span className="text-[10px] tracking-[3px] text-[var(--text-muted)] uppercase">ngày tới khai mạc</span>
      </div>
    );
  }
  if (days === 0) {
    return <div className="inline-block mt-6 bg-[var(--gold)] text-[var(--bg-deep)] font-bold px-5 py-2 rounded-full tracking-widest">★ KHAI MẠC HÔM NAY</div>;
  }
  return <div className="inline-block mt-6 text-[var(--text-muted)] text-sm">Giải đấu đã bắt đầu</div>;
}
