// Desktop-only quick preview popover shown on booking-bar click.
"use client";
import {
	CalendarBlankIcon,
	PencilSimpleIcon,
	PhoneIcon,
	TrashIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import { parseISODateLocal, RU_MONTHS_SHORT } from "@/lib/dates";
import type { Booking } from "@/types";
import {
	formatGuests,
	formatNights,
	nightsBetween,
} from "../shared/bookingHelpers";

function formatDay(iso: string): string {
	const d = parseISODateLocal(iso);
	if (!d) return "—";
	return `${d.getDate()} ${RU_MONTHS_SHORT[d.getMonth()]}`;
}

type Props = {
	booking: Booking | null;
	anchor: HTMLElement | null;
	onClose: () => void;
	onEdit: (booking: Booking) => void;
	onDelete: (id: string) => Promise<void>;
};

export default function BookingPreviewPopover({
	booking,
	anchor,
	onClose,
	onEdit,
	onDelete,
}: Props) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

	if (!booking || !anchor) return null;

	const fullName =
		`${booking.clientFirstName} ${booking.clientLastName ?? ""}`.trim() ||
		"Без имени";
	const nights = nightsBetween(booking.checkIn, booking.checkOut);

	return (
		<>
			<Popover open onOpenChange={(o) => !o && onClose()}>
				<PopoverAnchor virtualRef={{ current: anchor }} />
				<PopoverContent
					side="bottom"
					align="start"
					sideOffset={6}
					collisionPadding={16}
					className="w-80 p-4"
				>
					<div className="flex items-start justify-between gap-2 mb-2">
						<div className="min-w-0">
							<div className="font-bold text-sm truncate">{fullName}</div>
							<div className="text-xs text-[var(--muted-foreground)] truncate">
								{booking.houseName}
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							aria-label="Закрыть"
							className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
						>
							<XIcon size={18} />
						</button>
					</div>
					<div className="h-px bg-[var(--border)]/60 mb-3" />
					<ul className="flex flex-col gap-2 text-sm">
						<li className="flex items-center gap-2">
							<CalendarBlankIcon
								size={16}
								className="text-[var(--muted-foreground)]"
							/>
							<span>
								{formatDay(booking.checkIn)} — {formatDay(booking.checkOut)} (
								{formatNights(nights)})
							</span>
						</li>
						<li className="flex items-center gap-2">
							<PhoneIcon size={16} className="text-[var(--muted-foreground)]" />
							<span>{booking.clientPhone || "—"}</span>
						</li>
						<li className="flex items-center gap-2">
							<UsersIcon size={16} className="text-[var(--muted-foreground)]" />
							<span>{formatGuests(booking.guestsCount)}</span>
						</li>
						<li>
							<Badge
								variant={booking.status === "active" ? "active" : "completed"}
							>
								{booking.status === "active" ? "Активно" : "Завершено"}
							</Badge>
						</li>
					</ul>
					<div className="flex items-center gap-2 mt-4">
						<button
							type="button"
							onClick={() => onEdit(booking)}
							className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-[var(--accent)] text-white text-sm font-semibold hover:brightness-105"
						>
							<PencilSimpleIcon size={16} weight="bold" />
							Редактировать
						</button>
						<button
							type="button"
							onClick={() => setConfirmOpen(true)}
							className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-[var(--danger-light)] text-[var(--danger)] text-sm font-semibold hover:brightness-95"
						>
							<TrashIcon size={16} weight="bold" />
							Удалить
						</button>
					</div>
				</PopoverContent>
			</Popover>
			<ConfirmDeleteDialog
				open={confirmOpen}
				message="Удалить бронирование?"
				loading={deleting}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={async () => {
					setDeleting(true);
					try {
						await onDelete(booking.id);
						setConfirmOpen(false);
						onClose();
					} finally {
						setDeleting(false);
					}
				}}
			/>
		</>
	);
}
