// Форма создания/редактирования бронирования внутри модалки.
// Адаптивна: на десктопе поля раскладываются в сетку для лучшего использования пространства.
"use client";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import BookingDateRangePicker from "@/components/shadcn-space/date-picker/date-picker-02";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/data-state-container";
import { ErrorModal } from "@/components/ui/error-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMountedRef } from "@/hooks/useMountedRef";
import { useAuth } from "@/lib/auth-context";
import { addDays, toDateString } from "@/lib/dates";
import { parseNumber } from "@/lib/utils";
import type { Booking, Client, House, Service } from "@/types";
import ClientPicker from "./ClientPicker";
import HousePicker from "./HousePicker";

interface BookingEditFormProps {
	booking: Booking | null;
	houses: House[];
	clients: Client[];
	services: Service[];
	defaultDate?: string;
	defaultEndDate?: string;
	preselectedClient?: Client | null;
	preselectedHouseId?: string;
	onSave: (booking: Omit<Booking, "id"> | Booking) => Promise<void>;
	onCancel: () => void;
	onDelete?: () => void;
	deleting?: boolean;
	onOpenClient: (client: Client) => void;
	onCreateClient: () => void;
	onOpenHouse: (house: House) => void;
	onCreateHouse: () => void;
}

const EMPTY: Omit<Booking, "id"> = {
	houseId: "",
	clientId: "",
	clientFirstName: "",
	clientLastName: "",
	clientPhone: "",
	checkIn: "",
	checkOut: "",
	guestsCount: 1,
	managerId: "",
	services: [],
	status: "active",
	totalPrice: 0,
	prepayment: 0,
	comment: "",
};

/**
 * Начальное состояние формы для нового бронирования.
 * checkOut берётся из defaultEndDate (выбранный в шахматке диапазон), иначе — checkIn + 1 ночь.
 * Экспортируется для модульного теста (см. BookingEditForm.test.ts).
 */
export function initialForm(
	defaultDate?: string,
	defaultEndDate?: string,
): Omit<Booking, "id"> {
	if (!defaultDate) return EMPTY;
	const checkOut =
		defaultEndDate && defaultEndDate > defaultDate
			? defaultEndDate
			: toDateString(addDays(new Date(defaultDate), 1));
	return { ...EMPTY, checkIn: defaultDate, checkOut };
}

