# Product Requirements Document (PRD)
# Taekwondo Tournament Weigh-In Management System

## 1. Product Overview
The **Taekwondo Weigh-In Management System** is a professional, tournament-grade digital management platform engineered specifically for Taekwondo tournament organizers, technical directors, and official weigh-in marshals. It automates participant intake, weight measurement validation, real-time category segregation, status transition state enforcement, complete historical weigh-in audit trails, and strict A4 paper-ready passed athlete roster printing.

The system serves as the definitive bridge between athlete registration and bracket/draw generation, designed to seamlessly interface with existing fixture systems (such as [tkdfixture.vercel.app](https://tkdfixture.vercel.app/)).

---

## 2. Problem Statement
Traditional Taekwondo tournaments face severe bottlenecks and integrity challenges during official weigh-ins:
- **Human Error & Illegible Records:** Paper weigh-in sheets lead to transcription errors, lost records, and disputed weights.
- **Rules Non-Compliance:** Unclear or loosely tracked attempt limits, unauthorized re-weighs, and improper status transitions (e.g. changing an already passed athlete or incorrectly re-weighing rejected athletes without supervisor oversight).
- **Inefficient Category Queueing:** Marshals struggle to navigate participants sorted across complex multidimensional hierarchies (Gender → Division → Age Group → Category → Weight Category).
- **Delayed Draw Generation:** Bracket coordinators must wait for manual tallying and re-verification of passed rosters.
- **Accidental Disqualification & Audit Loss:** Failure to track multi-attempt progression (e.g., Attempt 1: 54.20 kg HOLD → Attempt 2: 53.80 kg PASSED) leaves tournaments vulnerable to protests and appeals.

---

## 3. Goals
- **G-01:** Eliminate paper-based weigh-in friction with a high-throughput, touch-optimized operator interface.
- **G-02:** Enforce an immutable status state machine (`PENDING`, `HOLD`, `PASSED`, `REJECTED`) where rules cannot be violated.
- **G-03:** Guarantee 100% preservation of every weigh-in attempt and audit record with timestamps and operator identity.
- **G-04:** Provide rapid CSV and XLSX bulk onboarding with pre-import validation, error isolation, and duplicate LOT detection.
- **G-05:** Dynamic category segregation automatically grouping participants by Gender, Division, Age Group, Category, and Weight Category.
- **G-06:** Provide strict, fail-safe A4 passed-athlete printing containing exclusively Athlete Name and Academy Name.
- **G-07:** Enable instant, tournament-wide search across Name, LOT Number, Academy, and Category.
- **G-08:** Design participant schema and export formats to directly feed future fixture, drawing, and match scoring workflows.

---

## 4. Non-Goals
- **NG-01:** Direct electronic digital scale hardware driver integration via serial/Bluetooth (handled via fast numeric keypad/stepper entry).
- **NG-02:** Generating tournament bracket trees and single/double elimination ladders inside this module (delegated to the connected fixture system `tkdfixture.vercel.app`).
- **NG-03:** Live point-by-point electronic scoring system (PSS) hardware telemetry during matches.
- **NG-04:** Public spectator ticketing or spectator livestreams.

---

## 5. Target Users & Personas
- **Tournament Director / Head of Competition:** Oversees overall tournament operations, configures categories, reviews rejected athletes, audits logs, and triggers official passed roster printouts.
- **Weigh-In Marshal / Official Operator:** Stations at official digital scale tables, calls athletes by LOT number, enters official weights, triggers status decisions (PASS, HOLD, REJECT), and navigates the queue using touchscreen tablets or laptops.
- **Team Coaches / Academy Leaders:** Submit bulk registration rosters, monitor real-time queue status (Pending/Hold), and present athletes for designated re-weigh windows.
- **Bracket Coordinator / Draw Master:** Receives the certified passed athlete roster to seed and draw division fixtures.

---

## 6. User Roles & RBAC
- **`ADMIN`:** Full management privileges — create/edit/delete participants, configure system settings, trigger imports, override decisions with audit justification, export databases, and print rosters.
- **`WEIGH_IN_OPERATOR`:** High-speed operational role — view participants, record weights, execute status transitions (`PASS`, `HOLD`, `REJECT`), trigger "Next Athlete", and view category progress.
- **`VIEW_ONLY`:** Inspection role for coaches and marshals — search athletes, view category completion statistics, and inspect public statuses without modification rights.

---

## 7. Functional Requirements

### 7.1 Participant Intake & Add Competitor Overhaul
- **FR-PM-01:** Dedicated intake card matching tournament specifications: Full Name, Club / Affiliation, Country dropdown (default "India (IND)"), Gender (Male/Female), Age Class (Division), and dynamic Weight Division dropdown.
- **FR-PM-02:** Official Divisions & Dynamic Weight Categories:
  - **Sub-Junior (Under 12)**: Male (-18kg to +38kg), Female (-18kg to +35kg)
  - **Cadet (12-14)**: Male (-33kg to +65kg), Female (-29kg to +59kg)
  - **Junior (15-17)**: Male (-45kg to +78kg), Female (-42kg to +68kg)
  - **Senior (18+)**: Male (-54kg to +87kg), Female (-46kg to +73kg)
- **FR-PM-03:** Auto Sequential LOT Assignment: Users do not need to manually supply LOT numbers; the system automatically calculates `max(existing_lots) + 1` and formats as sequential 3-digit strings (`001`, `002`, etc.).
- **FR-PM-04:** Fast actions: "Add Competitor", "Bulk Import (CSV/Paste)", "Reset with Sample Data", "Clear All Competitors".
- **FR-PM-05:** Participant deletion protection (participants with recorded weigh-in attempts cannot be deleted to protect audit history).

### 7.2 Bulk Import Engine
- **FR-BI-01:** Direct text pasting format matching Image 2: `Competitor List (Format: Name, Academy - one per line)`.
- **FR-BI-02:** Top category selectors: Gender, Age Class / Division (Sub-Junior, Cadet, Junior, Senior), Weight Division (dynamically updated).
- **FR-BI-03:** File parser supporting `.csv` and `.xlsx` (Excel) bulk uploads.
- **FR-BI-04:** Pre-import validation pipeline:
  - Detect missing required cells
  - Detect duplicate LOT numbers within the upload file
  - Detect duplicate LOT numbers colliding with existing database entries
  - Automatically allocate sequential LOT numbers for pasted competitor rows
- **FR-BI-05:** Interactive visual preview table displaying Valid Rows (green) and Error Rows (red) with descriptive error tooltips.
- **FR-BI-06:** Import confirmation summary and atomic batch insertion.

### 7.3 Dynamic Category Segregation
- **FR-CS-01:** Multidimensional grouping of participants:
  $$\text{Gender} \longrightarrow \text{Division} \longrightarrow \text{Age Group} \longrightarrow \text{Category} \longrightarrow \text{Weight Category}$$
- **FR-CS-02:** Division filter tabs embedded directly in the Weigh-In console: "All Divisions", "Sub-Junior", "Cadet", "Junior", "Senior".
- **FR-CS-03:** Category status counters displaying real-time metrics:
  - Total Athletes
  - Passed
  - Pending
  - Hold
  - Rejected
  - Progress percentage

### 7.4 Weigh-In Operator Console
- **FR-WO-01:** Touch-optimized UI tailored for 10-inch+ tablets and laptops.
- **FR-WO-02:** Category picker with live search and status badges.
- **FR-WO-03:** Active Athlete Card displaying LOT, Athlete Name, Academy, Gender, Division, Category, Weight Category, and Previous Attempts count.
- **FR-WO-04:** Official Weight Entry:
  - Large numeric decimal input (e.g. `53.40`)
  - Touch-friendly on-screen numeric keypad (0-9, `.`, Backspace, Clear)
  - Quick +/- fine adjustment steppers (`+0.1`, `-0.1`, `+0.5`, `-0.5`)
  - Range validation (minimum `10.00 kg`, maximum `200.00 kg`)
- **FR-WO-05:** Strict Status Buttons according to active athlete state machine:
  - When `PENDING`: `[ PASS ]`, `[ HOLD ]`, `[ REJECT ]`
  - When `HOLD`: `[ PASS ]`, `[ HOLD ]`, `[ REJECT ]`
  - When `REJECTED`: `[ PASS ]`, `[ HOLD ]` (No `REJECT` button)
  - When `PASSED`: All action buttons hidden; read-only certified badge displayed
- **FR-WO-06:** `[ NEXT ATHLETE ]` fast-forward button:
  - Automatically loads the next unresolved athlete (`PENDING` or `HOLD`) in the active category.
  - When all athletes are resolved, displays the "All athletes in this category have completed weigh-in" completion banner.
- **FR-WO-07:** Historical attempts drawer showing complete audit record:
  - Attempt #, Recorded Weight, Resulting Status, Timestamp (HH:MM:SS), Operator ID, and optional notes.

### 7.5 Status Views & Segregation
- **FR-SV-01 (Passed View):** Filterable table of only `PASSED` athletes. Includes instant trigger for passed-athlete roster printing.
- **FR-SV-02 (Pending / Hold View):** Dedicated holding area for athletes awaiting call or in secondary re-weigh period. Clear visual badge distinction (Pending: Slate/Gray; Hold: Amber). Includes single-click jump to operator console.
- **FR-SV-03 (Rejected View):** Dedicated registry of disqualified or over-weight athletes. Enables supervisor review and recovery transitions (`PASS` or `HOLD`).

### 7.6 Strict A4 Print Engine
- **FR-PR-01:** Dedicated print formatting conforming to standard ISO A4 paper (portrait).
- **FR-PR-02 (Content Filter - Strict):** Printed page must contain **ONLY**:
  1. Athlete Name
  2. Academy Name
- **FR-PR-03 (Strict Negative Constraint):** Under no circumstance may the printed output contain:
  - Weight values
  - Status labels
  - LOT numbers
  - Athlete IDs
  - Gender or Division tags
  - Pending, Hold, or Rejected athletes
  - UI navigation, headers, footers, buttons, or scrollbars
- **FR-PR-04:** Print Scopes:
  - "Print All Passed" (tournament-wide passed athletes)
  - "Print Passed Category" (filtered by selected category, strictly passed only)
- **FR-PR-05:** CSS print styling with `page-break-inside: avoid` and crisp typographic contrast.

### 7.7 Global Search
- **FR-GS-01:** Omnipresent search bar with instant keyboard shortcut (`/` or `Ctrl + K`).
- **FR-GS-02:** Fuzzy & substring search across:
  - Athlete Name
  - LOT Number
  - Athlete ID
  - Academy Name
  - Category
- **FR-GS-03:** Live search dropdown preview with status indicator and one-click direct jump to athlete in weigh-in console.

### 7.8 Dashboard & Tournament Analytics
- **FR-DB-01:** High-impact tournament summary cards:
  - Total Registered Athletes
  - Total Passed (Green)
  - Total Pending (Slate)
  - Total Hold (Amber)
  - Total Rejected (Red)
  - Overall Weigh-In Completion Percentage
- **FR-DB-02:** Category progress bar breakdown.
- **FR-DB-03:** Gender and Division distribution charts.
- **FR-DB-04:** Live chronological audit log feed.

### 7.9 Audit Logging
- **FR-AL-01:** Automatic immutable logging on every status transition, weight capture, and supervisor intervention.
- **FR-AL-02:** Audit fields: Participant ID, Action, Previous Status, New Status, Weight, Operator ID, Timestamp, Details.

---

## 8. Non-Functional Requirements
- **NFR-01 (Performance):** Zero UI lag during weight entry; query responses under 100ms for tournaments with up to 5,000 athletes.
- **NFR-02 (Reliability & Persistence):** ACID-compliant database transactions. No state loss upon browser refresh, network reconnect, or unexpected tablet reboot.
- **NFR-03 (Responsiveness):** 100% responsive across Mobile (375px+), Tablet (768px - 1024px touch devices), and Desktop/Laptop (1280px+).
- **NFR-04 (Security):** All mutating API endpoints validated with strict Zod schemas; input sanitization against XSS; SQL injection prevention via ORM parameterization; no raw credentials exposed to client.
- **NFR-05 (Accessibility):** High contrast ratio (WCAG AA), text accompanied by color on all status badges, touch targets $\ge 48\times 48\text{px}$.

---

## 9. Future Integration (Fixture / Bracket System)
- **FI-01:** Compatible participant schema with `tkdfixture.vercel.app`.
- **FI-02:** Certified Passed Export JSON endpoint (`/api/export/fixtures`) structured for direct consumption by the Draw & Seeding engine.

---

## 10. Acceptance Criteria Checklist
- [ ] Manual participant registration with full validation and duplicate LOT rejection.
- [ ] Bulk import of CSV and XLSX with downloadable template and pre-import error review.
- [ ] Dynamic category hierarchy generation without hardcoded categories.
- [ ] Weigh-in operator screen with large numeric input and quick +/- steppers.
- [ ] Mandatory weight entry before any status decision is allowed.
- [ ] Strict status state machine: PENDING → PASS/HOLD/REJECT; HOLD → PASS/HOLD/REJECT; REJECTED → PASS/HOLD; PASSED → immutable (no buttons).
- [ ] Full historical weigh-in attempt preservation with timestamps and operator records.
- [ ] Fast `[NEXT ATHLETE]` workflow selecting next unresolved athlete in current category.
- [ ] Omnipresent global search across Name, LOT, ID, Academy, and Category.
- [ ] Status segregation views: Passed, Pending/Hold, and Rejected.
- [ ] Strict A4 print output displaying **ONLY** Athlete Name and Academy Name of PASSED athletes.
- [ ] Real-time tournament dashboard with real database metrics.
- [ ] Full test coverage including automated state machine and bulk import test suites.
