# Business Rules & Operational Truth Document
# Taekwondo Tournament Weigh-In Management System

> **STATUS:** IMMUTABLE SOURCE OF TRUTH  
> **RULE PRIORITY:** If any software implementation or user interface behavior contradicts this document, the implementation must be modified to adhere to this document. Business rules must not be silently modified or bypassed.

---

## 1. Participant Creation & Identity Rules

### RULE-001: Initial Status Assignment
Every newly created or imported participant record must automatically and unconditionally receive the status `PENDING`. No athlete may be inserted directly into `PASSED`, `HOLD`, or `REJECTED` status during standard registration or bulk import.

### RULE-002: LOT Number Tournament Uniqueness
Every participant must have a LOT Number. A LOT Number must be strictly unique across the entire tournament database. Any attempt to insert or update a participant with a LOT Number that already exists in the database must be rejected with a descriptive validation error.

### RULE-002A: Automatic Sequential LOT Assignment
When an athlete is registered via manual entry or bulk competitor import without an explicit LOT Number, the system automatically assigns the next sequential unique LOT (e.g. `001`, `002`, `014`) by evaluating the highest existing numeric LOT in the database and incrementing by 1.

### RULE-003: LOT Number Immutability During Active Weigh-In
Once a participant has one or more recorded weigh-in attempts, their LOT Number cannot be edited or reassigned without administrative supervisor clearance.

### RULE-004: Mandatory Participant Attributes & Official Divisions
Every participant record must contain non-empty, validated values for:
1. Athlete Name (string, minimum 2 characters)
2. Academy / Club Name (string, minimum 2 characters)
3. Gender (strictly `MALE` or `FEMALE`)
4. Division (strictly one of the four official tournament divisions):
   - `Sub-Junior` (Under 12)
   - `Cadet` (12-14)
   - `Junior` (15-17)
   - `Senior` (18+)
5. Age Group (e.g., Under 12, 12-14, 15-17, 18+)
6. Category (e.g., Kyorugi)
7. Weight Category (dynamically determined by Division and Gender)
8. LOT Number (unique identifier, auto-assigned sequentially if omitted)

### RULE-005: Participant Record Preservation
Participant records must never be deleted as a consequence of a status change (e.g. Disqualification / `REJECTED` status does not remove the participant from the tournament database). Deletion is permitted strictly as an explicit Administrative action for athletes with zero recorded attempts.

---

## 2. Weigh-In Measurement & Validation Rules

### RULE-006: Mandatory Recorded Weight Prior to Decision
A valid, positive numeric weight must be explicitly entered and recorded before any status button (`PASS`, `HOLD`, or `REJECT`) can be activated or submitted. The system must strictly disallow submission with null, empty, negative, zero, or non-numeric weight values.

### RULE-007: Official Weight Boundaries
Official weight measurements must be decimal numbers formatted with up to two decimal places (e.g., `53.40`, `54.25`). Any entered value less than `10.00 kg` or greater than `200.00 kg` must be flagged as out-of-bounds to prevent accidental measurement or scale transmission errors.

### RULE-008: Decimal Precision Standard
All weights must be recorded and stored in kilograms (KG) to two decimal places (hundredths of a kilogram). Rounding must adhere to standard arithmetic round-half-up.

---

## 3. Status State Machine Rules

### RULE-009: PENDING State Transitions
An athlete in `PENDING` status may transition to:
1. `PASSED` (when official weight is within designated category specifications)
2. `HOLD` (when athlete is out of weight range or requires official review)
3. `REJECTED` (when athlete is disqualified or refuses to weigh in)

### RULE-010: HOLD State Transitions
An athlete in `HOLD` status may transition to:
1. `PASSED` (successful subsequent weigh-in attempt)
2. `HOLD` (athlete weighed again during official grace period but remains unresolved)
3. `REJECTED` (grace period expired or athlete fails final re-weigh attempt)
Every re-weigh action in `HOLD` status must generate a new, sequentially numbered attempt.

