# Desktop Calendar Chessboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `lg`+ desktop layout with a collapsible left sidebar and convert the booking calendar to a PMS-style chessboard (rows = houses, columns = days) while keeping the mobile experience intact.

**Architecture:** A new `useBreakpoint` hook drives a switch in `components/booking-calendar/index.tsx` between an unchanged `MobileBookingCalendar` (current code, moved into `mobile/`) and a new `DesktopBookingCalendar` (chessboard). Shared CRUD/modal state lives in `useBookingCalendarController`. Global shell adds `DesktopSidebar` (`hidden lg:flex`) alongside `BottomNav` (`lg:hidden`). The calendar page opts into full width via `data-page="fullwidth"`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Radix UI primitives, Phosphor icons, Biome lint/format. **No test suite exists in this project** — verification gates use `npm run lint`, `npx tsc --noEmit`, and manual browser checks at `http://localhost:3000`.

**Reference spec:** `docs/superpowers/specs/2026-05-20-desktop-calendar-chessboard-design.md`

**Conventions used in every task:**
- All new TS/TSX files start with a one-line top-of-file comment describing purpose.
- `"use client"` on every interactive component.
- After each task: run `npm run lint` and `npx tsc --noEmit`, then commit with the message shown.
- Commits are small (one task = one commit). Never amend.
- Russian UI strings (matches existing convention).

---

## File Plan

**New files (created across tasks):**
- `hooks/useBreakpoint.ts` (Task 1)
- `hooks/useSidebarCollapsed.ts` (Task 3)
- `components/layout/nav-items.ts` (Task 2)
- `components/layout/DesktopSidebar.tsx` (Task 4)
- `components/booking-calendar/shared/types.ts` (Task 7)
- `components/booking-calendar/shared/bookingHelpers.ts` (Task 11)
- `components/booking-calendar/shared/useBookingCalendarController.ts` (Task 8)
- `components/booking-calendar/desktop/useChessboardDates.ts` (Task 10)
- `components/booking-calendar/desktop/useRangeSelection.ts` (Task 15)
- `components/booking-calendar/desktop/DesktopBookingCalendar.tsx` (Task 17)
- `components/booking-calendar/desktop/ChessboardHeader.tsx` (Task 17)
- `components/booking-calendar/desktop/ChessboardGrid.tsx` (Task 13)
- `components/booking-calendar/desktop/ChessboardDateRow.tsx` (Task 12)
- `components/booking-calendar/desktop/ChessboardRow.tsx` (Task 14)
- `components/booking-calendar/desktop/ChessboardCell.tsx` (Task 13)
- `components/booking-calendar/desktop/BookingBar.tsx` (Task 14)
- `components/booking-calendar/desktop/BookingPreviewPopover.tsx` (Task 16)

**Moved (no behavior change, Task 6):**
- `components/booking-calendar/BookingCard.tsx` → `mobile/BookingCard.tsx`
- `components/booking-calendar/BookingEditForm.tsx` → `mobile/BookingEditForm.tsx`
- `components/booking-calendar/BookingModal.tsx` → `mobile/BookingModal.tsx`
- `components/booking-calendar/BookingView.tsx` → `mobile/BookingView.tsx`
- `components/booking-calendar/CalendarHeader.tsx` → `mobile/CalendarHeader.tsx`
- `components/booking-calendar/ClientPicker.tsx` → `mobile/ClientPicker.tsx`
- `components/booking-calendar/DaySlotHelpers.tsx` → `mobile/DaySlotHelpers.tsx`
- `components/booking-calendar/DayView.tsx` → `mobile/DayView.tsx`
- `components/booking-calendar/HousePicker.tsx` → `mobile/HousePicker.tsx`
- `components/booking-calendar/WeekView.tsx` → `mobile/WeekView.tsx`
- The current `index.tsx` body becomes `mobile/MobileBookingCalendar.tsx`.

**Modified:**
- `app/layout.tsx` — desktop shell + opt-in fullwidth via `:has([data-page=fullwidth])`. (Task 5)
- `components/layout/BottomNav.tsx` — import from `nav-items`, add `lg:hidden`. (Task 2)
- `hooks/useBookingData.ts` — accept `(rangeStart, rangeEnd)`. (Task 7)
- `components/booking-calendar/index.tsx` — breakpoint switcher. (Task 17)
- `app/page.tsx` — wrapper with `data-page="fullwidth"`. (Task 5)

---

## Task 1: Add `useBreakpoint` hook

**Files:**
- Create: `hooks/useBreakpoint.ts`

- [ ] **Step 1: Create the hook**

Write `hooks/useBreakpoint.ts`:

```ts
// Subscribes to the lg (>=1024px) media query and returns 'mobile' | 'desktop' | null (pre-mount).
"use client";
import { useEffect, useState } from "react";

const QUERY = "(min-width: 1024px)";

export type Breakpoint = "mobile" | "desktop";

/** Returns 'desktop' on lg+, 'mobile' below, null until hydrated. */
export function useBreakpoint(): Breakpoint | null {
	const [bp, setBp] = useState<Breakpoint | null>(null);

	useEffect(() => {
		const mql = window.matchMedia(QUERY);
		const update = () => setBp(mql.matches ? "desktop" : "mobile");
		update();
		mql.addEventListener("change", update);
		return () => mql.removeEventListener("change", update);
	}, []);

	return bp;
}
```

- [ ] **Step 2: Verify type-check and lint**

Run:
```bash
npx tsc --noEmit
npm run lint
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/useBreakpoint.ts
git commit -m "feat(hooks): add useBreakpoint hook for lg+ detection"
```

---

## Task 2: Extract shared `nav-items.ts` and gate `BottomNav` with `lg:hidden`

**Files:**
- Create: `components/layout/nav-items.ts`
- Modify: `components/layout/BottomNav.tsx`

- [ ] **Step 1: Create shared navigation source**

Write `components/layout/nav-items.ts`:

```ts
// Single source of truth for primary navigation items (used by BottomNav and DesktopSidebar).
import {
	BackpackIcon,
	BuildingsIcon,
	DotsThreeOutlineIcon,
	HouseIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { RolePermission } from "@/types";

export type NavItem = {
	href: string;
	label: string;
	permission: RolePermission | null;
	icon: ComponentType<{ size: number; weight: "regular" | "fill" }>;
};

export const NAV_ITEMS: NavItem[] = [
	{ href: "/", label: "Главная", permission: null, icon: HouseIcon },
	{
		href: "/rental",
		label: "Прокат",
		permission: "canManageRentals",
		icon: BackpackIcon,
	},
	{
		href: "/clients",
		label: "Клиенты",
		permission: "canManageClients",
		icon: UsersIcon,
	},
	{
		href: "/houses",
		label: "Дома",
		permission: "canManageHouses",
		icon: BuildingsIcon,
	},
	{ href: "/more", label: "Ещё", permission: null, icon: DotsThreeOutlineIcon },
];
```

- [ ] **Step 2: Refactor `BottomNav.tsx` to use shared list and hide on lg+**

Replace the contents of `components/layout/BottomNav.tsx`:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { NAV_ITEMS } from "./nav-items";

export default function BottomNav() {
	const pathname = usePathname();
	const { currentRole } = useAuth();

	const visibleItems = NAV_ITEMS.filter((item) => {
		if (item.permission === null) return true;
		if (currentRole === null) return false;
		return currentRole[item.permission];
	});

	return (
		<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-elevated)]/95 backdrop-blur-xl border-t border-[var(--border)]/70 shadow-[0_-12px_34px_-18px_oklch(0.2_0.018_64/0.28)] pb-[env(safe-area-inset-bottom)]">
			<div className="flex items-center justify-around max-w-md mx-auto h-16 px-1">
				{visibleItems.map((item) => {
					const isActive =
						item.href === "/"
							? pathname === "/"
							: pathname === item.href || pathname.startsWith(`${item.href}/`);
					const Icon = item.icon;
					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={isActive ? "page" : undefined}
							className={`relative flex min-w-[64px] flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
								isActive
									? "text-[var(--accent)] bg-[var(--accent-light)]/65"
									: "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
							}`}
						>
							{isActive && (
								<div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-7 h-0.5 rounded-full bg-[var(--accent)]" />
							)}
							<Icon size={22} weight={isActive ? "fill" : "regular"} />
							<span
								className={`text-[10px] tracking-wide transition-colors duration-200 ${
									isActive
										? "font-bold text-[var(--accent)]"
										: "font-semibold text-[var(--muted-foreground)]"
								}`}
							>
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
```

- [ ] **Step 3: Verify type-check and lint**

```bash
npx tsc --noEmit
npm run lint
```
Expected: no errors.

- [ ] **Step 4: Manual sanity check**

Run `npm run dev` and visit `http://localhost:3000` at viewport ≥1024px — BottomNav should disappear. At <1024px BottomNav appears as before. Verify, then stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add components/layout/nav-items.ts components/layout/BottomNav.tsx
git commit -m "refactor(nav): extract NAV_ITEMS and hide BottomNav on lg+"
```

---

## Task 3: Add `useSidebarCollapsed` hook

**Files:**
- Create: `hooks/useSidebarCollapsed.ts`

- [ ] **Step 1: Create the hook**

Write `hooks/useSidebarCollapsed.ts`:

```ts
// Persisted state for the desktop sidebar collapsed/expanded toggle.
"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "sidebarCollapsed";

export function useSidebarCollapsed() {
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(KEY);
			if (raw === "true") setCollapsed(true);
		} catch {}
	}, []);

	const toggle = useCallback(() => {
		setCollapsed((prev) => {
			const next = !prev;
			try {
				window.localStorage.setItem(KEY, String(next));
			} catch {}
			return next;
		});
	}, []);

	return { collapsed, toggle };
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add hooks/useSidebarCollapsed.ts
git commit -m "feat(hooks): add useSidebarCollapsed with localStorage persistence"
```

---

## Task 4: Create `DesktopSidebar` component

**Files:**
- Create: `components/layout/DesktopSidebar.tsx`

- [ ] **Step 1: Write the component**

Write `components/layout/DesktopSidebar.tsx`:

```tsx
// Desktop-only left navigation rail. Collapsible between 220px and 64px; persists state in localStorage.
"use client";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useSettings } from "@/lib/settings-context";
import { NAV_ITEMS } from "./nav-items";

