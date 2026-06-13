<!-- AGENTS.md — файл для AI-агентов, работающих с проектом KV-Next -->

# KV-Next — руководство для AI-агентов

## 1. Обзор проекта

**KV-Next** — веб-приложение для управления объектами глэмпинга «Коротково» (бронирования домов, прокат снаряжения, клиентская база, отчёты). Предназначено для работы менеджеров и администраторов через мобильные устройства и десктоп.

- **Фронтенд**: Next.js 16.1.6 (App Router), React 19.2.3, TypeScript 5 (strict)
- **Стили**: Tailwind CSS v4 с inline `@theme` в `app/globals.css` (отдельного `tailwind.config.ts` нет)
- **UI-компоненты**: shadcn/ui (style: base-nova), Radix UI primitives
- **Анимации**: Framer Motion (`motion/react`)
- **Иконки**: Phosphor Icons (`@phosphor-icons/react`) — основные; Lucide (`lucide-react`) — для shadcn-компонентов
- **Бэкенд**: 1С:Предприятие, доступное через Apache HTTP-сервисы (`/a-KV/hs/bots/api/`)
- **Прокси**: Nginx (HTTPS → Node.js, `/api/*` → Apache/1С)
- **Язык интерфейса**: русский (все метки, сообщения, placeholder'ы)
- **PWA**: динамический Web App Manifest (`app/manifest.webmanifest/route.ts`), иконки 192/512, standalone display

### Архитектура деплоя (основной — Windows Server)

```
Пользователь
  → HTTPS (443) → Nginx → proxy_pass → Node.js (next start, порт 3000)
  → /api/* → Nginx rewrite → Apache (localhost:80) → 1С HTTP-сервисы
  → HTTP (80) → Apache → 301 редирект на HTTPS (кроме /KV/ru и /a-KV/)
```

Альтернативный деплой: Docker (multi-stage build, standalone-режим Next.js) — см. `PROD2/`.

---

## 2. Команды

```bash
npm run dev           # Dev-сервер на http://localhost:3000
npm run build         # Production-сборка (standalone в .next/standalone)
npm run start         # Production-сервер (требует предварительный build)
npm run lint          # Проверка Biome
npm run format        # Автоформатирование Biome — запускать после массовых правок
npm run generate:icons # Генерация PWA-иконок из app/favicon.ico
```

Тестовый набор **не настроен**. Нет Jest, Vitest, Playwright, Cypress или другого test runner.

---

## 3. Структура проекта

```
app/                    # Next.js App Router
  page.tsx              # Главная — календарь бронирований
  layout.tsx            # Корневой layout: шрифты Nunito/JetBrains Mono, провайдеры, навигация
  error.tsx             # Глобальный Error Boundary
  globals.css           # Tailwind импорты, CSS-переменные OKLCH, мобильные фиксы
  manifest.webmanifest/ # Динамический манифест (GET /manifest.webmanifest)
  clients/page.tsx      # Клиенты (CRUD)
  houses/page.tsx       # Дома (CRUD)
  rental/page.tsx       # Прокат снаряжения (CRUD)
  more/page.tsx         # Меню "Ещё" (навигация, выход, профиль)
  more/reports/page.tsx      # Отчёты (финансы, менеджеры, дома)
  more/history/page.tsx      # История броней
  more/settings/page.tsx     # Настройки компании
  more/users/page.tsx        # Пользователи (CRUD)
  more/roles/page.tsx        # Роли и доступы (CRUD)
  more/services/page.tsx     # Доп. услуги (CRUD)
  more/equipment/page.tsx    # Справочник снаряжения (CRUD)

components/
  auth/                 # AppShell, SplashScreen, LoginScreen
  booking-calendar/     # Календарь бронирований (mobile + desktop)
    mobile/             # BookingCard, BookingModal, DayView, WeekView и т.д.
    desktop/            # ChessboardGrid, ChessboardCell, BookingBar и т.д.
    shared/             # bookingHelpers.ts, useBookingCalendarController.ts
  clients/              # ClientCard, ClientModal
  houses/               # HouseCard, HouseModal
  equipment/            # EquipmentCard, EquipmentModal
  history/              # HistoryCard, HistoryFilters
  rental/               # RentalCard, RentalModal, EquipmentPicker
  reports/              # FinanceTable, ManagersTable, HousesTable, FinanceDayDetailsModal
  roles/                # RoleCard, RoleModal
  services/             # ServiceCard, ServiceModal
  users/                # UserCard, UserModal
  layout/               # BottomNav, DesktopSidebar, nav-items.ts
  ui/                   # Переиспользуемые UI (shadcn + кастом)
    base-card.tsx
    crud-modal.tsx
    crud-page-layout.tsx
    data-state-container.tsx
    modal-sheet.tsx
    page-header.tsx
    confirm-delete-dialog.tsx
    error-modal.tsx
    phone-input.tsx
    SearchablePicker.tsx
    DateFilterPicker.tsx
    PullToRefreshIndicator.tsx
    ...и прочие shadcn-компоненты

hooks/
  useCrudPage.ts        # CRUD-логика для страниц
  usePullToRefresh.ts   # Pull-to-refresh жест
  useMountedRef.ts      # Защита setState после размонтирования
  useBodyScrollLock.ts  # Блокировка фонового скролла при открытой модалке
  useBreakpoint.ts      # Определение десктоп/мобильная ширина
  useSidebarCollapsed.ts # Состояние свёрнутости DesktopSidebar
  useBookingData.ts     # Загрузка данных для календаря
  useCalendarNavigation.ts # Навигация по неделям/месяцам

lib/
  api.ts                # API-клиент (axios) + все API-объекты (*Api)
  auth-context.tsx      # AuthContext, AuthProvider, useAuth
  settings-context.tsx  # SettingsContext, SettingsProvider, useSettings
  dates.ts              # Утилиты дат (русская локализация)
  utils.ts              # cn(), parseNumber(), formatPhone()

types/
  index.ts              # Все TypeScript-интерфейсы проекта

public/                 # Статические файлы (favicon, PWA-иконки)
scripts/
  generate-icons.mjs    # Генерация иконок из favicon.ico через sharp

PROD/                   # Конфиги продакшена (nginx-kv-next.conf, .env.production, httpd.conf)
PROD2/                  # Docker-деплой (Dockerfile, nginx.conf, deploy.bat, reload-nginx.bat)
docs/
  crud-patterns.md      # Руководство по абстракциям useCrudPage, CrudModal, BaseCard
  AUDIT-2026-03-31.md   # Аудит кода (критические проблемы, рекомендации)
```

---

## 4. Стек и зависимости

### Production
- `next` 16.1.6 (App Router, `output: "standalone"`)
- `react` 19.2.3, `react-dom` 19.2.3
- `axios` 1.13.6 (HTTP-клиент)
- `tailwindcss` 4 + `@tailwindcss/postcss` (CSS-фреймворк, конфигурация в CSS)
- `tw-animate-css` (анимации)
- `clsx` + `tailwind-merge` (условные классы)
- `class-variance-authority` (варианты компонентов)
- `motion` 12.38.0 (Framer Motion)
- `@phosphor-icons/react` 2.1.10 (основные иконки приложения)
- `lucide-react` (иконки для shadcn/ui)
- `date-fns` 4.1.0 (даты)
- `react-day-picker` 9.14.0 + `react-datepicker` 9.1.0 (календари)
- `@radix-ui/react-popover`, `@radix-ui/react-slot` (примитивы)

### Dev
- `typescript` 5 (strict mode)
- `@biomejs/biome` 2.4.7 (основной линтер и форматтер)
- `shadcn` 4.0.8 (CLI для компонентов)
- `@types/node`, `@types/react`, `@types/react-dom`

**Важно**: ESLint-конфиг (`eslint.config.mjs`) присутствует для совместимости с Next.js (`eslint-config-next`), но в повседневной разработке и CI используется **только Biome**. Prettier не используется.

---

## 5. Code Style

### Язык и локализация
- Весь UI на **русском** (метки, сообщения об ошибках, placeholder'ы).
- Комментарии в коде могут быть на русском или английском.

### Импорты
- Использовать `@/*` path aliases, не относительные пути (`../`) за исключением непосредственных соседей.
- Группировка: React/Next → сторонние библиотеки → `@/` алиасы → относительные.

### Иконки
- **Phosphor Icons** с суффиксом `Icon`: `UsersIcon`, `PhoneIcon`, `GearIcon`.
- Без суффикса (`Users`, `Phone`, `Gear`) — устаревшие, не использовать.

### Именование
- Компоненты: `PascalCase` (`BookingModal`, `HousePicker`)
- Хуки: `camelCase` с префиксом `use` (`useCrudPage`, `useMountedRef`)
- Типы/интерфейсы: `PascalCase` (`Booking`, `AppSettings`)
- API-объекты: `camelCase` с суффиксом `Api` (`bookingsApi`, `housesApi`)
- CSS-переменные: `--accent`, `--accent-hover`, `--accent-light`, `--danger`, `--danger-light`

### Форматирование (Biome)
- `indentStyle`: `tab`
- `indentWidth`: 2 (справочно, при табах не применяется)
- Точки с запятой обязательны, trailing commas — включены (рекомендованные правила Biome).
- Запускать `npm run format` перед коммитом и после массовых правок.

### Типы
- `strict: true` в tsconfig — не использовать `any` без крайней необходимости.
- Предпочитать `T | null` и `T | undefined` вместо опциональных `?` для явного состояния.
- **Modal tri-state**: `undefined` = закрыта, `null` = создание новой, `T` = редактирование существующей.

### Обработка ошибок
- Все API-ошибки приходят как plain `Error` (не `AxiosError`). Ловить через `err instanceof Error`, читать `err.message`.
- API-интерсептор автоматически бросает на `success === false` или HTTP-ошибки.
- Внутри модалок использовать `ErrorModal` для отображения ошибок.
- Использовать `useMountedRef()` для защиты `setState` после async-операций в модалках.

---

## 6. Архитектура приложения

### Адаптивный дизайн
- **Mobile-first**: основной контейнер `max-w-md`, нижняя навигация (`BottomNav`), свайпы.
- **Desktop** (`lg:` breakpoint): левый сайдбар (`DesktopSidebar`) с collapsible состоянием (64px / 220px), нижняя навигация скрыта.
- Страницы календаря и отчётов используют `data-page="fullwidth"` для развёртывания на всю ширину на десктопе.

### Аутентификация
- `AppShell` управляет тремя экранами: `SplashScreen` → `LoginScreen` → приложение.
- `AuthContext` предоставляет `currentUser`, `currentRole`, `logout()`.
- Авторизация через `localStorage` (`userId`) + заголовок `X-User-Id` в каждом запросе.
- При входе: `/auth-login` → `/auth-me` → `/roles` → переход в приложение.
- При logout очищается localStorage и состояние контекста.

### Настройки
- `SettingsProvider` оборачивает всё приложение.
- `AppSettings`: `companyName`, `showBookingCardPrice`.
- Название компании подгружается динамически в `generateMetadata()` и Web App Manifest.

### Ролевая модель
- `Role` содержит булевы флаги: `canAccessReports`, `canManageUsers`, `canManageHouses`, `canManageClients`, `canManageEquipment`, `canManageRentals`, `canManageServices`, `canManageSettings`.
- `currentRole` управляет видимостью пунктов `BottomNav` и меню в `/more`.
- `NAV_ITEMS` в `components/layout/nav-items.ts` — единый источник истины для навигации.

### API-слой
- Базовый URL: `NEXT_PUBLIC_API_URL` (dev: `http://localhost/a-KV/hs/bots/api`, prod: `/api`)
- Axios-интерсепторы: добавляют `X-User-Id`, проверяют `success === false`.
- API-объекты группированы по доменам: `bookingsApi`, `housesApi`, `clientsApi`, `equipmentApi`, `servicesApi`, `equipmentRentalsApi`, `usersApi`, `rolesApi`, `authApi`, `reportsApi`, `settingsApi`.
- ID кодируются через `encodeURIComponent()` в URL.

---

## 7. Компонентные паттерны

### Модалки
- **Всегда** использовать `ModalSheet` (не raw `fixed inset-0`).
- `ModalSheet` предоставляет: свайп для закрытия, drag handle, body scroll lock (`useBodyScrollLock`), анимации через Framer Motion.
- На мобильном — bottom sheet, на десктопе — центрированный модал.
- Для простых CRUD-модалок: `CrudModal` с render-функцией `children({ form, setForm, saving })`.
- Для сложных модалок (`BookingModal`, `UserModal`): использовать `ModalSheet` напрямую.
- Удаление: `ConfirmDeleteDialog` с пропом `open` (всегда рендерится, переключается видимость).

### CRUD-страницы
- Использовать `useCrudPage<T>()` + `CrudPageLayout`.
- `CrudPageLayout` принимает `header` как отдельный проп (не внутри `children`).
- Страница типично содержит: `PageHeader`, `DataStateContainer`, список карточек (`BaseCard`), модалку.
- `useCrudPage` поддерживает опциональные `createItem`/`updateItem`/`deleteItem`, а также `prependNew` для вставки новых элементов в начало списка.
- Примеры: `app/houses/page.tsx`, `app/more/equipment/page.tsx`.

### Списки
- Оборачивать в `DataStateContainer` для состояний loading / error / empty.
- Карточки использовать через `BaseCard` для единого стиля.

### Pull-to-Refresh
- Использовать `usePullToRefresh(callback, containerRef)`.
- `containerRef` — на внешний wrapper (не на скроллируемый внутренний div).
- Индикатор размещается между sticky header и контентом. Автоматически в `CrudPageLayout`.

---

## 8. Конвенции данных

### Денормализация
- Всегда устанавливать оба поля: `houseId` + `houseName`, `managerId` + `managerName`, `clientId` + `clientFirstName`/`clientLastName`.
- Менеджер всегда `currentUser`, никогда не показывается как редактируемое поле.

### Селекторы
- Передавать и `id`, и `name` (см. `HousePicker`, `ClientPicker`).

### Предотвращение двойной загрузки
- Паттерн `fetchedRef` в `useEffect` для предотвращения double fetching в Strict Mode.

---

## 9. Стилизация

- Tailwind CSS v4 с inline `@theme` в `app/globals.css`. Отдельного `tailwind.config.ts` нет.
- Кастомная палитра на OKLCH: `--accent` (зелёный), `--danger` (красный), `--amber` (жёлтый).
- Фон: градиент + радиальный глосс.
- Предпочитать `bg-[var(--accent)]` вместо хардкодных цветов.
- CSS-переменные для теней: `--shadow-soft`, `--shadow-card`, `--shadow-accent`.
- Шрифты: `Nunito` (основной, 400–800), `JetBrains Mono` (моноширинный).

Мобильные фиксы в `globals.css`:
- `font-size: 16px` на input/textarea/select (предотвращает iOS zoom)
- `-webkit-tap-highlight-color: transparent`
- `-webkit-overflow-scrolling: touch`
- `body.modal-open` — блокировка фонового скролла
- `userScalable: false` в viewport

---

## 10. Тестирование

**Тестовый набор отсутствует.** Нет Jest, Vitest, Playwright, Cypress или другого test runner.

Если добавляешь тесты:
- Согласуй выбор инструмента с владельцем проекта.
- Рекомендуемый стек для Next.js: Vitest + React Testing Library (unit), Playwright (e2e).

---

## 11. Деплой и безопасность

### Production-сборка
- `next.config.ts` содержит единственную настройку: `output: "standalone"`.
- `.env.production` задаёт `NEXT_PUBLIC_API_URL=/api`.
- Переменные `NEXT_PUBLIC_*` встраиваются **во время сборки**, не runtime.

### Деплой на Windows Server (основной)
1. Локально: `npm run build`
2. Скопировать на сервер: `.next/`, `public/`, `package.json`, `package-lock.json`, `next.config.ts`, `.env.production`
3. На сервере: `npm install --omit=dev`
4. Переименовать `.env.production` → `.env.local`
5. Запуск через `next start` как Windows Service (NSSM) на порту 3000
6. Nginx проксирует HTTPS → `127.0.0.1:3000`
7. `/api/` → rewrite → Apache/1С на `localhost:80`

Детали см. в `PROD/ИНСТРУКЦИЯ-NEXT.md`.

### Деплой через Docker (альтернативный)
- Multi-stage Dockerfile в `PROD2/Dockerfile` (builder: `node:22-alpine`, runner: `node:18-alpine`).
- `deploy.bat` для обновления контейнера на Windows Server.
- Порт 3000 доступен только с localhost (не снаружи).
- Nginx на хосте проксирует `/` → Docker-контейнер.

Детали см. в `PROD2/ИНСТРУКЦИЯ.md`.

### Безопасность
- Аутентификация по `X-User-Id` заголовку + `localStorage` (не JWT/cookie).
- Нет CSRF-токенов — полагаться на SameSite-политику и HTTPS.
- Пароли передаются в plaintext в `authApi.login(phone, password)` — HTTPS обязателен.
- Все данные хранятся в 1С, фронтенд не хранит чувствительные данные.
- `error.tsx` — глобальный Error Boundary для предотвращения белых экранов.

---

## 12. Проверки перед коммитом

```bash
npm run lint       # должен пройти без ошибок
npm run format     # применить форматирование
npm run build      # сборка не должна падать
```

---

## 13. Полезные ссылки внутри проекта

- `docs/crud-patterns.md` — руководство по абстракциям `useCrudPage`, `CrudModal`, `BaseCard`, `CrudPageLayout`
- `docs/AUDIT-2026-03-31.md` — полный аудит кода (критические проблемы, рекомендации)
- `PROD/ИНСТРУКЦИЯ-NEXT.md` — пошаговая инструкция деплоя на Windows Server
- `PROD2/ИНСТРУКЦИЯ.md` — инструкция Docker-деплоя
