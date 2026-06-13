# План рефакторинга: адаптивный фронтенд (Mobile + Desktop)

> **Проект:** KV-Next  
> **Дата:** 2026-05-24  
> **Ограничения:** не изменять `types/index.ts` и `lib/api.ts` (контракт с 1С).  
> **Цель:** все страницы должны комфортно работать на мобильных (основной сценарий) и эффективно использовать пространство десктопа.

---

## 1. Резюме текущего состояния

Проект уже построен по mobile-first принципу с одним breakpoint `lg:` (1024 px). Есть рабочие механизмы:

- `BottomNav` (мобильная нижняя навигация) + `DesktopSidebar` (десктопный сайдбар).
- `ModalSheet` — адаптивная модалка (bottom sheet на мобильном, центрированная на десктопе).
- `BookingCalendar` — полностью разделённые реализации `MobileBookingCalendar` и `DesktopBookingCalendar`.
- `Rental` — единственная CRUD-страница, у которой на десктопе таблица вместо карточек.

**Главная проблема:** все остальные CRUD-страницы (`houses`, `clients`, `users`, `roles`, `services`, `equipment`, `settings`) на десктопе ограничены узкой колонкой `max-w-md` (~448 px) и не используют свободное пространство. Календарь имеет hydration mismatch из-за `useBreakpoint()` на сервере.

---

## 2. Архитектурные принципы рефакторинга

1. **Mobile-first сохраняем.** Мобильный UX — основной. Десктоп — enhancement.
2. **Не добавляем новых breakpoint без необходимости.** Базовый остаётся `lg:` (1024 px). Промежуточный `md:` (768 px) вводим только для grid-карточек на планшетах.
3. **Единый контейнер.** Все страницы используют один механизм управления шириной (`data-page="fullwidth"` или стандартный адаптивный контейнер).
4. **Изоляция desktop-логики.** Если мобильная и десктопная раскладки кардинально отличаются (таблица vs карточки), используем `useBreakpoint` + отдельные подкомпоненты (паттерн `BookingCalendar`).
5. **Никаких изменений API и типов.** Все существующие интерфейсы (`Booking`, `House`, `Client`, …) остаются без изменений.
6. **Расширяемость.** Новые CRUD-страницы должны получать desktop-режим «бесплатно» через `CrudPageLayout` и `BaseCard`.

---

## 3. Отчёт по разделам и план действий

### 3.1. Глобальный Layout (`app/layout.tsx`)

**Текущее состояние:**
```tsx
<div className="lg:flex min-h-dvh">
  <DesktopSidebar />
  <main className="flex-1 min-w-0 lg:overflow-x-hidden">
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0
                    max-w-md mx-auto min-h-dvh
                    lg:[&:has([data-page=fullwidth])]:max-w-none
                    lg:[&:has([data-page=fullwidth])]:mx-0">
      {children}
    </div>
  </main>
</div>
<BottomNav />
```

Проблемы:
- Контейнер `max-w-md` жёстко встроен в layout. Чтобы сделать страницу широкой, нужно ставить `data-page="fullwidth"` на внутренний элемент — неявный механизм.
- `BottomNav` рендерится в DOM на десктопе, хотя скрыт через `lg:hidden`.
- `min-h-dvh` vs `min-h-screen` используется непоследовательно на разных страницах.

**План рефакторинга:**

| # | Действие | Файлы | Приоритет |
|---|----------|-------|-----------|
| 1.1 | Вынести логику контейнера в переиспользуемый компонент `AdaptiveContainer`. Он должен принимать проп `fullWidth?: boolean` и на десктопе либо растягиваться (`max-w-none`), либо ограничиваться разумной шириной (`lg:max-w-5xl lg:mx-auto`). | `components/layout/adaptive-container.tsx` | Высокий |
| 1.2 | Убрать `max-w-md` из `app/layout.tsx`. Вместо этого `AdaptiveContainer` сам управляет шириной. | `app/layout.tsx` | Высокий |
| 1.3 | Условно рендерить `BottomNav` только при `bp !== "desktop"`, чтобы не монтировать его в DOM на десктопе. | `app/layout.tsx` | Средний |
| 1.4 | Унифицировать высоту: заменить `min-h-screen` → `min-h-dvh` на всех страницах (`reports`, `history`, `more`). | `app/more/reports/page.tsx`, `app/more/history/page.tsx`, `app/more/page.tsx` | Средний |

