"use client";

import { CalendarIcon, CaretDown } from "@phosphor-icons/react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useCallback, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
	value: string;
	onChange: (date: string) => void;
	placeholder?: string;
	id?: string;
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

export default function DateFilterPicker({
	value,
	onChange,
	placeholder = "Выберите дату",
	id,
}: Props) {
	const [open, setOpen] = useState(false);

	const handleSelect = useCallback(
		(day: Date | undefined) => {
			onChange(day ? toIso(day) : "");
			setOpen(false);
		},
		[onChange],
	);

	const label = value
		? format(parseISO(value), "d MMM yyyy", { locale: ru })
		: null;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					id={id}
					type="button"
					className={cn(
						"flex h-10 w-full items-center gap-2 rounded-xl border bg-white/80 px-3 py-2 text-sm outline-none transition-all duration-200",
						"border-[var(--border)] hover:border-[var(--accent)]/30",
						open && "border-[var(--accent)] ring-2 ring-[var(--accent)]/15",
						!label && "text-[var(--muted-foreground)]",
					)}
				>
					<CalendarIcon
						size={14}
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
						size={12}
						weight="bold"
						className={cn(
							"shrink-0 text-[var(--muted-foreground)] transition-transform duration-200",
							open && "rotate-180",
						)}
					/>
				</button>
			</PopoverTrigger>

			<PopoverContent
				className="w-fit p-0 rounded-lg border border-border shadow-xl bg-white"
				align="start"
				sideOffset={6}
				collisionPadding={16}
			>
				<Calendar
					mode="single"
					selected={toDate(value)}
					onSelect={handleSelect}
					locale={ru}
				/>
			</PopoverContent>
		</Popover>
	);
}
