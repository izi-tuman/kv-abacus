# CRUD Patterns — Руководство по абстракциям

Документ описывает новые переиспользуемые абстракции для устранения дублирования в CRUD-страницах, карточках и модалях.

---

## 1. `useCrudPage<T>` hook

**Файл:** `hooks/useCrudPage.ts`

**Проблема:** 6+ страниц (Equipment, Services, Houses, Roles, Users, Clients) дублируют одинаковую логику: загрузка списка, pull-to-refresh, create/update/delete, modal tri-state.

**Интерфейс:**

```ts
interface CrudPageOptions<T extends { id: string }> {
  /** Загрузка списка */
  fetchItems: () => Promise<T[]>
  /** Создание записи */
  createItem: (data: Omit<T, "id">) => Promise<T>
  /** Обновление записи */
  updateItem: (id: string, data: Partial<T>) => Promise<T>
  /** Удаление записи */
  deleteItem: (id: string) => Promise<void>
}

interface CrudPageResult<T extends { id: string }> {
  /** Текущий список */
  items: T[]
  /** Загрузка данных */
  loading: boolean
  /** Ошибка загрузки */
  loadError: boolean
  /** Tri-state модаль: undefined=закрыта, null=создание, T=редактирование */
  modalItem: T | null | undefined
  setModalItem: (item: T | null | undefined) => void
  /** Сохранение (create или update по наличию id) */
  handleSave: (data: Omit<T, "id"> | T) => Promise<void>
  /** Удаление */
  handleDelete: (id: string) => Promise<void>
  /** Обновление списка (pull-to-refresh) */
  handleRefresh: () => Promise<void>
  /** Ref на контейнер для pull-to-refresh */
  containerRef: React.RefObject<HTMLDivElement>
  /** Pull-to-refresh данные */
  pullDistance: number
  isRefreshing: boolean
}
```

**Внутри инкапсулирует:**
- `useState` для items, loading, loadError, modalItem
- `fetchedRef` + `useEffect` для начальной загрузки
- `usePullToRefresh` для обновления свайпом
- `handleSave` — определяет create/update по `"id" in data`
- `handleDelete` — удаляет и фильтрует из списка
- `handleRefresh` — закрывает модаль, перезагружает список

**Использование (до и после):**

### До (124 строки в каждой странице):

```tsx
export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [modalEquipment, setModalEquipment] = useState<Equipment | null | undefined>(undefined)
  const fetchedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleRefresh = useCallback(async () => { /* ... */ }, [])
  const { pullDistance, isRefreshing } = usePullToRefresh(handleRefresh, containerRef)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    equipmentApi.getEquipment()
      .then(setEquipmentList)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(data) { /* create or update */ }
  async function handleDelete(id) { /* delete and filter */ }

  return (/* ... */)
}
```

### После (~40 строк):

```tsx
export default function EquipmentPage() {
  const crud = useCrudPage<Equipment>({
    fetchItems: () => equipmentApi.getEquipment(),
    createItem: (data) => equipmentApi.createEquipment(data),
    updateItem: (id, data) => equipmentApi.updateEquipment(id, data),
    deleteItem: (id) => equipmentApi.deleteEquipment(id),
  })

  return (
    <CrudPageLayout
      containerRef={crud.containerRef}
      pullDistance={crud.pullDistance}
      isRefreshing={crud.isRefreshing}
    >
      <PageHeader title="Снаряжение" subtitle={`${crud.items.length} позиций`} onAdd={() => crud.setModalItem(null)} />
      <DataStateContainer loading={crud.loading} error={crud.loadError ? "..." : null} empty={crud.items.length === 0}>
        {crud.items.map((e) => (
          <BaseCard key={e.id} onClick={() => crud.setModalItem(e)}>
            {/* содержимое карточки */}
          </BaseCard>
        ))}
      </DataStateContainer>
      {crud.modalItem !== undefined && (
        <EquipmentModal equipment={crud.modalItem} onClose={() => crud.setModalItem(undefined)} onSave={crud.handleSave} onDelete={crud.handleDelete} />
      )}
    </CrudPageLayout>
  )
}
```

---

## 2. `BaseCard` компонент

**Файл:** `components/ui/base-card.tsx`

**Проблема:** 5 карточек (EquipmentCard, ServiceCard, HouseCard, UserCard, ClientCard) дублируют одинаковый className кнопки из 170+ символов.

**Интерфейс:**

```tsx
interface BaseCardProps {
  onClick?: () => void
  children: React.ReactNode
  className?: string // дополнительные классы
}
```

**Реализация:**

```tsx
export function BaseCard({ onClick, children, className }: BaseCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left bg-white rounded-2xl px-4 py-3 mb-3 shadow-sm",
        "border border-stone-100 transition-all duration-200 ease-out",
        "hover:shadow-md hover:scale-[1.01] hover:border-[var(--accent)]/20",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 focus-visible:ring-offset-2",
        "active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </button>
  )
}
```

