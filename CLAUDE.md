# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm run start      # Production server
npm run lint       # Biome check (lint, `biome check .`)
npm run format     # Biome format (auto-fix, `biome format --write`)
npm run generate:icons  # Regenerate PWA icons (scripts/generate-icons.mjs)
```

No test suite is configured in this project.

## Architecture

**Next.js 16 App Router** application for managing a glamping rental property ("Korotkovo Village"). **Adaptive layout**, mobile-first by default: below `lg` (1024px) it's a phone UI (`max-w-md` container, `BottomNav`, swipe gestures); at `lg+` it's a desktop UI (`DesktopSidebar`, wider containers, distinct components).

### Adaptive / Responsive Architecture

- The `lg` (≥1024px) breakpoint is the mobile/desktop divide everywhere.
- `app/layout.tsx` renders both chromes: `DesktopSidebar` (`lg:flex` row) + `main`, with `BottomNav` shown only below `lg` (it hides itself on `lg`). `NAV_ITEMS` in `components/layout/nav-items.ts` is the single source of nav truth shared by `BottomNav` and `DesktopSidebar` (href, label, `permission: RolePermission | null`, icon).
- **Prefer CSS-based branching** (`lg:hidden` / `hidden lg:block`) over JS so SSR/hydration stays clean — see `components/booking-calendar/index.tsx`, which mounts both `MobileBookingCalendar` and `DesktopBookingCalendar` and toggles visibility via Tailwind. Both render, only one is visible.
- `hooks/useBreakpoint.ts` — `useBreakpoint(): 'mobile' | 'desktop' | null` (null pre-hydration) for cases that genuinely need JS branching. `hooks/useSidebarCollapsed.ts` — desktop sidebar collapse state.
- `components/layout/adaptive-container.tsx` — `<AdaptiveContainer fullWidth?>` centers content: `max-w-md` on mobile, `lg:max-w-5xl` (or `lg:max-w-none` when `fullWidth`) on desktop.

### Auth Flow (`components/auth/`)

- `AppShell.tsx` — controls app state machine: `splash → login → app`. Shows `SplashScreen` for ≥2000ms, checks `localStorage.userId`, calls `authApi.getCurrentUser()`, falls back to `LoginScreen` on failure.
- `LoginScreen.tsx` — phone + password form, no animation.
- `SplashScreen.tsx` — fullscreen static logo (HouseIcon tile) + company name + pulsing dots.
- `lib/auth-context.tsx` — `AuthProvider` wraps the app, exposes `currentUser: User | null`, `currentRole: Role | null`, `setCurrentUser()`, `setCurrentRole()`, `logout()`. Saves `userId` to `localStorage` on login. `AppShell` loads user's role via `rolesApi.getRoles()` after login/restore and waits for it before transitioning to app screen.

### Settings (`lib/settings-context.tsx`)

- `SettingsProvider` wraps the app, exposes `settings: AppSettings`, `updateSettings()`.
- `AppSettings` — `companyName`, `showBookingCardPrice`. Loaded on app init, managed via `/more/settings` page.
- `settingsApi` in `lib/api.ts` — `get()` and `update()`.

### Data Model (`types/index.ts`)
- `Booking` — house, client, check-in/check-out, price, status (active/completed). `houseId`/`houseName` and `managerId`/`managerName` are denormalized.
- `House` — name, capacity, basePrice, isActive
- `Client` — name, phone, email, notes, bookingCount
- `Service` — name, description, isActive (доп. услуги, связаны с бронированием)
- `Equipment` — name, description, photoUrl?, isActive
- `EquipmentRental` / `EquipmentRentalItem` — equipment rental with status (active/completed)
- `Role` — permission flags: `canAccessReports`, `canManageUsers`, `canManageHouses`, `canManageClients`, `canManageEquipment`, `canManageRentals`, `canManageServices`, `canManageSettings`
- `User` — firstName, lastName, phone, chatId?, roleId, roleName?, isActive

### API Layer (`lib/api.ts`)
- Base URL: `NEXT_PUBLIC_API_URL` env var, defaults to `http://localhost/a-KV/hs/bots/api`
- Auth header: `X-User-Id` read from `localStorage`
- Response interceptor: auto-throws `Error(data.error)` when `success === false` or on HTTP errors with `error` in response body. All API errors arrive as plain `Error` (not `AxiosError`) — catch with `err instanceof Error` and read `err.message`.
- APIs: `bookingsApi`, `housesApi`, `clientsApi`, `servicesApi`, `equipmentApi`, `equipmentRentalsApi`, `usersApi`, `rolesApi`, `authApi`, `settingsApi`, `reportsApi`

