// Pure helpers that map between booking dates and chessboard day indices.
import { toDateString } from "@/lib/dates";
import type { Booking } from "@/types";

/** Lookup table date-string -> index for a `days[]` window. Build once per window. */
export function buildDayIndexMap(days: Date[]): Map<string, number> {
	const map = new Map<string, number>();
	for (let i = 0; i < days.length; i++) {
		map.set(toDateString(days[i]), i);
	}
	return map;
}

/**
 * Index of `date` within `days[]`, or -1 if not found.
 * Pass a `dayIndexMap` (from buildDayIndexMap) for O(1) lookup; otherwise falls back
 * to a linear scan — convenient for tests and one-off calls.
 */
export function dateIndex(
	days: Date[],
	date: Date | string,
	dayIndexMap?: Map<string, number>,
): number {
	const str = typeof date === "string" ? date : toDateString(date);
	if (dayIndexMap) return dayIndexMap.get(str) ?? -1;
	for (let i = 0; i < days.length; i++) {
		if (toDateString(days[i]) === str) return i;
	}
	return -1;
}

/**
 * Compute booking bar position within the visible chessboard window.
 * Returns null if the booking does not overlap the window.
 * `clippedLeft`/`clippedRight` indicate the bar is truncated at that edge.
 */
export function bookingBarPosition(
	booking: Booking,
	days: Date[],
	dayIndexMap?: Map<string, number>,
): {
	startIdx: number; // visible start (>=0)
	endIdx: number; // visible end exclusive (<= days.length)
	clippedLeft: boolean;
	clippedRight: boolean;
} | null {
	if (days.length === 0) return null;
	const firstStr = toDateString(days[0]);
	const lastStr = toDateString(days[days.length - 1]);
	// Booking occupies [checkIn, checkOut) as half-open day range (checkOut is free).
	if (booking.checkOut <= firstStr) return null;
	if (booking.checkIn > lastStr) return null;

	const clippedLeft = booking.checkIn < firstStr;
	const clippedRight = booking.checkOut > lastStr;

	const startIdx = clippedLeft
		? 0
		: dateIndex(days, booking.checkIn, dayIndexMap);
	// checkOut maps to "the day after the last occupied cell"; we want endIdx exclusive.
	const checkOutIdx = clippedRight
		? days.length
		: dateIndex(days, booking.checkOut, dayIndexMap);
	const endIdx = checkOutIdx === -1 ? days.length : checkOutIdx;

	if (startIdx < 0 || endIdx <= startIdx) return null;

	return { startIdx, endIdx, clippedLeft, clippedRight };
}

/** True if any booking for this house overlaps the [fromIdx, toIdx) half-open window. */
export function rangeHasBookingConflict(
	bookings: Booking[],
	houseId: string,
	days: Date[],
	fromIdx: number,
	toIdx: number,
	dayIndexMap?: Map<string, number>,
): boolean {
	for (const b of bookings) {
		if (b.houseId !== houseId) continue;
		if (b.status !== "active" && b.status !== "completed") continue;
		const pos = bookingBarPosition(b, days, dayIndexMap);
		if (!pos) continue;
		// Overlap of half-open intervals [a,b) and [c,d): a<d && c<b.
		if (pos.startIdx < toIdx && fromIdx < pos.endIdx) return true;
	}
	return false;
}

/** Format guests count with Russian plural form. */
export function formatGuests(n: number): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return `${n} гость`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
		return `${n} гостя`;
	return `${n} гостей`;
}

/** Count nights between two ISO dates (checkOut exclusive). */
export function nightsBetween(checkIn: string, checkOut: string): number {
	const a = new Date(`${checkIn}T00:00:00`).getTime();
	const b = new Date(`${checkOut}T00:00:00`).getTime();
	return Math.max(0, Math.round((b - a) / 86400000));
}

/** Format nights count with Russian plural form. */
export function formatNights(n: number): string {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return `${n} ночь`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
		return `${n} ночи`;
	return `${n} ночей`;
}
