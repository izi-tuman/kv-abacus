// Top action bar for the desktop chessboard: month nav, today, create-booking.
"use client";
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";

type Props = {
	onPrevMonth: () => void;
	onNextMonth: () => void;
	onToday: () => void;
	onCreate: () => void;
};

export default function ChessboardHeader({
	onPrevMonth,
	onNextMonth,
	onToday,
	onCreate,
}: Props) {
	return (
		<div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]/70 bg-[var(--surface-elevated)]">
			<h1 className="text-lg font-bold text-[var(--foreground)] mr-auto">
				Календарь
			</h1>
			<button
				type="button"
				onClick={onPrevMonth}
				className="inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
				aria-label="Предыдущий месяц"
			>
				<CaretLeftIcon size={18} weight="bold" />
			</button>
			<button
				type="button"
				onClick={onToday}
				className="h-9 px-3 rounded-md bg-[var(--accent-light)] text-[var(--accent)] text-sm font-semibold hover:brightness-105"
			>
				Сегодня
			</button>
			<button
				type="button"
				onClick={onNextMonth}
				className="inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
				aria-label="Следующий месяц"
			>
				<CaretRightIcon size={18} weight="bold" />
			</button>
			<button
				type="button"
				onClick={onCreate}
				className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[var(--accent)] text-white text-sm font-semibold hover:brightness-105"
			>
				<PlusIcon size={16} weight="bold" />
				Новая бронь
			</button>
		</div>
	);
}
