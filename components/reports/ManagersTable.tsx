import type { ManagerReport } from "@/types";

export default function ManagersTable({ data }: { data: ManagerReport[] }) {
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
					key={row.managerId}
					className="bg-white rounded-xl px-4 py-3 border border-[var(--border)]"
				>
					<div className="flex justify-between items-center mb-1">
						<span className="text-sm font-medium text-[var(--foreground)]">
							{row.managerName}
						</span>
						<span className="text-sm font-semibold text-[var(--accent)]">
							{row.totalRevenue.toLocaleString("ru-RU")} ₽
						</span>
					</div>
					<div className="text-xs text-[var(--muted-foreground)]">
						Броней: {row.bookingsCount}
					</div>
				</div>
			))}
		</div>
	);
}
