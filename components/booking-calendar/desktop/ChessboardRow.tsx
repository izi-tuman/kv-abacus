// One house row — background cells, range-selection overlay, and absolutely-positioned booking bars.
"use client";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { isToday } from "@/lib/dates";
import type { Booking, House } from "@/types";
import { bookingBarPosition } from "../shared/bookingHelpers";
import BookingBar from "./BookingBar";
import ChessboardCell from "./ChessboardCell";

import { CELL_WIDTH, HOUSE_COL_WIDTH, ROW_HEIGHT } from "./constants";

export type RangeSelectionState =
	| { phase: "idle" }
	| {
			phase: "picking-end";
			houseId: string;
			anchorIndex: number;
			hoverIndex: number;
			conflict: boolean;
	  };

// Selection overlay narrowed to a single row. Parent computes it so unrelated rows
// receive `null` (a stable prop) and skip re-render on hover thanks to memo().
export type RowSelection = { left: number; width: number; conflict: boolean };

type Props = {
	house: House;
	days: Date[];
	bookings: Booking[];
	dayIndexMap: Map<string, number>;
	rowSelection: RowSelection | null;
	onCellHover: (houseId: string, idx: number) => void;
	onCellClick: (houseId: string, idx: number) => void;
	onBookingClick: (booking: Booking, anchor: HTMLElement) => void;
};

function ChessboardRow({
	house,
	days,
	bookings,
	dayIndexMap,
	rowSelection,
	onCellHover,
	onCellClick,
	onBookingClick,
}: Props) {
	const cellsRef = useRef<HTMLDivElement>(null);

	const indexFromEvent = useCallback((clientX: number) => {
		const el = cellsRef.current;
		if (!el) return -1;
		const rect = el.getBoundingClientRect();
		const x = clientX - rect.left;
		if (x < 0 || x >= rect.width) return -1;
		return Math.floor(x / CELL_WIDTH);
	}, []);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const idx = indexFromEvent(e.clientX);
			if (idx >= 0) onCellHover(house.id, idx);
		},
		[house.id, indexFromEvent, onCellHover],
	);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			// Ignore clicks landing on a BookingBar (it stops propagation via its own onClick path).
			if ((e.target as HTMLElement).closest("[data-booking-bar]")) return;
			const idx = indexFromEvent(e.clientX);
			if (idx >= 0) onCellClick(house.id, idx);
		},
		[house.id, indexFromEvent, onCellClick],
	);

	const overlayConflict = rowSelection?.conflict ?? false;

	const houseBookings = useMemo(
		() => bookings.filter((b) => b.houseId === house.id),
		[bookings, house.id],
	);

	// Keyboard navigation state
	const [focusedIndex, setFocusedIndex] = useState(() => {
		const idx = days.findIndex((d) => isToday(d));
		return idx >= 0 ? idx : 0;
	});

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				setFocusedIndex((i) => Math.max(0, i - 1));
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				setFocusedIndex((i) => Math.min(days.length - 1, i + 1));
			} else if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onCellClick(house.id, focusedIndex);
			}
		},
		[days.length, focusedIndex, house.id, onCellClick],
	);

	return (
		<div className="flex border-b border-[var(--border)]/40">
			<div
				className="sticky left-0 z-10 flex items-center px-3 bg-[var(--surface-elevated)] border-r border-[var(--border)]/70"
				style={{ width: HOUSE_COL_WIDTH, height: ROW_HEIGHT }}
			>
				<div className="flex flex-col min-w-0">
					<span className="truncate text-sm font-semibold text-[var(--foreground)]">
						{house.name}
					</span>
					<span className="truncate text-[10px] text-[var(--muted-foreground)]">
						{house.capacity} мест · {house.basePrice} ₽
					</span>
				</div>
			</div>
			{/* biome-ignore lint/a11y/useSemanticElements: interactive chessboard uses grid role for keyboard range selection */}
			<div
				ref={cellsRef}
				tabIndex={0}
				role="grid"
				aria-label={`Дом ${house.name}. Используйте стрелки влево/вправо для навигации по дням, Enter или Пробел для выбора диапазона.`}
				className={`relative shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] ${
					overlayConflict ? "cursor-not-allowed" : ""
				}`}
				style={{ width: days.length * CELL_WIDTH, height: ROW_HEIGHT }}
				onMouseMove={handleMouseMove}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
			>
				{days.map((d) => (
					<div key={d.toISOString()} className="inline-block align-top">
						<ChessboardCell day={d} rowHeight={ROW_HEIGHT} />
					</div>
				))}
				{/* Keyboard focus indicator */}
				<div
					className="pointer-events-none absolute top-0 bottom-0 z-[5] ring-2 ring-inset ring-[var(--accent)]"
					style={{ left: focusedIndex * CELL_WIDTH, width: CELL_WIDTH }}
				/>
				{rowSelection && (
					<div
						className={`pointer-events-none absolute top-0 bottom-0 ${
							overlayConflict
								? "bg-[var(--danger-light)]/70"
								: "bg-[var(--accent-light)]/60"
						}`}
						style={{ left: rowSelection.left, width: rowSelection.width }}
					/>
				)}
				{houseBookings.map((b) => {
					const pos = bookingBarPosition(b, days, dayIndexMap);
					if (!pos) return null;
					return (
						<div key={b.id} data-booking-bar>
							<BookingBar
								booking={b}
								startIdx={pos.startIdx}
								endIdx={pos.endIdx}
								clippedLeft={pos.clippedLeft}
								clippedRight={pos.clippedRight}
								rowHeight={ROW_HEIGHT}
								onClick={onBookingClick}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// memo: with rowSelection narrowed per-row, only the hovered row re-renders on mousemove.
export default memo(ChessboardRow);
