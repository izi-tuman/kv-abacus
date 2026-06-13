// Форма создания/редактирования клиента.
// Адаптивна: на десктопе имя/фамилия в одну строку, кнопки выравниваются вправо.
"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/data-state-container";
import { ErrorModal } from "@/components/ui/error-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { useMountedRef } from "@/hooks/useMountedRef";
import type { Client } from "@/types";

const EMPTY: Omit<Client, "id" | "totalBookings" | "createdAt"> = {
	firstName: "",
	lastName: "",
	phone: "",
	email: "",
	notes: "",
	isBlacklisted: false,
};

interface ClientEditFormProps {
	client: Client | null;
	onSave: (
		client: Omit<Client, "id" | "totalBookings" | "createdAt"> | Client,
	) => Promise<void>;
	onCancel: () => void;
}

export default function ClientEditForm({
	client,
	onSave,
	onCancel,
}: ClientEditFormProps) {
	const [form, setForm] = useState(client ?? EMPTY);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const mountedRef = useMountedRef();

	useEffect(() => {
		setForm(client ?? EMPTY);
		setError(null);
	}, [client]);

	function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		try {
			await onSave(client ? { ...form, id: client.id } : form);
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
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
						<Label className="mb-1 block">Фамилия</Label>
						<Input
							value={form.lastName ?? ""}
							onChange={(e) => set("lastName", e.target.value)}
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
					<Label className="mb-1 block">Email</Label>
					<Input
						type="email"
						value={form.email ?? ""}
						onChange={(e) => set("email", e.target.value)}
						placeholder="example@mail.ru"
						pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
					/>
				</div>

				<div>
					<Label className="mb-1 block">Заметки</Label>
					<Textarea
						value={form.notes ?? ""}
						onChange={(e) => set("notes", e.target.value)}
						rows={2}
						placeholder="Любые заметки о клиенте..."
					/>
				</div>

				<div className="flex items-center gap-2">
					<Checkbox
						checked={form.isBlacklisted ?? false}
						onChange={(e) => set("isBlacklisted", e.target.checked)}
					/>
					<span className="text-sm text-[var(--foreground)]">
						В чёрном списке
					</span>
				</div>

				<div className="flex gap-2 pt-1 pb-2 lg:justify-end">
					<Button
						type="button"
						variant="secondary"
						className="flex-1 lg:flex-none lg:px-6"
						onClick={onCancel}
						aria-label="Отменить редактирование клиента"
					>
						Отмена
					</Button>
					<Button
						type="submit"
						disabled={saving}
						className="flex-1 lg:flex-none lg:px-8"
						aria-label="Сохранить изменения клиента"
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
