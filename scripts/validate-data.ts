import { tournamentSchema, teamSchema, venueSchema, groupSchema, matchSchema } from '../src/lib/schemas';
import { validateCrossRefs } from '../src/lib/references';
import tournament from '../src/data/tournament.json';
import teams from '../src/data/teams.json';
import venues from '../src/data/venues.json';
import groups from '../src/data/groups.json';
import matches from '../src/data/matches.json';

tournamentSchema.parse(tournament);
const parsedTeams = teams.map(t => teamSchema.parse(t));
const parsedVenues = venues.map(v => venueSchema.parse(v));
const parsedGroups = groups.map(g => groupSchema.parse(g));
const parsedMatches = matches.map(m => matchSchema.parse(m));

validateCrossRefs({
  teams: parsedTeams,
  venues: parsedVenues,
  matches: parsedMatches,
});

if (matches.length !== 104) throw new Error(`Expected 104 matches, got ${matches.length}`);
if (venues.length !== 16)   throw new Error(`Expected 16 venues, got ${venues.length}`);
if (teams.length !== 48)    throw new Error(`Expected 48 teams, got ${teams.length}`);
if (groups.length !== 12)   throw new Error(`Expected 12 groups, got ${groups.length}`);

// Verify every team code in groups.json exists in teams.json
const teamCodes = new Set(parsedTeams.map(t => t.code));
for (const g of parsedGroups) {
  for (const code of g.teams) {
    if (!teamCodes.has(code)) throw new Error(`Group ${g.letter}: team code ${code} not in teams.json`);
  }
}

console.log('All data files valid. 104 matches, 16 venues, 48 teams, 12 groups.');
