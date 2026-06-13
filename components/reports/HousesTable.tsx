import type { HouseReport } from "@/types";

export default function HousesTable({ data }: { data: HouseReport[] }) {
	if (data.length === 0)
		return (
			<div className="text-center text-[var(--muted-foreground)] text-sm py-8">
				Нет данных за период
			</div>
		);
	return (
		<div className="flex flex-col gap-2">
			{data.map((row) => (
				<div
					key={row.houseId}
					className="bg-white rounded-xl px-4 py-3 border border-[var(--border)]"
				>
					<div className="flex justify-between items-center mb-1">
						<span className="text-sm font-medium text-[var(--foreground)]">
							{row.houseName}
						</span>
						<span className="text-sm font-semibold text-[var(--accent)]">
							{row.revenue.toLocaleString("ru-RU")} ₽
						</span>
					</div>
					<div className="flex gap-4 text-xs text-[var(--muted-foreground)]">
						<span>Броней: {row.bookingsCount}</span>
						<span>Загрузка: {row.occupancyRate}%</span>
					</div>
				</div>
			))}
		</div>
	);
}