**Рекомендуемая финальная структура `app/layout.tsx`:**
```tsx
<div className="lg:flex min-h-dvh">
  <DesktopSidebar />
  <main className="flex-1 min-w-0 lg:overflow-x-hidden">
    {children}
  </main>
</div>
{bp !== "desktop" && <BottomNav />}
```

---

### 3.2. Навигация (`BottomNav`, `DesktopSidebar`, `nav-items.ts`)

**Текущее состояние:**
- `nav-items.ts` — единый источник правды, хорошо работает.
- `DesktopSidebar` — collapsible (64 px / 220 px), sticky, показывает `companyName`.
- `BottomNav` — 5 пунктов, ролевая фильтрация, safe-area inset.

Проблемы:
- `BottomNav` не использует `AdaptiveContainer` для центрирования на очень широких мобильных экранах.
- Нет tooltip'ов в свёрнутом `DesktopSidebar` для понимания иконок.

**План рефакторинга:**

| # | Действие | Файлы | Приоритет |
|---|----------|-------|-----------|
| 2.1 | Добавить `title`-атрибуты или кастомные tooltip'ы для пунктов `DesktopSidebar` в свёрнутом режиме (64 px). | `components/layout/DesktopSidebar.tsx` | Низкий |
| 2.2 | Проверить, что `BottomNav` корректно работает с `AdaptiveContainer` (не вылазит за пределы max-width на планшетах). | `components/layout/BottomNav.tsx` | Средний |
| 2.3 | Добавить hover-состояния для пунктов десктопного сайдбара с плавными переходами. | `components/layout/DesktopSidebar.tsx` | Низкий |

---

### 3.3. Дизайн-система и CSS (`app/globals.css`, breakpoints)

**Текущее состояние:**
- Tailwind CSS v4 с inline `@theme`.
- OKLCH-палитра, CSS-переменные для теней.
- Мобильные фиксы (iOS zoom, tap-highlight, scroll-lock).
- Единственный breakpoint в логике — `lg:`.

Проблемы:
- Нет промежуточного `md:` (768 px). Планшеты показывают мобильный UI.
- Хардкод `bg-white` в `ConfirmDeleteDialog`, `ErrorModal`, `SearchablePicker` — блокирует тёмную тему.
- Нет `components/ui/index.ts` (barrel-экспорта).

**План рефакторинга:**

