"use client";
import DateFilterPicker from "@/components/ui/DateFilterPicker";
import type { House } from "@/types";

interface Filters {
	search: string;
	houseId: string;
	managerId: string;
	status: string;
}

interface ManagerOption {
	id: string;
	name: string;
}

interface Props {
	dateFrom: string;
	dateTo: string;
	onDateFromChange: (v: string) => void;
	onDateToChange: (v: string) => void;
	filters: Filters;
	onFiltersChange: (filters: Filters) => void;
	onReset: () => void;
	houses: House[];
	managerOptions: ManagerOption[];
}

export type { Filters, ManagerOption };

const inputClass =
	"w-full border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] bg-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 transition-all duration-200";

export default function HistoryFilters({
	dateFrom,
	dateTo,
	onDateFromChange,
	onDateToChange,
	filters,
	onFiltersChange,
	onReset,
	houses,
	managerOptions,
}: Props) {
	function set<K extends keyof Filters>(key: K, value: Filters[K]) {
		onFiltersChange({ ...filters, [key]: value });
	}

	return (
		<div className="mt-3 bg-white rounded-lg px-4 py-4 flex flex-col gap-3 border border-[var(--border)]">
			{/* Даты */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
				<div className="min-w-0">
					<label className="text-xs text-[var(--muted-foreground)] mb-1 block">
						Дата от
					</label>
					<DateFilterPicker
						value={dateFrom}
						onChange={onDateFromChange}
						placeholder="Выберите дату"
					/>
				</div>
				<div className="min-w-0">
					<label className="text-xs text-[var(--muted-foreground)] mb-1 block">
						Дата до
					</label>
					<DateFilterPicker
						value={dateTo}
						onChange={onDateToChange}
						placeholder="Выберите дату"
					/>
				</div>
			</div>

			{/* Поиск */}
			<div>
				<label className="text-xs text-[var(--muted-foreground)] mb-1 block">
					Поиск по клиенту
				</label>
				<input
					type="text"
					value={filters.search}
					onChange={(e) => set("search", e.target.value)}
					placeholder="Имя, фамилия или телефон"
					className={`${inputClass} placeholder:text-[var(--muted-foreground)]/60`}
				/>
			</div>

			{/* Дом + Менеджер */}
			<div className="flex gap-2">
				<div className="flex-1">
					<label className="text-xs text-[var(--muted-foreground)] mb-1 block">
						Дом
					</label>
					<select
						value={filters.houseId}
						onChange={(e) => set("houseId", e.target.value)}
						className={inputClass}
					>
						<option value="">Все дома</option>
						{houses
							.filter((h) => h.isActive)
							.map((h) => (
								<option key={h.id} value={h.id}>
									{h.name}
								</option>
							))}
					</select>
				</div>
				<div className="flex-1">
					<label className="text-xs text-[var(--muted-foreground)] mb-1 block">
						Менеджер
					</label>
					<select
						value={filters.managerId}
						onChange={(e) => set("managerId", e.target.value)}
						className={inputClass}
					>
						<option value="">Все менеджеры</option>
						{managerOptions.map((m) => (
							<option key={m.id} value={m.id}>
								{m.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Статус */}
			<div>
				<label className="text-xs text-[var(--muted-foreground)] mb-1 block">
					Статус
				</label>
				<select
					value={filters.status}
					onChange={(e) => set("status", e.target.value)}
					className={inputClass}
				>
					<option value="">Все статусы</option>
					<option value="active">Активно</option>
					<option value="completed">Завершено</option>
				</select>
			</div>

			{/* Сброс */}
			<div className="flex justify-end">
				<button
					type="button"
					onClick={onReset}
					className="border border-[var(--border)] text-[var(--muted-foreground)] text-sm px-4 py-2 rounded-xl hover:bg-[var(--accent-light)] hover:text-[var(--accent)] hover:border-[var(--accent)]/25 transition-all duration-200"
				>
					Сбросить
				</button>
			</div>
		</div>
	);
}
