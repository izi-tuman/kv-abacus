# UI/UX Ревью: Календарь бронирований

**Дата:** 2026-05-24  
**Область:** `components/booking-calendar/`, `app/page.tsx`, связанные hooks  
**Стандарт:** ui-ux-pro-max (Accessibility, Touch, Performance, Layout, Animation, Forms)

---

## 🔴 Critical (must fix)

### 1. ✅ ИСПРАВЛЕНО — Невалидный HTML: `<a>` внутри `<button>` в BookingCard
**Файл:** `components/booking-calendar/mobile/BookingCard.tsx`

~~Карточка бронирования рендерится как `<button>`, внутри которой находится ссылка `tel:`. По спецификации HTML элемент `<button>` не может содержать интерактивные элементы.~~

**Исправление:** ссылка `tel:` вынесена за пределы `<button>` через `absolute` позиционирование (`right-3 top-[42px]`). Основная карточка осталась `<button>`, padding-right увеличен (`pr-10`), чтобы текст не заезжал под иконку. Добавлен `aria-label="Позвонить клиенту"`.

---

### 2. ✅ ИСПРАВЛЕНО — Десктопная шахматка — только мышь, нет клавиатурного доступа
**Файл:** `components/booking-calendar/desktop/ChessboardRow.tsx`

~~Range selection работает исключительно через `onMouseMove` + `onClick`. Пользователь без мыши полностью лишён возможности создать бронирование.~~

**Исправление:**
- Добавлен `tabIndex={0}` и `role="grid"` на cells-область.
- Добавлен `onKeyDown` с навигацией: `ArrowLeft`/`ArrowRight` перемещают focusedIndex, `Enter`/`Space` вызывают `onCellClick`.
- Добавлен визуальный индикатор фокуса (ring-2 inset).
- `aria-label` описывает поведение: "Дом X. Используйте стрелки влево/вправо для навигации по дням, Enter или Пробел для выбора диапазона."
- Убраны `biome-ignore` для a11y.

---

### 3. ✅ ИСПРАВЛЕНО — Touch-target меньше минимального стандарта в CalendarHeader
**Файл:** `components/booking-calendar/mobile/CalendarHeader.tsx`

~~Кнопки переключения периода имели размер `w-8 h-8` (32×32px), что ниже минимума 44×44pt (Apple HIG).~~

**Исправление:** все навигационные кнопки увеличены до `w-11 h-11` (44px). `transition-all` заменён на `transition-colors`.

---

## 🟠 High (should fix)

### 4. Desktop chessboard не оптимизирован для больших списков
**Файл:** `components/booking-calendar/desktop/DesktopBookingCalendar.tsx` и дочерние

Шахматка рендерит фиксированное окно в ~5 месяцев:
- ~150 дней × 20 домов = **3000+ DOM-элементов** ячеек (`ChessboardCell`)
- Плюс sticky-заголовки, overlay, booking bars

Нет virtualization (virtual scroll). На слабых устройствах и при большом количестве броней это вызывает:
- Долгий initial render
- Jank при горизонтальном скролле
- Высокое потребление памяти

**Рекомендация:**
- Внедрить виртуализацию строк (домов) или, как минимум, ячеек.
- Альтернатива: ленивая загрузка booking bars (не рендерить те, что вне viewport).

---

### 5. ✅ ИСПРАВЛЕНО — `transition-all` вызывает layout thrashing
**Файлы:**
- `components/booking-calendar/mobile/BookingCard.tsx`
- `components/booking-calendar/mobile/CalendarHeader.tsx`
- `components/booking-calendar/mobile/DaySlotHelpers.tsx`

~~Использование `transition-all duration-200` вместо явного перечисления анимируемых свойств.~~

**Исправление:** `transition-all` заменён на `transition-transform transition-shadow transition-colors` (или `transition-colors transition-transform` где применимо). Браузер теперь знает заранее, какие свойства анимируются.

---