| # | Действие | Файлы | Приоритет |
|---|----------|-------|-----------|
| 3.1 | Добавить `md:` breakpoint в логику только там, где это нужно: grid-карточки (`houses`, `equipment`, `services`) — `md:grid-cols-2`. Не добавлять новые глобальные breakpoints. | `app/*/page.tsx` | Средний |
| 3.2 | Заменить хардкод `bg-white` на `bg-[var(--surface-elevated)]` в `ConfirmDeleteDialog` и `ErrorModal`. | `components/ui/confirm-delete-dialog.tsx`, `components/ui/error-modal.tsx` | Низкий |
| 3.3 | Создать `components/ui/index.ts` — barrel-экспорт всех UI-компонентов для сокращения импортов. | `components/ui/index.ts` | Низкий |
| 3.4 | Вынести `Spinner` из `data-state-container.tsx` в отдельный `components/ui/spinner.tsx`. | `components/ui/spinner.tsx`, `components/ui/data-state-container.tsx` | Низкий |
| 3.5 | Добавить CSS-класс `.responsive-grid` в `globals.css` как reusable паттерн: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`. | `app/globals.css` | Средний |

---

### 3.4. CRUD-абстракции (`useCrudPage`, `CrudPageLayout`, `BaseCard`, `PageHeader`)

**Текущее состояние:**
- `useCrudPage` — хорошо покрывает загрузку, модалку, сохранение, удаление.
- `CrudPageLayout` — sticky header + pull-to-refresh.
- `BaseCard` — единая карточка списка.
- `PageHeader` — заголовок, FAB (+), поиск.
- **Отсутствует `CrudModal`** — документирован в `crud-patterns.md`, но не реализован. Все модалки дублируют одну и ту же логику.

Проблемы:
- `CrudPageLayout` не поддерживает десктопную раскладку (контент всегда в одну колонку).
- `PageHeader` на десктопе выглядит скромно (FAB `w-10 h-10`).
- `ClientCard` — единственная карточка, не использующая `BaseCard`.
- Нет `CrudModal` — каждая модалка реализует form state, saving, error, confirmDelete самостоятельно.

**План рефакторинга:**

| # | Действие | Файлы | Приоритет |
|---|----------|-------|-----------|
| 4.1 | **Реализовать `CrudModal`** по спецификации `docs/crud-patterns.md`. Он должен принимать `item`, `onSave`, `onDelete`, `title`, `children({ form, setForm, saving })`, `fields`. | `components/ui/crud-modal.tsx` | Высокий |
| 4.2 | Мигрировать `EquipmentModal`, `HouseModal` на `CrudModal` (они уже используют похожий паттерн). Затем мигрировать остальные. | `components/equipment/EquipmentModal.tsx`, `components/houses/HouseModal.tsx`, … | Средний |
| 4.3 | Доработать `CrudPageLayout`: добавить поддержку `layout: "cards" | "table"` для десктопа. На мобильном всегда карточки. | `components/ui/crud-page-layout.tsx` | Высокий |
| 4.4 | Доработать `PageHeader`: на десктопе (`lg:`) размещать поиск и FAB в одну строку (`flex-row items-center justify-between`), увеличить FAB до `lg:w-11 lg:h-11`. | `components/ui/page-header.tsx` | Средний |
| 4.5 | Перевести `ClientCard` на `BaseCard`. Удалить дублирующие стили. | `components/clients/ClientCard.tsx` | Средний |
| 4.6 | Добавить `grid`-обёртку в `CrudPageLayout`: на десктопе (`lg:grid-cols-2 xl:grid-cols-3`) карточки расставляются в сетку. На мобильном — одна колонка. | `components/ui/crud-page-layout.tsx` | Высокий |

**Паттерн десктопной раскладки CRUD-страницы:**
```tsx
// Внутри CrudPageLayout на десктопе:
<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
  {items.map(item => <BaseCard key={item.id} ... />)}
