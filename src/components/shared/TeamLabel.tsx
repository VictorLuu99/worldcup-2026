import { Flag } from './Flag';
import type { TeamRef, Team } from '~/lib/schemas';
import { resolveTeamRef } from '~/lib/references';

interface Props { teamRef: TeamRef; teams: Team[]; }

export function TeamLabel({ teamRef, teams }: Props) {
  const resolved = resolveTeamRef(teamRef, teams);
  const isPlaceholder = teamRef.type === 'placeholder';
  return (
    <span className={`inline-flex items-center gap-2 ${isPlaceholder ? 'text-white/60 italic' : 'text-white'}`}>
      <Flag flagClass={resolved.flagClass} />
      <span className="font-semibold">{resolved.display}</span>
    </span>
  );
}
