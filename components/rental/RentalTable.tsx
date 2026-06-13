"use client";
import { BackpackIcon, NoteIcon } from "@phosphor-icons/react";
import { formatPhone } from "@/lib/utils";
import type { EquipmentRental } from "@/types";

interface Props {
	rentals: EquipmentRental[];
	onRowClick: (rental: EquipmentRental) => void;
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

export default function RentalTable({ rentals, onRowClick }: Props) {
	return (
		<div className="bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-[var(--border)] bg-[var(--muted)]/40">
							<th className="px-4 py-3 text-[11px] font-extrabold text-[var(--muted-foreground)] uppercase tracking-wider">
								Клиент
							</th>
							<th className="px-4 py-3 text-[11px] font-extrabold text-[var(--muted-foreground)] uppercase tracking-wider">
								Период
							</th>
							<th className="px-4 py-3 text-[11px] font-extrabold text-[var(--muted-foreground)] uppercase tracking-wider">
								Снаряжение
							</th>
							<th className="px-4 py-3 text-[11px] font-extrabold text-[var(--muted-foreground)] uppercase tracking-wider">
								Статус
							</th>
							<th className="px-4 py-3 text-[11px] font-extrabold text-[var(--muted-foreground)] uppercase tracking-wider text-right">
								Сумма
							</th>
							<th className="px-4 py-3 text-[11px] font-extrabold text-[var(--muted-foreground)] uppercase tracking-wider">
								Менеджер
							</th>
						</tr>
					</thead>
					<tbody>
						{rentals.map((rental) => {
							const isCompleted = rental.status === "completed";
							return (
								<tr
									key={rental.id}
									onClick={() => onRowClick(rental)}
									className="border-b border-[var(--border)]/60 last:border-b-0 hover:bg-[var(--accent-light)]/25 cursor-pointer transition-colors"
								>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">
												<BackpackIcon size={16} weight="fill" />
											</div>
											<div className="min-w-0">
												<div className="text-sm font-bold text-[var(--foreground)] truncate">
													{rental.clientFirstName}
													{rental.clientLastName
														? ` ${rental.clientLastName}`
														: ""}
												</div>
												<div className="text-xs text-[var(--muted-foreground)] font-medium">
													{formatPhone(rental.clientPhone)}
												</div>
											</div>
										</div>
									</td>
									<td className="px-4 py-3">
										<div className="text-xs text-[var(--foreground)] font-medium whitespace-nowrap">
											{formatDateTime(rental.startDate)}
										</div>
										<div className="text-xs text-[var(--muted-foreground)] font-medium whitespace-nowrap">
											→ {formatDateTime(rental.endDate)}
										</div>
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-wrap gap-1 max-w-[220px]">
											{rental.items.slice(0, 3).map((item) => (
												<span
													key={item.equipmentId}
													className="text-[11px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] font-medium"
												>
													{item.equipmentName} × {item.quantity}
												</span>
											))}
											{rental.items.length > 3 && (
												<span
													title={rental.items
														.slice(3)
														.map((i) => `${i.equipmentName} × ${i.quantity}`)
														.join(", ")}
													className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] font-medium"
												>
													+{rental.items.length - 3}
												</span>
											)}
										</div>
									</td>
									<td className="px-4 py-3">
										<span
											className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
												isCompleted
													? "bg-[var(--muted)] text-[var(--muted-foreground)]"
													: "bg-[var(--accent-light)] text-[var(--accent)]"
											}`}
										>
											{isCompleted ? "Завершён" : "Активен"}
										</span>
									</td>
									<td className="px-4 py-3 text-right">
										<span className="text-sm font-bold text-[var(--accent)]">
											{rental.totalPrice.toLocaleString("ru-RU")} ₽
										</span>
									</td>
									<td className="px-4 py-3">
										<span className="text-xs text-[var(--muted-foreground)] font-medium">
											{rental.managerName ?? "—"}
										</span>
										{rental.notes && (
											<span
												title={rental.notes}
												className="inline-block ml-1.5"
											>
												<NoteIcon
													size={12}
													weight="fill"
													className="text-[var(--accent)]"
												/>
											</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
