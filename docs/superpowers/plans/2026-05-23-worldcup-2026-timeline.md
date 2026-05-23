# World Cup 2026 Timeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Vietnamese single-page website displaying the FIFA World Cup 2026 schedule with a chronological timeline (default view) and bracket overview (alternate tab), auto-scrolling to the next upcoming match. Deploy to Cloudflare Pages.

**Architecture:** Astro 5 with `output: 'static'` (no SSR adapter) renders both views server-side at build time. React 19 islands hydrate only what needs JS: tab switcher, countdown ticker, timeline auto-scroll, match-row expand. All data lives in 5 JSON files under `src/data/`, validated at build time with Zod. Images go through Astro's built-in `astro:assets` pipeline (WebP, responsive srcsets).

**Tech Stack:** Astro 5 (static), React 19, Tailwind CSS v3, Framer Motion, Zod, `flag-icons` (MIT), Lucide icons, Google Fonts (Bebas Neue, Inter, JetBrains Mono), Vitest, Wrangler (Cloudflare Pages CLI).

**Spec:** [docs/superpowers/specs/2026-05-23-worldcup-2026-timeline-design.md](../specs/2026-05-23-worldcup-2026-timeline-design.md)

**Reference visual:** `referrence.png` in repo root.

**Reference codebase for stack patterns (read-only, don't copy blindly):** `/Users/vuongluu/Documents/jobs/victorluu/party`

---

## File Structure (locked in before tasks)

```
worldcup_2026/                            # working directory
├── astro.config.mjs                      # Astro config (output: 'static', tailwind, react)
├── tailwind.config.ts                    # Tailwind theme with phase color tokens
├── tsconfig.json                         # path aliases (~/* → src/*)
├── vitest.config.ts                      # Vitest setup
├── package.json
├── pnpm-lock.yaml
├── wrangler.toml                         # Cloudflare Pages project config
├── .gitignore
├── .nvmrc                                # node 20
├── IMAGE-CREDITS.md                      # photo sources + licenses
├── README.md
├── referrence.png                        # already exists
│
├── docs/superpowers/{specs,plans}/       # already exists
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── env.d.ts
│   ├── layouts/
│   │   └── Base.astro                    # html shell, fonts, OG meta
│   ├── pages/
│   │   └── index.astro                   # single page; loads data, renders both views
│   ├── styles/
│   │   ├── tokens.css                    # CSS vars: palette, phase colors, spacing
│   │   └── global.css                    # resets, font imports
│   ├── data/
│   │   ├── tournament.json
│   │   ├── teams.json
│   │   ├── venues.json
│   │   ├── groups.json
│   │   └── matches.json
│   ├── lib/
│   │   ├── schemas.ts                    # Zod schemas + parseDataFiles()
│   │   ├── time.ts                       # formatVNTime, formatLocalTime, ...
│   │   ├── matches.ts                    # getMatchStatus, getNextUpcomingMatch, ...
│   │   ├── references.ts                 # resolveTeamRef, resolveVenue, validateRefs
│   │   ├── data.ts                       # loadAllData() entrypoint
│   │   └── constants.ts                  # PHASE_META (label, color, order)
│   ├── assets/
│   │   ├── hero/wc2026-banner.jpg
│   │   ├── venues/<id>.jpg               # 16 files
│   │   └── og/og-card.jpg
│   └── components/
│       ├── Header.astro
│       ├── Hero.astro
│       ├── StatsStrip.astro
│       ├── Footer.astro
│       ├── Countdown.tsx                 # island, client:load
│       ├── TabRouter.tsx                 # island, client:load
│       ├── shared/
│       │   ├── Flag.tsx                  # <span class="fi fi-us">
│       │   ├── TeamLabel.tsx             # flag + Vietnamese name OR placeholder
│       │   └── PhaseBadge.tsx
│       ├── timeline/
│       │   ├── TimelineView.tsx          # island, client:load
│       │   ├── PhaseSection.tsx
│       │   ├── DayDivider.tsx
│       │   ├── MatchRow.tsx
│       │   └── MatchExpand.tsx
│       └── bracket/
│           ├── BracketView.tsx           # island, client:idle
│           ├── GroupCard.tsx
│           ├── KnockoutColumn.tsx
│           ├── BracketMatch.tsx
│           └── BracketLines.tsx
│
└── tests/
    ├── time.test.ts
    ├── matches.test.ts
    ├── schemas.test.ts
    └── references.test.ts
```

**Boundaries:**
- `src/data/*.json` — pure data, no logic
- `src/lib/*.ts` — pure functions, easy to unit test, no DOM/React
- `src/components/**/*` — pure presentation, receive resolved data via props
- `src/components/**/*.astro` — server-only, no client JS
- `src/components/**/*.tsx` — React islands, only when `client:*` directive is set on usage

---

## Task 1: Project scaffold + green build

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `.gitignore`, `.nvmrc`, `wrangler.toml`, `README.md`, `src/env.d.ts`, `src/pages/index.astro`, `public/favicon.svg`

- [ ] **Step 1: Init git**

```bash
cd /Users/vuongluu/Documents/jobs/victorluu/worldcup_2026
git init
```

- [ ] **Step 2: Write `.gitignore`**

```
node_modules
dist
.astro
.wrangler
.dev.vars
.env
.DS_Store
*.log
.superpowers/brainstorm
```

- [ ] **Step 3: Write `.nvmrc`**

```
20
```

- [ ] **Step 4: Write `package.json`**

```json
{
  "name": "worldcup-2026-timeline",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "typecheck": "astro check",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "astro": "^5.18.1",
    "@astrojs/react": "^5.0.5",
    "@astrojs/tailwind": "^5.1.5",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "tailwindcss": "^3.4.19",
    "framer-motion": "^12.40.0",
    "zod": "^3.24.0",
    "flag-icons": "^7.5.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.9",
    "@types/node": "^25.9.1",
    "@types/react": "^19.2.15",
    "@types/react-dom": "^19.2.3",
    "autoprefixer": "^10.5.0",
    "postcss": "^8.5.15",
    "typescript": "^5.9.3",
    "vitest": "^4.1.7",
    "wrangler": "^4.93.1"
  }
}
```

- [ ] **Step 5: Install**

```bash
pnpm install
```

Expected: dependencies resolve, lockfile created.

- [ ] **Step 6: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  vite: {
    resolve: {
      alias: {
        '~': new URL('./src/', import.meta.url).pathname,
      },
    },
  },
});
```

- [ ] **Step 7: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "~/*": ["src/*"] },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 8: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#001d3d',
        'bg-base': '#0a2540',
        'bg-elev': '#1d3557',
        gold: '#ffd60a',
        'phase-group': '#ffd60a',
        'phase-r32': '#a855f7',
        'phase-r16': '#00b4d8',
        'phase-qf': '#22c55e',
        'phase-sf': '#f472b6',
        'phase-third': '#94a3b8',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px' },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 9: Write `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
```

- [ ] **Step 10: Write `public/favicon.svg`** (placeholder — gold soccer ball emoji)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ffd60a"/><text x="50" y="68" text-anchor="middle" font-size="60">⚽</text></svg>
```

- [ ] **Step 11: Write `src/pages/index.astro` (placeholder)**

```astro
---
---
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>World Cup 2026 Timeline</title>
</head>
<body>
  <h1>WC 2026 — scaffold OK</h1>
</body>
</html>
```

- [ ] **Step 12: Verify build**

```bash
pnpm build
```

Expected: build succeeds, `dist/index.html` exists.

- [ ] **Step 13: Verify dev**

```bash
pnpm dev
```

Expected: server runs on http://localhost:4321, page shows "WC 2026 — scaffold OK".

Stop with Ctrl-C after confirming.

- [ ] **Step 14: First commit**

```bash
git add -A
git commit -m "chore: scaffold Astro 5 + React + Tailwind + tooling"
```

---

## Task 2: Vitest setup + first passing test

**Files:**
- Create: `vitest.config.ts`, `tests/smoke.test.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '~': new URL('./src/', import.meta.url).pathname } },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Write `tests/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

Expected: 1 passed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: vitest setup with smoke test"
```

---

## Task 3: Design tokens + global CSS

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Modify: `src/layouts/Base.astro` (will be created here)

- [ ] **Step 1: Write `src/styles/tokens.css`**

```css
:root {
  /* Base palette */
  --bg-deep: #001d3d;
  --bg-base: #0a2540;
  --bg-elev: #1d3557;
  --gold: #ffd60a;
  --white: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.6);
  --text-dim: rgba(255, 255, 255, 0.4);

  /* Phase accents */
  --phase-group: #ffd60a;
  --phase-r32: #a855f7;
  --phase-r16: #00b4d8;
  --phase-qf: #22c55e;
  --phase-sf: #f472b6;
  --phase-third: #94a3b8;
  --phase-final-gradient: linear-gradient(135deg, #ef4444, #ffd60a);

  /* State */
  --live: #22c55e;
  --next-glow: 0 0 20px rgba(255, 214, 10, 0.4);
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);

  /* Spacing & sizing */
  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 12px;
  --container-max: 1200px;
}

@keyframes live-pulse {
  0%, 100% { box-shadow: 0 0 24px rgba(34, 197, 94, 0.5); }
  50% { box-shadow: 0 0 12px rgba(34, 197, 94, 0.25); }
}

