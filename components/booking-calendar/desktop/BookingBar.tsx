// Horizontal booking bar inside a chessboard row.
"use client";
import { memo } from "react";
import type { Booking } from "@/types";
import { formatGuests } from "../shared/bookingHelpers";

import { BAR_INSET, CELL_WIDTH } from "./constants";

const STATUS_BG: Record<Booking["status"], string> = {
	active: "bg-[var(--accent)] text-white",
	completed: "bg-[var(--muted-foreground)] text-white",
};

type Props = {
	booking: Booking;
	startIdx: number;
	endIdx: number; // exclusive
	clippedLeft: boolean;
	clippedRight: boolean;
	rowHeight: number;
	onClick: (booking: Booking, anchor: HTMLElement) => void;
};

function BookingBar({
	booking,
	startIdx,
	endIdx,
	clippedLeft,
	clippedRight,
	rowHeight,
	onClick,
}: Props) {
	const left = startIdx * CELL_WIDTH + BAR_INSET;
	const width = (endIdx - startIdx) * CELL_WIDTH - BAR_INSET * 2;
	// Round only the outer corners; a clipped edge stays square so it reads as continuing off-screen.
	const leftRadius = clippedLeft ? "0" : "6px";
	const rightRadius = clippedRight ? "0" : "6px";
	const radius = `${leftRadius} ${rightRadius} ${rightRadius} ${leftRadius}`;
	const fullName =
		`${booking.clientFirstName} ${booking.clientLastName ?? ""}`.trim();

	return (
		<button
			type="button"
			onClick={(e) => onClick(booking, e.currentTarget)}
			className={`absolute flex flex-col items-start justify-center px-2 py-0.5 text-left shadow-sm hover:brightness-105 transition-[filter] cursor-pointer ${STATUS_BG[booking.status]}`}
			style={{
				left,
				width,
				top: 4,
				height: rowHeight - 8,
				borderRadius: radius,
			}}
		>
			<span className="truncate w-full text-[10px] leading-tight font-semibold">
				{fullName || "Без имени"}
			</span>
			<span className="truncate w-full text-[10px] leading-tight opacity-90">
				{booking.clientPhone}
			</span>
			<span className="truncate w-full text-[10px] leading-tight opacity-90">
				{formatGuests(booking.guestsCount)}
			</span>
		</button>
	);
}

// memo: bars only change when their booking or window position changes, not on hover.
export default memo(BookingBar);
