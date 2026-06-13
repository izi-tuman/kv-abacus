"use client";
import { PhoneIcon, UserIcon, UsersIcon } from "@phosphor-icons/react";
import { useSettings } from "@/lib/settings-context";
import { formatPhone } from "@/lib/utils";
import type { Booking } from "@/types";

interface Props {
	booking: Booking;
	onClick: (booking: Booking) => void;
}

function formatDate(dateStr: string): string {
	return `${dateStr.slice(8, 10)}.${dateStr.slice(5, 7)}`;
}

export default function BookingCard({ booking, onClick }: Props) {
	const { settings } = useSettings();

	return (
		<div className="relative mb-2.5">
			{/* Tel link — positioned outside the card button for valid HTML and a11y */}
			{booking.clientPhone && (
				<a
					href={`tel:${booking.clientPhone}`}
					onClick={(e) => e.stopPropagation()}
					className="absolute right-3 top-[42px] z-10 flex items-center justify-center size-6 rounded-full shrink-0 transition-all duration-200 bg-[var(--accent-light)] hover:bg-[var(--accent)]/15 text-[var(--accent)]"
					aria-label="Позвонить клиенту"
				>
					<PhoneIcon size={12} weight="regular" />
				</a>
			)}
			<button
				type="button"
				onClick={() => onClick(booking)}
				className="w-full text-left rounded-xl overflow-hidden border bg-[var(--surface-elevated)] backdrop-blur-sm border-[var(--border)] shadow-[var(--shadow-card)] hover:shadow-[0_14px_34px_-22px_oklch(0.2_0.018_64/0.36)] hover:border-[var(--accent)]/25 transition-transform transition-shadow transition-colors duration-200 active:scale-[0.99]"
			>
				{/* Header: house + dates */}
				<div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)] text-white">
					<span className="font-bold text-sm tracking-wide truncate">
						{booking.houseName ?? booking.houseId}
					</span>
					{booking.checkIn && booking.checkOut && (
						<span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm shrink-0 ml-2">
							{formatDate(booking.checkIn)}–{formatDate(booking.checkOut)}
						</span>
					)}
				</div>

				{/* Body */}
				<div className="px-3 py-2 pr-10">
					{/* Client row */}
					<div className="flex items-center justify-between mb-1.5">
						<p className="font-semibold text-sm text-[var(--foreground)] leading-tight truncate">
							{booking.clientFirstName} {booking.clientLastName}
						</p>
					</div>

					{/* Details grid */}
					<div className="flex items-center gap-x-3 gap-y-1">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 flex-1 min-w-0">
							{booking.clientPhone && (
								<span className="text-xs text-[var(--muted-foreground)]">
									{formatPhone(booking.clientPhone)}
								</span>
							)}
							{booking.guestsCount > 0 && (
								<span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
									<UsersIcon size={11} weight="regular" />
									{booking.guestsCount} чел.
								</span>
							)}
							{settings.showBookingCardPrice &&
								booking.totalPrice != null &&
								booking.totalPrice > 0 && (
									<span className="text-xs font-bold text-[var(--accent)]">
										{booking.totalPrice.toLocaleString("ru-RU")} ₽
									</span>
								)}
						</div>
						{booking.managerName && (
							<span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] shrink-0">
								<UserIcon size={11} weight="regular" />
								{booking.managerName}
							</span>
						)}
					</div>

					{/* Services */}
					{booking.services.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-1.5">
							{booking.services.map((s) => (
								<span
									key={s.id}
									className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-[var(--amber-light)] text-[var(--amber-hover)] border border-[var(--amber)]/15"
								>
									{s.name}
								</span>
							))}
						</div>
					)}
				</div>
			</button>
		</div>
	);
}
