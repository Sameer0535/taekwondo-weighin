# Design System & UI/UX Specification Document
# Taekwondo Tournament Weigh-In Management System

## 1. Design Philosophy & Aesthetic Vision
The Taekwondo Weigh-In Management System is built to official **Olympic Championship Standards**, incorporating the official branding of **Kyorix (Sport Technology Private Limited)**. It embodies high readability, pristine white/slate canvas contrast, electric Olympic blue accents, rapid touch ergonomics, tactile feedback, and high visual contrast suitable for indoor stadium lighting and tablet screens.

Key Principles:
- **Olympic Cleanliness:** High-contrast, clean white surfaces with Kyorix electric blue branding (`#0052FF`).
- **Touch-First Operator Ergonomics:** Large touch targets ($\ge 48\text{px}$) for weigh-in marshals operating on digital tablets.
- **Fail-Safe Color Coding:** Unambiguous Olympic status colors (Emerald, Amber, Ruby, Slate) always accompanied by explicit text labels.
- **Zero-Friction Transitions:** Instant state feedback, optimistic UI updates, and zero layout shifts.

---

## 2. Color System

### 2.1 Olympic Palette & Kyorix Branding
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `primary` | `#0052FF` | Kyorix Electric Blue (Brand actions, active tabs, primary buttons) |
| `primary-hover` | `#0045D8` | Hover state for primary action buttons |
| `surface-bg` | `#F8FAFC` | Root background (crisp slate/light grey canvas) |
| `surface-card` | `#FFFFFF` | Primary card, container, and modal background |
| `surface-subtle` | `#F1F5F9` | Secondary inputs, category selector backgrounds |
| `border-subtle` | `#E2E8F0` | Dividers, card borders, and table line separators |
| `text-primary` | `#0F172A` | Headings, primary numeric weight readouts |
| `text-secondary` | `#475569` | Labels, categories, timestamps, metadata |
| `text-muted` | `#94A3B8` | Placeholders, inactive state icons |

### 2.2 Olympic Status Colors
Every status color is calibrated with distinct hue, saturation, and luminance to ensure immediate recognition:
| Status | Background | Border | Text | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **`PASSED`** | `#ECFDF5` (Emerald 50) | `#A7F3D0` (Emerald 200) | `#047857` (Emerald 700) | `CheckCircle2` |
| **`HOLD`** | `#FFFBEB` (Amber 50) | `#FDE68A` (Amber 200) | `#B45309` (Amber 700) | `Clock` |
| **`REJECTED`** | `#FEF2F2` (Rose 50) | `#FECDD3` (Rose 200) | `#B91C1C` (Rose 700) | `XCircle` |
| **`PENDING`** | `#F8FAFC` (Slate 50) | `#E2E8F0` (Slate 200) | `#475569` (Slate 600) | `Hourglass` |

---

## 3. Typography
- **Primary Font Family:** `Inter`, system-ui, sans-serif
- **Numeric Font Family (Weigh-In Displays):** `JetBrains Mono` or tabular numerals (`font-mono tracking-tight font-black`) to prevent digit jitter during entry.

### Type Scale
- `Display XXL` (Official Weight Value): `48px` / `56px` line-height, bold/black.
- `Heading 1` (Page Titles, Category Headings): `28px` / `34px`, semi-bold.
- `Heading 2` (Card Headers, Section Titles): `20px` / `26px`, semi-bold.
- `Body Large` (Athlete Names, Action Button Text): `16px` / `24px`, medium.
- `Body Base` (Table rows, Form inputs): `14px` / `20px`, regular.
- `Caption / Micro` (LOT numbers, timestamps, badges): `12px` / `16px`, semi-bold uppercase.

---

## 4. Navigation & Layout Hierarchy