### Pages (`app/`)
- `/` — booking calendar (main feature)
- `/clients` — client management
- `/rental` — equipment rental
- `/houses` — house management with full CRUD
- `/more` — section menu (Отчёты, Доп. услуги, Снаряжение, История, Пользователи, Должности, Настройки)
- `/more/users` — user management
- `/more/roles` — roles management
- `/more/services` — services management with full CRUD
- `/more/equipment` — equipment management with full CRUD
- `/more/reports` — report generation: finance/managers/houses, date range picker, on-demand fetch
- `/more/history` — booking history with filters (date, house, manager, status, client search), pull-to-refresh, inline booking/client/house modals
- `/more/settings` — app settings (company name, feature toggles like `showBookingCardPrice`)

### Key Components

**`components/booking-calendar/`** — split into three subfolders by viewport, glued by `index.tsx`:
- `index.tsx` — adaptive switch: renders `mobile/MobileBookingCalendar` under `lg`, `desktop/DesktopBookingCalendar` at `lg+` (CSS visibility, both mounted).
- `shared/useBookingCalendarController.ts` — **all calendar state + CRUD handlers live here**, consumed by both variants. Wraps `useBookingData(rangeStart, rangeEnd)`, holds the modal tri-states (`modalBooking`, `clientModal`, `houseModal`), preselection (`preselectedClient`, `preselectedHouseId`, `modalDefaultDate`/`EndDate`), and `handleSave`/`handleDelete`/`handleClientSave`/`handleHouseSave`/etc. When adding calendar behavior, put shared logic here, not in a variant.
- `shared/BookingModal.tsx` — the booking editor (used by both variants). Includes `ClientPicker`, `HousePicker`, `ServiceSearch`. Manager field is read-only (always `currentUser`). `shared/bookingHelpers.ts` — pure helpers.
- `mobile/` — week/day views (`WeekView`, `DayView`, `CalendarHeader`, `DaySlotHelpers`), `BookingCard`, `BookingView`, plus mobile `HousePicker`/`ClientPicker`. Navigation via `hooks/useCalendarNavigation.ts`.
- `desktop/` — chessboard grid (rows = houses, columns = days, sticky top/left): `ChessboardGrid`/`Header`/`Row`/`Cell`/`DateRow`, `BookingBar`, `BookingPreviewPopover`, range-drag to create via `useRangeSelection.ts`, date range via `useChessboardDates.ts`, `constants.ts` (`CELL_WIDTH`).

**`mobile/HousePicker.tsx`** — custom dropdown with search (by name), shows capacity and basePrice. Only active houses shown. `onChange(houseId, houseName)` — both id and name passed to keep `Booking.houseName` denormalized. Has `ArrowSquareOutIcon` button inside selected field to open house, "+" to create new. (Built on `SearchablePicker`.)

**`mobile/ClientPicker.tsx`** — same pattern as HousePicker. Has `ArrowSquareOutIcon` inside selected field to open client.

