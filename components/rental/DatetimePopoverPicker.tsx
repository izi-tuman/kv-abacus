"use client";

import { CalendarIcon, CaretDown, Check } from "@phosphor-icons/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
	const h = Math.floor(i / 2);
	const m = i % 2 === 0 ? 0 : 30;
	return {
		label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
		h,
		m,
	};
});

interface Props {
	value: Date | null;
	onChange: (date: Date | null) => void;
	placeholder?: string;
	id?: string;
}

function dateToSlotIndex(d: Date | null): number {
	if (!d) return 18;
	return d.getHours() * 2 + (d.getMinutes() >= 30 ? 1 : 0);
}

export default function DatetimePopoverPicker({
	value,
	onChange,
	placeholder = "Выберите дату",
	id,
}: Props) {
	const [open, setOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		value ?? undefined,
	);
	const [slotIndex, setSlotIndex] = useState(() => dateToSlotIndex(value));

	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (value) {
			setSelectedDate(value);
			setSlotIndex(dateToSlotIndex(value));
		}
	}, [value]);

	useEffect(() => {
		if (!open) return;
		requestAnimationFrame(() => {
			const el = listRef.current?.querySelector<HTMLElement>(
				"[data-selected=true]",
			);
			el?.scrollIntoView({ block: "center" });
		});
	}, [open]);

	const handleDaySelect = useCallback(
		(day: Date | undefined) => {
			if (!day) {
				setSelectedDate(undefined);
				onChange(null);
				return;
			}
			const slot = TIME_SLOTS[slotIndex];
			const result = new Date(day);
			result.setHours(slot.h, slot.m, 0, 0);
			setSelectedDate(day);
			onChange(result);
		},
		[slotIndex, onChange],
	);

	const handleSlotSelect = useCallback(
		(index: number) => {
			const slot = TIME_SLOTS[index];
			const base = selectedDate ?? new Date();
			const result = new Date(base);
			result.setHours(slot.h, slot.m, 0, 0);
			setSlotIndex(index);
			onChange(result);
		},
		[selectedDate, onChange],
	);

	const label = useMemo(
		() => (value ? format(value, "d MMM yyyy, HH:mm", { locale: ru }) : null),
		[value],
	);

	const footerLabel = useMemo(
		() =>
			value ? format(value, "d MMMM, HH:mm", { locale: ru }) : "Не выбрано",
		[value],
	);

	const timeSlots = useMemo(
		() =>
			TIME_SLOTS.map((slot, i) => {
				const isSelected = i === slotIndex;
				const isMidnight = slot.h === 0 && slot.m === 0;
				const isNoon = slot.h === 12 && slot.m === 0;
				return (
					<button
						key={slot.label}
						type="button"
						data-selected={isSelected}
						onClick={() => handleSlotSelect(i)}
						className={cn(
							"relative flex items-center justify-center rounded-lg py-1.5 text-sm font-medium transition-all duration-150 active:scale-95",
							isSelected
								? "bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/30"
								: "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
							(isMidnight || isNoon) &&
								!isSelected &&
								"font-semibold text-[var(--foreground)]",
						)}
					>
						{slot.label}
						{(isMidnight || isNoon) && !isSelected && (
							<span className="absolute -top-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[var(--accent)]/40" />
						)}
					</button>
				);
			}),
		[slotIndex, handleSlotSelect],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					id={id}
					type="button"
					className={cn(
						"group flex h-11 w-full items-center gap-2.5 rounded-xl border bg-white/80 px-3 py-2.5 text-sm outline-none transition-all duration-200",
						"border-[var(--border)] hover:border-[var(--accent)]/30",
						"focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15",
						open && "border-[var(--accent)] ring-2 ring-[var(--accent)]/15",
						!label && "text-[var(--muted-foreground)]",
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
						{label ?? placeholder}
					</span>
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
				className="w-[calc(100vw-2rem)] max-w-sm p-0 overflow-hidden rounded-lg border border-[var(--border)] shadow-xl bg-white flex flex-col"
				style={{ maxHeight: "var(--radix-popover-content-available-height)" }}
				align="start"
				sideOffset={6}
				collisionPadding={16}
			>
				<div className="overflow-y-auto">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleDaySelect}
						locale={ru}
						className="rounded-none border-none p-3 w-full"
					/>
				</div>

				<div className="relative flex items-center gap-3 px-4 py-0">
					<div className="h-px flex-1 bg-[var(--border)]" />
					<span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
						Время
					</span>
					<div className="h-px flex-1 bg-[var(--border)]" />
				</div>

				<div className="relative">
					<div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-white to-transparent" />
					<div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-white to-transparent" />

					<div
						ref={listRef}
						className="grid h-36 sm:h-40 grid-cols-4 overflow-y-auto overscroll-contain scroll-smooth px-2 py-3"
						style={{ scrollbarWidth: "none" }}
					>
						{timeSlots}
					</div>
				</div>

				<div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--muted)]/30 px-4 py-2.5">
					<span className="text-xs text-[var(--muted-foreground)] truncate mr-2">
						{footerLabel}
					</span>
					<button
						type="button"
						onClick={() => setOpen(false)}
						className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] active:scale-95"
					>
						<Check size={12} weight="bold" />
						Готово
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
