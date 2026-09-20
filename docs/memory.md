# Project Memory

## Product Context
The **Taekwondo Weigh-In Management System** is a mission-critical digital management application designed for tournament directors, technical marshals, and weigh-in officials. It handles the critical bridge between athlete registration and bracket fixture generation. The application enforces strict official weight validation, a non-bypassable finite state machine, complete historical attempt logging, tournament-wide search, status segregation, and paper-ready A4 printing.

---

## Important Decisions
- **Decision 01 (Documentation-First Development):** Mandatory `/docs` project control documents (`prd.md`, `architecture.md`, `rules.md`, `design.md`, `tasks.md`, `memory.md`) must be kept in active synchronization with the codebase throughout all iterations.
- **Decision 02 (Zero Data Loss Policy):** Weigh-in status changes must never delete or overwrite historical attempt records or participant profiles. Every attempt is stored with its sequential attempt number, measured weight, resulting status, and operator stamp.
- **Decision 03 (Strict Print Content Quarantine):** The passed-athlete print layout must output **ONLY** Athlete Name and Academy Name. All other fields (weight, LOT, status, division, category, UI controls) are strictly quarantined and stripped from the print DOM.

---

## Architecture Decisions
- **Framework:** Next.js 14+ with App Router and React Server Components / Client Components where appropriate.
- **Language:** TypeScript with strict type checking enabled across all modules.
- **Styling:** Vanilla Tailwind CSS with custom design tokens for dark tactical sports console ergonomics.
- **State Machine Architecture:** Implemented in `src/lib/state-machine.ts` as a pure, testable deterministic transition function used by both backend API routes and frontend client optimistic checks.
- **Data Ingestion:** SheetJS (`xlsx`) for local client and server parsing of CSV and XLSX files.

---

## Database Decisions
- **ORM:** Prisma ORM for type-safe relational modeling and migrations.
- **Local Development Target:** SQLite (`file:./dev.db`) is selected for local execution because it operates with zero background service dependencies on Windows and provides immediate ACID compliance.
- **Production Target:** PostgreSQL (via Supabase, Neon, or Vercel Postgres).
- **SQLite / PostgreSQL Differences Documented:**
  - Enums: SQLite does not support native `enum` types in SQL; Prisma emulates enums as `TEXT` with application-level validation. In PostgreSQL, Prisma creates native database `ENUM` types.
  - DateTime precision: SQLite stores timestamps as ISO strings/integers, whereas PostgreSQL uses microsecond-precision `timestamp with time zone`.
  - JSON types: Not required in the core schema; plain relational foreign key relationships are used.
  - Concurrency: SQLite uses file-level locking during writes; PostgreSQL supports row-level locking. For multi-mat simultaneous weigh-in in production, PostgreSQL is mandatory.

---

## Business Logic Decisions
- **State Machine Transitions:**
  - `PENDING` → `PASS`, `HOLD`, `REJECT`
  - `HOLD` → `PASS`, `HOLD`, `REJECT`
  - `REJECTED` → `PASS`, `HOLD` (strictly no `REJECT` button shown)
  - `PASSED` → locked / no action buttons presented
- **Weight Requirement:** Numeric entry is mandatory prior to any status action. Values must be between `10.00 kg` and `200.00 kg` with up to two decimal places.
- **Next Athlete Behavior:** Advances exclusively to the next unresolved (`PENDING` or `HOLD`) athlete within the active category.

---

## UI/UX Decisions
- **Sports Console Aesthetics:** Deep navy/slate background (`#0B0F17`) with emerald for Passed, amber for Hold, red for Rejected, and slate for Pending.
- **Operator Console:** Split layout featuring bold athlete metadata, oversized weight readout, rapid `+/-` steppers, on-screen touch keypad, and high-visibility status buttons.
- **Omnipresent Search:** Global spotlight modal (`Ctrl+K` or `/`) accessible from anywhere with one-click direct jump to athlete in weigh-in queue.

---