</div>
```

---

### 3.5. CRUD-страницы (`houses`, `clients`, `rental`, `equipment`, `services`, `users`, `roles`)

**Текущее состояние:**
- Современный inline-CRUD: `houses`, `users`, `roles`, `services`, `equipment` — используют `useCrudPage` + `CrudPageLayout`.
- Legacy-обёртки: `clients`, `rental` — логика в `components/clients/index.tsx` и `components/rental/index.tsx`, `page.tsx` пустой.
- `Rental` уже имеет `RentalTable.tsx` для десктопа — отличный пример.

Проблемы:
- Legacy-страницы (`clients`, `rental`) не соответствуют современному паттерну.
- `houses` подгружает `occupancy` кастомно — валидно, но логика размазана.
- `users` загружает роли в `handleSave` — валидно, но нестандартно.

**План рефакторинга:**

| # | Действие | Файлы | Приоритет |
|---|----------|-------|-----------|
| 5.1 | **Houses page:** добавить `data-page="fullwidth"` или использовать `AdaptiveContainer`. На десктопе карточки домов в `lg:grid-cols-2`. | `app/houses/page.tsx` | Высокий |
| 5.2 | **Clients page:** перенести логику из `components/clients/index.tsx` в `app/clients/page.tsx` (inline-CRUD), как у `roles`. Добавить `useCrudPage`. На десктопе — grid карточек или таблица. | `app/clients/page.tsx`, `components/clients/index.tsx` | Высокий |
| 5.3 | **Rental page:** перенести логику из `components/rental/index.tsx` в `app/rental/page.tsx`. Сохранить существующий паттерн "карточки мобайл / таблица десктоп". | `app/rental/page.tsx`, `components/rental/index.tsx` | Высокий |
| 5.4 | **Users page:** добавить grid-раскладку карточек на десктопе. | `app/more/users/page.tsx` | Средний |
| 5.5 | **Roles page:** добавить grid-раскладку карточек на десктопе. | `app/more/roles/page.tsx` | Средний |
| 5.6 | **Services page:** добавить grid-раскладку карточек на десктопе. | `app/more/services/page.tsx` | Средний |
| 5.7 | **Equipment page:** добавить grid-раскладку карточек на десктопе. | `app/more/equipment/page.tsx` | Средний |

**Примечание:** `clients` и `rental` — приоритетные, так как они используют legacy-архитектуру.

---

### 3.6. Кастомные страницы (`more`, `reports`, `history`, `settings`)

**Текущее состояние:**
- `more/page.tsx` — меню, профиль, logout. 256 строк. Logout-диалог через raw `fixed inset-0`.
- `more/reports/page.tsx` — отчёты с фильтрами. 175 строк. Не использует `DataStateContainer`.
- `more/history/page.tsx` — история броней. 317 строк. 3 модалки в одном файле.
- `more/settings/page.tsx` — форма настроек. 87 строк.

Проблемы:
- `more/page.tsx` — logout-диалог нарушает паттерн модалок (нет `ModalSheet`).
- `reports` — нет `DataStateContainer`, нет pull-to-refresh, контент `max-w-md`.
- `history` — монолит (317 строк), импорты из `booking-calendar/mobile/`.
- Ни одна из этих страниц не использует `data-page="fullwidth"`.

**План рефакторинга:**

| # | Действие | Файлы | Приоритет |
|---|----------|-------|-----------|
| 6.1 | **More page:** заменить raw logout-диалог на `ConfirmDeleteDialog` (или новый `ConfirmActionDialog`). | `app/more/page.tsx` | Средний |
| 6.2 | **Reports page:** обернуть в `DataStateContainer`. Добавить `data-page="fullwidth"` — отчёты выиграют от широких таблиц. | `app/more/reports/page.tsx` | Высокий |
| 6.3 | **Reports page:** на десктопе (`lg:`) раскрыть таблицы на всю ширину, возможно добавить sticky-заголовки. | `app/more/reports/page.tsx` | Средний |
| 6.4 | **History page:** декомпозировать на подкомпоненты (`HistoryFilters`, `HistoryList`, `HistoryBookingModal`). | `app/more/history/page.tsx`, `components/history/` | Средний |
| 6.5 | **History page:** добавить `data-page="fullwidth"`. На десктопе — таблица или компактные карточки в grid. | `app/more/history/page.tsx` | Высокий |
| 6.6 | **Settings page:** добавить `data-page="fullwidth"` и центрирование формы на десктопе (`lg:max-w-2xl`). | `app/more/settings/page.tsx` | Средний |

---

### 3.7. Календарь бронирований (`BookingCalendar`)

**Текущее состояние:**
- `BookingCalendar` (root) использует `useBreakpoint()` для выбора `MobileBookingCalendar` / `DesktopBookingCalendar`.
- `useBreakpoint()` возвращает `null` на сервере → всегда рендерится `MobileBookingCalendar` → после гидратации переключается на `DesktopBookingCalendar`.
- `DesktopBookingCalendar` использует `h-dvh`.
- `BookingModal` лежит в `mobile/`, но используется и на десктопе.

Проблемы:
- **Hydration mismatch** — главный риск.
- `BookingModal` — bottom-sheet на десктопе (не лучший UX).
- `DesktopBookingCalendar` занимает `h-dvh`, но вложен в контейнеры с `min-h-dvh`.

**План рефакторинга:**

| # | Действие | Файлы | Приоритет |
|---|----------|-------|-----------|
| 7.1 | **Исправить hydration mismatch.** Варианты:  
  A) Использовать CSS-media (`hidden lg:block` / `lg:hidden`) вместо JS-switch в корне.  
  B) Рендерить `MobileBookingCalendar` по умолчанию, но обёртку desktop-версии скрывать через `hidden lg:contents` до гидратации.  
  C) Использовать `useSyncExternalStore` для `useBreakpoint` с `getServerSnapshot`, возвращающим `"mobile"`.  
**Рекомендация A** — CSS-media не ломает hydration. | `components/booking-calendar/index.tsx` | **Критический** |
| 7.2 | Перенести `BookingModal` из `mobile/` в `shared/` (или `components/booking-calendar/BookingModal.tsx`), так как он используется обеими версиями. | Перемещение файла + обновление импортов | Высокий |
| 7.3 | Убедиться, что `BookingModal` внутри использует `ModalSheet` — он уже адаптивен (bottom-sheet mobile / центрированный desktop). | `components/booking-calendar/mobile/BookingModal.tsx` | Средний |
| 7.4 | Проверить `DesktopBookingCalendar` на корректную работу внутри `data-page="fullwidth"` без двойных скроллбаров. | `components/booking-calendar/desktop/DesktopBookingCalendar.tsx` | Средний |

**Рекомендуемый паттерн для `index.tsx` календаря:**
```tsx
// components/booking-calendar/index.tsx
export default function BookingCalendar() {
  return (
    <>
      <div className="lg:hidden">
        <MobileBookingCalendar />
      </div>
      <div className="hidden lg:block">
        <DesktopBookingCalendar />
      </div>
    </>
  );
}
```
Это решает hydration mismatch полностью.

---

### 3.8. Модальные окна и формы

**Текущее состояние:**
- `ModalSheet` — адаптивный, отлично работает.
- Каждая модалка (`ClientModal`, `HouseModal`, `UserModal`, `EquipmentModal`, `RentalModal`, `ServiceModal`) реализует свою логику: `form`, `saving`, `error`, `mountedRef`, `ConfirmDeleteDialog`.
- `BookingModal` — сложная, используется везде.

Проблемы:
- Массовое дублирование кода модалок.
- `SearchablePicker` — dropdown не адаптирован под ширину десктопа (может быть узким).
- Нет единого компонента `CrudModal` (см. п. 4.1).

**План рефакторинга:**

| # | Действие | Файлы | Приоритет |
|---|----------|-------|-----------|
| 8.1 | Реализовать и внедрить `CrudModal` для простых CRUD-модалок. | `components/ui/crud-modal.tsx` | Высокий |
| 8.2 | Убедиться, что все модалки используют `ModalSheet`, а не raw `fixed inset-0`. | Все `*Modal.tsx` | Средний |
| 8.3 | Адаптировать `SearchablePicker`: на десктопе (`lg:`) увеличить max-width выпадающего списка (`lg:max-w-md`). | `components/ui/SearchablePicker.tsx` | Низкий |
| 8.4 | Для сложных модалок (`BookingModal`, `UserModal`) оставить прямое использование `ModalSheet`, но вынести общие хуки (например, `useCrudForm`) если это сократит дублирование. | По необходимости | Низкий |

---

### 3.9. Производительность, DX и консистентность

**План:**

| # | Действие | Файлы | Приоритет |
|---|----------|-------|-----------|
| 9.1 | Исправить deprecated-импорты иконок (`Gear` → `GearIcon` в settings). | `app/more/settings/page.tsx` | Низкий |
| 9.2 | Унифицировать именование: `SearchablePicker.tsx` (PascalCase внутри `ui/`) vs `page-header.tsx` (kebab-case). Оставить как есть, но при новых файлах использовать kebab-case. | — | Низкий |
| 9.3 | Проверить, что все страницы, которым нужна ширина, получают `fullwidth` через `AdaptiveContainer`, а не через хак `data-page` на случайных div'ах. | Все `page.tsx` | Средний |
| 9.4 | Обновить `docs/crud-patterns.md` — добавить описание `CrudModal`, `AdaptiveContainer`, desktop grid. | `docs/crud-patterns.md` | Низкий |

---

## 4. Фазы реализации

### Фаза 1. Инфраструктура (1–2 дня)
- Создать `AdaptiveContainer`.
- Рефактор `app/layout.tsx` (убрать `max-w-md`, условный `BottomNav`).
- Унифицировать `min-h-dvh` на всех страницах.
- Исправить hydration mismatch в `BookingCalendar` (CSS-media).
- Переместить `BookingModal` в `shared/`.

### Фаза 2. CRUD-ядро (2–3 дня)
- Реализовать `CrudModal`.
- Доработать `CrudPageLayout` (grid на десктопе).
- Доработать `PageHeader` (десктопная раскладка).
- Перевести `ClientCard` на `BaseCard`.

### Фаза 3. Страницы (3–4 дня)
- **Houses:** grid-карточки на десктопе.
- **Clients:** миграция на inline-CRUD + grid.
- **Rental:** миграция на inline-CRUD, сохранить таблицу на десктопе.
- **Users, Roles, Services, Equipment:** grid на десктопе.
- **Reports:** fullwidth + `DataStateContainer`.
- **History:** декомпозиция + fullwidth.
- **Settings:** центрирование формы на десктопе.

### Фаза 4. Полировка (1 день)
- Tooltip'ы в `DesktopSidebar`.
- `SearchablePicker` width.
- Barrel-export `components/ui/index.ts`.
- Обновление документации (`docs/crud-patterns.md`).
- `npm run lint && npm run format && npm run build`.

---

## 5. Критерии приёмки

1. **Все CRUD-страницы** на десктопе (≥1024 px) используют пространство эффективно: либо grid карточек, либо таблица.
2. **Мобильная версия** не ухудшилась: `BottomNav`, `max-w-md`, bottom-sheet модалки, pull-to-refresh работают.
3. **Нет hydration mismatch:** `npm run build` проходит без ошибок, консоль браузера чистая.
4. **Навигация:** `DesktopSidebar` и `BottomNav` корректно переключаются по `lg:`.
5. **API и типы:** `types/index.ts` и `lib/api.ts` не изменены (кроме импортов/экспортов, если нужно).
6. **Сборка:** `npm run build` завершается успешно. `npm run lint` — без ошибок.
7. **Расширяемость:** новая CRUD-страница, созданная по шаблону `useCrudPage` + `CrudPageLayout`, автоматически получает desktop grid.

---

## 6. Чек-лист затронутых файлов

### Создать новые:
- `components/layout/adaptive-container.tsx`
- `components/ui/crud-modal.tsx`
- `components/ui/spinner.tsx`
- `components/ui/index.ts` (barrel)

### Изменить (layout & infra):
- `app/layout.tsx`
- `app/globals.css`
- `components/layout/BottomNav.tsx`
- `components/layout/DesktopSidebar.tsx`

### Изменить (UI-абстракции):
- `components/ui/crud-page-layout.tsx`
- `components/ui/page-header.tsx`
- `components/ui/confirm-delete-dialog.tsx`
- `components/ui/error-modal.tsx`
- `components/ui/data-state-container.tsx`
- `components/ui/SearchablePicker.tsx`

### Изменить (страницы):
- `app/page.tsx`
- `app/houses/page.tsx`
- `app/clients/page.tsx` (+ удалить/сократить `components/clients/index.tsx`)
- `app/rental/page.tsx` (+ удалить/сократить `components/rental/index.tsx`)
- `app/more/page.tsx`
- `app/more/reports/page.tsx`
- `app/more/history/page.tsx`
- `app/more/settings/page.tsx`
- `app/more/users/page.tsx`
- `app/more/roles/page.tsx`
- `app/more/services/page.tsx`
- `app/more/equipment/page.tsx`

### Изменить (календарь):
- `components/booking-calendar/index.tsx`
- `components/booking-calendar/mobile/BookingModal.tsx` → `components/booking-calendar/shared/BookingModal.tsx`
- Обновить все импорты `BookingModal`

### Изменить (карточки):
- `components/clients/ClientCard.tsx`

### Изменить (документация):
- `docs/crud-patterns.md`

---

*План составлен на основе полного аудита кодовой базы. Приоритеты могут корректироваться в зависимости от бизнес-задач.*
