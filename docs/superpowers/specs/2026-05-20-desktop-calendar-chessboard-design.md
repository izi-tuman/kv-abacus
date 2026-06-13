# Desktop Calendar Chessboard — Design Spec

**Date:** 2026-05-20
**Status:** Approved (brainstorm phase)
**Scope:** First step of project-wide desktop adaptation — booking calendar page + global desktop sidebar shell. Other pages adapt later.

---

## 1. Goals

- Add a desktop layout (`lg` ≥ 1024px) with a collapsible left sidebar instead of bottom navigation.
- Render the booking calendar on desktop as a PMS-style chessboard: rows = houses, columns = days, bookings as horizontal bars.
- Keep the mobile experience unchanged.
- Establish a clean split between mobile and desktop component trees so each side evolves independently.

## 2. Non-goals

- Adapting other pages (`/houses`, `/clients`, `/rental`, `/more/*`) to desktop — separate tasks.
- Replacing `ModalSheet` with a centered desktop modal — separate task.
- Drag-to-create or drag-to-resize bookings.
- Virtualization of the chessboard.

## 3. Breakpoint and detection

- Breakpoint: `lg` (≥ 1024px). Below — mobile (current UI). At/above — desktop.
- New hook `hooks/useBreakpoint.ts`: subscribes to `window.matchMedia('(min-width: 1024px)')`, returns `'mobile' | 'desktop' | null`.
- Before mount it returns `null`; consumers default to mobile rendering to avoid SSR flash and to keep first paint cheap.

## 4. Global layout changes

### 4.1 `app/layout.tsx`

- Keep `max-w-md mx-auto` on the page-content wrapper globally. Pages opt in to full width by rendering a root element with `data-page="fullwidth"`. The layout wrapper uses Tailwind arbitrary CSS selector (`[&:has([data-page=fullwidth])]:lg:max-w-none [&:has([data-page=fullwidth])]:lg:mx-0`) so the constraint is dropped only on those pages and only on `lg+`.
- Wrap children in a `lg:flex` two-column shell: `<DesktopSidebar />` (`hidden lg:flex`) on the left, `<main className="flex-1 min-w-0">` on the right.
- `<BottomNav />` gains `lg:hidden`.
- Bottom padding (`pb-[calc(5rem+env(safe-area-inset-bottom,0px))]`) only applies on mobile — remove on `lg+` (`lg:pb-0`).

### 4.2 Shared navigation source

- Extract `NAV_ITEMS` from `components/layout/BottomNav.tsx` into `components/layout/nav-items.ts`.
- Both `BottomNav` and `DesktopSidebar` import the same list and apply the same permission filter (`currentRole[item.permission]`).

### 4.3 `components/layout/DesktopSidebar.tsx` (new)

Header comment: `// Desktop-only left navigation rail. Collapsible between 220px and 64px; persists state in localStorage.`

- Renders only on `lg+` (`hidden lg:flex`).
- `sticky top-0 h-dvh` flex column.
- Two states:
  - Expanded: `w-[220px]`, icon + label.
  - Collapsed: `w-[64px]`, icon only; label exposed via `title` attribute (native tooltip).
- Width transition: `transition-[width] duration-200`.
- State managed by `hooks/useSidebarCollapsed.ts` (new): `{ collapsed: boolean, toggle: () => void }`, persisted to `localStorage` (key `sidebarCollapsed`). Initial render uses expanded (`false`) until hydration reads localStorage — accepted brief flicker.
- Toggle control: arrow chevron button at the top of the sidebar (right edge in expanded state, centered icon in collapsed state).
- Sections top-to-bottom:
  1. Header: company name (from `settings.companyName`) when expanded, just logo icon when collapsed. Chevron toggle next to it.
  2. Nav list: same filtered `NAV_ITEMS`. Active item gets `bg-[var(--accent-light)]` background, accent text color, 3px left accent bar (`--accent`), Phosphor icon `weight="fill"`.
  3. Spacer (`flex-1`).
  4. Footer: empty (profile/logout stay in `/more`).
