// Форма создания/редактирования пользователя (сотрудника).
// Адаптивна: на десктопе поля раскладываются в сетку, превью аватара — горизонтально.
"use client";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/data-state-container";
import { ErrorModal } from "@/components/ui/error-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { useMountedRef } from "@/hooks/useMountedRef";
import type { Role, User } from "@/types";

export interface UserFormData extends Omit<User, "id"> {
	password?: string;
}

const EMPTY: Omit<User, "id"> = {
	firstName: "",
	lastName: "",
	phone: "",
	roleId: "",
	roleName: "",
	isActive: true,
};

interface UserEditFormProps {
	user: User | null;
	roles: Role[];
	onSave: (user: UserFormData & { id?: string }) => Promise<void>;
	onCancel: () => void;
}

export default function UserEditForm({
	user,
	roles,
	onSave,
	onCancel,
}: UserEditFormProps) {
	const [form, setForm] = useState<Omit<User, "id">>(user ?? EMPTY);
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const mountedRef = useMountedRef();
	const isEdit = user !== null;

	useEffect(() => {
		setForm(user ?? EMPTY);
		setPassword("");
		setError(null);
	}, [user]);

	function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	function handleRoleChange(roleId: string) {
		const role = roles.find((r) => r.id === roleId);
		setForm((prev) => ({ ...prev, roleId, roleName: role?.name ?? "" }));
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		try {
			const data: UserFormData & { id?: string } = user
				? { ...form, id: user.id }
				: { ...form };
			if (password) data.password = password;
			await onSave(data);
			if (mountedRef.current) setSaving(false);
			onCancel();
		} catch (err) {
			if (mountedRef.current) {
				setError(err instanceof Error ? err.message : "Ошибка при сохранении");
				setSaving(false);
			}
		}
	}

	return (
		<>
			<div role="status" aria-live="assertive" aria-atomic="true">
				<ErrorModal error={error} onClose={() => setError(null)} />
			</div>
			<form
				onSubmit={handleSubmit}
				className="px-4 lg:px-6 py-3 flex flex-col gap-2.5"
			>
				{/* Live avatar preview */}
				<div
					className="lg:flex-row flex flex-col items-center gap-3.5 p-3.5 rounded-[14px] mb-1"
					style={{
						background:
							"linear-gradient(135deg, var(--accent), oklch(0.36 0.085 151))",
						color: "white",
					}}
				>
					<div
						className="shrink-0 flex items-center justify-center text-[20px] font-black"
						style={{
							width: 52,
							height: 52,
							borderRadius: "50%",
							background: "rgba(255,255,255,0.25)",
							backdropFilter: "blur(8px)",
						}}
					>
						{(form.firstName?.[0] ?? "") + (form.lastName?.[0] ?? "") || "?"}
					</div>
					<div className="flex-1 min-w-0 text-center lg:text-left">
						<div className="text-base font-black tracking-tight leading-tight">
							{[form.firstName, form.lastName].filter(Boolean).join(" ") ||
								"Новый пользователь"}
						</div>
						<div className="text-xs font-medium mt-0.5 opacity-85">
							{form.roleId
								? (roles.find((r) => r.id === form.roleId)?.name ??
									"Роль не выбрана")
								: "Роль не выбрана"}
						</div>
					</div>
					<div
						className="shrink-0 text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-[20px]"
						style={{
							background: form.isActive
								? "rgba(255,255,255,0.25)"
								: "rgba(0,0,0,0.2)",
						}}
					>
						{form.isActive ? "Активен" : "Неактивен"}
					</div>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div className="min-w-0">
						<Label className="mb-1 block">
							Имя <span className="text-[var(--danger)]">*</span>
						</Label>
						<Input
							value={form.firstName}
							onChange={(e) => set("firstName", e.target.value)}
							required
							placeholder="Имя"
						/>
					</div>
					<div className="min-w-0">
						<Label className="mb-1 block">
							Фамилия <span className="text-[var(--danger)]">*</span>
						</Label>
						<Input
							value={form.lastName}
							onChange={(e) => set("lastName", e.target.value)}
							required
							placeholder="Фамилия"
						/>
					</div>
				</div>

				<div>
					<Label className="mb-1 block">
						Телефон <span className="text-[var(--danger)]">*</span>
					</Label>
					<PhoneInput
						value={form.phone}
						onChange={(v) => set("phone", v)}
						required
					/>
				</div>

				<div>
					<Label className="mb-1 block">
						{isEdit ? (
							"Новый пароль"
						) : (
							<>
								Пароль <span className="text-[var(--danger)]">*</span>
							</>
						)}
					</Label>
					<div className="relative">
						<Input
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required={!isEdit}
							placeholder={
								isEdit ? "Оставьте пустым, чтобы не менять" : "Введите пароль"
							}
							className="pr-10"
						/>
						<button
							type="button"
							onClick={() => setShowPassword((v) => !v)}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
						>
							{showPassword ? (
								<EyeSlash size={18} weight="regular" aria-hidden="true" />
							) : (
								<Eye size={18} weight="regular" aria-hidden="true" />
							)}
						</button>
					</div>
				</div>

				<div>
					<Label className="mb-1 block">
						Должность <span className="text-[var(--danger)]">*</span>
					</Label>
					<select
						value={form.roleId}
						onChange={(e) => handleRoleChange(e.target.value)}
						required
						className="w-full h-11 border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] bg-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all duration-200 hover:border-[var(--accent)]/40"
					>
						<option value="">Выберите должность</option>
						{roles.map((r) => (
							<option key={r.id} value={r.id}>
								{r.name}
							</option>
						))}
					</select>
				</div>

				<label className="flex items-center gap-2 cursor-pointer">
					<Checkbox
						checked={form.isActive}
						onChange={(e) => set("isActive", e.target.checked)}
					/>
					<span className="text-sm text-[var(--foreground)]">Активен</span>
				</label>

				{/* Permissions preview */}
				{form.roleId &&
					(() => {
						const selectedRole = roles.find((r) => r.id === form.roleId);
						if (!selectedRole) return null;
						const perms: Array<{ label: string; has: boolean }> = [
							{ label: "Бронирования", has: true },
							{ label: "Клиенты", has: !!selectedRole.canManageClients },
							{ label: "Прокат", has: !!selectedRole.canManageRentals },
							{ label: "Отчёты", has: !!selectedRole.canAccessReports },
							{ label: "Настройки", has: !!selectedRole.canManageSettings },
						];
						return (
							<div
								className="p-3 rounded-xl border"
								style={{
									background: "var(--muted)",
									borderColor: "var(--border)",
								}}
							>
								<div
									className="text-[11px] font-extrabold uppercase tracking-widest mb-2"
									style={{ color: "var(--muted-foreground)" }}
								>
									Права доступа · {selectedRole.name}
								</div>
								<div className="flex flex-wrap gap-1.5">
									{perms.map((p) => (
										<span
											key={p.label}
											className="text-[11px] font-bold px-2 py-0.5 rounded-[20px] inline-flex items-center gap-1"
											style={{
												background: p.has
													? "var(--accent-light)"
													: "oklch(0.93 0.008 80)",
												color: p.has ? "var(--accent)" : "oklch(0.55 0.012 64)",
											}}
										>
											<span>{p.has ? "✓" : "✕"}</span>
											{p.label}
										</span>
									))}
								</div>
							</div>
						);
					})()}

				<div className="flex gap-2 pt-1 pb-2 lg:justify-end">
					<Button
						type="button"
						variant="secondary"
						className="flex-1 lg:flex-none lg:px-6"
						onClick={onCancel}
						aria-label="Отменить редактирование пользователя"
					>
						Отмена
					</Button>
					<Button
						type="submit"
						disabled={saving}
						className="flex-1 lg:flex-none lg:px-8"
						aria-label="Сохранить изменения пользователя"
					>
						{saving ? (
							<span className="flex items-center gap-2 text-white">
								<Spinner className="size-4 text-current" />
								Сохраняю...
							</span>
						) : (
							"Сохранить"
						)}
					</Button>
				</div>
			</form>
		</>
	);
}