**Использование:**

```tsx
// Было (EquipmentCard — 39 строк)
<button type="button" onClick={...} className="w-full text-left bg-white rounded-2xl px-4 py-3 mb-3 shadow-sm border border-stone-100 transition-all duration-200 ease-out hover:shadow-md hover:scale-[1.01] hover:border-[var(--accent)]/20 ...">
  {/* содержимое */}
</button>

// Стало
<BaseCard onClick={() => onClick(equipment)}>
  {/* содержимое — без изменений */}
</BaseCard>
```

Карточки продолжают существовать как отдельные компоненты (EquipmentCard, HouseCard и т.д.), но используют BaseCard внутри. Содержимое у каждой своё — абстрагируется только обёртка.

---

## 3. `CrudModal` обёртка

**Файл:** `components/ui/crud-modal.tsx`

**Проблема:** 5+ модалей (EquipmentModal, ServiceModal, HouseModal, RoleModal, UserModal) дублируют одинаковую логику: form state, saving, error, confirmDelete, mountedRef, handleSubmit, handleDelete.

**Интерфейс:**

```tsx
interface CrudModalProps<T extends { id: string }> {
  /** null = создание, T = редактирование */
  item: T | null
  /** Начальное состояние формы для создания */
  emptyForm: Omit<T, "id">
  /** Заголовок модали (или функция) */
  title: string | ((isEdit: boolean) => string)
  onClose: () => void
  onSave: (data: Omit<T, "id"> | T) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  /** Текст подтверждения удаления */
  deleteMessage?: string
  /** Рендер-функция для содержимого формы */
  children: (ctx: {
    form: Omit<T, "id">
    setForm: React.Dispatch<React.SetStateAction<Omit<T, "id">>>
    saving: boolean
  }) => React.ReactNode
}
```

**Внутри инкапсулирует:**
- `useState` для form, saving, confirmDelete, error
- `useMountedRef()`
- `useEffect` для сброса формы при смене item
- `handleSubmit` — try/catch, setSaving, onSave, onClose
- `handleDelete` — try/catch, setSaving, onDelete, onClose
- JSX: `ModalSheet` + `ErrorModal` + `ConfirmDeleteDialog` + `<form>` + кнопки Удалить/Сохранить

**Использование (до и после):**

### До (EquipmentModal — 161 строка):

```tsx
export default function EquipmentModal({ equipment, onClose, onSave, onDelete }: Props) {
  const initial = equipment ?? EMPTY
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useMountedRef()

  useEffect(() => { /* reset */ }, [equipment])
  async function handleSubmit(e) { /* try/catch save */ }
  async function handleDelete() { /* try/catch delete */ }

  return (
    <ModalSheet open onClose={onClose} title="...">
      <ErrorModal error={error} onClose={...} />
      {confirmDelete && <ConfirmDeleteDialog ... />}
      <form onSubmit={handleSubmit}>
        {/* поля формы */}
        {/* кнопки */}
      </form>
    </ModalSheet>
  )
}
```

### После (~35 строк):

```tsx
const EMPTY: Omit<Equipment, "id"> = { name: "", description: "", isActive: true }

export default function EquipmentModal({ equipment, onClose, onSave, onDelete }: Props) {
  return (
    <CrudModal
      item={equipment}
      emptyForm={EMPTY}
      title={(isEdit) => isEdit ? "Редактировать снаряжение" : "Новое снаряжение"}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      deleteMessage="Удалить снаряжение?"
    >
      {({ form, setForm }) => (
        <>
          <div>
            <Label className="mb-1 block">Название *</Label>
            <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <Label className="mb-1 block">Описание</Label>
            <Textarea value={form.description ?? ""} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} />
            <span className="text-sm text-stone-700">Активно</span>
          </label>
        </>
      )}
    </CrudModal>
  )
}
```

---

## 4. `CrudPageLayout` компонент

**Файл:** `components/ui/crud-page-layout.tsx`

**Проблема:** Все CRUD-страницы дублируют одинаковую обёртку: `div` с `ref`, `min-h-screen bg-stone-100`, `PullToRefreshIndicator`, sticky header wrapper.

**Интерфейс:**

```tsx
interface CrudPageLayoutProps {
  containerRef: React.RefObject<HTMLDivElement>
  pullDistance: number
  isRefreshing: boolean
  children: React.ReactNode
}
```

**Реализация:**

```tsx
export function CrudPageLayout({ containerRef, pullDistance, isRefreshing, children }: CrudPageLayoutProps) {
  return (
    <div ref={containerRef} className="relative min-h-screen bg-stone-100 flex flex-col">
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      {children}
    </div>
  )
}
```

---

## 5. Координатор модалей для BookingCalendar