- Active-state matching mirrors `BottomNav`: `pathname === '/'` exact; otherwise `pathname === href || pathname.startsWith(href + '/')`.

## 5. Calendar component split

### 5.1 New folder layout

```
components/booking-calendar/
  index.tsx                            # breakpoint switch
  shared/
    types.ts                           # view-layer types
    useBookingCalendarController.ts    # all CRUD + modal state shared by mobile/desktop
    bookingHelpers.ts                  # date-index math for bars
  mobile/
    MobileBookingCalendar.tsx          # current root code, moved here
    CalendarHeader.tsx
    WeekView.tsx
    DayView.tsx
    BookingCard.tsx
    BookingView.tsx
    BookingModal.tsx
    ClientPicker.tsx
    HousePicker.tsx
    DaySlotHelpers.tsx
  desktop/
    DesktopBookingCalendar.tsx
    ChessboardHeader.tsx
    ChessboardGrid.tsx
    ChessboardDateRow.tsx
    ChessboardHouseColumn.tsx
    ChessboardRow.tsx
    ChessboardCell.tsx
    BookingBar.tsx
    BookingPreviewPopover.tsx
    useRangeSelection.ts
    useChessboardDates.ts
```

Existing mobile files inside `components/booking-calendar/` move into `mobile/` without behavior changes. Import paths update accordingly.

### 5.2 `components/booking-calendar/index.tsx`

```tsx
"use client";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import MobileBookingCalendar from "./mobile/MobileBookingCalendar";
import DesktopBookingCalendar from "./desktop/DesktopBookingCalendar";

export default function BookingCalendar() {
  const bp = useBreakpoint();
  // Default to mobile until hydration determines viewport — avoids SSR flash.
  if (bp === 'desktop') return <DesktopBookingCalendar />;
  return <MobileBookingCalendar />;
}
```

### 5.3 `useBookingData` refactor

- Current signature: `useBookingData(weekStart: Date)`.
- New signature: `useBookingData(rangeStart: Date, rangeEnd: Date)`.
- Bookings fetched for the full range. AbortController on range change as before.
- Reference data (houses, clients, users, services) load once on mount, unchanged.
- API must accept date range params. If `bookingsApi.getBookings` currently takes `weekStart` only, extend it to `getBookings({ from, to })`. (Backend support assumed; verify during planning.)

### 5.4 `useBookingCalendarController` (shared)

Header comment: `// Shared state and CRUD handlers for mobile and desktop calendar variants.`

- Params: `{ rangeStart: Date, rangeEnd: Date }`.
- Internally calls `useBookingData(rangeStart, rangeEnd)`.
- Owns modal tri-state for `modalBooking`, `clientModal`, `houseModal` plus `modalDefaultDate`, `preselectedClient`, `preselectedHouseId`.
- Exposes `handleSave`, `handleDelete`, `handleClientSave`, `handleHouseSave`, `handleHouseDelete` — copied from current root code in `components/booking-calendar/index.tsx`.
- Returns everything both variants need.

### 5.5 `MobileBookingCalendar`

- Uses `useCalendarNavigation()` locally (week/day, swipe).
- Computes its own narrow range (current week or current day) and passes to `useBookingCalendarController`.
- Renders `CalendarHeader`, `WeekView` or `DayView`, and the shared `BookingModal`/`ClientModal`/`HouseModal`.
- Pull-to-refresh stays.
- Behavior identical to current root component.

### 5.6 `DesktopBookingCalendar`

Header comment: `// Desktop chessboard calendar — rows = houses, columns = days.`

