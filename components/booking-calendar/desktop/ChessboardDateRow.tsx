// Sticky top header for the chessboard: month band + per-day cells with today/weekend highlighting.
"use client";
import { isToday, RU_DAYS } from "@/lib/dates";
import { CELL_WIDTH, HOUSE_COL_WIDTH } from "./constants";
import type { MonthBand } from "./useChessboardDates";

type Props = {
	days: Date[];
	months: MonthBand[];
};

export default function ChessboardDateRow({ days, months }: Props) {
	return (
		<div
			className="flex flex-col bg-[var(--surface-elevated)] border-b border-[var(--border)]/70"
			style={{ width: HOUSE_COL_WIDTH + days.length * CELL_WIDTH }}
		>
			<div className="flex border-b border-[var(--border)]/40">
				<div
					className="sticky left-0 z-10 bg-[var(--surface-elevated)] border-r border-[var(--border)]/70"
					style={{ width: HOUSE_COL_WIDTH, height: 28 }}
				/>
				{months.map((m) => (
					<div
						key={`${m.label}-${m.startIndex}`}
						className="flex items-center justify-center text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide"
						style={{ width: m.span * CELL_WIDTH, height: 28 }}
					>
						{m.label}
					</div>
				))}
			</div>
			<div className="flex">
				<div
					className="sticky left-0 z-10 bg-[var(--surface-elevated)] border-r border-[var(--border)]/70"
					style={{ width: HOUSE_COL_WIDTH, height: 36 }}
				/>
				{days.map((d) => {
					const dow = d.getDay();
					const weekend = dow === 0 || dow === 6;
					const today = isToday(d);
					return (
						<div
							key={d.toISOString()}
							className={`flex flex-col items-center justify-center border-r border-[var(--border)]/40 ${
								today
									? "bg-[var(--accent-light)] text-[var(--accent)] font-bold"
									: weekend
										? "bg-[var(--surface-muted)]/50 text-[var(--foreground)]"
										: "text-[var(--foreground)]"
							}`}
							style={{ width: CELL_WIDTH, height: 36 }}
						>
							<span className="text-sm leading-none">{d.getDate()}</span>
							<span className="text-[10px] leading-none text-[var(--muted-foreground)] mt-0.5">
								{RU_DAYS[dow].toLowerCase()}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
