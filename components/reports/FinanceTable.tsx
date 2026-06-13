import { CaretRightIcon } from "@phosphor-icons/react";
import type { FinanceReport } from "@/types";

interface Props {
	data: FinanceReport[];
	onDayClick?: (row: FinanceReport) => void;
}

export default function FinanceTable({ data, onDayClick }: Props) {
	if (data.length === 0)
		return (
			<div className="text-center text-[var(--muted-foreground)] text-sm py-8">
				Нет данных за период
			</div>
		);
	const total = data.reduce((s, r) => s + r.revenue, 0);
	const totalBookings = data.reduce((s, r) => s + r.bookingsCount, 0);
	return (
		<div className="flex flex-col gap-2">
			{data.map((row) => (
				<button
					key={row.date}
					type="button"
					onClick={() => onDayClick?.(row)}
					disabled={row.bookingsCount === 0}
					className="w-full text-left bg-white rounded-xl px-4 py-3 border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--card)] active:scale-[0.99] disabled:opacity-50 disabled:hover:border-[var(--border)] disabled:hover:bg-white disabled:active:scale-100 disabled:cursor-default transition-all duration-200 flex items-center gap-2"
				>
					<div className="flex-1 min-w-0">
						<div className="flex justify-between items-center mb-1">
							<span className="text-sm font-medium text-[var(--foreground)]">
								{row.date}
							</span>
							<span className="text-sm font-semibold text-[var(--accent)]">
								{row.revenue.toLocaleString("ru-RU")} ₽
							</span>
						</div>
						<div className="flex gap-4 text-xs text-[var(--muted-foreground)]">
							<span>Броней: {row.bookingsCount}</span>
							<span>Ср. чек: {row.averageCheck.toLocaleString("ru-RU")} ₽</span>
						</div>
					</div>
					<CaretRightIcon
						size={14}
						className="text-[var(--muted-foreground)] shrink-0"
					/>
				</button>
			))}
			<div className="bg-[var(--foreground)] text-white rounded-xl px-4 py-3 flex justify-between mt-1">
				<span className="text-sm font-medium">
					Итого: {totalBookings} броней
				</span>
				<span className="text-sm font-bold">
					{total.toLocaleString("ru-RU")} ₽
				</span>
			</div>
		</div>
	);
}