### RULE-011: REJECTED State Recovery Transitions
An athlete in `REJECTED` status may only transition to:
1. `PASSED` (upon successful supervisor appeal or official administrative review)
2. `HOLD` (upon supervisor granting a temporary re-weigh extension)
The `REJECT` action button must NEVER be displayed or enabled for an athlete who is already in `REJECTED` status.

### RULE-012: Terminal PASSED State
Once an athlete achieves `PASSED` status, the weigh-in operation is certified and locked. The normal weigh-in operator interface must NOT display any status-changing action buttons (`PASS`, `HOLD`, `REJECT`). The status cannot be altered through normal operator workflows.

---

## 4. History Preservation & Audit Rules

### RULE-013: Immutable Historical Attempts
Every weigh-in action must be recorded as an individual `WeighInAttempt` entry. Under no circumstances may prior weigh-in attempts be overwritten, modified, or deleted when an athlete's status changes or when a subsequent attempt is recorded.

### RULE-014: Sequential Attempt Numbering
Weigh-in attempts for a given participant must be numbered sequentially starting at 1 (Attempt 1, Attempt 2, Attempt 3, etc.). Attempt numbers must never decrement or reset.

### RULE-015: Audit Record Generation
Every change to an athlete's status must create an immutable `AuditLog` record containing:
- Participant ID
- Action Type
- Previous Status
- New Status
- Recorded Weight
- Operator ID
- Accurate Server Timestamp
- Optional Operational Notes

---

## 5. Queue Navigation & Next Athlete Rules

### RULE-016: Next Athlete Resolution Criteria
The `[NEXT ATHLETE]` operation in the Weigh-In Operator Console must exclusively advance to the next athlete within the currently active category whose status is unresolved (`PENDING` or `HOLD`).

### RULE-017: Skipped / Completed Category Handling
When all athletes within the active category have reached certified or resolved states (i.e. zero athletes in `PENDING` or `HOLD`), the `[NEXT ATHLETE]` operation must notify the operator with the standard message: `"All athletes in this category have completed weigh-in."` and must not cycle back into already resolved athletes.

---

## 6. Printing & Certification Rules

### RULE-018: Strict Passed-Only Print Dataset
The print dataset for official tournament rosters must exclusively contain athletes whose active status is `PASSED`. Athletes with status `PENDING`, `HOLD`, or `REJECTED` must be strictly filtered out and must never appear in the print output.

### RULE-019: Strict Print Content Isolation
The official printed passed roster must contain ONLY:
1. Athlete Name
2. Academy Name
Under no circumstances may the printed document display:
- Weight
- Status
- LOT Number
- Athlete ID
- Gender
- Division
- Category
- Age Group
- Weigh-in attempt counts
- Interactive UI elements (buttons, navigation bars, search inputs, pagination)

### RULE-020: Print Layout Standard
All printouts must conform to standard ISO A4 paper specifications in Portrait orientation. Content must utilize page-break controls (`page-break-inside: avoid`) to ensure table rows are never split across paper boundaries.

### RULE-021: Category Print Filtering
When the operator triggers "Print Passed Category", the output dataset must strictly enforce:
$$\text{Status} == \text{PASSED} \quad \mathbf{AND} \quad \text{Category} == \text{Selected Category}$$

---

## 7. Bulk Import Rules

### RULE-022: File-Internal Duplicate LOT Prevention
If a CSV or XLSX upload file contains two or more rows with the same LOT Number, all rows sharing that duplicate LOT Number must be flagged as invalid during pre-import validation.

### RULE-023: Database Collision Duplicate LOT Prevention
If a CSV or XLSX upload file contains a row with a LOT Number that already exists in the tournament database, that row must be flagged as invalid during pre-import validation.

### RULE-024: Non-Destructive Import Preview
No data from an uploaded CSV or XLSX file may be committed to the database until the operator has reviewed the visual validation preview and explicitly clicked "Confirm & Import".

---

## 8. Tournament Statistics & Integrity Rules

### RULE-025: Real-Time Aggregate Statistics
All tournament summary metrics (Total Athletes, Passed, Pending, Hold, Rejected, Completion %) must be calculated dynamically from actual database records. No mock, cached, or synthetic numbers may be presented to tournament officials.
