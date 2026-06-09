# UI/UX Audit — Follow-ups

This file tracks deferred work from the universal UI/UX consistency audit
(May 2026). Items here are intentionally scoped as a separate pass — they were
*not* blocking the previous audit's "build passes / no TS errors / public auth
pages on public theme" success criteria.

Pick this up when:

- The current sprint has no urgent product work.
- You need to do a focused mobile pass at 320–375px widths.
- A user reports that admin tables clip or scroll horizontally on mobile.

---

## Pass A — Large admin pages: 320px responsiveness audit

**Files (large, dense, table-heavy):**

- [x] `src/pages/admin/AdminStudents.tsx` (~52KB) — already card-grid based; shared loading/empty/error states adopted in the previous pass.
- [x] `src/pages/admin/AdminFeeRequests.tsx` (~50KB) — mobile stacked `<li>` cards below `sm:`, desktop table preserved. Inline edit form factored into a shared `renderEditForm` helper used by both views.
- [x] `src/pages/admin/AdminInstructorApplications.tsx` (~38KB) — already uses a stacked card list (no `<table>`), shared loading/empty/error states already adopted.
- [x] `src/pages/admin/AdminInstructors.tsx` (~34KB) — uses a card list; create-form footer + detail-drawer header hardened in the previous pass.
- [x] `src/pages/admin/AdminTrainingCenters.tsx` (~29KB) — no `<table>` (already a card list). List row now stacks the right cluster below the name below `sm:`; modal + detail-drawer headers truncate; drawer body has `flex-1 overflow-y-auto`; modal + pause-dialog footers wrap with `min-h-11` tap targets; `InfoRow` values use `break-words`.
- [x] `src/pages/admin/AdminDisciplines.tsx` (~28KB) — no `<table>` (already a card list). List row stacks status badge + action menu below name on mobile; `DisciplineForm` footer Save/Cancel are full-width at `<sm:` with `min-h-11`; form title breaks long edit names.
- [x] `src/pages/admin/AdminUsers.tsx` (~23KB) — DEMO_USERS removed, `AdminEmptyState` added, table has `min-w-[480px]` + `overflow-x-auto` and stacks roles into the first cell below `sm:`.
- [x] `src/pages/admin/AdminProfile.tsx` (~25KB) — no `<table>`. Outer profile card padding + avatar scale down on mobile; headline breaks; email/personnel-ID cards use `min-w-0` + `truncate`; security modal header truncates with a 44 px close button; security modal sticky footer stacks vertically below `sm:` with `min-h-11 w-full` buttons (so "Update Super Admin Security" no longer clips).
- [x] `src/pages/admin/AdminPaymentReview.tsx` (~14KB) — mobile stacked `<li>` cards below `sm:`, desktop table preserved.

**What to check / improve on each:**

1. Wrap all `<table>` blocks in a `<div className="overflow-x-auto -mx-4 sm:mx-0">`
   or convert to a stacked mobile card list below `sm:` breakpoint.
2. Detail drawers / dialogs: confirm `max-h-[92dvh]` + `overflow-y-auto` and
   `w-full max-w-2xl` patterns are used (the InstructorApplications
   `DetailDrawer` is a good reference).
3. Action button rows: ensure `flex-wrap gap-2` and `min-h-11` tap targets;
   the `Detail drawer` action bar in `AdminInstructorApplications.tsx`
   currently flex-wraps — replicate that pattern elsewhere.
4. Replace ad-hoc empty/loading/error blocks with the shared admin UI:
   - `AdminEmptyState` (`src/components/admin/ui/AdminEmptyState.tsx`)
   - `AdminLoadingState` (`src/components/admin/ui/AdminLoadingState.tsx`)
   - `AdminErrorState` (`src/components/admin/ui/AdminErrorState.tsx`)
   This is mostly a search-and-replace exercise for `text-sm text-slate-500`
   "Loading…" strings and `<p>No … yet</p>` blocks.
5. Confirm tabular columns that show long values (emails, names, IDs) use
   `truncate` + parent `min-w-0`. Audit candidates: name + email cells in
   AdminStudents, AdminFeeRequests, AdminInstructorApplications.
6. Verify status chips render via `AdminBadge` (`src/components/admin/ui/AdminBadge.tsx`)
   for consistent tones rather than inline `bg-* text-*` Tailwind classes.

**How to verify quickly:**

- DevTools responsive mode: 320×640, 360×740, 390×844, 768×1024.
- Manual checks: no `overflow-x` on the page body; no clipped action buttons;
  every modal scrolls inside itself; every table either fits or scrolls
  horizontally with a visible scrollbar / shadow indicator.

**Out of scope (do NOT change):**

- API calls / endpoints.
- Auth logic.
- Admin login visual direction (`src/pages/admin/AdminLogin.tsx` and
  `src/components/admin/auth/*` stay dark).

---

## Pass B — Shared mobile primitives (optional, only if Pass A reveals duplication)

If Pass A surfaces the same boilerplate in 3+ places, promote it to:

- `src/components/admin/ui/AdminResponsiveTable.tsx` — wrapper with
  `overflow-x-auto` and a "scroll" affordance shadow.
- `src/components/admin/ui/AdminMobileCardList.tsx` — `<dl>`-based key/value
  card variant of a row, rendered below the `sm:` breakpoint.

Only build these if they unlock a meaningful reduction in repeated markup;
otherwise leave the inline patterns alone.

---

## Pass C — Public pages mobile pass (lower priority)

The public marketing pages (`HomePage`, `AboutPage`, `AcademyPage`,
`DisciplinesPage`, `PublicInstructorsPage`, `EventsPage`) generally use the
homepage's responsive patterns already, but they have not had a dedicated
320px audit since the auth-theme refactor.

Spot-check for:

- Hero text clamps stay readable (`text-[clamp(...)]` ranges).
- Section CTAs stack at `<sm:` without clipping.
- Any new dark-mode regressions in cards (`public-theme-surface`).

---

## When this file should be deleted

When all of Pass A items are checked off across the listed files, delete this
file in the same commit that closes the work — don't leave stale TODOs in the
repo.

---

## Progress log

- May 12, 2026 — Pass A: converted `AdminFeeRequests` and `AdminPaymentReview`
  wide tables to dual mobile-card / desktop-table layouts. No new
  dependencies, no API changes, `npm run lint` + `npm run build` green.
- May 12, 2026 — Pass A finished: audited the remaining
  `AdminTrainingCenters`, `AdminDisciplines`, and `AdminProfile`. None of
  them had a `<table>` to convert; fixes were limited to row-cluster
  stacking below `sm:`, drawer/modal header truncation, drawer-body
  scrolling (`flex-1 overflow-y-auto`), and footer buttons gaining
  `min-h-11` + full-width-on-mobile so long labels (e.g. "Update Super
  Admin Security") stop clipping. Pass A is now complete.