### 6. ✅ ИСПРАВЛЕНО — BookingPreviewPopover может выходить за пределы viewport
**Файл:** `components/booking-calendar/desktop/BookingPreviewPopover.tsx`

~~Popover не имел настроек collision detection, мог обрезаться у нижнего края экрана.~~

**Исправление:** добавлен `collisionPadding={16}` к `PopoverContent`. Radix теперь будет автоматически переворачивать поповер при столкновении с границами viewport.

---

### 7. ✅ ИСПРАВЛЕНО — Мобильный свайп конфликтует с вертикальным скроллом
**Файл:** `hooks/useCalendarNavigation.ts`

~~Свайп для смены недели не имел direction lock, конфликтовал с вертикальным скроллом.~~

**Исправление:** добавлено отслеживание `touchStartY`. В `onTouchEnd` добавлена проверка: если `Math.abs(dy) > Math.abs(dx) * 0.6`, свайп игнорируется (вертикальное движение преобладает). Также обнуляется `touchStartY`.

---

## 🟡 Medium (nice to fix)

### 8. ✅ ИСПРАВЛЕНО — Хардкод цвета для статуса `completed`
**Файл:** `components/booking-calendar/desktop/BookingBar.tsx`

~~`bg-stone-400` — raw Tailwind цвет, не семантический токен.~~

**Исправление:** заменено на `bg-[var(--muted-foreground)]`, который является частью дизайн-системы и будет консистентен в любой теме.

---

### 9. ✅ ИСПРАВЛЕНО — Inline SVG вместо единого набора иконок
**Файлы:**
- `components/booking-calendar/mobile/DaySlotHelpers.tsx`
- `components/ui/confirm-delete-dialog.tsx`

~~Inline SVG нарушали консистентность stroke width и размеров.~~

**Исправление:**
- `DaySlotHelpers`: кастомный SVG «плюс» заменён на `PlusIcon` из Phosphor Icons.
- `ConfirmDeleteDialog`: кастомный SVG «мусорка» заменён на `TrashIcon` из Phosphor Icons.

---

### 10. Ошибки формы показываются в ErrorModal, а не inline
**Файл:** `components/booking-calendar/mobile/BookingEditForm.tsx` (строка 261)

```tsx
<div role="status" aria-live="assertive" aria-atomic="true">
  <ErrorModal error={error} onClose={() => setError(null)} />
</div>
```

При валидации на submit ошибка показывается в отдельном модальном окне. Пользователь теряет контекст формы и не видит, какое именно поле невалидно ("Выберите дом" — но где именно дом в форме?).

**Рекомендация:**
- Для простых правил (required fields) — показывать inline ошибки под полями.
- ErrorModal оставить только для серверных/network ошибок.

---

### 11. Нет inline-валидации onBlur
**Файл:** `components/booking-calendar/mobile/BookingEditForm.tsx`

Все поля проверяются только при submit. Прогрессивная валидация (validate on blur) помогает пользователю исправлять ошибки до завершения заполнения формы.

**Рекомендация:** добавить простую валидацию при `onBlur` для обязательных полей (дом, клиент, даты).

---

### 12. Нет deep-link для бронирований
**Файл:** `components/booking-calendar/shared/BookingModal.tsx`

URL страницы не меняется при открытии модалки бронирования. Нельзя:
- Поделиться ссылкой на конкретное бронирование
- Использовать browser back для закрытия модалки
- Открыть бронирование из push-уведомления

**Рекомендация:** использовать Query Parameters (`?booking=ID`) или Route Segment (`/booking/[id]`) при открытии модалки.

---

### 13. Мелкий шрифт в BookingBar
**Файл:** `components/booking-calendar/desktop/BookingBar.tsx` (строки 53–60)

```tsx
<span className="truncate w-full text-[10px] leading-tight font-semibold">
```

`text-[10px]` — слишком мелко для UI-элемента, содержащего имя клиента и телефон. WCAG рекомендует минимум 12px для functional text.