export default function DesktopSidebar() {
	const pathname = usePathname();
	const { currentRole } = useAuth();
	const { settings } = useSettings();
	const { collapsed, toggle } = useSidebarCollapsed();

	const visibleItems = NAV_ITEMS.filter((item) => {
		if (item.permission === null) return true;
		if (currentRole === null) return false;
		return currentRole[item.permission];
	});

	return (
		<aside
			className={`hidden lg:flex sticky top-0 h-dvh flex-col shrink-0 border-r border-[var(--border)]/70 bg-[var(--surface-elevated)]/95 backdrop-blur-xl transition-[width] duration-200 ${
				collapsed ? "w-[64px]" : "w-[220px]"
			}`}
		>
			<div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-[var(--border)]/40">
				{!collapsed && (
					<span className="truncate font-bold text-sm text-[var(--foreground)]">
						{settings.companyName ?? "Меню"}
					</span>
				)}
				<button
					type="button"
					onClick={toggle}
					aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
					className={`flex items-center justify-center w-8 h-8 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] transition-colors ${
						collapsed ? "mx-auto" : ""
					}`}
				>
					{collapsed ? (
						<CaretRightIcon size={18} weight="bold" />
					) : (
						<CaretLeftIcon size={18} weight="bold" />
					)}
				</button>
			</div>

			<nav className="flex-1 overflow-y-auto py-2">
				<ul className="flex flex-col gap-1 px-2">
					{visibleItems.map((item) => {
						const isActive =
							item.href === "/"
								? pathname === "/"
								: pathname === item.href ||
									pathname.startsWith(`${item.href}/`);
						const Icon = item.icon;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									aria-current={isActive ? "page" : undefined}
									title={collapsed ? item.label : undefined}
									className={`relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
										isActive
											? "bg-[var(--accent-light)]/65 text-[var(--accent)]"
											: "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
									}`}
								>
									{isActive && (
										<span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-md bg-[var(--accent)]" />
									)}
									<Icon size={22} weight={isActive ? "fill" : "regular"} />
									{!collapsed && (
										<span
											className={`truncate text-sm ${
												isActive ? "font-bold" : "font-semibold"
											}`}
										>
											{item.label}
										</span>
									)}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>
		</aside>
	);
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```
Expected: no errors. (Compile-only; not yet mounted in layout.)

- [ ] **Step 3: Commit**

```bash
git add components/layout/DesktopSidebar.tsx
git commit -m "feat(layout): add DesktopSidebar with collapsible navigation"
```

---

## Task 5: Wire desktop shell into `app/layout.tsx` and opt page into full width

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update root layout**

Open `app/layout.tsx` and replace the `RootLayout` return block. The current body content is:

```tsx
<AuthProvider>
  <SettingsProvider>
    <AppShell>
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))] max-w-md mx-auto min-h-dvh">
        {children}
      </div>
      <BottomNav />
    </AppShell>
  </SettingsProvider>
</AuthProvider>
```

Replace it with:

```tsx
<AuthProvider>
  <SettingsProvider>
    <AppShell>
      <div className="lg:flex min-h-dvh">
        <DesktopSidebar />
        <main className="flex-1 min-w-0 lg:overflow-x-hidden">
          <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0 max-w-md mx-auto min-h-dvh lg:[&:has([data-page=fullwidth])]:max-w-none lg:[&:has([data-page=fullwidth])]:mx-0">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </AppShell>
  </SettingsProvider>
</AuthProvider>
```

Add the import at the top of `app/layout.tsx`:

```tsx
import DesktopSidebar from "@/components/layout/DesktopSidebar";
```

- [ ] **Step 2: Opt the calendar page into full width**

Replace the contents of `app/page.tsx`:

```tsx
import BookingCalendar from "@/components/booking-calendar";

export default function Home() {
	return (
		<div data-page="fullwidth" className="contents">
			<BookingCalendar />
		</div>
	);
}
```

> Note: `className="contents"` makes the wrapper layout-transparent so it doesn't affect existing mobile rendering. The `data-page` selector on the layout's `:has()` parent picks it up on `lg+` to drop `max-w-md`.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 4: Manual sanity check**

Run `npm run dev` and at viewport ≥1024px:
1. Sidebar appears on the left.
2. Calendar content sits next to it, full width (no centered 28rem column).
3. Toggle the chevron — sidebar collapses to 64px (icons only) and expands back. State persists after page reload.
4. Visit `/clients`, `/houses`, `/more` — those pages remain centered in `max-w-md` (since they don't carry `data-page="fullwidth"`).
5. At <1024px BottomNav still works, sidebar is hidden.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat(layout): mount desktop sidebar and add fullwidth opt-in"
```

---

## Task 6: Move all current `components/booking-calendar/*` files (except `index.tsx`) into `mobile/`

**Files:**
- Move 10 files (see File Plan) into `components/booking-calendar/mobile/`.
- Convert `components/booking-calendar/index.tsx` body into `components/booking-calendar/mobile/MobileBookingCalendar.tsx`.

- [ ] **Step 1: Create the mobile directory and move files**

```bash
mkdir -p components/booking-calendar/mobile
git mv components/booking-calendar/BookingCard.tsx components/booking-calendar/mobile/BookingCard.tsx
git mv components/booking-calendar/BookingEditForm.tsx components/booking-calendar/mobile/BookingEditForm.tsx
git mv components/booking-calendar/BookingModal.tsx components/booking-calendar/mobile/BookingModal.tsx
git mv components/booking-calendar/BookingView.tsx components/booking-calendar/mobile/BookingView.tsx
git mv components/booking-calendar/CalendarHeader.tsx components/booking-calendar/mobile/CalendarHeader.tsx
git mv components/booking-calendar/ClientPicker.tsx components/booking-calendar/mobile/ClientPicker.tsx
git mv components/booking-calendar/DaySlotHelpers.tsx components/booking-calendar/mobile/DaySlotHelpers.tsx
git mv components/booking-calendar/DayView.tsx components/booking-calendar/mobile/DayView.tsx
git mv components/booking-calendar/HousePicker.tsx components/booking-calendar/mobile/HousePicker.tsx
git mv components/booking-calendar/WeekView.tsx components/booking-calendar/mobile/WeekView.tsx
```

- [ ] **Step 2: Update relative imports inside the moved files**

Many moved files import siblings via `./Sibling`. Inside the new `mobile/` folder those paths are still `./Sibling`, so they continue to work — no edits needed there.

However, some moved files may import from other folders using `..` (e.g. `../clients/...`, `../houses/...`, `../ui/...`). After moving they would need `../../...`. Run:

```bash
grep -rn "from \"\\.\\./" components/booking-calendar/mobile/
```

For every result that starts with `from "../"` (not `"../../"`), prefix it with one more `../`. Use the Edit tool to do this per-file. Save your work after each edit.

Also check for imports from `./` that used to point at the now-moved `index.tsx` body — there shouldn't be any (index doesn't export named components).

- [ ] **Step 3: Create `mobile/MobileBookingCalendar.tsx`**

Open the current `components/booking-calendar/index.tsx` and copy its full body (the `BookingCalendar` component). Create `components/booking-calendar/mobile/MobileBookingCalendar.tsx` with this header comment, then the moved code:

```tsx
// Mobile booking calendar — week/day view with swipe gestures and pull-to-refresh.
"use client";
import { useCallback, useRef, useState } from "react";
import { Spinner } from "@/components/ui/data-state-container";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { useBookingData } from "@/hooks/useBookingData";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { bookingsApi, clientsApi, housesApi } from "@/lib/api";
import { toDateString } from "@/lib/dates";
import type { Booking, Client, House } from "@/types";
import ClientModal from "../../clients/ClientModal";
import HouseModal from "../../houses/HouseModal";
import BookingModal from "./BookingModal";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import WeekView from "./WeekView";

export default function MobileBookingCalendar() {
	// --- body identical to the current components/booking-calendar/index.tsx BookingCalendar() function body ---
	// Copy verbatim from the existing file. Note imports above already adjust for the new location.
}
```

