# Splash & Login Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить анимированный splash screen на дизайн из хэндоффа (статичный логотип + пульсирующие точки) и обновить визуал формы логина.

**Architecture:** `SplashScreen.tsx` переписывается полностью без `HouseDrawingAnimation`. `LoginScreen.tsx` получает только визуальные правки — логика авторизации не трогается. `AppShell.tsx` уменьшает `SPLASH_MIN_MS` до 2000ms. `HouseDrawingAnimation.tsx` и связанные CSS-анимации удаляются.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Phosphor Icons, CSS-переменные дизайн-системы проекта.

---

### Task 1: Переписать SplashScreen

**Files:**
- Modify: `components/auth/SplashScreen.tsx`

- [ ] **Заменить содержимое файла:**

```tsx
"use client";
import { HouseIcon } from "@phosphor-icons/react";
import { useSettings } from "@/lib/settings-context";

export default function SplashScreen() {
	const { settings } = useSettings();
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(circle_at_top,_var(--accent-light),_transparent_32rem),linear-gradient(180deg,var(--background),oklch(0.955_0.014_82))]">
			<div className="w-20 h-20 rounded-[24px] bg-[var(--accent)] flex items-center justify-center shadow-[0_12px_32px_-8px_oklch(0.44_0.095_151/0.6)] mb-5">
				<HouseIcon size={40} weight="fill" color="white" />
			</div>
			<div className="text-[22px] font-black text-[var(--foreground)] tracking-tight mb-1.5">
				{settings.companyName}
			</div>
			<div className="text-[13px] font-medium text-[var(--muted-foreground)]">
				Система управления объектами
			</div>
			<div className="flex gap-1.5 mt-8">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"
						style={{ animationDelay: `${i * 0.2}s` }}
					/>
				))}
			</div>
		</div>
	);
}
```

- [ ] **Проверить визуально:** запустить `npm run dev`, открыть приложение — должен показаться логотип-квадрат с иконкой дома, название компании и три пульсирующие точки.

- [ ] **Commit:**
```bash
git add components/auth/SplashScreen.tsx
git commit -m "feat: replace drawing animation splash with static logo + pulse dots"
```

---

### Task 2: Уменьшить длительность splash в AppShell

**Files:**
- Modify: `components/auth/AppShell.tsx`

- [ ] **Изменить константу `SPLASH_MIN_MS`** (строка ~9):

```ts
// было:
const SPLASH_MIN_MS = 3500;

// стало:
const SPLASH_MIN_MS = 2000;
```

- [ ] **Commit:**
```bash
git add components/auth/AppShell.tsx
git commit -m "feat: reduce splash duration to 2000ms"
```

---

### Task 3: Обновить визуал LoginScreen

**Files:**
- Modify: `components/auth/LoginScreen.tsx`

- [ ] **Заменить содержимое файла:**

```tsx
"use client";
import { HouseIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { authApi } from "@/lib/api";
import { useSettings } from "@/lib/settings-context";
import type { User } from "@/types";

interface Props {
	onSuccess: (user: User) => void;
}

export default function LoginScreen({ onSuccess }: Props) {
	const { settings } = useSettings();
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const result = await authApi.login(phone, password);
			if (result.success && result.user) {
				onSuccess(result.user);
			} else {
				setError(result.error ?? "Неверный телефон или пароль");
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Ошибка соединения с сервером",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_top,_var(--accent-light),_transparent_32rem),linear-gradient(180deg,var(--background),oklch(0.955_0.014_82))] px-6">
			<form onSubmit={handleSubmit} className="w-full max-w-[340px]">
				{/* Logo */}
				<div className="text-center mb-10">
					<div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[22px] bg-[var(--accent)] text-white shadow-[0_12px_32px_-8px_oklch(0.44_0.095_151/0.55)] mb-4">
						<HouseIcon size={32} weight="fill" />
					</div>
					<h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
						{settings.companyName}
					</h1>
					<p className="text-[13px] text-[var(--muted-foreground)] font-medium mt-1">
						Система управления объектами глэмпинга
					</p>
				</div>

				{error && (
					<div className="bg-[var(--danger-light)] border border-[var(--danger)]/15 text-[var(--danger)] rounded-xl px-4 py-3 text-[15px] font-semibold mb-5">
						⚠ {error}
					</div>
				)}

				<div className="space-y-3.5">
					<div>
						<label className="text-sm font-semibold text-[var(--foreground)] mb-1.5 block tracking-wide">
							Телефон
						</label>
						<PhoneInput value={phone} onChange={setPhone} required />
					</div>

					<div>
						<label className="text-sm font-semibold text-[var(--foreground)] mb-1.5 block tracking-wide">
							Пароль
						</label>
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							placeholder="••••••••"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full h-[50px] text-sm font-extrabold text-white bg-[var(--accent)] rounded-[14px] shadow-[0_6px_20px_-6px_oklch(0.44_0.095_151/0.6)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 active:scale-[0.98] mt-1"
					>
						{loading ? "Вхожу..." : "Войти в систему"}
					</button>
				</div>
			</form>
		</div>
	);
}
```

- [ ] **Проверить визуально:** выйти из системы → должна открыться форма с квадратным логотипом 72px, названием компании жирным шрифтом, подписью "Система управления объектами глэмпинга", кнопкой "Войти в систему".

- [ ] **Commit:**
```bash
git add components/auth/LoginScreen.tsx
git commit -m "feat: update login screen visual to match handoff design"
```

---

### Task 4: Удалить HouseDrawingAnimation

**Files:**
- Delete: `components/HouseDrawingAnimation.tsx`
- Modify: `app/globals.css`

- [ ] **Удалить файл компонента:**
```bash
git rm components/HouseDrawingAnimation.tsx
```

- [ ] **Удалить CSS-анимации из `app/globals.css`** — найти и удалить блок от комментария `/* ── HouseDrawingAnimation ──` до конца анимаций (классы `.house-main-path`, `.house-door-path`, `.house-window-path`, `.house-window2-path`, `.house-brand-text` и кейфреймы `house-draw`, `house-draw-delayed`, `house-fade-in`).

  Также удалить из блока `@media (prefers-reduced-motion: reduce)` строки:
  ```css
  .house-main-path,
  .house-door-path,
  .house-window-path,
  .house-window2-path,
  .house-brand-text {
    animation: none;
    stroke-dashoffset: 0;
    opacity: 1;
  }
  ```

- [ ] **Проверить сборку:**
```bash
npm run build
```
Ожидается: успешная сборка без ошибок о `HouseDrawingAnimation`.

- [ ] **Commit:**
```bash
git add app/globals.css
git commit -m "chore: remove HouseDrawingAnimation component and CSS keyframes"
```
