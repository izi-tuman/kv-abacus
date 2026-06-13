// Scrollable wrapper that hosts the sticky date row and the house rows.
"use client";
import { forwardRef, type ReactNode } from "react";
import ChessboardDateRow from "./ChessboardDateRow";
import { CELL_WIDTH, HOUSE_COL_WIDTH } from "./constants";
import type { MonthBand } from "./useChessboardDates";

type Props = {
	days: Date[];
	months: MonthBand[];
	children: ReactNode;
};

const ChessboardGrid = forwardRef<HTMLDivElement, Props>(
	function ChessboardGrid({ days, months, children }, ref) {
		return (
			<div
				ref={ref}
				className="relative h-full overflow-auto border border-[var(--border)]/70 rounded-md bg-[var(--background)]"
			>
				<div style={{ width: HOUSE_COL_WIDTH + days.length * CELL_WIDTH }}>
					<div className="sticky top-0 z-20">
						<ChessboardDateRow days={days} months={months} />
					</div>
					{children}
				</div>
			</div>
		);
	},
);

export default ChessboardGrid;
