// Модалка бронирования: переключается между просмотром (BookingView) и редактированием (BookingEditForm).
// Используется как на мобильном, так и на десктопе через адаптивный ModalSheet.
"use client";
import { useEffect, useState } from "react";
import BookingEditForm from "@/components/booking-calendar/mobile/BookingEditForm";
import BookingView from "@/components/booking-calendar/mobile/BookingView";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { ErrorModal } from "@/components/ui/error-modal";
import { ModalSheet } from "@/components/ui/modal-sheet";
import type { Booking, Client, House, Service, User } from "@/types";

interface Props {
	booking: Booking | null;
	houses: House[];
	clients: Client[];
	users: User[];
	services: Service[];
	defaultDate?: string;
	defaultEndDate?: string;
	preselectedClient?: Client | null;
	preselectedHouseId?: string;
	onClose: () => void;
	onSave: (booking: Omit<Booking, "id"> | Booking) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
	onOpenClient: (client: Client) => void;
	onCreateClient: () => void;
	onOpenHouse: (house: House) => void;
	onCreateHouse: () => void;
}

export default function BookingModal({
	booking,
	houses,
	clients,
	users: _users,
	services,
	defaultDate,
	defaultEndDate,
	preselectedClient,
	preselectedHouseId,
	onClose,
	onSave,
	onDelete,
	onOpenClient,
	onCreateClient,
	onOpenHouse,
	onCreateHouse,
}: Props) {
	const [mode, setMode] = useState<"view" | "edit">(
		booking === null ? "edit" : "view",
	);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: сброс режима только при смене брони (по id)
	useEffect(() => {
		setMode(booking === null ? "edit" : "view");
		setConfirmDelete(false);
		setDeleteError(null);
	}, [booking?.id]);

	const house = booking
		? houses.find((h) => h.id === booking.houseId)
		: undefined;
	const client = booking
		? clients.find((c) => c.id === booking.clientId)
		: undefined;

	async function handleConfirmDelete() {
		if (!booking || !onDelete) return;
		setDeleting(true);
		setDeleteError(null);
		try {
			await onDelete(booking.id);
			onClose();
		} catch (err) {
			setDeleteError(
				err instanceof Error ? err.message : "Ошибка при удалении",
			);
			setConfirmDelete(false);
		} finally {
			setDeleting(false);
		}
	}

	return (
		<ModalSheet
			open
			onClose={onClose}
			title={booking ? "Бронирование" : "Новое бронирование"}
		>
			<ErrorModal error={deleteError} onClose={() => setDeleteError(null)} />

			<ConfirmDeleteDialog
				open={confirmDelete}
				message="Удалить бронирование?"
				onConfirm={handleConfirmDelete}
				onCancel={() => setConfirmDelete(false)}
				loading={deleting}
			/>

			{mode === "view" && booking ? (
				<BookingView
					booking={booking}
					house={house}
					client={client}
					onEdit={() => setMode("edit")}
					onDelete={() => setConfirmDelete(true)}
					onOpenClient={onOpenClient}
					deleting={deleting}
				/>
			) : (
				<BookingEditForm
					booking={booking}
					houses={houses}
					clients={clients}
					services={services}
					defaultDate={defaultDate}
					defaultEndDate={defaultEndDate}
					preselectedClient={preselectedClient}
					preselectedHouseId={preselectedHouseId}
					onSave={onSave}
					onCancel={booking ? () => setMode("view") : onClose}
					onDelete={
						booking && onDelete ? () => setConfirmDelete(true) : undefined
					}
					deleting={deleting}
					onOpenClient={onOpenClient}
					onCreateClient={onCreateClient}
					onOpenHouse={onOpenHouse}
					onCreateHouse={onCreateHouse}
				/>
			)}
		</ModalSheet>
	);
}