Then paste the entire function body of the current `BookingCalendar` (everything inside `export default function BookingCalendar() { ... }`) into `MobileBookingCalendar`. Do not change logic.

Also note: `useBookingData` is still called with `weekStart` (a single arg). After Task 7 it changes signature; we'll update this call in Task 7.

- [ ] **Step 4: Make `components/booking-calendar/index.tsx` re-export `MobileBookingCalendar` (temporary)**

Replace `components/booking-calendar/index.tsx` with:

```tsx
// Temporary re-export — replaced in Task 17 by the breakpoint switcher.
export { default } from "./mobile/MobileBookingCalendar";
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
npm run lint
```
Expected: no errors. If there are import path errors, finish updating relative paths in Step 2.

- [ ] **Step 6: Manual sanity check**

Run `npm run dev`. The calendar (mobile view, viewport <1024px) must still work exactly as before. Verify: week view, day view, opening a booking modal, creating a booking, pull-to-refresh. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add components/booking-calendar/
git commit -m "refactor(booking-calendar): move mobile files into mobile/ subdir"
```

---

## Task 7: Refactor `useBookingData` to accept a date range; create shared `types.ts`

**Files:**
- Modify: `hooks/useBookingData.ts`
- Modify: `components/booking-calendar/mobile/MobileBookingCalendar.tsx`
- Create: `components/booking-calendar/shared/types.ts`

- [ ] **Step 1: Create the shared types file**

Write `components/booking-calendar/shared/types.ts`:

```ts
// Shared types for both mobile and desktop calendar variants.
export type CalendarRange = {
	rangeStart: Date;
	rangeEnd: Date; // inclusive
};
```

- [ ] **Step 2: Refactor `useBookingData` signature**

Replace `hooks/useBookingData.ts` with:

```ts
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMountedRef } from "@/hooks/useMountedRef";
import {
	bookingsApi,
	clientsApi,
	housesApi,
	servicesApi,
	usersApi,
} from "@/lib/api";
import { toDateString } from "@/lib/dates";
import type { Booking, Client, House, Service, User } from "@/types";

/**
 * Bookings + reference data for an arbitrary date range.
 * Pass the first and last (inclusive) calendar days to display.
 */
export function useBookingData(rangeStart: Date, rangeEnd: Date) {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [houses, setHouses] = useState<House[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(false);
	const mountedRef = useMountedRef();

	// biome-ignore lint/correctness/useExhaustiveDependencies: load once on mount
	useEffect(() => {
		housesApi
			.getHouses()
			.then((h) => {
				if (mountedRef.current) setHouses(h);
			})
			.catch((e) => console.error("Failed to load houses:", e));
		clientsApi
			.getClients()
			.then((c) => {
				if (mountedRef.current) setClients(c);
			})
			.catch((e) => console.error("Failed to load clients:", e));
		usersApi
			.getUsers()
			.then((u) => {
				if (mountedRef.current) setUsers(u);
			})
			.catch((e) => console.error("Failed to load users:", e));
		servicesApi
			.getServices()
			.then((s) => {
				if (mountedRef.current) setServices(s);
			})
			.catch((e) => console.error("Failed to load services:", e));
	}, []);

	const abortRef = useRef<AbortController | null>(null);

	const startStr = toDateString(rangeStart);
	// API "endDate" param is exclusive in the existing semantics — pass day-after-last to include rangeEnd.
	const endStr = toDateString(
		new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate() + 1),
	);

	const loadBookings = useCallback(async () => {
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setLoading(true);
		try {
			const data = await bookingsApi.getBookings(
				startStr,
				endStr,
				controller.signal,
			);
			setBookings(data);
		} catch (e) {
			if (
				(e as Error).name !== "AbortError" &&
				(e as Error).name !== "CanceledError"
			)
				console.error(e);
		} finally {
			if (!controller.signal.aborted) setLoading(false);
		}
	}, [startStr, endStr]);

	useEffect(() => {
		loadBookings();
	}, [loadBookings]);

	const refreshAll = useCallback(async () => {
		await Promise.all([
			housesApi.getHouses().then(setHouses),
			clientsApi.getClients().then(setClients),
			usersApi.getUsers().then(setUsers),
			servicesApi.getServices().then(setServices),
			loadBookings(),
		]);
	}, [loadBookings]);

	return {
		bookings,
		houses,
		setHouses,
		clients,
		setClients,
		users,
		services,
		loading,
		loadBookings,
		refreshAll,
	};
}
```

- [ ] **Step 3: Update `MobileBookingCalendar` to compute and pass the range**

In `components/booking-calendar/mobile/MobileBookingCalendar.tsx`:

Find:
```tsx
const nav = useCalendarNavigation();
const data = useBookingData(nav.weekStart);
```

Replace with:
```tsx
const nav = useCalendarNavigation();
// Mobile keeps the original 7-day window: rangeStart = weekStart, rangeEnd = weekStart+6.
const rangeEnd = new Date(nav.weekStart);
rangeEnd.setDate(rangeEnd.getDate() + 6);
const data = useBookingData(nav.weekStart, rangeEnd);
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 5: Manual check**

Run `npm run dev`, open the calendar at <1024px viewport. Week view, day view, navigation buttons, modal open/save — all behavior must remain identical.

- [ ] **Step 6: Commit**

```bash
git add hooks/useBookingData.ts components/booking-calendar/mobile/MobileBookingCalendar.tsx components/booking-calendar/shared/types.ts
git commit -m "refactor(booking-data): accept arbitrary date range"
```

---

## Task 8: Create `useBookingCalendarController` (shared CRUD/modal state)

**Files:**
- Create: `components/booking-calendar/shared/useBookingCalendarController.ts`

- [ ] **Step 1: Write the hook**

Write `components/booking-calendar/shared/useBookingCalendarController.ts`:

```ts
// Shared state and CRUD handlers for mobile and desktop calendar variants.
"use client";
import { useState } from "react";
import { useBookingData } from "@/hooks/useBookingData";
import { bookingsApi, clientsApi, housesApi } from "@/lib/api";
import type { Booking, Client, House } from "@/types";

export function useBookingCalendarController(
	rangeStart: Date,
	rangeEnd: Date,
) {
	const data = useBookingData(rangeStart, rangeEnd);

	const [modalBooking, setModalBooking] = useState<
		Booking | null | undefined
	>(undefined);
	const [clientModal, setClientModal] = useState<Client | null | undefined>(
		undefined,
	);
	const [houseModal, setHouseModal] = useState<House | null | undefined>(
		undefined,
	);
	const [modalDefaultDate, setModalDefaultDate] = useState("");
	const [modalDefaultEndDate, setModalDefaultEndDate] = useState("");
	const [preselectedClient, setPreselectedClient] = useState<Client | null>(
		null,
	);
	const [preselectedHouseId, setPreselectedHouseId] = useState("");

	async function handleSave(d: Omit<Booking, "id"> | Booking) {
		if ("id" in d) {
			const updated = await bookingsApi.updateBooking(d.id, d);
			setModalBooking((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			await bookingsApi.createBooking(d);
		}
		await data.loadBookings();
	}

	async function handleDelete(id: string) {
		await bookingsApi.deleteBooking(id);
		await data.loadBookings();
	}

	async function handleClientSave(
		d: Omit<Client, "id" | "totalBookings" | "createdAt"> | Client,
	) {
		if ("id" in d) {
			const updated = await clientsApi.updateClient(d.id, d);
			data.setClients((prev) =>
				prev.map((c) => (c.id === updated.id ? updated : c)),
			);
			setClientModal((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			const created = await clientsApi.createClient(d);
			data.setClients((prev) => [created, ...prev]);
			setPreselectedClient(created);
		}
	}

	async function handleHouseSave(d: Omit<House, "id"> | House) {
		if ("id" in d) {
			const updated = await housesApi.updateHouse(d.id, d);
			data.setHouses((prev) =>
				prev.map((h) => (h.id === updated.id ? updated : h)),
			);
			setHouseModal((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			const created = await housesApi.createHouse(d);
			data.setHouses((prev) => [...prev, created]);
			setPreselectedHouseId(created.id);
		}
	}

	async function handleHouseDelete(id: string) {
		await housesApi.deleteHouse(id);
		data.setHouses((prev) => prev.filter((h) => h.id !== id));
	}

	return {
		...data,
		modalBooking,
		setModalBooking,
		clientModal,
		setClientModal,
		houseModal,
		setHouseModal,
		modalDefaultDate,
		setModalDefaultDate,
		modalDefaultEndDate,
		setModalDefaultEndDate,
		preselectedClient,
		setPreselectedClient,
		preselectedHouseId,
		setPreselectedHouseId,
		handleSave,
		handleDelete,
		handleClientSave,
		handleHouseSave,
		handleHouseDelete,
	};
}
```