**`components/ui/`** — shared primitives (re-exported from `components/ui/index.ts` barrel; import from `@/components/ui`):
- `ModalSheet` — animated bottom sheet wrapper (motion/react, swipe-to-close from drag handle and content scroll top, body scroll lock). Use for all modals instead of raw `fixed inset-0`.
- `DataStateContainer` — renders loading/error/empty states; wrap list content with it.
- `ErrorModal` — centered animated error dialog (z-[60], above ModalSheet). Use for API errors in modals.
- `ConfirmDeleteDialog` — centered animated modal dialog (z-[60], above ModalSheet) with trash icon. Props: `open`, `message`, `onConfirm`, `onCancel`, `loading`. Always rendered, visibility controlled by `open` prop.
- `CrudPageLayout` — page wrapper with sticky header slot (`header` prop) + pull-to-refresh indicator between header and content + scrollable body. `containerRef` is on the outer div (touch target for pull-to-refresh).
- `PageHeader` — sticky page title + subtitle + optional action button.
- `PullToRefreshIndicator` — relative-positioned indicator, renders as collapsing height block. Shown between sticky header and list content — not inside the scrollable area.
- `PhoneInput` — phone number input with Russian format `+7 (XXX) XXX-XX-XX`. Stores value as `+7XXXXXXXXXX` (raw digits), displays formatted.
- `Checkbox` — styled checkbox with accessible touch target (24×24px), uses CSS `peer` for focus ring.
- `SearchablePicker<T>` — generic reusable dropdown with search, create (+), open-item (ArrowSquareOut). Props: `items`, `selected`, `onSelect`, `onClear`, `onCreate`, `onOpenItem?`, `filterFn`, `renderItem`, `renderSelected`, `label`, `placeholder`, `limit?`. Used as base for `HousePicker` and `ClientPicker`.
- `DateFilterPicker` — date picker using shadcn `Popover` + `Calendar` + `date-fns`. Returns ISO string.
- `Badge` — status badge with variants: `default`, `active`, `completed`, `cancelled`, `inactive` (uses CVA + `class-variance-authority`). Import from `@/components/ui/badge` (not in the barrel).

**`hooks/`**:
- `usePullToRefresh(callback, containerRef)` — pull-to-refresh gesture, returns `{ pullDistance, isRefreshing }`. Requires `containerRef` on the element receiving touch events (outer wrapper, not the scrollable inner div for body-scroll pages).
- `useBodyScrollLock(open)` — locks body scroll when modal is open.
- `useMountedRef()` — returns ref that is `true` while component is mounted; use to guard `setState` in async callbacks.
- `useCalendarNavigation()` — week/day navigation state for the mobile booking calendar.
- `useBookingData(rangeStart, rangeEnd)` — fetches bookings for the date range (with `AbortController` on range change), loads reference data (houses, clients, users, services) once on mount. Returns `{ bookings, houses, setHouses, clients, setClients, users, services, loading, loadBookings, refreshAll }`.
- `useBreakpoint()` / `useSidebarCollapsed()` — see Adaptive Architecture above.
- `useCrudPage<T extends { id: string }>(options)` — shared CRUD page logic. Options: `fetchItems`, `createItem?`, `updateItem?`, `deleteItem?`, `prependNew?` (prepend vs append new items). Returns items state, loading/error, modal tri-state, save/delete handlers, pull-to-refresh props (`containerRef`, `pullDistance`, `isRefreshing`).

