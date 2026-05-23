import { tournamentSchema, teamSchema, venueSchema, groupSchema, matchSchema } from './schemas';
import { validateCrossRefs } from './references';
import tournament from '~/data/tournament.json';
import teamsRaw from '~/data/teams.json';
import venuesRaw from '~/data/venues.json';
import groupsRaw from '~/data/groups.json';
import matchesRaw from '~/data/matches.json';

export function loadAllData() {
  const t = tournamentSchema.parse(tournament);
  const teams = teamsRaw.map(x => teamSchema.parse(x));
  const venues = venuesRaw.map(x => venueSchema.parse(x));
  const groups = groupsRaw.map(x => groupSchema.parse(x));
  const matches = matchesRaw.map(x => matchSchema.parse(x));
  validateCrossRefs({ teams, venues, matches });
  return { tournament: t, teams, venues, groups, matches };
}
