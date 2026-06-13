// Computes the 5-month chessboard window (prev month -> current + 3 months) and month grouping.
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { RU_MONTHS_NOM, toDateString } from "@/lib/dates";
import { buildDayIndexMap } from "../shared/bookingHelpers";

export type MonthBand = {
	label: string;
	startIndex: number;
	span: number;
};

function todayLocal(): Date {
	const t = new Date();
	t.setHours(0, 0, 0, 0);
	return t;
}

function buildRange(anchor: Date): {
	rangeStart: Date;
	rangeEnd: Date;
	days: Date[];
	months: MonthBand[];
	todayIndex: number;
} {
	const rangeStart = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
	const rangeEnd = new Date(
		anchor.getFullYear(),
		anchor.getMonth() + 4,
		0, // last day of (anchor.month + 3)
	);

	const days: Date[] = [];
	const cursor = new Date(rangeStart);
	while (cursor <= rangeEnd) {
		days.push(new Date(cursor));
		cursor.setDate(cursor.getDate() + 1);
	}

	const months: MonthBand[] = [];
	let currentMonth = -1;
	let currentYear = -1;
	days.forEach((d, i) => {
		const m = d.getMonth();
		const y = d.getFullYear();
		if (m !== currentMonth || y !== currentYear) {
			months.push({
				label: `${RU_MONTHS_NOM[m]} ${y}`,
				startIndex: i,
				span: 1,
			});
			currentMonth = m;
			currentYear = y;
		} else {
			months[months.length - 1].span += 1;
		}
	});

	const anchorStr = toDateString(anchor);
	const todayIndex = days.findIndex((d) => toDateString(d) === anchorStr);

	return { rangeStart, rangeEnd, days, months, todayIndex };
}

export function useChessboardDates() {
	const [anchor, setAnchor] = useState<Date>(() => todayLocal());
	const anchorRef = useRef(anchor);
	anchorRef.current = anchor;

	useEffect(() => {
		const onVisible = () => {
			if (document.visibilityState !== "visible") return;
			const t = todayLocal();
			if (toDateString(t) !== toDateString(anchorRef.current)) {
				setAnchor(t);
			}
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => document.removeEventListener("visibilitychange", onVisible);
	}, []);

	return useMemo(() => {
		const range = buildRange(anchor);
		// Built once per window and shared by every row + range-selection — O(1) date lookups.
		return { ...range, dayIndexMap: buildDayIndexMap(range.days) };
	}, [anchor]);
}
