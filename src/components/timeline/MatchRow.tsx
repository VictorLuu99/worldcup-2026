import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { Match, Team, Venue } from '~/lib/schemas';
import { TeamLabel } from '~/components/shared/TeamLabel';
import { PHASE_META } from '~/lib/constants';
import { getMatchStatus } from '~/lib/matches';
import { formatVNTime } from '~/lib/time';
import { MatchExpand } from './MatchExpand';
import { resolveVenue } from '~/lib/references';

interface Props {
  match: Match;
  teams: Team[];
  venues: Venue[];
  venueImageMap: Record<string, string>;
  nowMs: number;
  isNext: boolean;
}

export function MatchRow({ match, teams, venues, venueImageMap, nowMs, isNext }: Props) {
  const [expanded, setExpanded] = useState(false);
  const status = getMatchStatus(match, nowMs);
  const meta = PHASE_META[match.phase];
  const venue = resolveVenue(match.venueId, venues);

  const baseClasses = [
    'rounded-lg border px-4 py-3 cursor-pointer transition',
    status === 'past' ? 'opacity-40 border-white/5' : 'border-white/10 hover:border-white/30',
    isNext ? 'border-[var(--gold)]' : '',
  ].join(' ');

  const liveClasses = status === 'live' ? 'live-pulse border-[var(--live)]' : '';

  return (
    <article
      id={`match-${match.id}`}
      data-status={status}
      className={`${baseClasses} ${liveClasses}`}
      style={{
        borderLeft: `3px solid ${meta.color}`,
        boxShadow: isNext ? 'var(--next-glow)' : undefined,
        background: isNext ? 'rgba(255,214,10,0.05)' : 'rgba(255,255,255,0.02)',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
          TRẬN #{match.matchNumber}{match.group ? ` · BẢNG ${match.group}` : ''}
        </span>
        {status === 'live' && (
          <span className="text-[10px] font-bold tracking-widest text-[var(--live)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse"></span>
            ĐANG ĐÁ
          </span>
        )}
        {isNext && status === 'upcoming' && (
          <span className="text-[10px] font-bold tracking-widest text-[var(--gold)]">★ TIẾP THEO</span>
        )}
        <span className="ml-auto text-[11px] text-[var(--text-muted)]">{formatVNTime(match.kickoff).split(',')[0]} giờ VN</span>
        <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      <div className="flex items-center gap-3 mt-2">
        <TeamLabel teamRef={match.home} teams={teams} />
        <span className="text-[var(--text-muted)] text-xs">VS</span>
        <TeamLabel teamRef={match.away} teams={teams} />
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <MatchExpand match={match} venue={venue} venueImage={venueImageMap[venue.id]} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