## Integration Decisions
- **Fixture System Compatibility:** Participant schema is aligned with [tkdfixture.vercel.app](https://tkdfixture.vercel.app/).
- **Export Endpoint:** `/api/export/fixtures` provides certified `PASSED` rosters ready for direct consumption by the Draw and Bracket generation pipeline.

---

## Known Constraints
- Local Windows environment runs with PowerShell script execution restrictions for `.ps1` files; `npm.cmd` and `npx.cmd` must be used for CLI operations.
- Local PostgreSQL service is not installed on this workstation; local dev and automated tests run via Prisma SQLite, with full schema parity for PostgreSQL.

---

## Known Issues
- None currently recorded.

---

## Completed Milestones
- [x] Phase 1: Mandatory Project Documentation created (`prd.md`, `architecture.md`, `rules.md`, `design.md`, `tasks.md`, `memory.md`).
- [x] Phase 2: Next.js 14+ (App Router) + Tailwind CSS + TypeScript + Lucide React foundation configured.
- [x] Phase 3: Prisma ORM relational persistence (`Participant`, `WeighInAttempt`, `AuditLog`) initialized and seeded with realistic multi-category tournament dataset.
- [x] Phase 4: Participant Management engine with Zod schema validation, LOT uniqueness checks, and protected deletion.
- [x] Phase 5: Bulk Import pipeline supporting `.csv` and `.xlsx` via SheetJS, with downloadable templates, pre-import preview, and collision detection.
- [x] Phase 6: Dynamic Category Segregation engine organizing participants by `Gender -> Division -> Age Group -> Category -> Weight Category`.
- [x] Phase 7: Touch-optimized Weigh-In Operator Console with numeric keypad, +/- fine steppers, strict state machine enforcement (`PENDING -> PASS/HOLD/REJECT`, `HOLD -> PASS/HOLD/REJECT`, `REJECTED -> PASS/HOLD`, `PASSED -> locked`), attempt history timeline, and fast `[NEXT ATHLETE]` workflow.
- [x] Phase 8: Tournament-wide instant search (`Ctrl+K`) with live query dropdown and 1-click weigh-in jump.
- [x] Phase 9: Status-specific segregation views for Passed, Pending/Hold, and Rejected.
- [x] Phase 10: Strict A4 Print Engine formatted via `@media print` displaying **ONLY** Athlete Name and Academy Name per RULE-010, RULE-018, RULE-019.
- [x] Phase 11: Real-time Tournament Dashboard with live database counters, division breakdowns, and chronological audit feed.
- [x] Phase 12: Automated test suite execution (`npm test`: 100% passing across state-machine, import-validation, database integrity) and production compilation (`next build`: 15/15 static and dynamic routes compiled).

---

## Future Work
- Direct Web Bluetooth or Web Serial integration for certified digital scales.
- Multi-mat real-time WebSocket synchronization across multiple weigh-in stations.
- Photo capture integration for athlete accreditation ID cards.

---

## Important File Locations
- Documentation: `/docs/`
- Prisma Schema: `/prisma/schema.prisma`
- Database Seed: `/prisma/seed.ts`
- State Machine Engine: `/src/lib/state-machine.ts`
- Category Engine: `/src/lib/category-engine.ts`
- Validation Schemas: `/src/lib/validation.ts`
- Weigh-In Console: `/src/app/weigh-in/page.tsx`
- Print View & CSS: `/src/app/print/page.tsx` and `/src/app/globals.css`
- Fixture Export Endpoint: `/src/app/api/export/fixtures/route.ts`

---

## Environment Variables
- `DATABASE_URL`: Connection string (`file:./dev.db` for SQLite; `postgresql://...` for production).
- `NODE_ENV`: Runtime environment (`development` / `production`).
- `NEXT_PUBLIC_APP_NAME`: Application display name ("Taekwondo Weigh-In Management System").

---

## Change History
- **2026-09-20 (Initial Setup):** Completed Phase 1 Documentation suite according to tournament master prompt requirements.
- **2026-09-20 (Complete Implementation):** Implemented all 12 phases including Next.js App Router, Prisma ORM, state machine, operator console, import pipeline, print engine, automated test suites, and verified 100% test pass and production build.
- **2026-09-20 (Olympic Theme & Divisions Overhaul):** Completed Phase 13:
  - Integrated official Kyorix (Sport Technology Private Limited) branding and logo.
  - Migrated styling to Olympic light palette (`#0052FF`, `#F8FAFC`, `#0F172A`).
  - Redesigned "Add Competitor" form and "Bulk Import" modal per user mockups.
  - Implemented 4 official Age Divisions (Sub-Junior, Cadet, Junior, Senior) with dynamic weight category cascading.
  - Automated sequential unique LOT number assignment (`001`, `002`, etc.) removing manual entry friction.
  - Integrated live instant search bar directly into the Weigh-In Console (removing separate search page).
  - All automated test suites (`npm test`) passing at 100% and production build (`npm run build`) passing with 0 errors.