- Uses `useChessboardDates()` to compute the visible range (prev month → today's month + 3).
- Passes `(rangeStart, rangeEnd)` to `useBookingCalendarController`.
- Holds desktop-only state: `previewBooking: Booking | null`.
- Uses `useRangeSelection` for chessboard cell selection.
- Renders `ChessboardHeader`, `ChessboardGrid`, `BookingPreviewPopover`, and the shared modals.
- Root element carries `data-page="fullwidth"` so the global wrapper drops `max-w-md` on `lg+`.

## 6. Chessboard data and range

### 6.1 `useChessboardDates`

Header comment: `// Computes the 5-month chessboard window and month grouping.`

- `anchor = today`
- `rangeStart = first day of (anchor.month - 1)`
- `rangeEnd = last day of (anchor.month + 3)`
- Returns `{ rangeStart, rangeEnd, days: Date[], months: { label: string, startIndex: number, span: number }[], todayIndex: number }`.
- Memoized by `toDateString(today)` so it only recomputes once per calendar day.
- Recomputes on `visibilitychange` if the cached `today` no longer matches `new Date()` (handles tabs left open overnight).

### 6.2 ChessboardHeader

Header comment: `// Top action bar for the desktop chessboard.`

Contents (left to right):
- Page title ("Календарь" or similar).
- `← month` button — smooth scroll the grid left by `daysInPrevMonth * CELL_WIDTH`.
- `Сегодня` button — scrolls so today's column sits ~120px from the right edge of the sticky house column.
- `month →` button — symmetric to left.
- `+ Новая бронь` button — opens `BookingModal` empty (same as mobile header `+`).

The grid mounts already scrolled to "today" via an effect on first mount.

## 7. Chessboard visual structure

### 7.1 Constants

- `CELL_WIDTH = 56`
- `ROW_HEIGHT = 56` (raise to 64 if three text lines visually crowd in implementation)
- `HOUSE_COL_WIDTH = 200`
- Date header height: ~64px (two rows: month, day-number+weekday).

### 7.2 `ChessboardGrid`

Header comment: `// Scrollable container providing sticky-top date row and sticky-left house column.`

```
<div ref={scrollRef} className="relative overflow-auto">
  <div style={{ width: HOUSE_COL_WIDTH + days.length * CELL_WIDTH }}>
    <div className="sticky top-0 z-20 bg-[var(--surface-elevated)]">
      <ChessboardDateRow days={days} months={months} todayIndex={todayIndex} />
    </div>
    {houses.filter(h => h.isActive).map(house => (
      <ChessboardRow
        key={house.id}
        house={house}
        days={days}
        bookings={bookingsByHouse[house.id] ?? []}
        selection={selection}
        onCellHover={...}
        onCellClick={...}
        onBookingClick={...}
      />
    ))}
  </div>
</div>
```

### 7.3 `ChessboardDateRow`

Header comment: `// Sticky top header — month band + day cells, with today/weekend highlighting.`

- Top band: one block per month, width = `daysInMonth * 56px`, label centered. Month label itself is `sticky left-[200px]` so it stays readable while scrolling its month into view (subject to feasibility — fallback: non-sticky labels).
- Bottom row: per-day cells with day number + short weekday (`пн`, `вт`, …).
- Today's cell: `bg-[var(--accent-light)]`, accent text color, font-bold.
- Saturday/Sunday: `bg-[var(--surface-muted)]/50`.
- No holidays.

### 7.4 `ChessboardHouseColumn` / sticky house cells

- Each `ChessboardRow` has `sticky left-0 z-10` first child with `w-[200px]` — house name (and possibly capacity badge).
- Background opaque to avoid bars showing through.

### 7.5 `ChessboardRow`

Header comment: `// One house row — background cells, range-selection overlay, and absolutely-positioned booking bars.`

- Right side: a `relative` div with width `days.length * 56px`.
- Background cells rendered as a row of `ChessboardCell` (one per day) for hover/borders/weekend tint.
- Mouse events use delegation: single `onMouseMove` on the row computes the cell index via `(e.clientX - row.getBoundingClientRect().left) / CELL_WIDTH`. Single `onClick` ditto.
- Selection overlay: when `selection.houseId === house.id`, render one absolutely-positioned div spanning `[min(anchor, hover) … max(...)]`, `pointer-events-none`, fill `bg-[var(--accent-light)]/60` (or `bg-[var(--danger-light)]` on conflict).
- Bookings: `bookingsByHouse[house.id]` rendered as `BookingBar` overlays absolutely-positioned by index math from `bookingHelpers.ts`.

### 7.6 `ChessboardCell`

Header comment: `// One day cell in a house row — background, border, weekend tint.`

- `border-r border-[var(--border)]/40`.
- Weekend background tint.
- Today's column has slight accent vertical line (optional polish).
- No event handlers — clicks/hovers handled at the row level.

### 7.7 `BookingBar`

Header comment: `// Horizontal booking bar inside a chessboard row.`

- Absolute positioning: `left = bookingHelpers.startIndex(booking, days) * 56`, `width = bookingHelpers.spanNights(booking) * 56 - 4`, `top: 4, bottom: 4`.
- If booking extends past the visible range: clamp `left`/`width` to the visible window; on the clipped edge, drop `rounded-md` to flat to signal continuation.
- Status colors:
  - `active` → `bg-[var(--accent)]`, white text.
  - `completed` → `bg-stone-400`, white text.
  - `cancelled` → `bg-[var(--danger)]`, white text.
- Content (three lines, `text-[10px] leading-tight`, each `truncate`):
  1. Client full name (`clientLastName clientFirstName`, both denormalized on Booking).
  2. Phone (`booking.clientPhone`, denormalized on Booking).
  3. `N гостей` (`booking.guestsCount`, with appropriate plural form).
- Hover: `brightness-105`, `cursor-pointer`, light shadow lift.
- Click: open `BookingPreviewPopover` anchored on this bar.
- Wrapped by shadcn `Popover` `<PopoverTrigger asChild>`.

### 7.8 Bar collision rendering

- Bookings on the same house must not overlap; the only allowed adjacency is `prev.checkOut === next.checkIn` (checkout day is free). In that case both bars sit in the same row, edge-to-edge, with no gap between them (the right border of the outgoing bar touches the left border of the incoming bar). No vertical stacking is implemented because the data model forbids true overlap.

## 8. Range selection (`useRangeSelection`)

Header comment: `// Two-click range selection for empty cells in a chessboard row.`

### 8.1 State

```ts
type Selection =
  | { phase: 'idle' }
  | {
      phase: 'picking-end';
      houseId: string;
      anchorIndex: number;   // index into days[]
      hoverIndex: number;
      conflict: boolean;
    };
```

### 8.2 Transitions

- `idle` + click on empty cell in row R, index I → `picking-end { houseId: R, anchorIndex: I, hoverIndex: I, conflict: false }`.
- `picking-end`:
  - `mousemove` over same row → update `hoverIndex` to the cell under cursor; recompute `conflict`.
  - `mousemove` over a different row → no change (selection stays anchored to its row).
  - Click on empty cell in the same row, index J:
    - If `conflict` → ignore the click; selection stays.
    - Else → compute `[from, to] = [min(anchor, J), max(anchor, J)]`, derive `dateFrom = days[from]`, `dateTo = days[to]`, set `preselectedHouseId = houseId`, `modalDefaultDate = dateFrom` (and pass `dateTo`), open `BookingModal`. Reset to `idle`.
    - Single-cell selection (`anchor === J`) is treated as a one-night booking attempt: `dateFrom = days[J]`, `dateTo = days[J+1]`. (Subject to confirmation in planning; default per spec.)
  - Click on a booking, click on another row, click outside the grid, `Esc`, scroll, page change, range change → reset to `idle`.

### 8.3 Conflict detection

- On every `hoverIndex` change, compute `[from, to] = [min, max]` and check whether any existing booking for `houseId` intersects the index range `[from, to)` (the `to` endpoint represents the checkout day and is considered free).
- A booking with start index `s` and end index `e` (where `e = s + nights`) intersects when `s < to && e > from`.
- `conflict = true` triggers the danger-tinted overlay and a `cursor-not-allowed` on the row.

### 8.4 Global handlers

- `Esc` handler via a `useEffect` `window.addEventListener('keydown', …)`.
- Outside-click via `mousedown` on `document` checking `gridRef.current?.contains(e.target)`.

## 9. Booking Preview Popover

Header comment: `// Desktop-only quick preview shown on booking-bar click.`

- Built on shadcn `Popover` from `components/ui/popover.tsx`.
- `PopoverTrigger asChild` wraps `BookingBar`.
- `PopoverContent`: `side="bottom"`, `align="start"`, `sideOffset={6}`, width ~`w-80`.
- Layout:
  - Header: client full name, close (×).
  - Subheader: house name.
  - Divider.
  - Lines:
    - `📅 {dateFrom} — {dateTo} ({N} ночей)`
    - `📞 {phone}`
    - `👥 {guestCount} гостей`
    - Status badge (`Badge` component).
  - Action row: `[Редактировать]` (secondary), `[Удалить]` (danger).
- Buttons:
  - Edit → close popover, call `setModalBooking(booking)`.
  - Delete → open `ConfirmDeleteDialog` (`z-[60]`, sits above popover). On confirm → `bookingsApi.deleteBooking(booking.id)` via controller's `handleDelete`, then close popover.
- Close on: outside click, `Esc`, opening another preview.

## 10. Data model touchpoints

- `Booking` type unchanged. `clientFirstName`, `clientLastName`, `clientPhone`, `guestsCount` are all denormalized on `Booking`, no lookup required.
- `useBookingData` API extended: accept `(rangeStart, rangeEnd)`. Backend already supports range params via the existing `getBookings(startDate, endDate, signal)` signature — no API change needed.
- `bookingsApi.getBookings(startDate, endDate, signal?)` already accepts the right shape.

## 11. Edge cases (decided)

1. No active houses → grid not rendered; empty state message.
2. No bookings in range → grid renders, bars empty, selection works.
3. Booking crosses range boundary → clipped bar, flat edge on clipped side.
4. Inactive houses → filtered out of rows.
5. Same-day checkout/checkin between two bookings → bars rendered edge-to-edge, no gap.
6. Today drift across midnight → recompute on `visibilitychange`.
7. Tight bar widths → `truncate` per line; acceptable.
8. SSR → render mobile by default; switch to desktop after `useBreakpoint` resolves. Accepts a brief flash for desktop users; avoids blank initial paint.
9. `useSidebarCollapsed` localStorage hydration → initial expanded state until storage read; brief flicker accepted.

## 12. Files touched / created

**New:**
- `hooks/useBreakpoint.ts`
- `hooks/useSidebarCollapsed.ts`
- `components/layout/DesktopSidebar.tsx`
- `components/layout/nav-items.ts`
- `components/booking-calendar/shared/useBookingCalendarController.ts`
- `components/booking-calendar/shared/bookingHelpers.ts`
- `components/booking-calendar/shared/types.ts`
- `components/booking-calendar/desktop/*` (10 files listed in §5.1)

**Modified:**
- `app/layout.tsx` — desktop shell, `data-page` selector, sidebar mount.
- `app/page.tsx` (or wherever calendar is rendered) — root element gets `data-page="fullwidth"`.
- `components/layout/BottomNav.tsx` — import from shared `nav-items`, add `lg:hidden`.
- `components/booking-calendar/index.tsx` — breakpoint switcher.
- `hooks/useBookingData.ts` — range signature.

**Moved (no behavior change):**
- All current `components/booking-calendar/*` files (except `index.tsx`) → `components/booking-calendar/mobile/*`. Import paths updated.

## 13. Header comments

Each new component/hook file starts with a single-line comment describing its purpose, as illustrated in §4.3, §5.4, §5.6, §6.1, §6.2, §7.2–7.7, §8, §9.

## 14. Out of scope (future work)

- Other pages' desktop layouts.
- Centered desktop modals.
- Drag-to-create / drag-to-resize bookings.
- Grid virtualization for very large house counts.
- Public holidays highlighting.
