// Модалка проката снаряжения: создание/редактирование записи о прокате.
// Адаптивна: на десктопе поля раскладываются в сетку, кнопки выравниваются вправо.
"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Spinner } from "@/components/ui/data-state-container";
import { ErrorModal } from "@/components/ui/error-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { parseNumber } from "@/lib/utils";
import type { Client, Equipment, EquipmentRental, User } from "@/types";
import ClientPicker from "../booking-calendar/mobile/ClientPicker";
import DatetimePopoverPicker from "./DatetimePopoverPicker";
import EquipmentPicker from "./EquipmentPicker";

interface Props {
	rental: EquipmentRental | null;
	equipment: Equipment[];
	clients: Client[];
	users: User[];
	preselectedClient?: Client | null;
	onClose: () => void;
	onSave: (
		rental: Omit<EquipmentRental, "id"> | EquipmentRental,
	) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
	onOpenClient: (client: Client) => void;
	onCreateClient: () => void;
}

const EMPTY: Omit<EquipmentRental, "id"> = {
	clientId: "",
	clientFirstName: "",
	clientLastName: "",
	clientPhone: "",
	startDate: "",
	endDate: "",
	items: [],
	totalPrice: 0,
	status: "active",
	managerId: "",
	notes: "",
};

function isoToDate(iso: string): Date | null {
	if (!iso) return null;
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? null : d;
}

function dateToIso(d: Date | null): string {
	if (!d) return "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export default function RentalModal({
	rental,
	equipment,
	clients,
	users,
	preselectedClient,
	onClose,
	onSave,
	onDelete,
	onOpenClient,
	onCreateClient,
}: Props) {
	const initial = rental ?? EMPTY;
	const [form, setForm] = useState<Omit<EquipmentRental, "id">>(() => initial);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const { currentUser } = useAuth();
	const initialRef = useRef(initial);

	useEffect(() => {
		const next = rental ?? EMPTY;
		initialRef.current = next;
		setForm(next);
		setError(null);
		setConfirmDelete(false);
	}, [rental]);

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only once on mount
	useEffect(() => {
		if (!rental && currentUser && !form.managerId) {
			setForm((prev) => ({ ...prev, managerId: currentUser.id }));
		}
	}, []);

	function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!form.clientId) {
			setError("Выберите клиента");
			return;
		}
		if (!form.startDate) {
			setError("Укажите дату начала");
			return;
		}
		if (!form.endDate) {
			setError("Укажите дату окончания");
			return;
		}
		if (form.endDate <= form.startDate) {
			setError("Дата окончания должна быть позже даты начала");
			return;
		}
		if (form.items.length === 0) {
			setError("Добавьте хотя бы одно снаряжение");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			await onSave(rental ? { ...form, id: rental.id } : form);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка при сохранении");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!rental || !onDelete) return;
		setSaving(true);
		setError(null);
		try {
			await onDelete(rental.id);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка при удалении");
			setConfirmDelete(false);
		} finally {
			setSaving(false);
		}
	}

	return (
		<ModalSheet
			open
			onClose={onClose}
			title={rental ? "Прокат снаряжения" : "Новый прокат"}
		>
			<ErrorModal error={error} onClose={() => setError(null)} />

			<ConfirmDeleteDialog
				open={confirmDelete}
				message="Удалить запись о прокате?"
				onConfirm={handleDelete}
				onCancel={() => setConfirmDelete(false)}
				loading={saving}
			/>

			<form
				onSubmit={handleSubmit}
				className="px-4 lg:px-6 py-3 flex flex-col gap-3"
			>
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

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<div className="min-w-0">
						<Label className="mb-1 block">
							Начало <span className="text-(--danger)">*</span>
						</Label>
						<DatetimePopoverPicker
							id="rental-start"
							value={isoToDate(form.startDate)}
							onChange={(d) => set("startDate", dateToIso(d))}
							placeholder="Выберите дату"
						/>
					</div>
					<div className="min-w-0">
						<Label className="mb-1 block">
							Окончание <span className="text-(--danger)">*</span>
						</Label>
						<DatetimePopoverPicker
							id="rental-end"
							value={isoToDate(form.endDate)}
							onChange={(d) => set("endDate", dateToIso(d))}
							placeholder="Выберите дату"
						/>
					</div>
				</div>

				<EquipmentPicker
					items={form.items}
					equipment={equipment}
					onChange={(items) => set("items", items)}
				/>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
					<div>
						<Label className="mb-1 block">Стоимость ₽</Label>
						<Input
							type="number"
							min={0}
							value={form.totalPrice || ""}
							placeholder="0"
							onChange={(e) => set("totalPrice", parseNumber(e.target.value))}
						/>
					</div>

					{(() => {
						const manager = form.managerId
							? users.find((u) => u.id === form.managerId)
							: currentUser;
						if (!manager) return null;
						return (
							<div className="sm:col-span-2 lg:col-span-2">
								<Label className="mb-1 block">Менеджер</Label>
								<div className="border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--muted-foreground)] bg-[var(--muted)]">
									{manager.firstName} {manager.lastName}
								</div>
							</div>
						);
					})()}
				</div>

				<div>
					<Label className="mb-1 block">Примечание</Label>
					<Textarea
						value={form.notes ?? ""}
						onChange={(e) => set("notes", e.target.value)}
						rows={2}
					/>
				</div>

				<div className="flex gap-2 pt-1 pb-2 lg:justify-end">
					{rental && onDelete && (
						<Button
							type="button"
							variant="destructive"
							className="flex-1 lg:flex-none lg:px-6"
							onClick={() => setConfirmDelete(true)}
							disabled={saving}
						>
							Удалить
						</Button>
					)}
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
		</ModalSheet>
	);
}
