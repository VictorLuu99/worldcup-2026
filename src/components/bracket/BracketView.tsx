import type { Match, Group, Team } from '~/lib/schemas';
import { GroupCard } from './GroupCard';
import { KnockoutColumn } from './KnockoutColumn';

interface Props { matches: Match[]; groups: Group[]; teams: Team[]; }

export function BracketView({ matches, groups, teams }: Props) {
  const byPhase = (p: Match['phase']) => matches.filter(m => m.phase === p).sort((a, b) => a.matchNumber - b.matchNumber);
  return (
    <div className="container py-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
        {groups.map(g => <GroupCard key={g.letter} group={g} teams={teams} />)}
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-[900px]">
          <KnockoutColumn phase="r32"   matches={byPhase('r32')}   teams={teams} />
          <KnockoutColumn phase="r16"   matches={byPhase('r16')}   teams={teams} />
          <KnockoutColumn phase="qf"    matches={byPhase('qf')}    teams={teams} />
          <KnockoutColumn phase="sf"    matches={byPhase('sf')}    teams={teams} />
          <KnockoutColumn phase="third" matches={byPhase('third')} teams={teams} />
          <KnockoutColumn phase="final" matches={byPhase('final')} teams={teams} />
        </div>
      </div>
    </div>
  );
}
