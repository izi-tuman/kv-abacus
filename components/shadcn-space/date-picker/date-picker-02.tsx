"use client";

import { CalendarIcon, CaretDown, X } from "@phosphor-icons/react";
import { addDays, differenceInDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
	/** YYYY-MM-DD */
	checkIn: string;
	/** YYYY-MM-DD */
	checkOut: string;
	onChange: (checkIn: string, checkOut: string) => void;
}

function toDate(s: string): Date | undefined {
	if (!s) return undefined;
	const d = parseISO(s);
	return Number.isNaN(d.getTime()) ? undefined : d;
}

function toIso(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nightsLabel(n: number): string {
	return `${n} ${n === 1 ? "ночь" : n < 5 ? "ночи" : "ночей"}`;
}

const QUICK_NIGHTS = [1, 3, 7];

export default function BookingDateRangePicker({
	checkIn,
	checkOut,
	onChange,
}: Props) {
	const [open, setOpen] = React.useState(false);

	const [draft, setDraft] = React.useState<DateRange | undefined>(undefined);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reads checkIn/checkOut only on open toggle
	React.useEffect(() => {
		if (open) setDraft({ from: toDate(checkIn), to: toDate(checkOut) });
	}, [open]);

	function handleSelect(selected: DateRange | undefined) {
		setDraft(selected);
	}

	function handleConfirm() {
		const from = draft?.from ? toIso(draft.from) : "";
		const to = draft?.to ? toIso(draft.to) : "";
		onChange(from, to);
		setOpen(false);
	}

	function handleClear() {
		setDraft(undefined);
		onChange("", "");
		setOpen(false);
	}

	function handleQuickSelect(nights: number) {
		const from = draft?.from ?? new Date();
		const to = addDays(from, nights);
		setDraft({ from, to });
	}

	const hint = (() => {
		if (!draft?.from) return "Выберите дату заезда";
		if (!draft.to) return "Теперь выберите дату выезда";
		const nights = differenceInDays(draft.to, draft.from);
		if (nights <= 0) return "Дата выезда должна быть позже заезда";
		return nightsLabel(nights);
	})();

	const isComplete = !!(draft?.from && draft?.to && draft.to > draft.from);
	const hasAny = !!(draft?.from || draft?.to);

	const triggerLabel = (() => {
		const from = toDate(checkIn);
		const to = toDate(checkOut);
		if (from && to)
			return `${format(from, "d MMM", { locale: ru })} — ${format(to, "d MMM yyyy", { locale: ru })}`;
		if (from) return format(from, "d MMM yyyy", { locale: ru });
		return null;
	})();

	const nights = (() => {
		const from = toDate(checkIn);
		const to = toDate(checkOut);
		if (!from || !to) return null;
		const n = differenceInDays(to, from);
		return n > 0 ? n : null;
	})();

	const triggerNightsLabel = nights ? nightsLabel(nights) : null;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={cn(
						"flex h-11 w-full items-center gap-2 rounded-xl border bg-white/80 px-3 py-2.5 text-sm outline-none transition-all duration-200",
						"border-[var(--border)] hover:border-[var(--accent)]/30",
						open
							? "border-[var(--accent)]/60 ring-2 ring-[var(--accent)]/12"
							: "",
						!triggerLabel && "text-[var(--muted-foreground)]",
					)}
				>
					<CalendarIcon
						size={16}
						weight={open ? "fill" : "regular"}
						className={cn(
							"shrink-0 transition-colors duration-200",
							open ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]",
						)}
					/>
					<span className="flex-1 min-w-0 text-left truncate">
						{triggerLabel ?? "Выберите даты заезда и выезда"}
					</span>
					{triggerNightsLabel && !open && (
						<span className="shrink-0 rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)] leading-none">
							{triggerNightsLabel}
						</span>
					)}
					<CaretDown
						size={14}
						weight="bold"
						className={cn(
							"shrink-0 text-[var(--muted-foreground)] transition-transform duration-200",
							open && "rotate-180",
						)}
					/>
				</button>
			</PopoverTrigger>

			<PopoverContent
				className="w-[calc(100vw-2rem)] max-w-sm p-0 rounded-lg border border-[var(--border)] shadow-xl bg-white flex flex-col"
				style={{ maxHeight: "var(--radix-popover-content-available-height)" }}
				align="start"
				sideOffset={6}
				collisionPadding={16}
			>
				<div className="overflow-y-auto">
					<Calendar
						mode="range"
						defaultMonth={draft?.from ?? toDate(checkIn)}
						selected={draft}
						onSelect={handleSelect}
						numberOfMonths={1}
						locale={ru}
						className="w-full p-3"
						classNames={{
							range_start:
								"relative isolate z-0 rounded-l-[var(--cell-radius)] bg-[var(--accent)] after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-[var(--accent)] text-white",
							range_middle:
								"rounded-none bg-[var(--accent-light)] text-[var(--foreground)]",
							range_end:
								"relative isolate z-0 rounded-r-[var(--cell-radius)] bg-[var(--accent)] after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-[var(--accent)] text-white",
							today:
								"rounded-[var(--cell-radius)] bg-[var(--accent-light)] text-[var(--foreground)] data-[selected=true]:rounded-none",
						}}
					/>
				</div>

				{/* Быстрый выбор */}
				<div className="flex shrink-0 items-center gap-1.5 border-t border-[var(--border)] px-3 py-2 bg-[var(--muted)]/40">
					<span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
						+
					</span>
					{QUICK_NIGHTS.map((n) => (
						<button
							key={n}
							type="button"
							onClick={() => handleQuickSelect(n)}
							disabled={!draft?.from}
							className={cn(
								"rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all",
								draft?.from
									? "bg-white border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95"
									: "bg-[var(--muted)] text-[var(--muted-foreground)]/50 cursor-not-allowed",
							)}
						>
							{n} {n === 1 ? "ночь" : n < 5 ? "ночи" : "ночей"}
						</button>
					))}
				</div>

				{/* Строка подсказки + кнопки */}
				<div className="flex shrink-0 items-center gap-2 border-t border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2.5 rounded-b-2xl">
					<div className="flex flex-1 items-center gap-2 min-w-0">
						<span
							className={cn(
								"flex size-2 shrink-0 rounded-full transition-colors",
								!draft?.from
									? "bg-[var(--muted-foreground)]/40"
									: !draft.to || draft.to <= draft.from
										? "bg-amber-400"
										: "bg-[var(--accent)]",
							)}
						/>
						<span className="truncate text-xs text-[var(--muted-foreground)]">
							{hint}
						</span>
					</div>

					{hasAny && (
						<button
							type="button"
							onClick={handleClear}
							className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
						>
							<X size={12} weight="bold" />
							Сброс
						</button>
					)}

					<button
						type="button"
						onClick={handleConfirm}
						disabled={!isComplete}
						className={cn(
							"shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
							isComplete
								? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm shadow-[var(--accent)]/20 active:scale-95"
								: "bg-[var(--muted)] text-[var(--muted-foreground)]/50 cursor-not-allowed",
						)}
					>
						Готово
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