**`components/layout/BottomNav.tsx`** (mobile, `lg:hidden`) and **`components/layout/DesktopSidebar.tsx`** (`lg+`) — both consume `NAV_ITEMS` from `nav-items.ts` and filter by `currentRole` from `AuthContext` (item's `permission`, `null` = always visible). `/rental`→`canManageRentals`, `/clients`→`canManageClients`, `/houses`→`canManageHouses`; "Главная" and "Ещё" always visible. Active tab uses `startsWith(href)` except `/` (exact match). Edit nav once in `nav-items.ts`, not per-component.

**`components/clients/ClientModal.tsx`** — complex modal with 3 tabs: "Данные" (edit client info), "Бронирования" (booking history), "Прокат" (rental history). Uses `ModalSheet` directly. History tabs lazy-load on first open via `fetchedRef`.

**`components/rental/RentalModal.tsx`** — uses custom `DatetimePicker` component (defined inline) for start/end dates. Renders a styled button that calls `input.showPicker()` programmatically; the actual `datetime-local` input is hidden (`opacity-0`, `pointer-events-none`).

**`lib/dates.ts`** — date helpers: formatting, Russian locale month/day names, `isToday(date)` for calendar day highlighting.

## Key Conventions
- Path alias `@/*` maps to the project root
- UI language is Russian throughout
- Biome for linting/formatting (not ESLint/Prettier) — run `npm run format` after bulk edits
- **Phosphor icons**: use `Icon`-suffixed names (`UsersIcon`, `PhoneIcon`, `HouseIcon`, `UserIcon`, `UserCircleIcon`, `WarningCircleIcon`, `ArrowSquareOutIcon`, etc.). Non-suffixed names (`Users`, `Phone`, `House`, `User`) are deprecated.
- Components organized by feature in subdirectories
- Modals use `ModalSheet` component (wraps animation, swipe-to-close, body scroll lock).
- Stone palette throughout. CSS variables `--accent` / `--accent-hover` / `--accent-light` / `--danger` / `--danger-light` defined in `globals.css` (warm olive/green, oklch). Prefer `bg-[var(--accent)]` over hardcoded `green-600` in new code.
- `fetchedRef` pattern to prevent double data fetching in `useEffect`
- `mountedRef` pattern in modals to guard against setState after unmount (extracted to `hooks/useMountedRef.ts`)
- `managerId`/`managerName` are denormalized in `Booking` and `EquipmentRental`; `houseId`/`houseName` denormalized in `Booking` — always set both when selecting. Manager is always set to `currentUser` automatically, never shown as editable dropdown.
- `chatId` exists in `User` type but is never shown in UI forms
- Role-based access: `currentRole` from `AuthContext` controls BottomNav tabs and `/more` menu items. `canManageUsers` gates "Пользователи" and "Должности"; `canAccessReports` gates "Отчёты"; `canManageServices` gates "Доп. услуги"; `canManageEquipment` gates "Снаряжение"; `canManageHouses` gates `/houses` tab; `canManageSettings` gates "Настройки". "Главная" and "История" always visible.
- Modal tri-state pattern: `undefined` = closed, `null` = create new, `T` = edit existing
- CRUD pages use `useCrudPage<T>` hook — handles items, loading, error, modal tri-state, save/delete, pull-to-refresh. Pass `header` prop to `CrudPageLayout` (not inside `children`) so pull-to-refresh indicator appears between header and list.
- Card components use `BaseCard` from `components/ui/base-card.tsx` — shared card button styling
- Simple CRUD modals use `CrudModal` from `components/ui/crud-modal.tsx` — handles form state, saving, error, delete confirmation. Props: `item` (null=create, T=edit), `emptyForm`, `title` (string or `(isEdit) => string`), `onSave`, `onDelete?`, `deleteMessage?`. Children is a render function `({ form, setForm, saving }) => ReactNode`. Complex modals (BookingModal, UserModal, ClientModal) use ModalSheet directly.
- `ConfirmDeleteDialog` uses `open` prop (not conditional rendering) — always include it in JSX and toggle `open`.
- Today's date highlighted in calendar: `isToday(day)` from `lib/dates.ts` — thicker left accent line + "сегодня" badge in `DayHeader`.
- Pull-to-refresh placement: indicator goes between sticky header and scrollable content. For pages using `CrudPageLayout` this is automatic. For custom pages (rental, history, calendar), place `<PullToRefreshIndicator>` as a sibling after the sticky header div, before the content div.
