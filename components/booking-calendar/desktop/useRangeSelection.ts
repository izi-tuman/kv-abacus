// Two-click range selection for empty cells in a chessboard row.
"use client";
import { useCallback, useEffect, useState } from "react";
import type { Booking } from "@/types";
import { rangeHasBookingConflict } from "../shared/bookingHelpers";
import type { RangeSelectionState } from "./ChessboardRow";

export function useRangeSelection(
	bookings: Booking[],
	days: Date[],
	onConfirm: (houseId: string, fromIdx: number, toIdx: number) => void,
	dayIndexMap?: Map<string, number>,
) {
	const [selection, setSelection] = useState<RangeSelectionState>({
		phase: "idle",
	});

	const onCellHover = useCallback(
		(houseId: string, idx: number) => {
			setSelection((prev) => {
				if (prev.phase !== "picking-end") return prev;
				if (prev.houseId !== houseId) return prev;
				if (prev.hoverIndex === idx) return prev;
				const from = Math.min(prev.anchorIndex, idx);
				const to = Math.max(prev.anchorIndex, idx);
				// Selection covers [from, to] inclusive (visual); for conflict we use half-open [from, to+1)
				// because a one-night booking occupies a single cell (checkout = next day, free).
				const conflict = rangeHasBookingConflict(
					bookings,
					houseId,
					days,
					from,
					to + 1,
					dayIndexMap,
				);
				return { ...prev, hoverIndex: idx, conflict };
			});
		},
		[bookings, days, dayIndexMap],
	);

	const onCellClick = useCallback(
		(houseId: string, idx: number) => {
			setSelection((prev) => {
				if (prev.phase === "idle") {
					const conflict = rangeHasBookingConflict(
						bookings,
						houseId,
						days,
						idx,
						idx + 1,
						dayIndexMap,
					);
					return {
						phase: "picking-end",
						houseId,
						anchorIndex: idx,
						hoverIndex: idx,
						conflict,
					};
				}
				if (prev.houseId !== houseId) {
					return { phase: "idle" };
				}
				const from = Math.min(prev.anchorIndex, idx);
				const to = Math.max(prev.anchorIndex, idx);
				const conflict = rangeHasBookingConflict(
					bookings,
					houseId,
					days,
					from,
					to + 1,
					dayIndexMap,
				);
				if (conflict) return prev; // ignore second click
				onConfirm(houseId, from, to);
				return { phase: "idle" };
			});
		},
		[bookings, days, onConfirm, dayIndexMap],
	);

	const reset = useCallback(() => setSelection({ phase: "idle" }), []);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") reset();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [reset]);

	return { selection, onCellHover, onCellClick, reset };
}
