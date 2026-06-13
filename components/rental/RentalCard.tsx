"use client";
import { BackpackIcon, NoteIcon } from "@phosphor-icons/react";
import { BaseCard } from "@/components/ui/base-card";
import { formatPhone } from "@/lib/utils";
import type { EquipmentRental } from "@/types";

interface Props {
	rental: EquipmentRental;
	onClick: (rental: EquipmentRental) => void;
}

function formatDateTime(iso: string): string {
	const d = new Date(iso);
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const year = d.getFullYear();
	const hours = String(d.getHours()).padStart(2, "0");
	const minutes = String(d.getMinutes()).padStart(2, "0");
	return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export default function RentalCard({ rental, onClick }: Props) {
	const isCompleted = rental.status === "completed";

	return (
		<BaseCard onClick={() => onClick(rental)}>
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">
					<BackpackIcon size={18} weight="fill" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2 mb-1">
						<span className="text-[15px] font-bold text-[var(--foreground)] truncate">
							{rental.clientFirstName}
							{rental.clientLastName ? ` ${rental.clientLastName}` : ""}
						</span>
						<span
							className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
								isCompleted
									? "bg-[var(--muted)] text-[var(--muted-foreground)]"
									: "bg-[var(--accent-light)] text-[var(--accent)]"
							}`}
						>
							{isCompleted ? "Завершён" : "Активен"}
						</span>
					</div>
					<div className="text-[12.5px] text-[var(--muted-foreground)] font-medium truncate">
						{formatPhone(rental.clientPhone)}
					</div>
					<div className="text-[11.5px] text-[var(--muted-foreground)]/90 font-medium mt-1">
						{formatDateTime(rental.startDate)} –{" "}
						{formatDateTime(rental.endDate)}
					</div>

					{rental.items.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-2">
							{rental.items.map((item) => (
								<span
									key={item.equipmentId}
									className="text-[11px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] font-medium"
								>
									{item.equipmentName} × {item.quantity}
								</span>
							))}
						</div>
					)}

					{rental.notes && (
						<div className="flex items-start gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-[var(--accent-light)]">
							<NoteIcon
								size={12}
								weight="fill"
								className="text-[var(--accent)] mt-[1px] shrink-0"
							/>
							<span className="text-[11.5px] text-[var(--accent)] font-medium leading-snug line-clamp-2">
								{rental.notes}
							</span>
						</div>
					)}

					<div className="flex items-center justify-between gap-2 mt-2">
						<span className="text-sm font-bold text-[var(--accent)]">
							{rental.totalPrice.toLocaleString("ru-RU")} ₽
						</span>
						{rental.managerName && (
							<span className="text-[11px] text-[var(--muted-foreground)] font-medium">
								{rental.managerName}
							</span>
						)}
					</div>
				</div>
			</div>
		</BaseCard>
	);
}
