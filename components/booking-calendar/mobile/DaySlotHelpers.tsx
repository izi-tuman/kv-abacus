import { PlusIcon } from "@phosphor-icons/react";

interface DayHeaderProps {
	dayOfWeek: string;
	rest: string[];
	today?: boolean;
}

export function DayHeader({ dayOfWeek, rest, today }: DayHeaderProps) {
	return (
		<div className="flex items-baseline gap-2 mb-2">
			<span className="text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
				{dayOfWeek}
			</span>
			<span className="text-xs text-[var(--muted-foreground)]">
				{rest[0]}
				<span className="ml-1">{rest.slice(1).join(" ")}</span>
			</span>
			{today && (
				<span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white leading-none">
					сегодня
				</span>
			)}
		</div>
	);
}

interface EmptyDaySlotProps {
	onAdd: () => void;
}

export function EmptyDaySlot({ onAdd }: EmptyDaySlotProps) {
	return (
		<button
			type="button"
			onClick={onAdd}
			className="w-full text-center text-sm text-[var(--muted-foreground)] py-6 border-2 border-dashed border-[var(--border)] rounded-lg hover:border-[var(--accent)]/30 hover:text-[var(--accent)] hover:bg-[var(--accent-light)]/50 transition-colors transition-transform duration-200 active:scale-[0.99]"
		>
			<PlusIcon
				size={20}
				weight="regular"
				className="mx-auto mb-1.5"
				aria-hidden="true"
			/>
			Добавить бронирование
		</button>
	);
}