.live-pulse { animation: live-pulse 2s ease-in-out infinite; }
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
@import 'flag-icons/css/flag-icons.min.css';
@import './tokens.css';

@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

html, body {
  background: var(--bg-deep);
  color: var(--white);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; }
img, picture, svg { display: block; max-width: 100%; }

.container { max-width: var(--container-max); margin: 0 auto; padding: 0 16px; }
```

- [ ] **Step 3: Create `src/layouts/Base.astro`**

```astro
---
interface Props { title?: string; description?: string; }
const { title = 'World Cup 2026 — Lịch thi đấu', description = 'Lịch trình thi đấu World Cup 2026 (USA · Canada · Mexico) — 104 trận đấu, timeline + bracket bằng tiếng Việt.' } = Astro.props;
import '~/styles/global.css';
---
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/og-card.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 4: Update `src/pages/index.astro` to use Base**

```astro
---
import Base from '~/layouts/Base.astro';
---
<Base>
  <main class="container py-12">
    <h1 class="font-display text-6xl tracking-[4px] text-white">WORLD CUP 2026</h1>
    <p class="text-[var(--text-muted)] mt-2">Tokens OK</p>
    <div class="flex gap-2 mt-4">
      <span class="inline-block w-12 h-6 rounded" style="background: var(--phase-group)"></span>
      <span class="inline-block w-12 h-6 rounded" style="background: var(--phase-r32)"></span>
      <span class="inline-block w-12 h-6 rounded" style="background: var(--phase-r16)"></span>
      <span class="inline-block w-12 h-6 rounded" style="background: var(--phase-qf)"></span>
      <span class="inline-block w-12 h-6 rounded" style="background: var(--phase-sf)"></span>
      <span class="inline-block w-12 h-6 rounded" style="background: var(--phase-final-gradient)"></span>
    </div>
  </main>
</Base>
```

- [ ] **Step 5: Verify visually**

```bash
pnpm dev
```

Open http://localhost:4321. Expect: dark navy background, gold display title "WORLD CUP 2026" in Bebas Neue, 6 colored swatches under it. Stop with Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: design tokens, global CSS, Base layout"
```

---

## Task 4: Constants + PHASE_META

**Files:**
- Create: `src/lib/constants.ts`

- [ ] **Step 1: Write `src/lib/constants.ts`**

```ts
export type Phase = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';

export const PHASES: Phase[] = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'];

export const PHASE_META: Record<Phase, {
  labelVi: string;
  color: string;          // CSS var name, NOT raw color
  glowColor: string;      // rgba for shadow
  order: number;
}> = {
  group:  { labelVi: 'VÒNG BẢNG',     color: 'var(--phase-group)', glowColor: 'rgba(255,214,10,0.4)',  order: 1 },
  r32:    { labelVi: 'VÒNG 32 ĐỘI',   color: 'var(--phase-r32)',   glowColor: 'rgba(168,85,247,0.4)',  order: 2 },
  r16:    { labelVi: 'VÒNG 16 ĐỘI',   color: 'var(--phase-r16)',   glowColor: 'rgba(0,180,216,0.4)',   order: 3 },
  qf:     { labelVi: 'TỨ KẾT',        color: 'var(--phase-qf)',    glowColor: 'rgba(34,197,94,0.4)',   order: 4 },
  sf:     { labelVi: 'BÁN KẾT',       color: 'var(--phase-sf)',    glowColor: 'rgba(244,114,182,0.4)', order: 5 },
  third:  { labelVi: 'TRANH HẠNG BA', color: 'var(--phase-third)', glowColor: 'rgba(148,163,184,0.3)', order: 6 },
  final:  { labelVi: 'CHUNG KẾT',     color: 'var(--phase-final-gradient)', glowColor: 'rgba(239,68,68,0.5)', order: 7 },
};

export const VN_TZ = 'Asia/Ho_Chi_Minh';
export const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours after kickoff
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: phase metadata + constants"
```

---

## Task 5: Zod schemas (TDD)

**Files:**
- Create: `src/lib/schemas.ts`, `tests/schemas.test.ts`

- [ ] **Step 1: Write failing tests `tests/schemas.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import {
  tournamentSchema,
  teamSchema,
  venueSchema,
  groupSchema,
  matchSchema,
} from '~/lib/schemas';

