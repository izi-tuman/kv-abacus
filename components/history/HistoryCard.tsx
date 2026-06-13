import type { Booking } from "@/types";

function formatDate(dateStr: string): string {
	return `${dateStr.slice(8, 10)}.${dateStr.slice(5, 7)}`;
}

export default function HistoryCard({
	booking,
	onClick,
}: {
	booking: Booking;
	onClick: (b: Booking) => void;
}) {
	const isActive = booking.status === "active";

	return (
		<button
			type="button"
			onClick={() => onClick(booking)}
			className="w-full text-left rounded-xl mb-2 shadow-md overflow-hidden border bg-white border-[var(--border)]"
		>
			{/* Шапка: домик + даты */}
			<div
				className={`px-3 py-2 flex items-center justify-between gap-2 ${isActive ? "bg-[var(--accent)]" : "bg-[var(--muted-foreground)]"}`}
			>
				<p className="text-sm font-semibold text-white truncate">
					{booking.houseName ?? booking.houseId}
				</p>
				{booking.checkIn && booking.checkOut && (
					<p className="text-xs font-medium text-white/80 shrink-0 tabular-nums">
						{formatDate(booking.checkIn)}–{formatDate(booking.checkOut)}
					</p>
				)}
			</div>

			{/* Тело: имя + сервисы + ответственный */}
			<div className="px-3 pt-1.5 pb-2">
				<p className="text-base font-semibold truncate text-[var(--foreground)]">
					{booking.clientFirstName} {booking.clientLastName}
				</p>
				{(booking.services.length > 0 || booking.managerName) && (
					<div className="flex items-center justify-between gap-1 mt-1">
						<div className="flex flex-wrap items-center gap-1">
							{booking.services.map((s) => (
								<span
									key={s.id}
									className="text-xs px-2 py-0.5 rounded-full border bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)]"
								>
									{s.name}
								</span>
							))}
						</div>
						{booking.managerName && (
							<span className="text-xs px-2 py-0.5 rounded-full border bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] shrink-0 ml-auto">
								{booking.managerName}
							</span>
						)}
					</div>
				)}
			</div>
		</button>
	);
}
