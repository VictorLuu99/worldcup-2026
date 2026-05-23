import type { Group, Team } from '~/lib/schemas';
import { resolveTeamRef } from '~/lib/references';
import { Flag } from '~/components/shared/Flag';

interface Props { group: Group; teams: Team[]; }

export function GroupCard({ group, teams }: Props) {
  return (
    <div className="bg-white/[0.04] border border-[var(--phase-group)]/40 rounded-lg p-3">
      <div className="text-[10px] tracking-[3px] text-[var(--phase-group)] font-bold mb-2">BẢNG {group.letter}</div>
      <ul className="space-y-1.5">
        {group.teams.map((code, i) => {
          const resolved = resolveTeamRef({ type: 'team', code }, teams);
          const isPlaceholder = code.startsWith('TBD-');
          return (
            <li key={i} className={`flex items-center gap-2 text-xs ${isPlaceholder ? 'text-white/40 italic' : 'text-white'}`}>
              <Flag flagClass={resolved.flagClass} />
              <span>{resolved.display}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
