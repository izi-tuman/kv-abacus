// Background day cell in a chessboard row — border + weekend tint. No event handlers (delegated to row).
"use client";
import { memo } from "react";
import { isToday } from "@/lib/dates";

import { CELL_WIDTH } from "./constants";

type Props = {
	day: Date;
	rowHeight: number;
};

// memo: cells are identical across every hover-driven re-render of the row.
function ChessboardCell({ day, rowHeight }: Props) {
	const dow = day.getDay();
	const weekend = dow === 0 || dow === 6;
	const today = isToday(day);
	return (
		<div
			className={`shrink-0 border-r border-[var(--border)]/40 ${
				today
					? "bg-[var(--accent-light)]/30"
					: weekend
						? "bg-[var(--surface-muted)]/40"
						: ""
			}`}
			style={{ width: CELL_WIDTH, height: rowHeight }}
		/>
	);
}

export default memo(ChessboardCell);