### 4.1 Navigation Order
1. **Dashboard** (`/`): Real-time tournament metrics, KPI cards, category completion bars.
2. **Add Competitor** (`/participants`): Intake form (Full Name, Club, Country, Gender, Division, Weight Division) & live roster.
3. **Weigh-In Console** (`/weigh-in`): Interactive scale workstation with integrated live search bar and Division filter tabs.
4. **Passed** (`/passed`): Certified athletes table with Category/All print triggers.
5. **Pending / Hold** (`/pending`): Athletes awaiting initial call or in active grace period.
6. **Rejected** (`/rejected`): Disqualified athletes with Supervisor Appeal & Recovery (PASS / HOLD).
7. **Print Passed** (`/print`): Clean ISO A4 printout strictly showing ONLY Athlete Name and Academy Name per RULE-019.
| SIDEBAR         | MAIN CONTENT VIEWPORT                                          |
|                 |                                                                 |
| ⬚ Dashboard     | [Page Title & Breadcrumb]                      [Context Actions] |
| 👥 Participants |                                                                 |
| ⚖️ Weigh-In     | +-------------------------------------------------------------+ |
| 🟢 Passed       | | Main Data Grid / Touch Console Card                         | |
| 🟡 Pending/Hold | |                                                             | |
| 🔴 Rejected     | |                                                             | |
| 📥 Bulk Import  | +-------------------------------------------------------------+ |
| ⚙️ Settings     |                                                                 |
+-----------------------------------------------------------------------------------+
```

### 4.2 Sidebar Navigation Items
1. **Dashboard:** Global tournament metrics, completion %, live feed.
2. **Participants:** Full searchable, editable roster; manual add button.
3. **Weigh-In:** Primary touch-optimized operator console.
4. **Passed:** Certified athletes view + Print trigger.
5. **Pending / Hold:** Segregated holding and re-weigh area.
6. **Rejected:** Disqualified athletes review and appeal/recovery.
7. **Bulk Import:** CSV/XLSX multi-stage onboarding tool.
8. **Settings:** Tournament config, operator assignment, database export.

---

## 5. Weigh-In Operator Console Specification

### 5.1 Active Athlete Card Layout
The operator console is split into two primary panels:
- **Left Panel (Active Weigh-In Target):**
  - **Athlete Header:** Bold LOT Number badge (e.g. `LOT: 014`), Athlete Name in `24px` semi-bold, Academy Name, and dynamic category pill.
  - **Official Weight Readout:** Giant display showing current entered weight in KG (e.g. `53.40 KG`).
  - **Quick Steppers:** 4 rapid adjustment touch chips: `[-0.5]`, `[-0.1]`, `[+0.1]`, `[+0.5]`.
  - **On-Screen Touch Keypad:** Clean 3x4 touch matrix:
    ```text
    [ 1 ]  [ 2 ]  [ 3 ]
    [ 4 ]  [ 5 ]  [ 6 ]
    [ 7 ]  [ 8 ]  [ 9 ]
    [ . ]  [ 0 ]  [ ⌫ ]
    ```
  - **Action Decision Panel:** High-visibility action buttons matching the state machine:
    - `[ PASS ]` (Emerald gradient, large $52\text{px}$ touch target)
    - `[ HOLD ]` (Amber gradient, large $52\text{px}$ touch target)
    - `[ REJECT ]` (Red gradient, large $52\text{px}$ touch target; hidden if already REJECTED)
    - Note: If status is `PASSED`, action buttons are replaced with a locked "Weigh-in Certified" badge.
  - **Workflow Fast-Forward:** `[ NEXT ATHLETE → ]` button to auto-advance to next unresolved record.
- **Right Panel (Attempts & Category Queue):**
  - **Historical Attempts Timeline:** Shows Attempt 1, Attempt 2, with weight, status badge, time, and operator ID.
  - **Category Queue Mini-List:** Scrollable list of athletes in the category with status icons.

---

## 6. Table & Form Controls

### 6.1 Data Tables
- Sticky header with subtle border.
- Alternating row zebra highlights (`surface-card` and `surface-elevated`).
- Hover glow effect on actionable rows.
- Clear status pill with icon and uppercase text.
- Action column with Edit, Weigh-In jump, and History view icons.

### 6.2 Forms
- Floating labels or crisp header labels with required asterisks (`*`).
- Inline real-time validation error text in `#F87171` (Red 400).
- Standard focus ring: `ring-2 ring-emerald-500`.

---

## 7. Modal & Dialog Patterns
- **Import Preview Modal:** Displays valid vs error rows with expandable error details.
- **Confirm Recovery Dialog:** Confirmation when moving a REJECTED athlete to PASS or HOLD.
- **Global Search Modal (`Ctrl+K`):** Spotlight-style search modal with fuzzy results and keyboard up/down/enter navigation.

---

## 8. Dedicated A4 Print Layout Specifications
- **Page Dimensions:** ISO 210mm x 297mm (A4 Portrait).
- **Margins:** $15\text{mm}$ on all sides.
- **Font:** Clean sans-serif (`Arial` or `Inter`), dark `#000000` text on `#FFFFFF` paper.
- **Strict Content Layout:**
  - Standard minimalist header: Tournament Name, Category Title, Date, "Certified Passed Roster".
  - Clean 2-column or tabular roster containing **STRICTLY**:
    - **Column 1:** Athlete Name (bold, 14pt)
    - **Column 2:** Academy / Club Name (regular, 12pt)
  - **Print CSS Rule:** All page background colors, sidebars, buttons, LOT numbers, weights, and headers are set to `display: none !important`.

---

## 9. Responsive Breakpoints
- **Mobile (< 768px):** Stacked single-column card views; collapsible drawer for navigation; touch stepper inputs.
- **Tablet (768px - 1024px):** Primary operator mode; side-by-side active athlete and keypad layout; sticky bottom action bar.
- **Desktop (1024px+):** Full 3-column overview; expansive table views; persistent left sidebar.