describe('schemas', () => {
  it('tournament: parses valid object', () => {
    const parsed = tournamentSchema.parse({
      name: 'FIFA World Cup 2026',
      hosts: ['USA', 'CAN', 'MEX'],
      startDate: '2026-06-11',
      endDate: '2026-07-19',
      lastUpdated: '2026-05-23',
    });
    expect(parsed.hosts).toHaveLength(3);
  });

  it('tournament: rejects invalid date', () => {
    expect(() =>
      tournamentSchema.parse({
        name: 'X',
        hosts: ['USA'],
        startDate: 'not-a-date',
        endDate: '2026-07-19',
        lastUpdated: '2026-05-23',
      })
    ).toThrow();
  });

  it('team: parses team with placeholder qualification', () => {
    const parsed = teamSchema.parse({
      code: 'USA',
      nameVi: 'Mỹ',
      nameEn: 'United States',
      flagClass: 'us',
      qualified: true,
      group: 'D',
    });
    expect(parsed.code).toBe('USA');
  });

  it('team: code must be uppercase 3 letters', () => {
    expect(() =>
      teamSchema.parse({
        code: 'usa',
        nameVi: 'Mỹ',
        nameEn: 'United States',
        flagClass: 'us',
        qualified: true,
        group: null,
      })
    ).toThrow();
  });

  it('venue: requires IANA timezone', () => {
    const ok = venueSchema.parse({
      id: 'sofi',
      name: 'SoFi Stadium',
      city: 'Los Angeles',
      country: 'USA',
      timezone: 'America/Los_Angeles',
      capacity: 70240,
      photo: 'venues/sofi.jpg',
    });
    expect(ok.timezone).toContain('/');
  });

  it('group: letter must be A-L', () => {
    expect(() =>
      groupSchema.parse({ letter: 'M', teams: ['A', 'B', 'C', 'D'] })
    ).toThrow();
    expect(() =>
      groupSchema.parse({ letter: 'A', teams: ['MEX', 'TBD-A2', 'TBD-A3', 'TBD-A4'] })
    ).not.toThrow();
  });

  it('match: accepts team ref and placeholder ref', () => {
    const m = matchSchema.parse({
      id: 1,
      matchNumber: 1,
      phase: 'group',
      group: 'A',
      kickoff: '2026-06-11T19:00:00Z',
      venueId: 'azteca',
      home: { type: 'team', code: 'MEX' },
      away: { type: 'placeholder', label: 'Đội A2' },
      bracketSlot: null,
    });
    expect(m.away.type).toBe('placeholder');
  });

  it('match: knockout requires bracketSlot', () => {
    expect(() =>
      matchSchema.parse({
        id: 73,
        matchNumber: 73,
        phase: 'r32',
        group: null,
        kickoff: '2026-06-28T19:00:00Z',
        venueId: 'sofi',
        home: { type: 'placeholder', label: 'Nhất A' },
        away: { type: 'placeholder', label: 'Nhì B' },
        bracketSlot: null,
      })
    ).toThrow();
  });

  it('match: kickoff must be ISO UTC ending in Z', () => {
    expect(() =>
      matchSchema.parse({
        id: 1,
        matchNumber: 1,
        phase: 'group',
        group: 'A',
        kickoff: '2026-06-11T19:00:00+07:00',
        venueId: 'azteca',
        home: { type: 'team', code: 'MEX' },
        away: { type: 'placeholder', label: 'Đội A2' },
        bracketSlot: null,
      })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run tests — expect ALL FAIL**

```bash
pnpm test
```

Expected: tests fail with `Cannot find module '~/lib/schemas'`.

- [ ] **Step 3: Write `src/lib/schemas.ts`**

```ts
import { z } from 'zod';
import { PHASES } from './constants';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');
const isoUtc = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'must be ISO UTC ending in Z');

export const tournamentSchema = z.object({
  name: z.string().min(1),
  hosts: z.array(z.string().length(3)).min(1),
  startDate: isoDate,
  endDate: isoDate,
  lastUpdated: isoDate,
});
export type Tournament = z.infer<typeof tournamentSchema>;

export const teamSchema = z.object({
  code: z.string().regex(/^[A-Z]{3}$/, 'code must be uppercase 3 letters').or(z.string().regex(/^TBD-[A-L][1-4]$/)),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  flagClass: z.string().regex(/^[a-z]{2}$/, 'flag-icons CSS class must be ISO 3166-1 alpha-2').nullable(),
  qualified: z.boolean(),
  group: z.string().regex(/^[A-L]$/).nullable(),
});
export type Team = z.infer<typeof teamSchema>;

export const venueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().regex(/^[A-Za-z_]+\/[A-Za-z_\/]+$/, 'IANA tz id'),
  capacity: z.number().int().positive(),
  photo: z.string().min(1),
});
export type Venue = z.infer<typeof venueSchema>;

export const groupSchema = z.object({
  letter: z.string().regex(/^[A-L]$/),
  teams: z.array(z.string()).length(4),
});
export type Group = z.infer<typeof groupSchema>;

const teamRef = z.discriminatedUnion('type', [
  z.object({ type: z.literal('team'), code: z.string() }),
  z.object({ type: z.literal('placeholder'), label: z.string().min(1) }),
]);
export type TeamRef = z.infer<typeof teamRef>;

export const matchSchema = z.object({
  id: z.number().int().positive(),
  matchNumber: z.number().int().min(1).max(104),
  phase: z.enum(PHASES as [string, ...string[]]),
  group: z.string().regex(/^[A-L]$/).nullable(),
  kickoff: isoUtc,
  venueId: z.string().min(1),
  home: teamRef,
  away: teamRef,
  bracketSlot: z.string().nullable(),
}).superRefine((m, ctx) => {
  if (m.phase === 'group' && m.group === null) {
    ctx.addIssue({ code: 'custom', message: 'group phase requires group letter' });
  }
  if (m.phase !== 'group' && m.bracketSlot === null) {
    ctx.addIssue({ code: 'custom', message: 'knockout phase requires bracketSlot' });
  }
});
export type Match = z.infer<typeof matchSchema>;
```

- [ ] **Step 4: Run tests — expect ALL PASS**

```bash
pnpm test
```

Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): Zod schemas for all data files with TDD"
```

---

## Task 6: Time helpers (TDD)

**Files:**
- Create: `src/lib/time.ts`, `tests/time.test.ts`

- [ ] **Step 1: Write failing tests `tests/time.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { formatVNTime, formatLocalTime, formatDateVN, daysUntil } from '~/lib/time';

describe('time helpers', () => {
  it('formatVNTime: converts UTC to VN (UTC+7)', () => {
    // 2026-06-11 19:00 UTC = 2026-06-12 02:00 VN
    expect(formatVNTime('2026-06-11T19:00:00Z')).toMatch(/02:00.*12\/6/);
  });

  it('formatVNTime: includes weekday in Vietnamese', () => {
    // 2026-06-11 is a Thursday — but VN-converted (UTC+7) reads as Friday morning
    const out = formatVNTime('2026-06-11T19:00:00Z');
    expect(out).toMatch(/(Thứ|CN)/);
  });

  it('formatLocalTime: converts UTC to venue tz', () => {
    // 2026-06-11 19:00 UTC in America/Los_Angeles (UTC-7 PDT) = 12:00 noon
    expect(formatLocalTime('2026-06-11T19:00:00Z', 'America/Los_Angeles')).toMatch(/12:00/);
  });

  it('formatDateVN: returns short DD/M', () => {
    expect(formatDateVN('2026-06-11T19:00:00Z')).toBe('12/6');
  });

  it('daysUntil: calculates whole days between dates', () => {
    const result = daysUntil('2026-06-11T00:00:00Z', new Date('2026-05-23T00:00:00Z').getTime());
    expect(result).toBe(19);
  });

  it('daysUntil: zero when same day', () => {
    expect(daysUntil('2026-06-11T12:00:00Z', new Date('2026-06-11T08:00:00Z').getTime())).toBe(0);
  });

  it('daysUntil: negative when in the past', () => {
    expect(daysUntil('2026-05-23T00:00:00Z', new Date('2026-06-11T00:00:00Z').getTime())).toBe(-19);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pnpm test tests/time.test.ts
```

- [ ] **Step 3: Write `src/lib/time.ts`**

```ts
import { VN_TZ } from './constants';

const VN_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function partsInTz(iso: string, tz: string): { y: number; m: number; d: number; hh: number; mm: number; weekday: number } {
  const date = new Date(iso);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    weekday: 'short',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
  const weekdayMap: Record<string, number> = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
    hh: Number(parts.hour === '24' ? '00' : parts.hour),
    mm: Number(parts.minute),
    weekday: weekdayMap[parts.weekday as string] ?? 0,
  };
}

export function formatVNTime(isoUtc: string): string {
  const p = partsInTz(isoUtc, VN_TZ);
  const hhmm = `${String(p.hh).padStart(2,'0')}:${String(p.mm).padStart(2,'0')}`;
  return `${hhmm} ${VN_WEEKDAYS[p.weekday]}, ${p.d}/${p.m}`;
}

export function formatLocalTime(isoUtc: string, tz: string): string {
  const p = partsInTz(isoUtc, tz);
  return `${String(p.hh).padStart(2,'0')}:${String(p.mm).padStart(2,'0')}`;
}

export function formatDateVN(isoUtc: string): string {
  const p = partsInTz(isoUtc, VN_TZ);
  return `${p.d}/${p.m}`;
}

export function daysUntil(targetIso: string, nowMs: number): number {
  const target = new Date(targetIso).getTime();
  const diffMs = target - nowMs;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): time helpers (VN/local formatting, daysUntil)"
```

---

## Task 7: Match status helpers (TDD)

**Files:**
- Create: `src/lib/matches.ts`, `tests/matches.test.ts`

- [ ] **Step 1: Write failing tests `tests/matches.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getMatchStatus, getNextUpcomingMatch, groupMatchesByPhase } from '~/lib/matches';
import type { Match } from '~/lib/schemas';

const make = (id: number, phase: Match['phase'], kickoff: string, opts: Partial<Match> = {}): Match => ({
  id, matchNumber: id, phase, group: phase === 'group' ? 'A' : null,
  kickoff, venueId: 'sofi',
  home: { type: 'team', code: 'USA' },
  away: { type: 'team', code: 'CAN' },
  bracketSlot: phase === 'group' ? null : `${phase}-${id}`,
  ...opts,
});

describe('getMatchStatus', () => {
  it('past: now after kickoff + 2h', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T22:00:00Z').getTime(); // 3h after
    expect(getMatchStatus(m, now)).toBe('past');
  });

  it('live: now within 2h after kickoff', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T20:00:00Z').getTime(); // 1h after
    expect(getMatchStatus(m, now)).toBe('live');
  });

  it('upcoming: now before kickoff', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T18:00:00Z').getTime();
    expect(getMatchStatus(m, now)).toBe('upcoming');
  });

  it('boundary: exactly at kickoff is live', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T19:00:00Z').getTime();
    expect(getMatchStatus(m, now)).toBe('live');
  });

  it('boundary: exactly at kickoff + 2h is past', () => {
    const m = make(1, 'group', '2026-06-11T19:00:00Z');
    const now = new Date('2026-06-11T21:00:00Z').getTime();
    expect(getMatchStatus(m, now)).toBe('past');
  });
});

describe('getNextUpcomingMatch', () => {
  it('returns live match if one exists', () => {
    const matches = [
      make(1, 'group', '2026-06-11T19:00:00Z'),  // live at 20:00
      make(2, 'group', '2026-06-12T00:00:00Z'),  // upcoming
    ];
    const now = new Date('2026-06-11T20:00:00Z').getTime();
    expect(getNextUpcomingMatch(matches, now)?.id).toBe(1);
  });

  it('returns earliest upcoming if no live', () => {
    const matches = [
      make(1, 'group', '2026-06-12T19:00:00Z'),
      make(2, 'group', '2026-06-13T00:00:00Z'),
    ];
    const now = new Date('2026-06-11T20:00:00Z').getTime();
    expect(getNextUpcomingMatch(matches, now)?.id).toBe(1);
  });

  it('returns null if all matches are past', () => {
    const matches = [make(1, 'group', '2026-06-11T19:00:00Z')];
    const now = new Date('2026-07-20T00:00:00Z').getTime();
    expect(getNextUpcomingMatch(matches, now)).toBeNull();
  });

  it('handles unsorted input', () => {
    const matches = [
      make(3, 'group', '2026-06-14T19:00:00Z'),
      make(1, 'group', '2026-06-12T19:00:00Z'),
      make(2, 'group', '2026-06-13T19:00:00Z'),
    ];
    const now = new Date('2026-06-11T20:00:00Z').getTime();
    expect(getNextUpcomingMatch(matches, now)?.id).toBe(1);
  });
});

describe('groupMatchesByPhase', () => {
  it('groups in phase order', () => {
    const matches = [
      make(73, 'r32', '2026-06-28T19:00:00Z'),
      make(1, 'group', '2026-06-11T19:00:00Z'),
      make(104, 'final', '2026-07-19T19:00:00Z'),
    ];
    const grouped = groupMatchesByPhase(matches);
    expect(grouped.map(g => g.phase)).toEqual(['group', 'r32', 'final']);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
pnpm test tests/matches.test.ts
```

- [ ] **Step 3: Write `src/lib/matches.ts`**

```ts
import type { Match } from './schemas';
import { LIVE_WINDOW_MS, PHASES, PHASE_META } from './constants';

export type MatchStatus = 'past' | 'live' | 'upcoming';

export function getMatchStatus(match: Match, nowMs: number): MatchStatus {
  const kickoff = new Date(match.kickoff).getTime();
  if (nowMs < kickoff) return 'upcoming';
  if (nowMs < kickoff + LIVE_WINDOW_MS) return 'live';
  return 'past';
}

export function getNextUpcomingMatch(matches: Match[], nowMs: number): Match | null {
  // Live match takes priority; else earliest upcoming
  const sorted = [...matches].sort((a, b) => a.kickoff.localeCompare(b.kickoff));

  const live = sorted.find(m => getMatchStatus(m, nowMs) === 'live');
  if (live) return live;

  const upcoming = sorted.find(m => getMatchStatus(m, nowMs) === 'upcoming');
  return upcoming ?? null;
}

export function groupMatchesByPhase(matches: Match[]): Array<{ phase: Match['phase']; matches: Match[] }> {
  const byPhase = new Map<Match['phase'], Match[]>();
  for (const m of matches) {
    if (!byPhase.has(m.phase)) byPhase.set(m.phase, []);
    byPhase.get(m.phase)!.push(m);
  }
  for (const list of byPhase.values()) {
    list.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  }
  return PHASES
    .filter(p => byPhase.has(p))
    .map(p => ({ phase: p, matches: byPhase.get(p)! }));
}

export function groupMatchesByDay(matches: Match[], tz: string): Array<{ dayKey: string; matches: Match[] }> {
  const byDay = new Map<string, Match[]>();
  for (const m of matches) {
    const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit' })
      .format(new Date(m.kickoff));
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(m);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, matches]) => ({ dayKey, matches }));
}

export { PHASE_META };
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
pnpm test
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): match status + grouping helpers"
```

---

## Task 8: Reference resolution (TDD)

**Files:**
- Create: `src/lib/references.ts`, `tests/references.test.ts`

- [ ] **Step 1: Write failing tests `tests/references.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { resolveTeamRef, resolveVenue, validateCrossRefs } from '~/lib/references';
import type { Team, Venue, Match } from '~/lib/schemas';

const teams: Team[] = [
  { code: 'USA', nameVi: 'Mỹ', nameEn: 'United States', flagClass: 'us', qualified: true, group: 'D' },
  { code: 'TBD-A2', nameVi: 'Đội A2', nameEn: 'TBD A2', flagClass: null, qualified: false, group: 'A' },
];

const venues: Venue[] = [
  { id: 'sofi', name: 'SoFi Stadium', city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', capacity: 70240, photo: 'venues/sofi.jpg' },
];

describe('resolveTeamRef', () => {
  it('resolves real team', () => {
    const r = resolveTeamRef({ type: 'team', code: 'USA' }, teams);
    expect(r.display).toBe('Mỹ');
    expect(r.flagClass).toBe('us');
  });

  it('resolves placeholder label', () => {
    const r = resolveTeamRef({ type: 'placeholder', label: 'Nhất A' }, teams);
    expect(r.display).toBe('Nhất A');
    expect(r.flagClass).toBeNull();
  });

  it('throws for unknown team code', () => {
    expect(() => resolveTeamRef({ type: 'team', code: 'XYZ' }, teams)).toThrow(/XYZ/);
  });
});

describe('resolveVenue', () => {
  it('resolves valid venue id', () => {
    expect(resolveVenue('sofi', venues).city).toBe('Los Angeles');
  });

  it('throws on unknown id', () => {
    expect(() => resolveVenue('nope', venues)).toThrow(/nope/);
  });
});

describe('validateCrossRefs', () => {
  it('passes when all refs resolve', () => {
    const matches: Match[] = [
      { id:1, matchNumber:1, phase:'group', group:'A', kickoff:'2026-06-11T19:00:00Z', venueId:'sofi',
        home:{type:'team',code:'USA'}, away:{type:'team',code:'TBD-A2'}, bracketSlot:null },
    ];
    expect(() => validateCrossRefs({ teams, venues, matches })).not.toThrow();
  });

  it('throws on broken venueId', () => {
    const matches: Match[] = [
      { id:1, matchNumber:1, phase:'group', group:'A', kickoff:'2026-06-11T19:00:00Z', venueId:'ghost',
        home:{type:'team',code:'USA'}, away:{type:'team',code:'TBD-A2'}, bracketSlot:null },
    ];
    expect(() => validateCrossRefs({ teams, venues, matches })).toThrow(/ghost/);
  });

  it('throws on broken teamCode', () => {
    const matches: Match[] = [
      { id:1, matchNumber:1, phase:'group', group:'A', kickoff:'2026-06-11T19:00:00Z', venueId:'sofi',
        home:{type:'team',code:'XYZ'}, away:{type:'team',code:'USA'}, bracketSlot:null },
    ];
    expect(() => validateCrossRefs({ teams, venues, matches })).toThrow(/XYZ/);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Write `src/lib/references.ts`**

```ts
import type { Team, Venue, Match, TeamRef } from './schemas';

export interface ResolvedTeam { display: string; flagClass: string | null; qualified: boolean; }

export function resolveTeamRef(ref: TeamRef, teams: Team[]): ResolvedTeam {
  if (ref.type === 'placeholder') {
    return { display: ref.label, flagClass: null, qualified: false };
  }
  const t = teams.find(x => x.code === ref.code);
  if (!t) throw new Error(`Unknown team code: ${ref.code}`);
  return { display: t.nameVi, flagClass: t.flagClass, qualified: t.qualified };
}

export function resolveVenue(id: string, venues: Venue[]): Venue {
  const v = venues.find(x => x.id === id);
  if (!v) throw new Error(`Unknown venue id: ${id}`);
  return v;
}

export function validateCrossRefs(data: { teams: Team[]; venues: Venue[]; matches: Match[] }): void {
  const teamCodes = new Set(data.teams.map(t => t.code));
  const venueIds = new Set(data.venues.map(v => v.id));
  for (const m of data.matches) {
    if (!venueIds.has(m.venueId)) throw new Error(`Match ${m.id} references unknown venue: ${m.venueId}`);
    for (const ref of [m.home, m.away]) {
      if (ref.type === 'team' && !teamCodes.has(ref.code)) {
        throw new Error(`Match ${m.id} references unknown team: ${ref.code}`);
      }
    }
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): reference resolution + cross-ref validation"
```

---

## Task 9: Source authoritative data (FIFA 2026 schedule)

**Files:**
- Create: `src/data/tournament.json`, `src/data/venues.json`, `src/data/teams.json`, `src/data/groups.json`, `src/data/matches.json`

> **Note for implementer:** The schedule and group draw are publicly known by 2026-05-23. WebSearch FIFA's official 2026 schedule. Source of truth priority: fifa.com → en.wikipedia.org/wiki/2026_FIFA_World_Cup. Cross-check 104 matches before committing.

- [ ] **Step 1: WebSearch FIFA 2026 official schedule and group draw**

Suggested queries:
- "FIFA World Cup 2026 official match schedule full list"
- "FIFA World Cup 2026 group draw"
- "2026 FIFA World Cup venues 16 cities"

Sources to confirm: fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026, en.wikipedia.org/wiki/2026_FIFA_World_Cup, en.wikipedia.org/wiki/2026_FIFA_World_Cup_group_stage

- [ ] **Step 2: Write `src/data/tournament.json`**

```json
{
  "name": "FIFA World Cup 2026",
  "hosts": ["USA", "CAN", "MEX"],
  "startDate": "2026-06-11",
  "endDate": "2026-07-19",
  "lastUpdated": "2026-05-23"
}
```

- [ ] **Step 3: Write `src/data/venues.json`** — 16 stadiums

Use this template (fill in the exact official capacities and confirm city/country):

```json
[
  { "id": "azteca",      "name": "Estadio Azteca",         "city": "Mexico City",  "country": "MEX", "timezone": "America/Mexico_City",    "capacity": 87523, "photo": "venues/azteca.jpg" },
  { "id": "akron",       "name": "Estadio Akron",          "city": "Guadalajara",  "country": "MEX", "timezone": "America/Mexico_City",    "capacity": 49850, "photo": "venues/akron.jpg" },
  { "id": "bbva",        "name": "Estadio BBVA",           "city": "Monterrey",    "country": "MEX", "timezone": "America/Monterrey",      "capacity": 53500, "photo": "venues/bbva.jpg" },
  { "id": "bmo",         "name": "BMO Field",              "city": "Toronto",      "country": "CAN", "timezone": "America/Toronto",        "capacity": 45736, "photo": "venues/bmo.jpg" },
  { "id": "bcplace",     "name": "BC Place",               "city": "Vancouver",    "country": "CAN", "timezone": "America/Vancouver",      "capacity": 54500, "photo": "venues/bcplace.jpg" },
  { "id": "sofi",        "name": "SoFi Stadium",           "city": "Los Angeles",  "country": "USA", "timezone": "America/Los_Angeles",    "capacity": 70240, "photo": "venues/sofi.jpg" },
  { "id": "att",         "name": "AT&T Stadium",           "city": "Dallas",       "country": "USA", "timezone": "America/Chicago",        "capacity": 92967, "photo": "venues/att.jpg" },
  { "id": "metlife",     "name": "MetLife Stadium",        "city": "East Rutherford", "country": "USA", "timezone": "America/New_York",   "capacity": 82500, "photo": "venues/metlife.jpg" },
  { "id": "arrowhead",   "name": "Arrowhead Stadium",      "city": "Kansas City",  "country": "USA", "timezone": "America/Chicago",        "capacity": 76416, "photo": "venues/arrowhead.jpg" },
  { "id": "nrg",         "name": "NRG Stadium",            "city": "Houston",      "country": "USA", "timezone": "America/Chicago",        "capacity": 72220, "photo": "venues/nrg.jpg" },
  { "id": "levis",       "name": "Levi's Stadium",         "city": "Santa Clara",  "country": "USA", "timezone": "America/Los_Angeles",    "capacity": 68500, "photo": "venues/levis.jpg" },
  { "id": "lincoln",     "name": "Lincoln Financial Field","city": "Philadelphia", "country": "USA", "timezone": "America/New_York",       "capacity": 69596, "photo": "venues/lincoln.jpg" },
  { "id": "mercedes",    "name": "Mercedes-Benz Stadium",  "city": "Atlanta",      "country": "USA", "timezone": "America/New_York",       "capacity": 71000, "photo": "venues/mercedes.jpg" },
  { "id": "hardrock",    "name": "Hard Rock Stadium",      "city": "Miami Gardens","country": "USA", "timezone": "America/New_York",       "capacity": 65326, "photo": "venues/hardrock.jpg" },
  { "id": "lumen",       "name": "Lumen Field",            "city": "Seattle",      "country": "USA", "timezone": "America/Los_Angeles",    "capacity": 68740, "photo": "venues/lumen.jpg" },
  { "id": "gillette",    "name": "Gillette Stadium",       "city": "Foxborough",   "country": "USA", "timezone": "America/New_York",       "capacity": 65878, "photo": "venues/gillette.jpg" }
]
```

- [ ] **Step 4: Write `src/data/teams.json`** — 48 teams

Include all 48 qualified teams (or TBD-XN placeholders for any still in playoff). Source: FIFA qualified-teams list as of 2026-05-23. Each entry follows `teamSchema`. Vietnamese names: use common Vietnamese transliteration (Mỹ, Đức, Pháp, Nhật Bản, Hàn Quốc, Brazil, Argentina, etc.).

**Important:** Every team code referenced from `groups.json` and `matches.json` MUST also have a row in `teams.json` — including every `TBD-XN` placeholder. `validateCrossRefs` will throw at build time otherwise. Example placeholder team row:

```json
{ "code": "TBD-G4", "nameVi": "Đội G4", "nameEn": "TBD G4", "flagClass": null, "qualified": false, "group": "G" }
```

Template starter:

```json
[
  { "code": "USA", "nameVi": "Mỹ",         "nameEn": "United States", "flagClass": "us", "qualified": true, "group": "D" },
  { "code": "CAN", "nameVi": "Canada",     "nameEn": "Canada",        "flagClass": "ca", "qualified": true, "group": "B" },
  { "code": "MEX", "nameVi": "Mexico",     "nameEn": "Mexico",        "flagClass": "mx", "qualified": true, "group": "A" }
]
```

Fill remaining 45 from FIFA confederation slots. For any team not yet qualified, use placeholder code `TBD-{GROUP}{SLOT}` (e.g. `TBD-G4`) and set `qualified: false`, `flagClass: null`.

- [ ] **Step 5: Write `src/data/groups.json`** — 12 groups (A–L)

```json
[
  { "letter": "A", "teams": ["MEX", "TBD-A2", "TBD-A3", "TBD-A4"] },
  { "letter": "B", "teams": ["CAN", "TBD-B2", "TBD-B3", "TBD-B4"] }
]
```

Fill with actual draw results (use FIFA's published draw). Each group has exactly 4 team codes.

- [ ] **Step 6: Write `src/data/matches.json`** — all 104 matches

Structure: 72 group matches (12 groups × 6 matches each) + 16 R32 + 8 R16 + 4 QF + 2 SF + 1 third + 1 final = 104.

For each match include the full schema. For knockout matches use placeholders like:

```json
{
  "id": 73,
  "matchNumber": 73,
  "phase": "r32",
  "group": null,
  "kickoff": "2026-06-28T19:00:00Z",
  "venueId": "sofi",
  "home": { "type": "placeholder", "label": "Nhất A" },
  "away": { "type": "placeholder", "label": "Nhì C" },
  "bracketSlot": "R32-1"
}
```

Knockout placeholder labels (must match FIFA's published bracket connections):
- R32: "Nhất A", "Nhì A", "Nhất B"... "Top 3 (1)" — 16 slots × 2 = 32 references
- R16: "Thắng R32-1", "Thắng R32-2"... → 16 references
- QF: "Thắng R16-1"...
- SF: "Thắng QF-1"...
- Third: "Thua SF-1", "Thua SF-2"
- Final: "Thắng SF-1", "Thắng SF-2"

- [ ] **Step 7: Verify JSON parses against schemas (one-off script)**

Create `scripts/validate-data.ts`:

```ts
import { tournamentSchema, teamSchema, venueSchema, groupSchema, matchSchema } from '~/lib/schemas';
import { validateCrossRefs } from '~/lib/references';
import tournament from '~/data/tournament.json';
import teams from '~/data/teams.json';
import venues from '~/data/venues.json';
import groups from '~/data/groups.json';
import matches from '~/data/matches.json';

tournamentSchema.parse(tournament);
teams.forEach(t => teamSchema.parse(t));
venues.forEach(v => venueSchema.parse(v));
groups.forEach(g => groupSchema.parse(g));
matches.forEach(m => matchSchema.parse(m));

validateCrossRefs({
  teams: teams.map(t => teamSchema.parse(t)),
  venues: venues.map(v => venueSchema.parse(v)),
  matches: matches.map(m => matchSchema.parse(m)),
});

if (matches.length !== 104) throw new Error(`Expected 104 matches, got ${matches.length}`);
if (venues.length !== 16) throw new Error(`Expected 16 venues, got ${venues.length}`);
if (teams.length !== 48) throw new Error(`Expected 48 teams, got ${teams.length}`);
if (groups.length !== 12) throw new Error(`Expected 12 groups, got ${groups.length}`);
console.log('All data files valid.');
```

Add to `package.json` scripts: `"validate-data": "tsx scripts/validate-data.ts"` (after `pnpm add -D tsx`).

**Note:** `tsx` does NOT read tsconfig `paths` aliases by default. Either install `tsconfig-paths` and run with `tsx --tsconfig-paths ...`, or — simpler — change imports in `scripts/validate-data.ts` to relative paths (`../src/lib/schemas`, `../src/data/tournament.json`, etc.) since this script lives outside `src/`.

Run: `pnpm validate-data`.

Expected: "All data files valid."

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "data: World Cup 2026 schedule, venues, teams, groups (sourced from FIFA)"
```

---

## Task 10: Data loader

**Files:**
- Create: `src/lib/data.ts`

- [ ] **Step 1: Write `src/lib/data.ts`**

```ts
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
```

- [ ] **Step 2: Verify by importing into a temp test**

Add to `tests/smoke.test.ts`:

```ts
import { loadAllData } from '~/lib/data';
it('loadAllData: returns 104 matches', () => {
  const data = loadAllData();
  expect(data.matches).toHaveLength(104);
});
```

Run `pnpm test`. Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(lib): loadAllData entrypoint with full validation"
```

---

## Task 11: Shared components — Flag, TeamLabel, PhaseBadge

**Files:**
- Create: `src/components/shared/Flag.tsx`, `src/components/shared/TeamLabel.tsx`, `src/components/shared/PhaseBadge.tsx`

- [ ] **Step 1: Write `src/components/shared/Flag.tsx`**

```tsx
interface Props { flagClass: string | null; className?: string; }

export function Flag({ flagClass, className = '' }: Props) {
  if (!flagClass) {
    return <span className={`inline-block w-6 h-4 rounded-sm bg-white/10 border border-white/15 ${className}`} aria-hidden />;
  }
  return <span className={`fi fi-${flagClass} rounded-sm ${className}`} style={{ display: 'inline-block', width: '24px', height: '16px' }} aria-hidden />;
}
```

- [ ] **Step 2: Write `src/components/shared/TeamLabel.tsx`**

```tsx
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
```

- [ ] **Step 3: Write `src/components/shared/PhaseBadge.tsx`**

```tsx
import { PHASE_META } from '~/lib/constants';
import type { Phase } from '~/lib/constants';

interface Props { phase: Phase; }

export function PhaseBadge({ phase }: Props) {
  const meta = PHASE_META[phase];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest"
      style={{
        background: phase === 'final' ? meta.color : `${meta.color}1A`,
        color: phase === 'final' ? '#fff' : meta.color,
        border: phase === 'final' ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${meta.color}66`,
      }}
    >
      {meta.labelVi}
    </span>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(components): shared Flag, TeamLabel, PhaseBadge"
```

---

## Task 12: Source images (16 stadiums + hero banner)

**Files:**
- Create: `src/assets/hero/wc2026-banner.jpg`, `src/assets/venues/<16 files>.jpg`, `IMAGE-CREDITS.md`

> **Note for implementer:** Source images via WebSearch + WebFetch. Wikipedia (CC-BY-SA) is preferred. Each image: JPEG, ~1200–1800px wide, ~150 KB. Record every URL + license + attribution string in `IMAGE-CREDITS.md`.

- [ ] **Step 1: For each venue in venues.json, fetch a representative photo**

Workflow per venue:
1. WebSearch: `"{venue name} stadium wikipedia"`
2. WebFetch the Wikipedia page to find the main infobox image URL
3. Download the image (curl) into `src/assets/venues/{id}.jpg`
4. Note the source URL + license + attribution in `IMAGE-CREDITS.md`

Example:
```bash
curl -L -o src/assets/venues/sofi.jpg "https://upload.wikimedia.org/wikipedia/commons/..."
```

- [ ] **Step 2: Source hero banner**

WebSearch: `"2026 FIFA World Cup" OR "World Cup stadium crowd" site:upload.wikimedia.org`. Pick one dramatic stadium-crowd shot, ~1920px wide. Save as `src/assets/hero/wc2026-banner.jpg`.

- [ ] **Step 3: Write `IMAGE-CREDITS.md`**

```markdown
# Image Credits

All non-flag images in this project are sourced from Wikipedia and licensed
under Creative Commons (CC-BY-SA 3.0 / 4.0) unless noted otherwise.

| File | Source URL | License | Author |
|---|---|---|---|
| src/assets/hero/wc2026-banner.jpg | <URL> | CC-BY-SA 4.0 | <Author> |
| src/assets/venues/sofi.jpg | <URL> | CC-BY-SA 4.0 | <Author> |
| ... | ... | ... | ... |

## Flags

Country flags use the `flag-icons` npm package (MIT License) by Lipis.
https://github.com/lipis/flag-icons
```

Fill the table for all 17 images (1 hero + 16 venues).

- [ ] **Step 4: Verify all files exist**

```bash
ls -la src/assets/venues/ | wc -l
# expect: 16 jpg files (plus . and ..)
```

```bash
ls -la src/assets/hero/
# expect: wc2026-banner.jpg
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "assets: 16 stadium photos + hero banner (Wikipedia CC-BY-SA), credits"
```

---

## Task 13: Header + Hero + StatsStrip

**Files:**
- Create: `src/components/Header.astro`, `src/components/Hero.astro`, `src/components/StatsStrip.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Write `src/components/Header.astro`**

```astro
---
---
<header class="sticky top-0 z-40 backdrop-blur bg-[var(--bg-deep)]/80 border-b border-white/5">
  <div class="container py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="font-display text-2xl tracking-[3px] text-white">WC 2026</span>
      <span class="text-[10px] tracking-[3px] text-[var(--text-muted)] hidden sm:inline">USA · CAN · MEX</span>
    </div>
    <div id="tab-router-mount"></div>
  </div>
</header>
```

(The tab router will mount here as a React island in Task 16.)

- [ ] **Step 2: Write `src/components/Hero.astro`**

```astro
---
import { Image } from 'astro:assets';
import banner from '~/assets/hero/wc2026-banner.jpg';

interface Props { startDate: string; endDate: string; }
const { startDate, endDate } = Astro.props;

function viDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()}/${d.getUTCMonth()+1}/${d.getUTCFullYear()}`;
}
---
<section class="relative">
  <div class="absolute inset-0 -z-10">
    <Image src={banner} alt="" widths={[800,1200,1920]} sizes="100vw" class="w-full h-full object-cover opacity-60" loading="eager" />
    <div class="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)]/40 via-transparent to-[var(--bg-deep)]"></div>
  </div>
  <div class="container py-20 sm:py-28 text-center">
    <p class="text-xs sm:text-sm tracking-[5px] text-[var(--gold)] font-bold">— FIFA WORLD CUP —</p>
    <h1 class="font-display text-6xl sm:text-8xl md:text-9xl tracking-[6px] text-white mt-2">2026</h1>
    <p class="mt-3 text-sm sm:text-base text-white/80 tracking-[2px]">{viDate(startDate)} — {viDate(endDate)}</p>
    <p class="mt-1 text-xs tracking-[4px] text-[var(--text-muted)]">UNITED STATES · CANADA · MEXICO</p>
  </div>
</section>
```

- [ ] **Step 3: Write `src/components/StatsStrip.astro`**

```astro
---
---
<section class="border-y border-white/5 bg-[var(--bg-base)]">
  <div class="container py-6 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
    <div>
      <div class="font-display text-3xl text-[var(--gold)]">48</div>
      <div class="text-[10px] tracking-[2px] text-[var(--text-muted)] uppercase">đội tuyển</div>
    </div>
    <div>
      <div class="font-display text-3xl text-[var(--gold)]">12</div>
      <div class="text-[10px] tracking-[2px] text-[var(--text-muted)] uppercase">bảng đấu</div>
    </div>
    <div>
      <div class="font-display text-3xl text-[var(--gold)]">104</div>
      <div class="text-[10px] tracking-[2px] text-[var(--text-muted)] uppercase">trận đấu</div>
    </div>
    <div>
      <div class="font-display text-3xl text-[var(--gold)]">16</div>
      <div class="text-[10px] tracking-[2px] text-[var(--text-muted)] uppercase">thành phố</div>
    </div>
    <div>
      <div class="font-display text-3xl text-[var(--gold)]">3</div>
      <div class="text-[10px] tracking-[2px] text-[var(--text-muted)] uppercase">nước chủ nhà</div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Write `src/components/Footer.astro`**

```astro
---
interface Props { lastUpdated: string; }
const { lastUpdated } = Astro.props;
---
<footer class="border-t border-white/5 mt-20">
  <div class="container py-8 text-center text-xs text-[var(--text-muted)] tracking-wider">
    <p>Dữ liệu cập nhật lần cuối: {lastUpdated}</p>
    <p class="mt-1">Ảnh sân vận động: Wikipedia (CC-BY-SA). Cờ: <a href="https://github.com/lipis/flag-icons" class="underline">flag-icons</a> (MIT).</p>
  </div>
</footer>
```

- [ ] **Step 5: Update `src/pages/index.astro` to wire them**

```astro
---
import Base from '~/layouts/Base.astro';
import Header from '~/components/Header.astro';
import Hero from '~/components/Hero.astro';
import StatsStrip from '~/components/StatsStrip.astro';
import Footer from '~/components/Footer.astro';
import { loadAllData } from '~/lib/data';

const { tournament } = loadAllData();
---
<Base>
  <Header />
  <Hero startDate={tournament.startDate} endDate={tournament.endDate} />
  <StatsStrip />
  <main class="container py-12">
    <p class="text-[var(--text-muted)]">Timeline coming next…</p>
  </main>
  <Footer lastUpdated={tournament.lastUpdated} />
</Base>
```

- [ ] **Step 6: Verify visually**

```bash
pnpm dev
```

Open http://localhost:4321. Expect: sticky header with "WC 2026", hero with banner image + "2026" big gold title + dates, stats strip with 5 numbers, placeholder "Timeline coming next…", footer.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ui): Header, Hero (with banner), StatsStrip, Footer"
```

---

## Task 14: Countdown island

**Files:**
- Create: `src/components/Countdown.tsx`
- Modify: `src/components/Hero.astro` (add Countdown island)

- [ ] **Step 1: Write `src/components/Countdown.tsx`**

```tsx
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
```

- [ ] **Step 2: Mount inside Hero**

Modify `src/components/Hero.astro`:

```astro
---
import { Image } from 'astro:assets';
import { Countdown } from '~/components/Countdown';
import banner from '~/assets/hero/wc2026-banner.jpg';

interface Props { startDate: string; endDate: string; }
const { startDate, endDate } = Astro.props;
const startIso = `${startDate}T00:00:00Z`;
// ... viDate helper kept ...
---
<!-- inside the .container text-center block, AFTER the dates paragraph: -->
<Countdown client:load startDateIso={startIso} />
```

- [ ] **Step 3: Verify visually**

`pnpm dev` → expect rounded pill: "CÒN 19 NGÀY TỚI KHAI MẠC" (assuming today is 2026-05-23).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(island): Countdown ticker in Hero"
```

---

## Task 15: TabRouter island (URL ↔ state)

**Files:**
- Create: `src/components/TabRouter.tsx`
- Modify: `src/components/Header.astro` (mount island)

- [ ] **Step 1: Write `src/components/TabRouter.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Calendar, Trophy } from 'lucide-react';

type View = 'timeline' | 'bracket';

function readView(): View {
  if (typeof window === 'undefined') return 'timeline';
  const v = new URLSearchParams(window.location.search).get('view');
  return v === 'bracket' ? 'bracket' : 'timeline';
}

function applyView(v: View) {
  const tl = document.getElementById('view-timeline');
  const br = document.getElementById('view-bracket');
  if (tl) tl.style.display = v === 'timeline' ? '' : 'none';
  if (br) br.style.display = v === 'bracket' ? '' : 'none';
}

export function TabRouter() {
  const [view, setView] = useState<View>(() => readView());

  useEffect(() => { applyView(view); }, [view]);

  useEffect(() => {
    const onPop = () => setView(readView());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const switchTo = (v: View) => {
    const url = new URL(window.location.href);
    if (v === 'timeline') url.searchParams.delete('view'); else url.searchParams.set('view', v);
    window.history.pushState({}, '', url);
    setView(v);
  };

  return (
    <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-1">
      <button onClick={() => switchTo('timeline')}
        className={`px-3 py-1.5 rounded-full text-xs tracking-wider inline-flex items-center gap-1 transition ${view==='timeline' ? 'bg-[var(--gold)] text-[var(--bg-deep)] font-bold' : 'text-white/70 hover:text-white'}`}>
        <Calendar size={14} /> TIMELINE
      </button>
      <button onClick={() => switchTo('bracket')}
        className={`px-3 py-1.5 rounded-full text-xs tracking-wider inline-flex items-center gap-1 transition ${view==='bracket' ? 'bg-[var(--gold)] text-[var(--bg-deep)] font-bold' : 'text-white/70 hover:text-white'}`}>
        <Trophy size={14} /> BRACKET
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Mount in Header.astro**

Replace `<div id="tab-router-mount"></div>` with:

```astro
---
import { TabRouter } from '~/components/TabRouter';
---
<TabRouter client:load />
```

(Add the import block at the top of Header.astro.)

- [ ] **Step 3: Add view containers to index.astro**

```astro
<div id="view-timeline">
  <p class="container py-12 text-[var(--text-muted)]">Timeline placeholder</p>
</div>
<div id="view-bracket" style="display:none">
  <p class="container py-12 text-[var(--text-muted)]">Bracket placeholder</p>
</div>
```

- [ ] **Step 4: Verify**

`pnpm dev`. Click TIMELINE/BRACKET tabs — content swaps without reload. URL updates to `?view=bracket`. Reload with `?view=bracket` → bracket placeholder shows. Browser back button works.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(island): TabRouter with URL state sync"
```

---

## Task 16: Timeline components — DayDivider, MatchRow, MatchExpand

**Files:**
- Create: `src/components/timeline/DayDivider.tsx`, `src/components/timeline/MatchRow.tsx`, `src/components/timeline/MatchExpand.tsx`

- [ ] **Step 1: Write `src/components/timeline/DayDivider.tsx`**

```tsx
import { formatDateVN } from '~/lib/time';

const VN_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

interface Props { dayKey: string; sampleIso: string; }

export function DayDivider({ dayKey, sampleIso }: Props) {
  const weekday = VN_WEEKDAYS[new Date(sampleIso).getUTCDay()];
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="h-px bg-white/10 flex-1" />
      <div className="text-xs tracking-[4px] text-[var(--text-muted)] uppercase">{weekday} · {formatDateVN(sampleIso)}</div>
      <div className="h-px bg-white/10 flex-1" />
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/timeline/MatchExpand.tsx`**

```tsx
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
```

- [ ] **Step 3: Write `src/components/timeline/MatchRow.tsx`**

```tsx
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
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(timeline): MatchRow, MatchExpand, DayDivider components"
```

---

## Task 17: PhaseSection + TimelineView (auto-scroll)

**Files:**
- Create: `src/components/timeline/PhaseSection.tsx`, `src/components/timeline/TimelineView.tsx`

- [ ] **Step 1: Write `src/components/timeline/PhaseSection.tsx`**

```tsx
import { useMemo } from 'react';
import type { Match, Team, Venue } from '~/lib/schemas';
import { PHASE_META } from '~/lib/constants';
import { groupMatchesByDay } from '~/lib/matches';
import { MatchRow } from './MatchRow';
import { DayDivider } from './DayDivider';
import { VN_TZ } from '~/lib/constants';

interface Props {
  phase: Match['phase'];
  matches: Match[];
  teams: Team[];
  venues: Venue[];
  venueImageMap: Record<string, string>;
  nowMs: number;
  nextMatchId: number | null;
}

export function PhaseSection({ phase, matches, teams, venues, venueImageMap, nowMs, nextMatchId }: Props) {
  const meta = PHASE_META[phase];
  const days = useMemo(() => groupMatchesByDay(matches, VN_TZ), [matches]);
  return (
    <section className="my-12">
      <div className="container">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-1" style={{ background: meta.color }} />
          <h2 className="font-display text-3xl tracking-[3px]" style={{ color: phase === 'final' ? '#fff' : meta.color }}>
            {meta.labelVi}
          </h2>
        </div>
        <p className="text-xs tracking-[3px] text-[var(--text-muted)] uppercase">{matches.length} trận</p>
        <div className="mt-6 space-y-2">
          {days.map(({ dayKey, matches: dayMatches }) => (
            <div key={dayKey}>
              <DayDivider dayKey={dayKey} sampleIso={dayMatches[0].kickoff} />
              <div className="space-y-3">
                {dayMatches.map(m => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    teams={teams}
                    venues={venues}
                    venueImageMap={venueImageMap}
                    nowMs={nowMs}
                    isNext={m.id === nextMatchId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `src/components/timeline/TimelineView.tsx`**

```tsx
import { useEffect, useState } from 'react';
import type { Match, Team, Venue } from '~/lib/schemas';
import { getNextUpcomingMatch, groupMatchesByPhase } from '~/lib/matches';
import { PhaseSection } from './PhaseSection';

interface Props {
  matches: Match[];
  teams: Team[];
  venues: Venue[];
  venueImageMap: Record<string, string>;
}

export function TimelineView({ matches, teams, venues, venueImageMap }: Props) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const next = getNextUpcomingMatch(matches, nowMs);
  const phases = groupMatchesByPhase(matches);

  // Auto-scroll once on first mount
  useEffect(() => {
    if (!next) return;
    const el = document.getElementById(`match-${next.id}`);
    if (el) {
      // delay a tick so layout settles
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {phases.map(({ phase, matches }) => (
        <PhaseSection
          key={phase}
          phase={phase}
          matches={matches}
          teams={teams}
          venues={venues}
          venueImageMap={venueImageMap}
          nowMs={nowMs}
          nextMatchId={next?.id ?? null}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 3: Wire into `src/pages/index.astro`**

```astro
---
import Base from '~/layouts/Base.astro';
import Header from '~/components/Header.astro';
import Hero from '~/components/Hero.astro';
import StatsStrip from '~/components/StatsStrip.astro';
import Footer from '~/components/Footer.astro';
import { TimelineView } from '~/components/timeline/TimelineView';
import { loadAllData } from '~/lib/data';
import { getImage } from 'astro:assets';

const data = loadAllData();

// Build venue image map: { sofi: '/_astro/sofi.xxx.webp', ... }
const venueImages = import.meta.glob('~/assets/venues/*.jpg', { eager: true, query: { format: 'webp', w: 1200 } });
const venueImageMap: Record<string, string> = {};
for (const [path, mod] of Object.entries(venueImages)) {
  const id = path.split('/').pop()!.replace('.jpg','');
  // @ts-expect-error - astro:assets glob returns ImageMetadata
  venueImageMap[id] = (mod.default as { src: string }).src;
}
---
<Base>
  <Header />
  <Hero startDate={data.tournament.startDate} endDate={data.tournament.endDate} />
  <StatsStrip />

  <div id="view-timeline">
    <TimelineView client:load
      matches={data.matches}
      teams={data.teams}
      venues={data.venues}
      venueImageMap={venueImageMap}
    />
  </div>

  <div id="view-bracket" style="display:none">
    <p class="container py-12 text-[var(--text-muted)]">Bracket coming next…</p>
  </div>

  <Footer lastUpdated={data.tournament.lastUpdated} />
</Base>
```

- [ ] **Step 4: Verify visually**

`pnpm dev`. Expect:
- Page loads, scrolls to next upcoming match (highlighted gold)
- 7 phase sections in order (Vòng bảng → R32 → R16 → QF → SF → Tranh hạng ba → Chung kết)
- Each section shows day dividers, match rows
- Click row → expand reveals stadium photo + venue info
- Past matches dimmed
- Phase color visible on left border of each row

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(timeline): TimelineView with auto-scroll + PhaseSection"
```

---

## Task 18: Bracket components

**Files:**
- Create: `src/components/bracket/GroupCard.tsx`, `src/components/bracket/BracketMatch.tsx`, `src/components/bracket/KnockoutColumn.tsx`, `src/components/bracket/BracketView.tsx`

- [ ] **Step 1: Write `src/components/bracket/GroupCard.tsx`**

```tsx
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
```

- [ ] **Step 2: Write `src/components/bracket/BracketMatch.tsx`**

```tsx
import type { Match, Team } from '~/lib/schemas';
import { resolveTeamRef } from '~/lib/references';
import { Flag } from '~/components/shared/Flag';
import { formatDateVN } from '~/lib/time';
import { PHASE_META } from '~/lib/constants';

interface Props { match: Match; teams: Team[]; }

export function BracketMatch({ match, teams }: Props) {
  const meta = PHASE_META[match.phase];
  const home = resolveTeamRef(match.home, teams);
  const away = resolveTeamRef(match.away, teams);
  return (
    <div className="bg-white/[0.03] border rounded-md p-2 text-xs" style={{ borderColor: `${meta.color}66` }}>
      <div className="font-mono text-[9px] text-[var(--text-muted)] mb-1">TRẬN {match.matchNumber} · {formatDateVN(match.kickoff)}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5"><Flag flagClass={home.flagClass} /><span className={home.flagClass ? '' : 'italic text-white/60'}>{home.display}</span></div>
        <div className="flex items-center gap-1.5"><Flag flagClass={away.flagClass} /><span className={away.flagClass ? '' : 'italic text-white/60'}>{away.display}</span></div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `src/components/bracket/KnockoutColumn.tsx`**

```tsx
import type { Match, Team } from '~/lib/schemas';
import { PHASE_META } from '~/lib/constants';
import { BracketMatch } from './BracketMatch';

interface Props { phase: Match['phase']; matches: Match[]; teams: Team[]; }

export function KnockoutColumn({ phase, matches, teams }: Props) {
  const meta = PHASE_META[phase];
  return (
    <div className="flex-1 min-w-[180px]">
      <div className="text-[10px] tracking-[3px] font-bold mb-3 text-center" style={{ color: phase === 'final' ? '#fff' : meta.color }}>
        {meta.labelVi}
      </div>
      <div className="space-y-3">
        {matches.map(m => <BracketMatch key={m.id} match={m} teams={teams} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/components/bracket/BracketView.tsx`**

```tsx
import type { Match, Group, Team } from '~/lib/schemas';
import { GroupCard } from './GroupCard';
import { KnockoutColumn } from './KnockoutColumn';

interface Props { matches: Match[]; groups: Group[]; teams: Team[]; }

export function BracketView({ matches, groups, teams }: Props) {
  const byPhase = (p: Match['phase']) => matches.filter(m => m.phase === p).sort((a,b)=>a.matchNumber-b.matchNumber);
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
```

- [ ] **Step 5: Wire into `src/pages/index.astro`**

Replace bracket placeholder:

```astro
<div id="view-bracket" style="display:none">
  <BracketView client:idle matches={data.matches} groups={data.groups} teams={data.teams} />
</div>
```

Add the import at top:
```astro
import { BracketView } from '~/components/bracket/BracketView';
```

- [ ] **Step 6: Verify visually**

`pnpm dev`. Click BRACKET tab. Expect:
- 12 group cards in a responsive grid
- 6 knockout columns (R32 / R16 / QF / SF / Tranh hạng ba / Chung kết) with placeholder team names
- Horizontal scroll on smaller screens

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(bracket): full bracket overview view"
```

---

## Task 19: Component smoke tests

**Files:**
- Create: `tests/components.test.tsx`
- Modify: `vitest.config.ts` (add jsdom)

- [ ] **Step 1: Install jsdom**

```bash
pnpm add -D jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Update `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '~': new URL('./src/', import.meta.url).pathname } },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

Install plugin: `pnpm add -D @vitejs/plugin-react`.

- [ ] **Step 3: Write `tests/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Write `tests/components.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamLabel } from '~/components/shared/TeamLabel';
import { PhaseBadge } from '~/components/shared/PhaseBadge';
import type { Team } from '~/lib/schemas';

const teams: Team[] = [
  { code: 'USA', nameVi: 'Mỹ', nameEn: 'United States', flagClass: 'us', qualified: true, group: 'D' },
];

describe('TeamLabel', () => {
  it('renders Vietnamese name for real team', () => {
    render(<TeamLabel teamRef={{ type: 'team', code: 'USA' }} teams={teams} />);
    expect(screen.getByText('Mỹ')).toBeInTheDocument();
  });

  it('renders placeholder label in italic style', () => {
    render(<TeamLabel teamRef={{ type: 'placeholder', label: 'Nhất A' }} teams={teams} />);
    expect(screen.getByText('Nhất A')).toBeInTheDocument();
  });
});

describe('PhaseBadge', () => {
  it('renders Vietnamese phase label', () => {
    render(<PhaseBadge phase="qf" />);
    expect(screen.getByText('TỨ KẾT')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run**

```bash
pnpm test
```

Expected: all previous tests + new component tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test(components): smoke tests for TeamLabel + PhaseBadge"
```

---

## Task 20: Mobile responsive + accessibility polish

**Files:**
- Modify: relevant components for media queries + a11y

- [ ] **Step 1: Open `pnpm dev`, resize browser to 375px width**

Check for:
- Header: WC2026 + tabs fit (subtitle "USA · CAN · MEX" hides via `hidden sm:inline`, already in place)
- Hero: title shrinks (`text-6xl` mobile vs `text-9xl` desktop, already in place)
- Stats strip: grid switches from 5 cols to 2 (already `grid-cols-2 sm:grid-cols-5`)
- Timeline match rows: text wraps cleanly, no horizontal overflow
- Bracket view: horizontal scroll inside container works

Fix any overflow / cramping issues as you find them. Common fixes: add `flex-wrap`, switch `gap-3` to `gap-2`, use `text-xs sm:text-sm`.

- [ ] **Step 2: A11y audit**

- Add `aria-label` on tab buttons: e.g. `aria-label="Xem dạng timeline"` / `aria-label="Xem dạng bracket"`
- Header should have `role="banner"` (implicit, OK)
- Use semantic `<article>` for match rows (already done)
- All images need `alt`: hero image is decorative (`alt=""` OK); venue images should have `alt={venue.name}` (already done)
- Color contrast: text on dimmed past matches — verify with Chrome devtools that opacity 40% still hits WCAG AA contrast against bg-deep. If not, raise to 50%.

- [ ] **Step 3: Run Lighthouse from Chrome devtools**

`pnpm build && pnpm preview`. Open preview URL. Run Lighthouse desktop. Targets: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

Fix any flagged issues:
- LCP image: ensure `loading="eager"` on hero
- Unused JS: review island sizes, consider `client:idle` over `client:load` for non-critical
- Font display: use `display=swap` in Google Fonts URL (already in place)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix(a11y,mobile): aria-labels, responsive tweaks, lighthouse polish"
```

---

## Task 21: OG card + final README

**Files:**
- Create: `src/assets/og/og-card.jpg`, `README.md` (rewrite)

- [ ] **Step 1: Build OG card**

Quick approach: open `pnpm dev`, take a screenshot of the hero section at 1200×630, save as `src/assets/og/og-card.jpg`. (Or build a dedicated `/og.html` page with the title + 3 flags + dates, screenshot it.)

Place in `public/og-card.jpg` so the path `/og-card.jpg` referenced in `Base.astro` resolves.

- [ ] **Step 2: Move `og-card.jpg` to `public/` so it's served from root**

```bash
mv src/assets/og/og-card.jpg public/og-card.jpg
```

(Update Base.astro `meta property="og:image"` content path if needed — `/og-card.jpg` is the public-root path.)

- [ ] **Step 3: Rewrite `README.md`**

```markdown
# World Cup 2026 — Lịch thi đấu

Vietnamese single-page site for FIFA World Cup 2026 (USA · Canada · Mexico). Chronological timeline + bracket overview.

## Live
https://worldcup-2026.pages.dev

## Stack
Astro 5 (static) · React 19 islands · Tailwind v3 · Framer Motion · Zod · Cloudflare Pages.

## Develop
```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm test         # vitest
pnpm typecheck
pnpm build        # ./dist (static)
```

## Update data
1. Edit JSON in `src/data/`
2. `pnpm test && pnpm build`
3. Commit and deploy

## Deploy
```bash
pnpm build
pnpm exec wrangler pages deploy ./dist --project-name worldcup-2026 --branch main
```

## License
Personal project. Image credits in `IMAGE-CREDITS.md`.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: README + OG card image"
```

---

## Task 22: Production build + Cloudflare Pages deploy

**Files:**
- Create: `wrangler.toml`

- [ ] **Step 1: Write `wrangler.toml`**

```toml
name = "worldcup-2026"
compatibility_date = "2026-05-23"
pages_build_output_dir = "./dist"
```

- [ ] **Step 2: Final build**

```bash
pnpm typecheck
pnpm test
pnpm build
```

Expected: all green. `dist/` populated.

- [ ] **Step 3: First deploy**

```bash
pnpm exec wrangler pages deploy ./dist --project-name worldcup-2026 --branch main
```

On first run, wrangler will prompt to login and create the project. Follow prompts.

Expected output: a `*.worldcup-2026.pages.dev` URL.

- [ ] **Step 4: Smoke-test production URL**

Open the deploy URL. Verify:
- Hero with banner image loads
- Countdown shows expected days
- Timeline tab default, auto-scrolls to next match
- Click match → expand works, stadium photo loads
- Bracket tab switches, URL updates to `?view=bracket`
- Mobile viewport works
- Footer credits visible

- [ ] **Step 5: Commit + tag v1**

```bash
git add -A
git commit --allow-empty -m "release: v1.0.0 — initial Cloudflare Pages deploy"
git tag v1.0.0
```

---

## Acceptance Checklist (final gate)

Walk through and check off every box. Do NOT mark as done if any item fails — fix it first.

- [ ] Page loads → auto-scrolls to the correct next/live match using user's clock
- [ ] All 104 matches render in timeline (group + R32 + R16 + QF + SF + third + final) with correct phase headers
- [ ] Bracket view renders 12 groups + R32 + R16 + QF + SF + Final with placeholder labels for unknown teams
- [ ] Click match → smooth inline expand showing stadium photo + venue + giờ VN + giờ local
- [ ] Tab switcher Timeline ↔ Bracket works; URL persists state on reload
- [ ] LIVE green-pulse badge appears for matches where kickoff < 2h ago
- [ ] NEXT gold-glow badge appears on the auto-scroll target
- [ ] Countdown ticker counts down to opening match (11/6) accurately
- [ ] Mobile responsive at 375 px viewport
- [ ] All 7 phase color tokens (group / r32 / r16 / qf / sf / third / final-gradient) render
- [ ] Deployed to Cloudflare Pages successfully
- [ ] Footer credits + `IMAGE-CREDITS.md` committed
- [ ] All Vitest tests green
- [ ] Lighthouse desktop Performance ≥ 95, Accessibility ≥ 95

---

## Notes for the implementer

- **Skill to use during execution:** `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans`
- **TDD discipline:** Tasks 5–8 are strict TDD (test → fail → impl → pass → commit). Other tasks have looser testing requirements but should still commit frequently.
- **Image sourcing in Task 12** will use a lot of WebSearch/WebFetch budget. Batch the fetches in one session.
- **Data sourcing in Task 9** is the most consequential — verify the schedule against multiple sources before locking it in. A single wrong kickoff time silently breaks the auto-scroll.
- If the FIFA schedule has matches that don't map cleanly to 4-team groups (e.g., schedule changes), update the spec rather than hacking the schema.
- Do NOT add features beyond the spec without coming back to the user.
