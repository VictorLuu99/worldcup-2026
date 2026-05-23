import type { Match, Venue } from '~/lib/schemas';
import { formatVNTime, formatLocalTime } from '~/lib/time';
import { MapPin, Clock } from 'lucide-react';

interface Props { match: Match; venue: Venue; venueImage?: string; }

export function MatchExpand({ match, venue, venueImage }: Props) {
  return (
    <div className="mt-3 rounded-lg overflow-hidden bg-white/[0.03] border border-white/10">
      {venueImage && (
        <div className="h-40 sm:h-48 overflow-hidden">
          <img src={venueImage} alt={venue.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} className="text-[var(--gold)]" />
          <span className="font-semibold">{venue.name}</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-muted)]">{venue.city}, {venue.country}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} className="text-[var(--gold)]" />
          <span className="font-semibold">{formatVNTime(match.kickoff)} <span className="text-[var(--text-muted)] font-normal">giờ VN</span></span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-muted)]">{formatLocalTime(match.kickoff, venue.timezone)} giờ địa phương</span>
        </div>
        <div className="text-xs text-[var(--text-muted)]">Sức chứa: {venue.capacity.toLocaleString('vi-VN')}</div>
      </div>
    </div>
  );
}