function ServiceSearch({
	services,
	selectedIds,
	onSelect,
}: {
	services: Service[];
	selectedIds: string[];
	onSelect: (s: { id: string; name: string }) => void;
}) {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const available = services.filter(
		(s) =>
			s.isActive &&
			!selectedIds.includes(s.id) &&
			s.name.toLowerCase().includes(query.toLowerCase()),
	);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={containerRef} className="relative">
			<MagnifyingGlassIcon
				size={13}
				weight="regular"
				className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] z-[1]"
				aria-hidden="true"
			/>
			<Input
				type="text"
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				placeholder="Поиск услуги..."
				className="pl-8"
			/>
			{open && available.length > 0 && (
				<div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-[var(--border)] rounded-lg shadow-lg overflow-y-auto max-h-48">
					{available.map((s) => (
						<button
							key={s.id}
							type="button"
							onMouseDown={() => {
								onSelect(s);
								setQuery("");
							}}
							className="w-full text-left px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)] border-b border-[var(--border)] last:border-0 transition-colors duration-150"
						>
							{s.name}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default function BookingEditForm({
	booking,
	houses,
	clients,
	services,
	defaultDate,
	defaultEndDate,
	preselectedClient,
	preselectedHouseId,
	onSave,
	onCancel,
	onDelete,
	deleting,
	onOpenClient,
	onCreateClient,
	onOpenHouse,
	onCreateHouse,
}: BookingEditFormProps) {
	const [form, setForm] = useState<Omit<Booking, "id">>(
		() => booking ?? initialForm(defaultDate, defaultEndDate),
	);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const mountedRef = useMountedRef();
	const { currentUser } = useAuth();

	useEffect(() => {
		setForm(booking ?? initialForm(defaultDate, defaultEndDate));
		setError(null);
	}, [booking, defaultDate, defaultEndDate]);

	useEffect(() => {
		if (preselectedClient) {
			setForm((prev) => ({
				...prev,
				clientId: preselectedClient.id,
				clientFirstName: preselectedClient.firstName,
				clientLastName: preselectedClient.lastName ?? "",
				clientPhone: preselectedClient.phone,
			}));
		}
	}, [preselectedClient]);

	useEffect(() => {
		if (preselectedHouseId) {
			const house = houses.find((h) => h.id === preselectedHouseId);
			setForm((prev) => ({
				...prev,
				houseId: preselectedHouseId,
				houseName: house?.name ?? "",
			}));
		}
	}, [preselectedHouseId, houses]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only once on mount
	useEffect(() => {
		if (!booking && currentUser && !form.managerId) {
			setForm((prev) => ({ ...prev, managerId: currentUser.id }));
		}
	}, []);

	function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	function toggleService(service: { id: string; name: string }) {
		const exists = form.services.some((s) => s.id === service.id);
		set(
			"services",
			exists
				? form.services.filter((s) => s.id !== service.id)
				: [...form.services, service],
		);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!form.houseId) {
			setError("Выберите дом");
			return;
		}
		if (!form.clientId) {
			setError("Выберите клиента");
			return;
		}
		if (!form.checkIn) {
			setError("Укажите дату заезда");
			return;
		}
		if (!form.checkOut) {
			setError("Укажите дату выезда");
			return;
		}
		if (form.checkOut <= form.checkIn) {
			setError("Дата выезда должна быть позже даты заезда");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			await onSave(booking ? { ...form, id: booking.id } : form);
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
				{/* Дом + Клиент — на десктопе в одну строку */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
					<HousePicker
						value={form.houseId}
						houses={houses}
						onChange={(houseId, houseName) => {
							set("houseId", houseId);
							set("houseName", houseName);
						}}
						onOpenHouse={onOpenHouse}
						onCreateHouse={onCreateHouse}
					/>

					<ClientPicker
						value={{
							clientId: form.clientId,
							clientFirstName: form.clientFirstName,
							clientLastName: form.clientLastName,
							clientPhone: form.clientPhone,
						}}
						clients={clients}
						onChange={(v) => setForm((prev) => ({ ...prev, ...v }))}
						onOpenClient={onOpenClient}
						onCreateClient={onCreateClient}
					/>
				</div>

				{/* Даты */}
				<div>
					<Label className="mb-1 block">
						Даты <span className="text-(--danger)">*</span>
					</Label>
					<BookingDateRangePicker
						checkIn={form.checkIn}
						checkOut={form.checkOut}
						onChange={(checkIn, checkOut) => {
							set("checkIn", checkIn);
							set("checkOut", checkOut);
						}}
					/>
				</div>

				{/* Гости, стоимость, предоплата — на десктопе в одну строку */}
				<div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
					<div className="min-w-0">
						<Label className="mb-1 block">Гостей</Label>
						<Input
							type="number"
							min={1}
							value={form.guestsCount || ""}
							placeholder="1"
							onChange={(e) => set("guestsCount", parseNumber(e.target.value))}
						/>
					</div>
					<div className="min-w-0">
						<Label className="mb-1 block">Стоимость ₽</Label>
						<Input
							type="number"
							min={0}
							value={form.totalPrice || ""}
							placeholder="0"
							onChange={(e) => set("totalPrice", parseNumber(e.target.value))}
						/>
					</div>
					<div className="min-w-0 col-span-2 lg:col-span-1">
						<Label className="mb-1 block">Предоплата ₽</Label>
						<Input
							type="number"
							min={0}
							value={form.prepayment || ""}
							placeholder="0"
							onChange={(e) => set("prepayment", parseNumber(e.target.value))}
						/>
					</div>
				</div>

				<RemainingLabel
					totalPrice={form.totalPrice}
					prepayment={form.prepayment}
				/>

				{/* Доп. услуги */}
				<div>
					<Label className="mb-1.5 block">Доп. услуги</Label>
					{form.services.length > 0 && (
						<div className="flex flex-wrap gap-1 mb-2">
							{form.services.map((s) => (
								<Badge key={s.id} variant="service">
									{s.name}
									<button
										type="button"
										onClick={() => toggleService(s)}
										className="text-[var(--accent)] hover:text-[var(--accent-hover)] ml-0.5"
									>
										<XIcon size={10} weight="bold" aria-hidden="true" />
									</button>
								</Badge>
							))}
						</div>
					)}
					<ServiceSearch
						services={services}
						selectedIds={form.services.map((s) => s.id)}
						onSelect={toggleService}
					/>
				</div>

				{/* Менеджер */}
				{currentUser && (
					<div>
						<Label className="mb-1 block">Менеджер</Label>
						<div className="border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--muted-foreground)] bg-[var(--muted)]">
							{currentUser.firstName} {currentUser.lastName}
						</div>
					</div>
				)}

				{/* Комментарий */}
				<div>
					<Label className="mb-1 block">Комментарий</Label>
					<Textarea
						value={form.comment ?? ""}
						onChange={(e) => set("comment", e.target.value)}
						rows={2}
					/>
				</div>

				{/* Кнопки */}
				<div className="flex gap-2 pt-1 pb-2 lg:justify-end">
					{booking && onDelete ? (
						<Button
							type="button"
							variant="destructive"
							className="flex-1 lg:flex-none lg:px-6"
							onClick={onDelete}
							disabled={saving || deleting}
						>
							Удалить
						</Button>
					) : null}
					<Button
						type="button"
						variant="secondary"
						className="flex-1 lg:flex-none lg:px-6"
						onClick={onCancel}
						disabled={saving}
					>
						Отмена
					</Button>
					<Button
						type="submit"
						disabled={saving}
						className="flex-1 lg:flex-none lg:px-8"
					>
						{saving ? (
							<span className="flex items-center gap-2">
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

function RemainingLabel({
	totalPrice,
	prepayment,
}: {
	totalPrice: number | undefined;
	prepayment: number | undefined;
}) {
	const tp = totalPrice ?? 0;
	const pp = prepayment ?? 0;
	const remaining = tp - pp;
	if (!tp && !pp) return null;
	return (
		<div className="flex items-center justify-between px-1">
			<span className="text-xs text-[var(--muted-foreground)]">
				Осталось оплатить
			</span>
			<span
				className={`text-sm font-semibold ${remaining > 0 ? "text-[var(--accent)]" : remaining < 0 ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}
			>
				{remaining.toLocaleString("ru-RU")} ₽
			</span>
		</div>
	);
}