> Note: `modalDefaultEndDate` is new and used by desktop range-selection (Task 17). Mobile does not set it; mobile only sets `modalDefaultDate` for the empty-cell add. This task only introduces the field; the mobile path stays unchanged.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add components/booking-calendar/shared/useBookingCalendarController.ts
git commit -m "feat(booking-calendar): add shared CRUD/modal controller hook"
```

---

## Task 9: Refactor `MobileBookingCalendar` to use the shared controller

**Files:**
- Modify: `components/booking-calendar/mobile/MobileBookingCalendar.tsx`

- [ ] **Step 1: Replace state and handlers with the controller**

Open `components/booking-calendar/mobile/MobileBookingCalendar.tsx`. Replace the entire component body (keeping imports + adding `useBookingCalendarController` import) with:

```tsx
// Mobile booking calendar — week/day view with swipe gestures and pull-to-refresh.
"use client";
import { useCallback, useRef } from "react";
import { Spinner } from "@/components/ui/data-state-container";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { toDateString } from "@/lib/dates";
import type { Booking } from "@/types";
import ClientModal from "../../clients/ClientModal";
import HouseModal from "../../houses/HouseModal";
import { useBookingCalendarController } from "../shared/useBookingCalendarController";
import BookingModal from "./BookingModal";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import WeekView from "./WeekView";