**Файл:** `components/booking-calendar/index.tsx` (рефакторинг)

**Проблема:** BookingModal (521 строк) сам управляет открытием ClientModal и HouseModal — нарушает разделение ответственности.

**Новая архитектура:**

```
index.tsx (координатор)
│
├── State:
│   ├── modalBooking: Booking | null | undefined
│   ├── modalClient: Client | null | undefined   ← НОВОЕ
│   └── modalHouse: House | null | undefined      ← НОВОЕ
│
├── BookingModal
│   ├── onRequestCreateClient() → координатор открывает ClientModal(null)
│   ├── onRequestEditClient(id) → координатор открывает ClientModal(client)
│   ├── onRequestCreateHouse() → координатор открывает HouseModal(null)
│   └── onRequestEditHouse(id) → координатор открывает HouseModal(house)
│
├── ClientModal (открывается координатором)
│   └── onSave → возвращает клиента координатору → координатор передаёт в BookingModal
│
└── HouseModal (открывается координатором)
    └── onSave → возвращает дом координатору → координатор передаёт в BookingModal
```

**BookingModal теряет:**
- State и логику для ClientModal/HouseModal
- ~100-150 строк кода

**BookingModal получает новые props:**
- `onRequestCreateClient: () => void`
- `onRequestEditClient: (id: string) => void`
- `onRequestCreateHouse: () => void`
- `onRequestEditHouse: (id: string) => void`

---

## 6. Декомпозиция HistoryPage

**Файл:** `app/more/history/page.tsx` (440 строк → 3 файла)

**Новая структура:**

```
app/more/history/
├── page.tsx           — координатор (state, fetch, модали)
components/history/
├── HistoryFilters.tsx  — блок фильтров (дата, дом, менеджер, статус, поиск)
├── HistoryCard.tsx     — карточка записи истории (уже существует)
└── HistoryList.tsx     — список с DataStateContainer
```

---

## 7. `AdaptiveContainer` компонент

**Файл:** `components/layout/adaptive-container.tsx`

**Проблема:** `app/layout.tsx` жёстко задавал `max-w-md mx-auto`, и страницы расширяли ширину через неявный хак `data-page="fullwidth"`.

**Интерфейс:**

```tsx
interface AdaptiveContainerProps {
  children: React.ReactNode
  fullWidth?: boolean
  className?: string
}
```

**Поведение:**
- `fullWidth=false` (по умолчанию): `max-w-md` на мобильном, `lg:max-w-5xl` на десктопе, центрирование `mx-auto`.
- `fullWidth=true`: на десктопе растягивается на всю ширину (`lg:max-w-none`).

**Использование:**
- Внутри `CrudPageLayout` — автоматически.
- На кастомных страницах (`reports`, `settings`, `more`) — импортировать явно.

---

## 8. Desktop-раскладка в `CrudPageLayout`

**Файл:** `components/ui/crud-page-layout.tsx`

**Новые пропсы:**

```tsx
interface CrudPageLayoutProps {
  // ... существующие пропсы
  fullWidth?: boolean
  layout?: "cards" | "table"
}
```

**Поведение:**
- `layout="cards"`: children оборачиваются в `<div className="responsive-grid">` (1 колонка мобайл, 2 на `md/lg`, 3 на `xl`).
- `layout="table"` или `undefined`: children рендерятся как есть (для табличных страниц, например `rental`).
- `fullWidth`: передаётся в `AdaptiveContainer`.

**Использование:**

```tsx
<CrudPageLayout layout="cards" ...>
  {items.map(item => <BaseCard key={item.id} ... />)}
</CrudPageLayout>
```

---

## 9. Barrel-export `components/ui/index.ts`

**Файл:** `components/ui/index.ts`

Единая точка входа для всех UI-компонентов:

```tsx
export { BaseCard } from "./base-card"
export { CrudModal } from "./crud-modal"
export { CrudPageLayout } from "./crud-page-layout"
export { DataStateContainer, Spinner } from "./data-state-container"
// ... и т.д.
```

---

## Порядок миграции (инкрементальный)

Каждый шаг — отдельный коммит, приложение остаётся рабочим.

| Шаг | Что делаем | Файлы |
|-----|-----------|-------|
| 1 | Создать `useCrudPage`, `BaseCard`, `CrudModal`, `CrudPageLayout` | 4 новых файла |
| 2 | Мигрировать EquipmentPage (самая простая) | 3 файла |
| 3 | Мигрировать ServicesPage, HousesPage | 4 файла |
| 4 | Мигрировать RolesPage, UsersPage | 4 файла |
| 5 | Мигрировать ClientsPage (с поиском/пагинацией) | 2 файла |
| 6 | Рефакторинг BookingModal — координатор модалей | 2 файла |
| 7 | Декомпозиция HistoryPage | 3 файла |
