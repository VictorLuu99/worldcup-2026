# World Cup 2026 Timeline — Design Spec

**Date:** 2026-05-23
**Author:** Victor Luu (with Claude)
**Status:** Approved by user, ready for implementation planning

## 1. Purpose & Scope

Single-page Vietnamese website that displays the full match schedule of FIFA World Cup 2026 (USA · Canada · Mexico, 11 Jun – 19 Jul 2026). Deployed as a static site on Cloudflare Pages.

The site presents 104 matches across all phases (group stage through final), with two views: a chronological timeline (default) and a bracket overview. Data updates happen by editing JSON files in the repository and redeploying — there is no admin panel, no result/score updates, and no live data feed.

The reference visual is the supplied `referrence.png` (Vietnamese bracket poster). This design adopts its palette and information density, then adds the missing piece: a chronological timeline of every match, including group stage.

### Goals

- Beautiful, brand-quality UI that matches the reference image's dark-navy + gold + multi-color phase aesthetic
- Auto-scroll to the next upcoming match on page load (user lands directly on what's relevant now)
- Allow scrolling backward through past matches (no result update needed — past matches just appear dimmed)
- Render placeholder team slots ("Nhất A", "Nhì B", etc.) for knockout rounds since teams are unknown until group stage finishes
- Deploy to Cloudflare Pages as a pure static site
- Data update workflow: user prompts Claude to research and update JSON → commit → redeploy

### Out of scope (v1)

- Live score / result updates
- Admin panel / database backend
- Group standings tables (no results means no standings)
- Host city showcase section
- Multi-language (only Vietnamese)
- Player photos
- Real-time data feed from FIFA / other API
- E2E / Playwright tests
- Authentication
- Comments, social, or sharing UX beyond OG card

## 2. UX Flow & Information Architecture

```
┌─ Header (sticky, transparent → solid on scroll)
│  WORLD CUP 2026 logo · USA·CAN·MEX · [📅 Timeline | 🏆 Bracket]
│
├─ Hero
│  Banner photo (full-bleed) + tournament title + dates (11/6 – 19/7/2026)
│  Stats strip: 48 đội · 12 bảng · 104 trận · 16 thành phố · 3 nước chủ nhà
│  Countdown: "Còn X ngày tới khai mạc" (live ticker)
│
├─ Main view (tab-controlled, URL ?view=timeline|bracket)
│  ┌── Tab "📅 Timeline" (DEFAULT)
│  │   Phase sections (vertical, chronological):
│  │     VÒNG BẢNG          (11/6 → 27/6)
│  │     VÒNG 32 ĐỘI         (28/6 → 3/7)
│  │     VÒNG 16 ĐỘI         (4/7 → 7/7)
│  │     TỨ KẾT              (9/7 → 11/7)
│  │     BÁN KẾT             (14/7 → 15/7)
│  │     TRANH HẠNG BA       (18/7)
│  │     CHUNG KẾT           (19/7)
│  │
│  │   Each phase = colored header + day dividers + match rows
│  │   Match row click → smooth inline expand (Framer Motion):
│  │     stadium photo + venue + giờ VN + local time
│  │   Auto-scroll to first not-yet-started match on mount
│  │   "ĐANG ĐÁ" green-pulse badge for kickoff < 2h ago
│  │
│  └── Tab "🏆 Bracket"
│      Full bracket overview matching referrence.png:
│        12 group cards (BẢNG A–L) in top grid
│        Bracket flow: R32 → R16 → QF → SF → F with SVG connector lines
│        Knockout slots use placeholder labels ("Nhất A", "Nhì B")
│
└─ Footer
   Credits · "Cập nhật lần cuối: YYYY-MM-DD" · IMAGE-CREDITS link
```

### Key UX rules

- Default landing → Timeline tab, auto-scroll to the next upcoming match using user's local clock (browser `Date.now()`)
- Tab state persists in URL (`?view=timeline` or `?view=bracket`) so links are shareable
- Tab toggle = CSS `display:none` switch (instant; both views are server-rendered up front)
- Click match row → smooth height animation (Framer Motion `<AnimatePresence>`); only one row expanded at a time? No — multiple expansion allowed (user choice; keep simple, no force-close)
- Vietnam time (Asia/Ho_Chi_Minh, UTC+7) shown everywhere as primary; venue local time shown inside expand as secondary
- Mobile (< 768px): same structure, single column; bracket view scrolls horizontally inside a container
- Past matches: dimmed to ~40% opacity, no badge, still clickable to expand venue info

### Match status states

| Status | When | Visual treatment |
|---|---|---|
| `past` | kickoff + 2h ≤ now | Opacity 40%, no badge |
| `live` | kickoff ≤ now < kickoff + 2h | Green pulse glow, badge "● ĐANG ĐÁ" |
| `upcoming-next` | Earliest non-past match | Gold glow + border, badge "★ TIẾP THEO" |
| `upcoming` | Future, but not next | Normal styling |

The auto-scroll target is the match in either `live` or `upcoming-next` state (whichever exists earliest). If a `live` match exists, scroll to it; else scroll to `upcoming-next`.

**Note on derivation:** `getMatchStatus(match, now)` returns only the three base states (`past` / `live` / `upcoming`). The `upcoming-next` flag is computed separately — it's the result of `getNextUpcomingMatch(matches, now)` matching one specific match id. The UI applies the NEXT styling as an overlay on top of whatever base status that match has (almost always `upcoming`, occasionally `live`).

## 3. Visual Design System

### Palette

**Base (CSS variables in `src/styles/tokens.css`):**
- `--bg-deep`: `#001d3d` — page background, modal backdrops
- `--bg-base`: `#0a2540` — main surface (hero, cards background)
- `--bg-elev`: `#1d3557` — elevated cards, hover states
- `--gold`: `#ffd60a` — primary accent (title, NEXT badge, group phase)
- `--white`: `#ffffff` — body text
- `--text-muted`: `rgba(255,255,255,0.6)` — secondary text
- `--text-dim`: `rgba(255,255,255,0.4)` — past-match text

**Phase accent colors (one per round):**
- Vòng bảng → `--phase-group: #ffd60a` (gold)
- Vòng 32 → `--phase-r32: #a855f7` (purple)
- Vòng 16 → `--phase-r16: #00b4d8` (cyan)
- Tứ kết → `--phase-qf: #22c55e` (green)
- Bán kết → `--phase-sf: #f472b6` (pink)
- Tranh hạng ba → `--phase-third: #94a3b8` (muted slate, less prominent)
- Chung kết → `--phase-final: linear-gradient(135deg, #ef4444, #ffd60a)` (red→gold gradient, epic)

**Semantic state colors:**
- LIVE: `#22c55e` with pulsing box-shadow
- NEXT: `--gold` with box-shadow glow
- Past: opacity 0.4

### Typography (Google Fonts)

- **Display** — `Bebas Neue` 400 (the family's only weight), uppercase, `letter-spacing: 4px`. Used for "WORLD CUP 2026" title and phase headers like "VÒNG BẢNG".
- **Heading** — `Inter` 800, uppercase, `letter-spacing: 3px`. Used for sub-section headers, phase date ranges.
- **Body** — `Inter` 500 (default) and 600 (emphasis). Used for team names, venue, time.
- **Mono label** — `JetBrains Mono` 500, `letter-spacing: 1px`. Used for match numbers like "TRẬN #23", group codes like "BẢNG D".

### Shadows & glow

- Card shadow: `0 4px 20px rgba(0,0,0,0.4)`
- Gold glow (NEXT match): `0 0 20px rgba(255,214,10,0.4)` + 1px gold border
- Live pulse (DANG DA): animated box-shadow keyframe, `0 0 24px rgba(34,197,94,0.5)` → `0 0 12px rgba(34,197,94,0.3)` cycling 2s
- Bracket connector lines: 1px stroke, color = destination phase accent

### Spacing & sizing scale

- Use Tailwind's default spacing scale (4-px base unit)
- Border radius: `--r-sm: 4px`, `--r-md: 8px`, `--r-lg: 12px`
- Container max-width: `--container-max: 1200px`
- Mobile breakpoint: `768px`

## 4. Data Model

All data lives in `src/data/` as static JSON files. Validated at build time with Zod schemas in `src/lib/schemas.ts` — bad data fails the build before deployment.

### Files

```
src/data/
├── tournament.json    # tournament metadata
├── teams.json         # 48 teams (qualified + placeholders)
├── venues.json        # 16 stadiums
├── groups.json        # 12 groups (A–L)
└── matches.json       # 104 matches
```

### Schemas (TypeScript / Zod)

```typescript
// tournament.json
{
  name: "FIFA World Cup 2026",
  hosts: ["USA", "CAN", "MEX"],
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  lastUpdated: "2026-05-23"
}

// teams.json — array of:
{
  code: "USA",          // 3-letter FIFA code
  nameVi: "Mỹ",         // Vietnamese display name
  nameEn: "United States",
  flagClass: "us",      // ISO 3166-1 alpha-2, used with flag-icons (fi-us)
  qualified: true,      // false if still in qualifying / intercontinental playoff
  group: "D"            // null if not yet assigned to a group
}

// venues.json — array of:
{
  id: "sofi",
  name: "SoFi Stadium",
  city: "Los Angeles",
  country: "USA",
  timezone: "America/Los_Angeles",   // IANA tz id
  capacity: 70240,
  photo: "venues/sofi.jpg"           // relative to src/assets/
}

// groups.json — array of:
{
  letter: "A",
  teams: ["MEX", "TBD-A2", "TBD-A3", "TBD-A4"]
  // TBD-X placeholders display as "Đội A2", "Đội A3"... in UI
}

// matches.json — array of 104:
{
  id: 1,
  matchNumber: 1,
  phase: "group",                    // group | r32 | r16 | qf | sf | third | final
  group: "A",                        // only when phase=group; null otherwise
  kickoff: "2026-06-11T19:00:00Z",   // ISO 8601 UTC
  venueId: "azteca",
  home: { type: "team", code: "MEX" },
  away: { type: "team", code: "TBD-A2" },
  // For knockout matches:
  // home: { type: "placeholder", label: "Nhất A" }
  // away: { type: "placeholder", label: "Nhì B" }
  bracketSlot: "R32-1"               // identifier for SVG connectors; knockout only
}
```

### Library helpers (`src/lib/`)

- `time.ts`:
  - `formatVNTime(isoUtc)` → `"10:00 Thứ Bảy, 13/6"` (Asia/Ho_Chi_Minh)
  - `formatLocalTime(isoUtc, timezone)` → `"20:00 PT"` (venue local)
  - `formatDateVN(isoUtc)` → `"13/6"` for day dividers
- `matches.ts`:
  - `getMatchStatus(match, now)` → `"past" | "live" | "upcoming"`
  - `getNextUpcomingMatch(matches, now)` → match for auto-scroll
  - `groupMatchesByDay(matches)` → for day dividers
  - `groupMatchesByPhase(matches)` → for phase sections
- `data.ts`:
  - `loadAllData()` → typed `{ tournament, teams, venues, groups, matches }`; called once in `index.astro`
- `schemas.ts`:
  - Zod schemas + `parseDataFiles()` that throws on first invalid field
- `references.ts`:
  - `resolveTeamRef(ref, teams)` → returns `{ display: "Mỹ", flag: "us" }` or `{ display: "Đội A2", flag: null }`
  - `resolveVenue(venueId, venues)` → venue object
  - Validates all foreign keys at build time (every match.venueId exists, every team.code exists, etc.)

## 5. Component Architecture

Astro 5 with `output: 'static'` (no adapter required — pure HTML/CSS/JS output, no SSR runtime). React 19 used only for islands that need client state.

```
src/
├── layouts/
│   └── Base.astro                  # HTML shell, fonts, OG meta, tokens.css
│
├── pages/
│   └── index.astro                 # Single page; loads data, renders both views
│
├── components/
│   ├── Hero.astro                  # banner + title + dates (static)
│   ├── Countdown.tsx (island)      # client:load — live ticker to opening match
│   ├── StatsStrip.astro            # static stats
│   ├── TabRouter.tsx (island)      # client:load — tab state ↔ URL ?view=...
│   │
│   ├── timeline/
│   │   ├── TimelineView.tsx        # client:load — wraps timeline, runs auto-scroll on mount
│   │   ├── PhaseSection.tsx        # one of 7 phase sections with colored header
│   │   ├── DayDivider.tsx          # date marker between matches of different days
│   │   ├── MatchRow.tsx            # clickable row; manages own expand state
│   │   └── MatchExpand.tsx         # expanded content: stadium photo + meta
│   │
│   ├── bracket/
│   │   ├── BracketView.tsx         # client:idle — render bracket overview (no client state)
│   │   ├── GroupCard.tsx           # one of 12 group cards (4 team slots)
│   │   ├── KnockoutColumn.tsx      # column per knockout round
│   │   ├── BracketMatch.tsx        # one match slot in knockout
│   │   └── BracketLines.tsx        # SVG overlay drawing connector lines
│   │
│   └── shared/
│       ├── TeamLabel.tsx           # flag + Vietnamese name; handles placeholder
│       ├── Flag.tsx                # uses flag-icons CSS lib classes
│       └── PhaseBadge.tsx          # colored pill for phase name
│
├── data/                           # JSON files (Section 4)
├── lib/                            # helpers (Section 4)
└── styles/
    ├── tokens.css                  # CSS vars (palette, spacing)
    └── global.css                  # base resets, font imports
```

### Island hydration strategy

Only the components that need client-side JS are hydrated:

| Component | Directive | Why |
|---|---|---|
| `Countdown` | `client:load` | Needs setInterval timer |
| `TabRouter` | `client:load` | Reads URL on mount, listens for popstate |
| `TimelineView` | `client:load` | Must run auto-scroll immediately on mount |
| `BracketView` | `client:idle` | HTML still SSR'd at build (so it's instantly visible when the tab toggles); `client:idle` only defers React hydration — fine here because the bracket has no interactivity |
| `MatchRow` / `MatchExpand` | (no directive) | Expand state lives inside `TimelineView`'s React tree — no separate island |

### State flow

```
URL ?view=... ──► TabRouter (reads + writes URL)
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
  TimelineView (visible)         BracketView (hidden via display:none)
       │                               │
       ├ on mount:                     └ static render only
       │   const target = getNextUpcomingMatch(matches, Date.now())
       │   document.getElementById(target.id)?.scrollIntoView({behavior:'smooth', block:'center'})
       │
       ├ setInterval(60_000) → re-render status badges (live/past/upcoming)
       │
       └ expand state: Map<matchId, boolean> in component state
           (multiple matches can be expanded simultaneously)
```

### Server vs client work

- Build time (Astro):
  - Parse all JSON via Zod → typed objects
  - Validate cross-refs (every venueId, teamCode, groupLetter resolves)
  - Render full HTML for both timeline and bracket views (SEO + fast FCP)
  - Optimize images via `astro:assets` (multi-size WebP)
- Client time (React islands):
  - Tab switching (toggle display)
  - Auto-scroll on timeline mount
  - Countdown ticker
  - Match-row expand toggle
  - Status badge refresh every 60s

## 6. Image Sourcing Plan

Level 2 Standard: 48 SVG flags from npm + 16 stadium photos + 1 hero banner + 1 OG card.

### Sources

- **Flags** — `flag-icons` npm package (MIT license). Used via CSS classes `fi fi-us`, `fi fi-mx`, etc. No manual sourcing.
- **Stadium photos** — Wikipedia article images (CC-BY-SA license preferred) for each of 16 venues. Fetched by Claude during implementation phase via `WebSearch` + `WebFetch`. Fallback: official stadium operator / city tourism sites.
- **Hero banner** — Wikipedia "2026 FIFA World Cup" page or Unsplash search "world cup stadium crowd". Picks one dramatic establishing shot.
- **OG card** — composed manually (HTML mockup → screenshot at build) using site fonts/colors; not fetched.

### Storage & optimization

- Source images go in `src/assets/` (subject to Astro's image pipeline)
- `astro:assets` generates responsive WebP variants at 480w / 800w / 1200w
- `<picture>` + `srcset` for responsive delivery
- `loading="lazy"` for stadium photos (not visible until match row is expanded)
- Target total image weight in `dist/`: ~5 MB

### Folder layout (`src/assets/`)

```
src/assets/
├── hero/
│   └── wc2026-banner.jpg     # ~1920×1080, ~300KB optimized
├── venues/                   # 16 files, ~150KB each
│   ├── sofi.jpg              # SoFi Stadium · Los Angeles
│   ├── azteca.jpg            # Estadio Azteca · Mexico City
│   ├── metlife.jpg           # MetLife Stadium · New Jersey (FINAL)
│   ├── att.jpg               # AT&T Stadium · Dallas
│   ├── arrowhead.jpg         # Arrowhead Stadium · Kansas City
│   ├── nrg.jpg               # NRG Stadium · Houston
│   ├── levis.jpg             # Levi's Stadium · San Francisco Bay
│   ├── lincoln.jpg           # Lincoln Financial · Philadelphia
│   ├── mercedes.jpg          # Mercedes-Benz Stadium · Atlanta
│   ├── hardrock.jpg          # Hard Rock Stadium · Miami
│   ├── lumen.jpg             # Lumen Field · Seattle
│   ├── gillette.jpg          # Gillette Stadium · Boston
│   ├── bmo.jpg               # BMO Field · Toronto
│   ├── bcplace.jpg           # BC Place · Vancouver
│   ├── monterrey.jpg         # Estadio BBVA · Monterrey
│   └── akron.jpg             # Estadio Akron · Guadalajara
└── og/
    └── og-card.jpg           # 1200×630 social preview
```

### Attribution

- Footer line: "Ảnh sân vận động: Wikipedia (CC-BY-SA). Cờ: flag-icons (MIT)."
- `IMAGE-CREDITS.md` in repo root lists every source URL + license per file (audit trail)

## 7. Tech Stack, Build & Deploy

### Locked-in stack

| Layer | Choice |
|---|---|
| Framework | Astro 5 (`output: 'static'`) |
| UI islands | React 19 |
| Styling | Tailwind CSS v3 + CSS variables (tokens) |
| Animation | Framer Motion (match expand + tab transitions) |
| Validation | Zod (JSON parse at build time) |
| Flags | `flag-icons` npm package |
| Icons | Lucide (UI icons like chevron, calendar, trophy) |
| Fonts | Google Fonts — Bebas Neue, Inter, JetBrains Mono |
| Tests | Vitest |
| Hosting | Cloudflare Pages (static) |

Notably absent vs `party` project: no D1, no R2, no `@astrojs/cloudflare` adapter, no JWT auth, no admin panel, no `.dev.vars` secrets.

### Local development

```bash
pnpm install
pnpm dev           # http://localhost:4321
pnpm test          # Vitest unit tests
pnpm build         # static output → ./dist
pnpm preview       # serve dist locally
```

### Deploy to Cloudflare Pages

Two options:

1. **Manual**:
   ```bash
   pnpm build
   pnpm exec wrangler pages deploy ./dist --project-name worldcup-2026 --branch main
   ```

2. **Auto via Git**: connect GitHub repo to Cloudflare Pages dashboard. Build command: `pnpm build`. Output directory: `dist`. Pushes to `main` → auto-deploy.

(Implementation will use option 1 for first deploy; user can opt into option 2 later.)

### Update workflow (when user prompts Claude for data update)

```
1. User: "Research and update qualified teams + group draw (FIFA just announced)"
2. Claude: WebSearch / WebFetch authoritative source (FIFA.com)
3. Claude: edit src/data/teams.json, groups.json, matches.json
4. Claude: pnpm test (catches broken references)
5. Claude: pnpm build (Zod validates all JSON)
6. Claude: commit "data: update group draw + qualified teams"
7. User (or CI): wrangler pages deploy ./dist
```

JSON is the single source of truth — diffs are easy to review in git, easy to roll back.

## 8. Performance Targets

- Lighthouse desktop: ≥ 95 Performance, ≥ 95 Accessibility
- FCP < 1.5s, LCP < 2.5s
- Total first-load page weight (HTML + CSS + critical JS): < 800 KB
- Stadium photos lazy-loaded — not counted in initial load
- Both views server-rendered → no client-side data fetching latency

## 9. Testing

Unit tests with Vitest:

- `lib/time.test.ts` — VN time conversion edge cases (UTC midnight straddling, kickoff on day boundary, daylight saving for venue local times)
- `lib/matches.test.ts` — `getMatchStatus` boundaries (exactly at kickoff, exactly at kickoff+2h, etc.), `getNextUpcomingMatch` ordering (chooses live over upcoming if live exists), placeholder vs real team handling
- `lib/schemas.test.ts` — Zod parse fails when JSON is malformed (missing field, wrong type, invalid timezone)
- `lib/references.test.ts` — broken venueId or teamCode throws at build time; valid refs resolve correctly
- Snapshot tests for a handful of components: `MatchRow` (placeholder team, live state, past state), `BracketMatch` (knockout placeholder rendering)

No e2e / Playwright for v1. Manual smoke test before each deploy:
- Page loads → auto-scrolls to expected match
- Click match → expand animation smooth, stadium photo loads
- Tab switch → URL updates, both views work
- Mobile viewport 375px renders correctly

## 10. Acceptance Criteria (v1 "done")

- [ ] Page loads → auto-scrolls to the correct next/live match using user's clock
- [ ] All 104 matches render in timeline (group stage + all knockout rounds) with correct phase headers
- [ ] Bracket view renders 12 groups + R32 + R16 + QF + SF + Final (placeholders for unknown teams)
- [ ] Click match → smooth inline expand showing stadium photo + venue + giờ VN + giờ local
- [ ] Tab switcher Timeline ↔ Bracket works; URL persists state
- [ ] LIVE green-pulse badge appears for matches where kickoff < 2h ago
- [ ] NEXT gold-glow badge appears on the auto-scroll target
- [ ] Countdown ticker counts down to opening match (11/6) accurately
- [ ] Mobile responsive (375 px breakpoint OK, bracket scrolls horizontally inside container)
- [ ] All 7 phase color tokens (group / R32 / R16 / QF / SF / third / final-gradient) render per the design system
- [ ] Deploys to Cloudflare Pages successfully (build green, site loads in production)
- [ ] Footer credits + IMAGE-CREDITS.md committed
- [ ] All Vitest tests green
- [ ] Lighthouse desktop Performance ≥ 95