export default function MobileBookingCalendar() {
	const nav = useCalendarNavigation();
	const rangeEnd = new Date(nav.weekStart);
	rangeEnd.setDate(rangeEnd.getDate() + 6);

	const c = useBookingCalendarController(nav.weekStart, rangeEnd);

	const containerRef = useRef<HTMLDivElement>(null);

	const handleRefresh = useCallback(async () => {
		c.setModalBooking(undefined);
		c.setClientModal(undefined);
		c.setHouseModal(undefined);
		await c.refreshAll();
	}, [c]);

	const { pullDistance, isRefreshing } = usePullToRefresh(
		handleRefresh,
		containerRef,
	);

	function handleAddBooking(date: Date) {
		c.setModalDefaultDate(toDateString(date));
		c.setModalBooking(null);
	}

	return (
		<div className="min-h-dvh bg-[var(--background)] flex flex-col">
			<CalendarHeader
				title={nav.title}
				mode={nav.mode}
				onPrevMonth={nav.prevMonth}
				onNextMonth={nav.nextMonth}
				onPrevPeriod={nav.prevPeriod}
				onNextPeriod={nav.nextPeriod}
				onToday={nav.goToToday}
				onToggleMode={nav.toggleMode}
				onCreateBooking={() => {
					c.setModalDefaultDate("");
					c.setModalBooking(null);
				}}
			/>

			<div
				ref={containerRef}
				className="flex-1 overflow-y-auto scroll-smooth"
				onTouchStart={nav.onTouchStart}
				onTouchEnd={nav.onTouchEnd}
			>
				<PullToRefreshIndicator
					pullDistance={pullDistance}
					isRefreshing={isRefreshing}
				/>
				{c.loading && !isRefreshing ? (
					<div className="flex items-center justify-center py-16">
						<Spinner />
					</div>
				) : nav.mode === "week" ? (
					<WeekView
						weekStart={nav.weekStart}
						bookings={c.bookings}
						onBookingClick={(b: Booking) => c.setModalBooking(b)}
						onAddBooking={handleAddBooking}
					/>
				) : (
					<DayView
						day={nav.focusDay}
						bookings={c.bookings}
						onBookingClick={(b: Booking) => c.setModalBooking(b)}
						onAddBooking={handleAddBooking}
					/>
				)}
			</div>

			{c.modalBooking !== undefined && (
				<BookingModal
					booking={c.modalBooking}
					houses={c.houses}
					clients={c.clients}
					users={c.users}
					services={c.services}
					defaultDate={c.modalDefaultDate}
					preselectedClient={c.preselectedClient}
					preselectedHouseId={c.preselectedHouseId}
					onClose={() => {
						c.setModalBooking(undefined);
						c.setModalDefaultDate("");
						c.setPreselectedClient(null);
						c.setPreselectedHouseId("");
					}}
					onSave={c.handleSave}
					onDelete={c.handleDelete}
					onOpenClient={(client) => c.setClientModal(client)}
					onCreateClient={() => c.setClientModal(null)}
					onOpenHouse={(house) => c.setHouseModal(house)}
					onCreateHouse={() => c.setHouseModal(null)}
				/>
			)}

			{c.clientModal !== undefined && (
				<ClientModal
					client={c.clientModal}
					onClose={() => c.setClientModal(undefined)}
					onSave={c.handleClientSave}
				/>
			)}

			{c.houseModal !== undefined && (
				<HouseModal
					house={c.houseModal}
					onClose={() => c.setHouseModal(undefined)}
					onSave={c.handleHouseSave}
					onDelete={c.handleHouseDelete}
				/>
			)}
		</div>
	);
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Manual check**

Run `npm run dev` at <1024px viewport. Walk through: open booking, edit booking, save → refresh; create booking; create client from booking; create house from booking; pull-to-refresh. All behavior must match pre-refactor mobile.

- [ ] **Step 4: Commit**

```bash
git add components/booking-calendar/mobile/MobileBookingCalendar.tsx
git commit -m "refactor(mobile-calendar): use shared controller hook"
```

---

## Task 10: Add `useChessboardDates` hook

**Files:**
- Create: `components/booking-calendar/desktop/useChessboardDates.ts`

- [ ] **Step 1: Write the hook**

Write `components/booking-calendar/desktop/useChessboardDates.ts`:

```ts
// Computes the 5-month chessboard window (prev month -> current + 3 months) and month grouping.
"use client";
import { useEffect, useMemo, useState } from "react";
import { toDateString } from "@/lib/dates";

export type MonthBand = {
	label: string;
	startIndex: number;
	span: number;
};

const RU_MONTHS_NOM = [
	"Январь",
	"Февраль",
	"Март",
	"Апрель",
	"Май",
	"Июнь",
	"Июль",
	"Август",
	"Сентябрь",
	"Октябрь",
	"Ноябрь",
	"Декабрь",
];

function todayLocal(): Date {
	const t = new Date();
	t.setHours(0, 0, 0, 0);
	return t;
}

function buildRange(anchor: Date): {
	rangeStart: Date;
	rangeEnd: Date;
	days: Date[];
	months: MonthBand[];
	todayIndex: number;
} {
	const rangeStart = new Date(
		anchor.getFullYear(),
		anchor.getMonth() - 1,
		1,
	);
	const rangeEnd = new Date(
		anchor.getFullYear(),
		anchor.getMonth() + 4,
		0, // last day of (anchor.month + 3)
	);

	const days: Date[] = [];
	const cursor = new Date(rangeStart);
	while (cursor <= rangeEnd) {
		days.push(new Date(cursor));
		cursor.setDate(cursor.getDate() + 1);
	}

	const months: MonthBand[] = [];
	let currentMonth = -1;
	let currentYear = -1;
	days.forEach((d, i) => {
		const m = d.getMonth();
		const y = d.getFullYear();
		if (m !== currentMonth || y !== currentYear) {
			months.push({
				label: `${RU_MONTHS_NOM[m]} ${y}`,
				startIndex: i,
				span: 1,
			});
			currentMonth = m;
			currentYear = y;
		} else {
			months[months.length - 1].span += 1;
		}
	});

	const anchorStr = toDateString(anchor);
	const todayIndex = days.findIndex((d) => toDateString(d) === anchorStr);

	return { rangeStart, rangeEnd, days, months, todayIndex };
}

export function useChessboardDates() {
	const [anchor, setAnchor] = useState<Date>(() => todayLocal());

	useEffect(() => {
		const onVisible = () => {
			const t = todayLocal();
			if (toDateString(t) !== toDateString(anchor)) {
				setAnchor(t);
			}
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => document.removeEventListener("visibilitychange", onVisible);
	}, [anchor]);

	return useMemo(() => buildRange(anchor), [anchor]);
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add components/booking-calendar/desktop/useChessboardDates.ts
git commit -m "feat(desktop-calendar): add useChessboardDates hook"
```

---

## Task 11: Add `bookingHelpers.ts` for index math

**Files:**
- Create: `components/booking-calendar/shared/bookingHelpers.ts`

- [ ] **Step 1: Write helpers**

Write `components/booking-calendar/shared/bookingHelpers.ts`:

```ts
// Pure helpers that map between booking dates and chessboard day indices.
import { toDateString } from "@/lib/dates";
import type { Booking } from "@/types";

/** Index of `date` within `days[]`, or -1 if not found. */
export function dateIndex(days: Date[], date: Date | string): number {
	const str = typeof date === "string" ? date : toDateString(date);
	for (let i = 0; i < days.length; i++) {
		if (toDateString(days[i]) === str) return i;
	}
	return -1;
}

/**
 * Compute booking bar position within the visible chessboard window.
 * Returns null if the booking does not overlap the window.
 * `clippedLeft`/`clippedRight` indicate the bar is truncated at that edge.
 */
export function bookingBarPosition(
	booking: Booking,
	days: Date[],
): {
	startIdx: number; // visible start (>=0)
	endIdx: number; // visible end exclusive (<= days.length)
	clippedLeft: boolean;
	clippedRight: boolean;
} | null {
	if (days.length === 0) return null;
	const firstStr = toDateString(days[0]);
	const lastStr = toDateString(days[days.length - 1]);
	// Booking occupies [checkIn, checkOut) as half-open day range (checkOut is free).
	if (booking.checkOut <= firstStr) return null;
	if (booking.checkIn > lastStr) return null;

	const clippedLeft = booking.checkIn < firstStr;
	const clippedRight = booking.checkOut > lastStr;

	const startIdx = clippedLeft ? 0 : dateIndex(days, booking.checkIn);
	// checkOut maps to "the day after the last occupied cell"; we want endIdx exclusive.
	const checkOutIdx = clippedRight ? days.length : dateIndex(days, booking.checkOut);
	const endIdx = checkOutIdx === -1 ? days.length : checkOutIdx;

	if (startIdx < 0 || endIdx <= startIdx) return null;

	return { startIdx, endIdx, clippedLeft, clippedRight };
}

/** True if any booking for this house overlaps the [fromIdx, toIdx) half-open window. */
export function rangeHasBookingConflict(
	bookings: Booking[],
	houseId: string,
	days: Date[],
	fromIdx: number,
	toIdx: number,
): boolean {
	for (const b of bookings) {
		if (b.houseId !== houseId) continue;
		if (b.status !== "active" && b.status !== "completed") continue;
		const pos = bookingBarPosition(b, days);
		if (!pos) continue;
		// Overlap of half-open intervals [a,b) and [c,d): a<d && c<b.
		if (pos.startIdx < toIdx && fromIdx < pos.endIdx) return true;
	}
	return false;
}

/** Format guests count with Russian plural form. */
export function formatGuests(n: number): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return `${n} гость`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
		return `${n} гостя`;
	return `${n} гостей`;
}

/** Format nights count with Russian plural form. */
export function formatNights(n: number): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return `${n} ночь`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
		return `${n} ночи`;
	return `${n} ночей`;
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add components/booking-calendar/shared/bookingHelpers.ts
git commit -m "feat(booking-calendar): add booking index/conflict/plural helpers"
```

---

## Task 12: Add `ChessboardDateRow`

**Files:**
- Create: `components/booking-calendar/desktop/ChessboardDateRow.tsx`

- [ ] **Step 1: Write component**

Write `components/booking-calendar/desktop/ChessboardDateRow.tsx`:

```tsx
// Sticky top header for the chessboard: month band + per-day cells with today/weekend highlighting.
"use client";
import { isToday, RU_DAYS } from "@/lib/dates";
import type { MonthBand } from "./useChessboardDates";

const CELL_WIDTH = 56;
const HOUSE_COL_WIDTH = 200;

type Props = {
	days: Date[];
	months: MonthBand[];
};

export default function ChessboardDateRow({ days, months }: Props) {
	return (
		<div
			className="flex flex-col bg-[var(--surface-elevated)] border-b border-[var(--border)]/70"
			style={{ width: HOUSE_COL_WIDTH + days.length * CELL_WIDTH }}
		>
			<div className="flex border-b border-[var(--border)]/40">
				<div
					className="sticky left-0 z-10 bg-[var(--surface-elevated)] border-r border-[var(--border)]/70"
					style={{ width: HOUSE_COL_WIDTH, height: 28 }}
				/>
				{months.map((m) => (
					<div
						key={`${m.label}-${m.startIndex}`}
						className="flex items-center justify-center text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide"
						style={{ width: m.span * CELL_WIDTH, height: 28 }}
					>
						{m.label}
					</div>
				))}
			</div>
			<div className="flex">
				<div
					className="sticky left-0 z-10 bg-[var(--surface-elevated)] border-r border-[var(--border)]/70"
					style={{ width: HOUSE_COL_WIDTH, height: 36 }}
				/>
				{days.map((d) => {
					const dow = d.getDay();
					const weekend = dow === 0 || dow === 6;
					const today = isToday(d);
					return (
						<div
							key={d.toISOString()}
							className={`flex flex-col items-center justify-center border-r border-[var(--border)]/40 ${
								today
									? "bg-[var(--accent-light)] text-[var(--accent)] font-bold"
									: weekend
										? "bg-[var(--surface-muted)]/50 text-[var(--foreground)]"
										: "text-[var(--foreground)]"
							}`}
							style={{ width: CELL_WIDTH, height: 36 }}
						>
							<span className="text-sm leading-none">{d.getDate()}</span>
							<span className="text-[10px] leading-none text-[var(--muted-foreground)] mt-0.5">
								{RU_DAYS[dow].toLowerCase()}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add components/booking-calendar/desktop/ChessboardDateRow.tsx
git commit -m "feat(desktop-calendar): add ChessboardDateRow"
```

---

## Task 13: Add `ChessboardCell` and `ChessboardGrid`

**Files:**
- Create: `components/booking-calendar/desktop/ChessboardCell.tsx`
- Create: `components/booking-calendar/desktop/ChessboardGrid.tsx`

- [ ] **Step 1: Write `ChessboardCell`**

Write `components/booking-calendar/desktop/ChessboardCell.tsx`:

```tsx
// Background day cell in a chessboard row — border + weekend tint. No event handlers (delegated to row).
"use client";
import { isToday } from "@/lib/dates";

const CELL_WIDTH = 56;

type Props = {
	day: Date;
	rowHeight: number;
};

export default function ChessboardCell({ day, rowHeight }: Props) {
	const dow = day.getDay();
	const weekend = dow === 0 || dow === 6;
	const today = isToday(day);
	return (
		<div
			className={`shrink-0 border-r border-[var(--border)]/40 ${
				today
					? "bg-[var(--accent-light)]/30"
					: weekend
						? "bg-[var(--surface-muted)]/40"
						: ""
			}`}
			style={{ width: CELL_WIDTH, height: rowHeight }}
		/>
	);
}
```

- [ ] **Step 2: Write `ChessboardGrid` (skeleton; rows wired in Task 14)**

Write `components/booking-calendar/desktop/ChessboardGrid.tsx`:

```tsx
// Scrollable wrapper that hosts the sticky date row and the house rows.
"use client";
import { forwardRef, type ReactNode } from "react";
import type { MonthBand } from "./useChessboardDates";
import ChessboardDateRow from "./ChessboardDateRow";

const CELL_WIDTH = 56;
const HOUSE_COL_WIDTH = 200;

type Props = {
	days: Date[];
	months: MonthBand[];
	children: ReactNode;
};

const ChessboardGrid = forwardRef<HTMLDivElement, Props>(function ChessboardGrid(
	{ days, months, children },
	ref,
) {
	return (
		<div
			ref={ref}
			className="relative overflow-auto border border-[var(--border)]/70 rounded-md bg-[var(--background)]"
		>
			<div
				style={{ width: HOUSE_COL_WIDTH + days.length * CELL_WIDTH }}
			>
				<div className="sticky top-0 z-20">
					<ChessboardDateRow days={days} months={months} />
				</div>
				{children}
			</div>
		</div>
	);
});

export default ChessboardGrid;
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add components/booking-calendar/desktop/ChessboardCell.tsx components/booking-calendar/desktop/ChessboardGrid.tsx
git commit -m "feat(desktop-calendar): add ChessboardCell and ChessboardGrid skeleton"
```

---

## Task 14: Add `BookingBar` and `ChessboardRow`

**Files:**
- Create: `components/booking-calendar/desktop/BookingBar.tsx`
- Create: `components/booking-calendar/desktop/ChessboardRow.tsx`

- [ ] **Step 1: Write `BookingBar`**

Write `components/booking-calendar/desktop/BookingBar.tsx`:

```tsx
// Horizontal booking bar inside a chessboard row.
"use client";
import type { Booking } from "@/types";
import { formatGuests } from "../shared/bookingHelpers";

const CELL_WIDTH = 56;
const BAR_INSET = 2;

const STATUS_BG: Record<Booking["status"], string> = {
	active: "bg-[var(--accent)] text-white",
	completed: "bg-stone-400 text-white",
};

type Props = {
	booking: Booking;
	startIdx: number;
	endIdx: number; // exclusive
	clippedLeft: boolean;
	clippedRight: boolean;
	rowHeight: number;
	onClick: (booking: Booking, anchor: HTMLElement) => void;
};

export default function BookingBar({
	booking,
	startIdx,
	endIdx,
	clippedLeft,
	clippedRight,
	rowHeight,
	onClick,
}: Props) {
	const left = startIdx * CELL_WIDTH + BAR_INSET;
	const width = (endIdx - startIdx) * CELL_WIDTH - BAR_INSET * 2;
	const radius = `${clippedLeft ? "0" : "6px"} ${clippedRight ? "0" : "6px"} ${
		clippedRight ? "0" : "6px"
	} ${clippedLeft ? "0" : "6px"}`;
	const fullName = `${booking.clientLastName} ${booking.clientFirstName}`.trim();

	return (
		<button
			type="button"
			onClick={(e) => onClick(booking, e.currentTarget)}
			className={`absolute flex flex-col items-start justify-center px-2 py-0.5 text-left shadow-sm hover:brightness-105 transition-[filter] cursor-pointer ${STATUS_BG[booking.status]}`}
			style={{
				left,
				width,
				top: 4,
				height: rowHeight - 8,
				borderRadius: radius,
			}}
		>
			<span className="truncate w-full text-[10px] leading-tight font-semibold">
				{fullName || "Без имени"}
			</span>
			<span className="truncate w-full text-[10px] leading-tight opacity-90">
				{booking.clientPhone}
			</span>
			<span className="truncate w-full text-[10px] leading-tight opacity-90">
				{formatGuests(booking.guestsCount)}
			</span>
		</button>
	);
}
```

- [ ] **Step 2: Write `ChessboardRow`**

Write `components/booking-calendar/desktop/ChessboardRow.tsx`:

```tsx
// One house row — background cells, range-selection overlay, and absolutely-positioned booking bars.
"use client";
import { useCallback, useRef } from "react";
import type { Booking, House } from "@/types";
import { bookingBarPosition } from "../shared/bookingHelpers";
import BookingBar from "./BookingBar";
import ChessboardCell from "./ChessboardCell";

const CELL_WIDTH = 56;
const ROW_HEIGHT = 56;
const HOUSE_COL_WIDTH = 200;

export type RangeSelectionState =
	| { phase: "idle" }
	| {
			phase: "picking-end";
			houseId: string;
			anchorIndex: number;
			hoverIndex: number;
			conflict: boolean;
		};

type Props = {
	house: House;
	days: Date[];
	bookings: Booking[];
	selection: RangeSelectionState;
	onCellHover: (houseId: string, idx: number) => void;
	onCellClick: (houseId: string, idx: number) => void;
	onBookingClick: (booking: Booking, anchor: HTMLElement) => void;
};

export default function ChessboardRow({
	house,
	days,
	bookings,
	selection,
	onCellHover,
	onCellClick,
	onBookingClick,
}: Props) {
	const cellsRef = useRef<HTMLDivElement>(null);

	const indexFromEvent = useCallback(
		(clientX: number) => {
			const el = cellsRef.current;
			if (!el) return -1;
			const rect = el.getBoundingClientRect();
			const x = clientX - rect.left;
			if (x < 0 || x >= rect.width) return -1;
			return Math.floor(x / CELL_WIDTH);
		},
		[],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const idx = indexFromEvent(e.clientX);
			if (idx >= 0) onCellHover(house.id, idx);
		},
		[house.id, indexFromEvent, onCellHover],
	);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			// Ignore clicks landing on a BookingBar (it stops propagation via its own onClick path).
			if ((e.target as HTMLElement).closest("[data-booking-bar]")) return;
			const idx = indexFromEvent(e.clientX);
			if (idx >= 0) onCellClick(house.id, idx);
		},
		[house.id, indexFromEvent, onCellClick],
	);

	const isSelectedRow =
		selection.phase === "picking-end" && selection.houseId === house.id;
	let overlayLeft = 0;
	let overlayWidth = 0;
	let overlayConflict = false;
	if (isSelectedRow) {
		const from = Math.min(selection.anchorIndex, selection.hoverIndex);
		const to = Math.max(selection.anchorIndex, selection.hoverIndex);
		overlayLeft = from * CELL_WIDTH;
		overlayWidth = (to - from + 1) * CELL_WIDTH;
		overlayConflict = selection.conflict;
	}

	return (
		<div className="flex border-b border-[var(--border)]/40">
			<div
				className="sticky left-0 z-10 flex items-center px-3 bg-[var(--surface-elevated)] border-r border-[var(--border)]/70"
				style={{ width: HOUSE_COL_WIDTH, height: ROW_HEIGHT }}
			>
				<div className="flex flex-col min-w-0">
					<span className="truncate text-sm font-semibold text-[var(--foreground)]">
						{house.name}
					</span>
					<span className="truncate text-[10px] text-[var(--muted-foreground)]">
						{house.capacity} мест · {house.basePrice} ₽
					</span>
				</div>
			</div>
			<div
				ref={cellsRef}
				className={`relative shrink-0 ${
					overlayConflict ? "cursor-not-allowed" : ""
				}`}
				style={{ width: days.length * CELL_WIDTH, height: ROW_HEIGHT }}
				onMouseMove={handleMouseMove}
				onClick={handleClick}
			>
				{days.map((d) => (
					<div key={d.toISOString()} className="inline-block align-top">
						<ChessboardCell day={d} rowHeight={ROW_HEIGHT} />
					</div>
				))}
				{isSelectedRow && (
					<div
						className={`pointer-events-none absolute top-0 bottom-0 ${
							overlayConflict
								? "bg-[var(--danger-light)]/70"
								: "bg-[var(--accent-light)]/60"
						}`}
						style={{ left: overlayLeft, width: overlayWidth }}
					/>
				)}
				{bookings
					.filter((b) => b.houseId === house.id)
					.map((b) => {
						const pos = bookingBarPosition(b, days);
						if (!pos) return null;
						return (
							<div key={b.id} data-booking-bar>
								<BookingBar
									booking={b}
									startIdx={pos.startIdx}
									endIdx={pos.endIdx}
									clippedLeft={pos.clippedLeft}
									clippedRight={pos.clippedRight}
									rowHeight={ROW_HEIGHT}
									onClick={onBookingClick}
								/>
							</div>
						);
					})}
			</div>
		</div>
	);
}
```

> Note about the cell layout: cells need to lay out in a horizontal row. The `inline-block` + `align-top` on each cell wrapper achieves this without an extra flex container that would clash with the absolute children. Bar widths and positions are computed in pixels off the same `CELL_WIDTH`, so they align with cells regardless.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add components/booking-calendar/desktop/BookingBar.tsx components/booking-calendar/desktop/ChessboardRow.tsx
git commit -m "feat(desktop-calendar): add BookingBar and ChessboardRow"
```

---

## Task 15: Add `useRangeSelection` hook

**Files:**
- Create: `components/booking-calendar/desktop/useRangeSelection.ts`

- [ ] **Step 1: Write the hook**

Write `components/booking-calendar/desktop/useRangeSelection.ts`:

```ts
// Two-click range selection for empty cells in a chessboard row.
"use client";
import { useCallback, useEffect, useState } from "react";
import type { Booking } from "@/types";
import { rangeHasBookingConflict } from "../shared/bookingHelpers";
import type { RangeSelectionState } from "./ChessboardRow";

export function useRangeSelection(
	bookings: Booking[],
	days: Date[],
	onConfirm: (houseId: string, fromIdx: number, toIdx: number) => void,
) {
	const [selection, setSelection] = useState<RangeSelectionState>({
		phase: "idle",
	});

	const onCellHover = useCallback(
		(houseId: string, idx: number) => {
			setSelection((prev) => {
				if (prev.phase !== "picking-end") return prev;
				if (prev.houseId !== houseId) return prev;
				if (prev.hoverIndex === idx) return prev;
				const from = Math.min(prev.anchorIndex, idx);
				const to = Math.max(prev.anchorIndex, idx);
				// Selection covers [from, to] inclusive (visual); for conflict we use half-open [from, to+1)
				// because a one-night booking occupies a single cell (checkout = next day, free).
				const conflict = rangeHasBookingConflict(
					bookings,
					houseId,
					days,
					from,
					to + 1,
				);
				return { ...prev, hoverIndex: idx, conflict };
			});
		},
		[bookings, days],
	);

	const onCellClick = useCallback(
		(houseId: string, idx: number) => {
			setSelection((prev) => {
				if (prev.phase === "idle") {
					const conflict = rangeHasBookingConflict(
						bookings,
						houseId,
						days,
						idx,
						idx + 1,
					);
					return {
						phase: "picking-end",
						houseId,
						anchorIndex: idx,
						hoverIndex: idx,
						conflict,
					};
				}
				if (prev.houseId !== houseId) {
					return { phase: "idle" };
				}
				const from = Math.min(prev.anchorIndex, idx);
				const to = Math.max(prev.anchorIndex, idx);
				const conflict = rangeHasBookingConflict(
					bookings,
					houseId,
					days,
					from,
					to + 1,
				);
				if (conflict) return prev; // ignore second click
				onConfirm(houseId, from, to);
				return { phase: "idle" };
			});
		},
		[bookings, days, onConfirm],
	);

	const reset = useCallback(
		() => setSelection({ phase: "idle" }),
		[],
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") reset();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [reset]);

	return { selection, onCellHover, onCellClick, reset };
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add components/booking-calendar/desktop/useRangeSelection.ts
git commit -m "feat(desktop-calendar): add useRangeSelection hook"
```

---

## Task 16: Add `BookingPreviewPopover`

**Files:**
- Create: `components/booking-calendar/desktop/BookingPreviewPopover.tsx`

- [ ] **Step 1: Write the component**

Write `components/booking-calendar/desktop/BookingPreviewPopover.tsx`:

```tsx
// Desktop-only quick preview popover shown on booking-bar click.
"use client";
import {
	CalendarBlankIcon,
	PencilSimpleIcon,
	PhoneIcon,
	TrashIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import ConfirmDeleteDialog from "@/components/ui/confirm-delete-dialog";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import { RU_MONTHS_SHORT } from "@/lib/dates";
import type { Booking } from "@/types";
import { formatGuests, formatNights } from "../shared/bookingHelpers";

function formatDay(iso: string): string {
	const d = new Date(`${iso}T00:00:00`);
	return `${d.getDate()} ${RU_MONTHS_SHORT[d.getMonth()]}`;
}

function nightsBetween(checkIn: string, checkOut: string): number {
	const a = new Date(`${checkIn}T00:00:00`).getTime();
	const b = new Date(`${checkOut}T00:00:00`).getTime();
	return Math.max(1, Math.round((b - a) / 86400000));
}

type Props = {
	booking: Booking | null;
	anchor: HTMLElement | null;
	onClose: () => void;
	onEdit: (booking: Booking) => void;
	onDelete: (id: string) => Promise<void>;
};

export default function BookingPreviewPopover({
	booking,
	anchor,
	onClose,
	onEdit,
	onDelete,
}: Props) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

	if (!booking || !anchor) return null;

	const fullName =
		`${booking.clientLastName} ${booking.clientFirstName}`.trim() ||
		"Без имени";
	const nights = nightsBetween(booking.checkIn, booking.checkOut);

	return (
		<>
			<Popover open onOpenChange={(o) => !o && onClose()}>
				<PopoverAnchor virtualRef={{ current: anchor }} />
				<PopoverContent
					side="bottom"
					align="start"
					sideOffset={6}
					className="w-80 p-4"
				>
					<div className="flex items-start justify-between gap-2 mb-2">
						<div className="min-w-0">
							<div className="font-bold text-sm truncate">{fullName}</div>
							<div className="text-xs text-[var(--muted-foreground)] truncate">
								{booking.houseName}
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							aria-label="Закрыть"
							className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
						>
							<XIcon size={18} />
						</button>
					</div>
					<div className="h-px bg-[var(--border)]/60 mb-3" />
					<ul className="flex flex-col gap-2 text-sm">
						<li className="flex items-center gap-2">
							<CalendarBlankIcon size={16} className="text-[var(--muted-foreground)]" />
							<span>
								{formatDay(booking.checkIn)} — {formatDay(booking.checkOut)} (
								{formatNights(nights)})
							</span>
						</li>
						<li className="flex items-center gap-2">
							<PhoneIcon size={16} className="text-[var(--muted-foreground)]" />
							<span>{booking.clientPhone || "—"}</span>
						</li>
						<li className="flex items-center gap-2">
							<UsersIcon size={16} className="text-[var(--muted-foreground)]" />
							<span>{formatGuests(booking.guestsCount)}</span>
						</li>
						<li>
							<Badge variant={booking.status === "active" ? "active" : "completed"}>
								{booking.status === "active" ? "Активно" : "Завершено"}
							</Badge>
						</li>
					</ul>
					<div className="flex items-center gap-2 mt-4">
						<button
							type="button"
							onClick={() => onEdit(booking)}
							className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-[var(--accent)] text-white text-sm font-semibold hover:brightness-105"
						>
							<PencilSimpleIcon size={16} weight="bold" />
							Редактировать
						</button>
						<button
							type="button"
							onClick={() => setConfirmOpen(true)}
							className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-[var(--danger-light)] text-[var(--danger)] text-sm font-semibold hover:brightness-95"
						>
							<TrashIcon size={16} weight="bold" />
							Удалить
						</button>
					</div>
				</PopoverContent>
			</Popover>
			<ConfirmDeleteDialog
				open={confirmOpen}
				message="Удалить бронирование?"
				loading={deleting}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={async () => {
					setDeleting(true);
					try {
						await onDelete(booking.id);
						setConfirmOpen(false);
						onClose();
					} finally {
						setDeleting(false);
					}
				}}
			/>
		</>
	);
}
```

> Note on `PopoverAnchor`: Radix accepts a `virtualRef` to anchor the popover at any DOM element. If the local Radix version doesn't support `virtualRef`, fall back to wrapping `BookingBar` with `<PopoverTrigger asChild>`. The version of `@radix-ui/react-popover` in this project supports `Anchor`. If `virtualRef` errors, switch to passing `anchor` element through a `useState` `<PopoverAnchor>` child div positioned at the same DOM location — but try `virtualRef` first and only adjust if TypeScript or runtime complains.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run lint
```

If `virtualRef` is not supported by the installed Radix version, replace the `<PopoverAnchor virtualRef={...} />` with this alternative: render an invisible 0×0 div at the anchor's `getBoundingClientRect()` position inside a `Popover` and use that as the anchor. Keep the same outer API (`booking`, `anchor`) so callers don't change.

- [ ] **Step 3: Commit**

```bash
git add components/booking-calendar/desktop/BookingPreviewPopover.tsx
git commit -m "feat(desktop-calendar): add BookingPreviewPopover"
```

---

## Task 17: Add `ChessboardHeader`, `DesktopBookingCalendar`, and wire the breakpoint switcher

**Files:**
- Create: `components/booking-calendar/desktop/ChessboardHeader.tsx`
- Create: `components/booking-calendar/desktop/DesktopBookingCalendar.tsx`
- Modify: `components/booking-calendar/index.tsx`

- [ ] **Step 1: Write `ChessboardHeader`**

Write `components/booking-calendar/desktop/ChessboardHeader.tsx`:

```tsx
// Top action bar for the desktop chessboard: month nav, today, create-booking.
"use client";
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";

type Props = {
	onPrevMonth: () => void;
	onNextMonth: () => void;
	onToday: () => void;
	onCreate: () => void;
};

export default function ChessboardHeader({
	onPrevMonth,
	onNextMonth,
	onToday,
	onCreate,
}: Props) {
	return (
		<div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]/70 bg-[var(--surface-elevated)]">
			<h1 className="text-lg font-bold text-[var(--foreground)] mr-auto">
				Календарь
			</h1>
			<button
				type="button"
				onClick={onPrevMonth}
				className="inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
				aria-label="Предыдущий месяц"
			>
				<CaretLeftIcon size={18} weight="bold" />
			</button>
			<button
				type="button"
				onClick={onToday}
				className="h-9 px-3 rounded-md bg-[var(--accent-light)] text-[var(--accent)] text-sm font-semibold hover:brightness-105"
			>
				Сегодня
			</button>
			<button
				type="button"
				onClick={onNextMonth}
				className="inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
				aria-label="Следующий месяц"
			>
				<CaretRightIcon size={18} weight="bold" />
			</button>
			<button
				type="button"
				onClick={onCreate}
				className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[var(--accent)] text-white text-sm font-semibold hover:brightness-105"
			>
				<PlusIcon size={16} weight="bold" />
				Новая бронь
			</button>
		</div>
	);
}
```

- [ ] **Step 2: Write `DesktopBookingCalendar`**

Write `components/booking-calendar/desktop/DesktopBookingCalendar.tsx`:

```tsx
// Desktop chessboard calendar — rows = houses, columns = days, sticky top + sticky left.
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/data-state-container";
import ClientModal from "../../clients/ClientModal";
import HouseModal from "../../houses/HouseModal";
import BookingModal from "../mobile/BookingModal";
import { useBookingCalendarController } from "../shared/useBookingCalendarController";
import { toDateString } from "@/lib/dates";
import type { Booking } from "@/types";
import BookingPreviewPopover from "./BookingPreviewPopover";
import ChessboardGrid from "./ChessboardGrid";
import ChessboardHeader from "./ChessboardHeader";
import ChessboardRow from "./ChessboardRow";
import { useChessboardDates } from "./useChessboardDates";
import { useRangeSelection } from "./useRangeSelection";

const CELL_WIDTH = 56;
const HOUSE_COL_WIDTH = 200;

export default function DesktopBookingCalendar() {
	const { rangeStart, rangeEnd, days, months, todayIndex } =
		useChessboardDates();

	const c = useBookingCalendarController(rangeStart, rangeEnd);

	const scrollRef = useRef<HTMLDivElement>(null);
	const didInitialScroll = useRef(false);

	const scrollToIndex = useCallback((idx: number, offsetFromLeft = 120) => {
		const el = scrollRef.current;
		if (!el || idx < 0) return;
		el.scrollTo({
			left: idx * CELL_WIDTH - offsetFromLeft,
			behavior: "smooth",
		});
	}, []);

	useEffect(() => {
		if (didInitialScroll.current) return;
		if (todayIndex >= 0 && scrollRef.current) {
			scrollRef.current.scrollLeft = todayIndex * CELL_WIDTH - 120;
			didInitialScroll.current = true;
		}
	}, [todayIndex]);

	const handlePrevMonth = () => {
		const el = scrollRef.current;
		if (!el) return;
		const approx = 30 * CELL_WIDTH;
		el.scrollTo({ left: Math.max(0, el.scrollLeft - approx), behavior: "smooth" });
	};
	const handleNextMonth = () => {
		const el = scrollRef.current;
		if (!el) return;
		const approx = 30 * CELL_WIDTH;
		el.scrollTo({ left: el.scrollLeft + approx, behavior: "smooth" });
	};
	const handleToday = () => scrollToIndex(todayIndex);

	const [preview, setPreview] = useState<{
		booking: Booking;
		anchor: HTMLElement;
	} | null>(null);

	const handleConfirmRange = useCallback(
		(houseId: string, fromIdx: number, toIdx: number) => {
			// fromIdx == toIdx → one-night booking: checkOut = next day.
			const dateFrom = toDateString(days[fromIdx]);
			const dateTo = toDateString(days[Math.min(toIdx + 1, days.length - 1)]);
			c.setModalDefaultDate(dateFrom);
			c.setModalDefaultEndDate(dateTo);
			c.setPreselectedHouseId(houseId);
			c.setModalBooking(null);
		},
		[c, days],
	);

	const { selection, onCellHover, onCellClick, reset } = useRangeSelection(
		c.bookings,
		days,
		handleConfirmRange,
	);

	useEffect(() => {
		const onScroll = () => reset();
		const el = scrollRef.current;
		el?.addEventListener("scroll", onScroll);
		return () => el?.removeEventListener("scroll", onScroll);
	}, [reset]);

	const activeHouses = c.houses.filter((h) => h.isActive);

	return (
		<div className="flex flex-col h-dvh bg-[var(--background)]">
			<ChessboardHeader
				onPrevMonth={handlePrevMonth}
				onNextMonth={handleNextMonth}
				onToday={handleToday}
				onCreate={() => {
					c.setModalDefaultDate("");
					c.setModalDefaultEndDate("");
					c.setPreselectedHouseId("");
					c.setModalBooking(null);
				}}
			/>
			<div className="flex-1 min-h-0 p-3">
				{c.loading && c.bookings.length === 0 ? (
					<div className="flex items-center justify-center py-16">
						<Spinner />
					</div>
				) : activeHouses.length === 0 ? (
					<div className="flex items-center justify-center py-16 text-[var(--muted-foreground)]">
						Нет домов. Создайте дом в разделе «Дома».
					</div>
				) : (
					<ChessboardGrid ref={scrollRef} days={days} months={months}>
						{activeHouses.map((house) => (
							<ChessboardRow
								key={house.id}
								house={house}
								days={days}
								bookings={c.bookings}
								selection={selection}
								onCellHover={onCellHover}
								onCellClick={onCellClick}
								onBookingClick={(b, anchor) => setPreview({ booking: b, anchor })}
							/>
						))}
					</ChessboardGrid>
				)}
			</div>

			<BookingPreviewPopover
				booking={preview?.booking ?? null}
				anchor={preview?.anchor ?? null}
				onClose={() => setPreview(null)}
				onEdit={(b) => {
					setPreview(null);
					c.setModalBooking(b);
				}}
				onDelete={c.handleDelete}
			/>

			{c.modalBooking !== undefined && (
				<BookingModal
					booking={c.modalBooking}
					houses={c.houses}
					clients={c.clients}
					users={c.users}
					services={c.services}
					defaultDate={c.modalDefaultDate}
					preselectedClient={c.preselectedClient}
					preselectedHouseId={c.preselectedHouseId}
					onClose={() => {
						c.setModalBooking(undefined);
						c.setModalDefaultDate("");
						c.setModalDefaultEndDate("");
						c.setPreselectedClient(null);
						c.setPreselectedHouseId("");
					}}
					onSave={c.handleSave}
					onDelete={c.handleDelete}
					onOpenClient={(client) => c.setClientModal(client)}
					onCreateClient={() => c.setClientModal(null)}
					onOpenHouse={(house) => c.setHouseModal(house)}
					onCreateHouse={() => c.setHouseModal(null)}
				/>
			)}

			{c.clientModal !== undefined && (
				<ClientModal
					client={c.clientModal}
					onClose={() => c.setClientModal(undefined)}
					onSave={c.handleClientSave}
				/>
			)}

			{c.houseModal !== undefined && (
				<HouseModal
					house={c.houseModal}
					onClose={() => c.setHouseModal(undefined)}
					onSave={c.handleHouseSave}
					onDelete={c.handleHouseDelete}
				/>
			)}
		</div>
	);
}
```

> Note: `BookingModal` only consumes `defaultDate`. It does not currently accept `defaultEndDate`. The desktop range-confirm sets `modalDefaultEndDate` in the controller, but until `BookingModal` is extended to read it, only the start date pre-fills the modal. **Extending `BookingModal` to accept `defaultEndDate` is out of scope for this plan** (would require changes inside the mobile booking modal that touch all consumers); we accept the current limitation as a follow-up. The mobile experience is unaffected.

- [ ] **Step 3: Wire breakpoint switcher**

Replace `components/booking-calendar/index.tsx` with:

```tsx
// Switches between mobile and desktop calendar implementations based on viewport width.
"use client";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import DesktopBookingCalendar from "./desktop/DesktopBookingCalendar";
import MobileBookingCalendar from "./mobile/MobileBookingCalendar";

export default function BookingCalendar() {
	const bp = useBreakpoint();
	if (bp === "desktop") return <DesktopBookingCalendar />;
	return <MobileBookingCalendar />;
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 5: Manual smoke test**

Run `npm run dev`. At viewport ≥1024px on `/`:

1. Sidebar present on left; chessboard occupies the rest of the viewport.
2. Date header sticks to the top of the grid; house column sticks to the left during horizontal scroll.
3. The grid is initially scrolled so today is visible (~120px from the left of the data area).
4. Today's column is accent-tinted; weekends have a light tint.
5. Existing bookings appear as colored bars showing ФИО / phone / N гостей.
6. Click a booking bar — popover opens with date range, phone, guests, status; "Редактировать" opens the modal with that booking; "Удалить" opens the confirm dialog and deletes on confirm; popover closes.
7. Click an empty cell on a row — that cell highlights and the highlight follows mouse along the same row. Click a second cell — `BookingModal` opens in create mode with the start date pre-filled and the house pre-selected. (End date won't pre-fill — see note in Step 2.)
8. If the dragged-out range covers an existing booking, the overlay turns red and the second click is ignored.
9. Press Esc — selection clears.
10. Click "Сегодня" — grid smooth-scrolls back to today. Click "← / →" — grid scrolls one month worth of cells.
11. Switch to viewport <1024px — mobile calendar must work as before.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add components/booking-calendar/desktop/ChessboardHeader.tsx components/booking-calendar/desktop/DesktopBookingCalendar.tsx components/booking-calendar/index.tsx
git commit -m "feat(desktop-calendar): wire chessboard view with breakpoint switcher"
```

---

## Task 18: Format, final lint, and finish

**Files:** None (verification only).

- [ ] **Step 1: Run formatter**

```bash
npm run format
```

If formatter modifies files, stage and commit them:

```bash
git add -A
git commit -m "style: biome format"
```

- [ ] **Step 2: Final lint + type-check**

```bash
npm run lint
npx tsc --noEmit
```

Expected: no errors. If issues remain, fix them and commit per-fix.

- [ ] **Step 3: End-to-end manual walkthrough**

Run `npm run dev` and verify both layouts one more time:

**Desktop (≥1024px):**
- Sidebar collapse/expand persists across reloads.
- Active nav highlight on `/`, `/clients`, `/houses`, `/more`.
- Chessboard renders. Today visible on initial load. Sticky row/col work during scroll.
- Booking bar click → preview popover → edit / delete.
- Empty-cell selection → modal create with house preselected.
- Conflict detection works (range over an existing booking is blocked).

**Mobile (<1024px):**
- BottomNav visible. Sidebar hidden.
- Week and day views, swipe gestures, modals, pull-to-refresh — all behave as before.

Stop the dev server.

---

## Self-Review Notes

The following spec requirements are covered by tasks:

- §3 breakpoint → Task 1.
- §4.1–4.3 global layout/sidebar/nav-items → Tasks 2, 3, 4, 5.
- §5 calendar split → Tasks 6, 7, 8, 9, 17.
- §6 chessboard data/range → Tasks 10, 17.
- §7 chessboard visual structure → Tasks 11–14, 17.
- §8 range selection → Task 15, integrated in Task 17.
- §9 preview popover → Task 16, integrated in Task 17.
- §10 data model touchpoints → covered by Task 7 (range refactor); no `bookingsApi` change required.
- §11 edge cases — active-only houses (Task 17), clipped bars (Task 11/14), today drift (Task 10), no-houses empty state (Task 17), SSR mobile-default (Task 17 via `useBreakpoint`).
- §13 header comments — every new file starts with a one-line `// …` comment as instructed.

Known limitation (acknowledged in plan): the existing `BookingModal` does not accept `defaultEndDate`, so range-confirm only pre-fills the start date. The controller stores both for a future modal extension.
