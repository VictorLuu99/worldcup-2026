# World Cup 2026 — Lịch thi đấu

Vietnamese single-page site for FIFA World Cup 2026 (USA · Canada · Mexico). Chronological timeline + bracket overview, deployed to Cloudflare Pages.

**🔗 Production:** https://worldcup-2026-dx0.pages.dev

## Features

- 104 matches across all 7 phases (group → R32 → R16 → QF → SF → third place → final)
- Default Timeline view auto-scrolls to the next upcoming match
- Bracket view matches the official FIFA bracket layout
- Vietnam time + venue local time on every match
- Live indicator (ĐANG ĐÁ) for in-progress matches
- 16 stadium photos lazy-loaded on click

## Stack

Astro 5 (static output) · React 19 islands · Tailwind v3 · Framer Motion · Zod · Vitest · Cloudflare Pages.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm test         # 43 tests
pnpm typecheck
pnpm build        # static output → ./dist
pnpm validate-data  # runs Zod schema validation against src/data/*.json
```

Node 22+ required (see `.nvmrc`).

## Update data

When FIFA publishes updated schedule, qualified teams, or group draw:

1. Edit JSON in `src/data/` (`teams.json`, `groups.json`, `matches.json`)
2. `pnpm validate-data` to catch broken references
3. `pnpm test` to confirm nothing else broke
4. `pnpm build`
5. Commit and deploy

## Deploy to Cloudflare Pages

```bash
pnpm build
pnpm exec wrangler pages deploy ./dist --project-name worldcup-2026 --branch main
```

Or connect this Git repo to Cloudflare Pages dashboard with build command `pnpm build` and output directory `dist`.

## Project structure

```
src/
├── data/                   # 5 JSON files (tournament, teams, venues, groups, matches)
├── lib/                    # schemas, time, matches, references, constants, data loader
├── components/
│   ├── Hero/StatsStrip/Header/Footer (Astro server-only)
│   ├── Countdown/TabRouter (React islands)
│   ├── timeline/           # PhaseSection, MatchRow, MatchExpand, DayDivider, TimelineView
│   ├── bracket/            # GroupCard, BracketMatch, KnockoutColumn, BracketView
│   └── shared/             # Flag, TeamLabel, PhaseBadge
├── pages/index.astro       # single page: data load + both views
├── styles/                 # tokens.css + global.css
├── layouts/Base.astro
└── assets/
    ├── hero/               # 1 banner
    └── venues/             # 16 stadium photos
```

## License

Personal project. Image credits in [`IMAGE-CREDITS.md`](IMAGE-CREDITS.md).
