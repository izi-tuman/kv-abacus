"use client";

import { CaretLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";

interface Props {
	title: string;
	mode: "week" | "day";
	onPrevMonth: () => void;
	onNextMonth: () => void;
	onPrevPeriod: () => void;
	onNextPeriod: () => void;
	onToday: () => void;
	onToggleMode: () => void;
	onCreateBooking: () => void;
}

export default function CalendarHeader({
	title,
	mode,
	onPrevMonth,
	onNextMonth,
	onPrevPeriod,
	onNextPeriod,
	onToday,
	onToggleMode,
	onCreateBooking,
}: Props) {
	return (
		<div className="sticky top-0 z-10 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/95 to-[var(--background)]/85 backdrop-blur-md px-4 pt-3 pb-2 border-b border-[var(--border)]/60">
			{/* Month navigation */}
			<div className="flex items-center justify-between mb-2">
				<button
					type="button"
					onClick={onPrevMonth}
					className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[var(--accent-light)] text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors duration-200 active:scale-95"
					aria-label="Предыдущий месяц"
				>
					<CaretLeftIcon size={18} weight="regular" />
				</button>
				<button
					type="button"
					onClick={onPrevPeriod}
					className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--accent-light)] text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors duration-200 active:scale-95"
					aria-label="Предыдущий период"
				>
					<CaretLeftIcon size={14} weight="bold" />
				</button>

				<h2 className="text-base font-bold text-[var(--foreground)] tracking-tight">
					{title}
				</h2>

				<button
					type="button"
					onClick={onNextPeriod}
					className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--accent-light)] text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors duration-200 active:scale-95"
					aria-label="Следующий период"
				>
					<CaretRightIcon size={14} weight="bold" />
				</button>
				<button
					type="button"
					onClick={onNextMonth}
					className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[var(--accent-light)] text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors duration-200 active:scale-95"
					aria-label="Следующий месяц"
				>
					<CaretRightIcon size={18} weight="regular" />
				</button>
			</div>

			{/* Actions row */}
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onToday}
					className="flex-1 h-9 text-xs font-semibold bg-white/80 border border-[var(--border)] text-[var(--foreground)] rounded-lg shadow-sm hover:bg-[var(--accent-light)] hover:border-[var(--accent)]/25 hover:text-[var(--accent)] transition-all duration-200 active:scale-[0.97]"
				>
					Сегодня
				</button>
				<button
					type="button"
					onClick={onToggleMode}
					className="flex-1 h-9 text-xs font-semibold bg-white/80 border border-[var(--border)] text-[var(--foreground)] rounded-lg shadow-sm hover:bg-[var(--accent-light)] hover:border-[var(--accent)]/25 hover:text-[var(--accent)] transition-all duration-200 active:scale-[0.97]"
				>
					{mode === "week" ? "День" : "Неделя"}
				</button>
				<button
					type="button"
					onClick={onCreateBooking}
					className="h-9 w-9 flex-shrink-0 flex items-center justify-center bg-[var(--accent)] text-white rounded-lg shadow-[0_2px_8px_-2px_oklch(0.42_0.09_148/0.35)] hover:bg-[var(--accent-hover)] hover:shadow-[0_4px_12px_-2px_oklch(0.42_0.09_148/0.4)] transition-all duration-200 active:scale-95"
					aria-label="Создать бронирование"
				>
					<PlusIcon size={18} weight="bold" />
				</button>
			</div>
		</div>
	);
}