**Рекомендация:** увеличить до `text-[11px]` или `text-xs` (12px). Если не влезает — увеличить `ROW_HEIGHT`/`CELL_WIDTH` или показывать tooltip при hover.

---

## 🟢 Low (polish)

### 14. Десктопные кнопки навигации без press feedback
**Файл:** `components/booking-calendar/desktop/ChessboardHeader.tsx`

Кнопки «Сегодня», «<», «>», «Новая бронь» имеют hover (`hover:bg-[var(--surface-muted)]`), но нет active/pressed состояния (`active:scale-95` или brightness). На десктопе это менее критично, но click feedback повышает perceived responsiveness.

---

### 15. Pull-to-refresh без spring-отпускания
**Файл:** `hooks/usePullToRefresh.ts`

Индикатор движется линейно через `setPullDistance`. При отпускании пальца индикатор либо резко исчезает, либо застывает на `THRESHOLD`. Нет физики пружины (spring easing) для возврата в исходное положение.

---

### 16. Manager useEffect может пропустить асинхронный currentUser
**Файл:** `components/booking-calendar/mobile/BookingEditForm.tsx` (строки 201–206)

```tsx
// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only once on mount
useEffect(() => {
  if (!booking && currentUser && !form.managerId) {
    setForm((prev) => ({ ...prev, managerId: currentUser.id }));
  }
}, []);
```

Если `currentUser` загружается асинхронно (например, после холодного старта) и приходит после первого рендера, `managerId` останется пустым.

**Рекомендация:** добавить `currentUser` в зависимости useEffect или использовать `useState` lazy initializer.

---

## ✅ Что сделано отлично

| Паттерн | Реализация | Где |
|---------|-----------|-----|
| **Адаптивный ModalSheet** | Bottom sheet на mobile, centered modal на desktop | `components/ui/modal-sheet.tsx` |
| **Pull-to-refresh** | Direction lock, dead zone (15px), проверка `modal-open` | `hooks/usePullToRefresh.ts` |
| **Body scroll lock** | `useBodyScrollLock` + класс `body.modal-open` | `components/ui/modal-sheet.tsx`, `globals.css` |
| **Focus-visible стили** | Глобальные `ring-2 ring-[var(--accent)]/30` | `globals.css` |
| **Reduced motion** | Полное отключение анимаций через `@media` | `globals.css` |
| **Active / pressed states** | `active:scale-95` на мобильных кнопках | `CalendarHeader`, `BookingCard` |
| **Semantic aria-labels** | Все иконки-кнопки в `CalendarHeader` имеют описания | `CalendarHeader.tsx` |
| **aria-live для ошибок** | `role="status" aria-live="assertive"` вокруг ErrorModal | `BookingEditForm.tsx` |
| **Empty states** | «Добавить бронирование» на пустом дне, «Нет домов» | `EmptyDaySlot`, `ChessboardHeader` |
| **Payment progress bar** | Визуальная обратная связь по оплате | `BookingView.tsx` |
| **Adaptive grid** | 1→2→3 колонки в форме при росте ширины | `BookingEditForm.tsx` |
| **Denormalization** | Сохраняются и `houseId`, и `houseName` | Везде в формах |
| **AbortController** | Отмена устаревших запросов броней | `useBookingData.ts` |

---

## 📋 Pre-Delivery Checklist (календарь)

| Критерий | Статус |
|----------|--------|
| No emoji as icons | ✅ |
| Touch targets ≥44px (mobile) | ✅ |
| Focus rings visible | ✅ |
| Keyboard navigation (desktop) | ✅ |
| Reduced motion support | ✅ |
| Semantic HTML (valid nesting) | ✅ |
| Loading states | ✅ |
| Empty states | ✅ |
| Disabled states clear | ✅ |
| Active/pressed feedback (mobile) | ✅ |
| Active/pressed feedback (desktop) | ⚠️ (минимально) |
| Inline validation / error placement | ⚠️ (ErrorModal вместо inline) |
| Deep linking | ❌ |
| Virtualization (large lists) | ❌ |
