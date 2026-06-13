"use client";
import { useRef, useState } from "react";
import {
	addDays,
	addMonths,
	addWeeks,
	formatDayHeader,
	formatWeekRange,
	getWeekDays,
	getWeekStart,
} from "@/lib/dates";

function getTodayMidnight() {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
}

export function useCalendarNavigation() {
	const [mode, setMode] = useState<"week" | "day">("week");
	const [weekStart, setWeekStart] = useState(() =>
		getWeekStart(getTodayMidnight()),
	);
	const [focusDay, setFocusDay] = useState(() => getTodayMidnight());

	function goToToday() {
		const now = getTodayMidnight();
		setWeekStart(getWeekStart(now));
		setFocusDay(now);
	}

	function toggleMode() {
		if (mode === "week") {
			const days = getWeekDays(weekStart);
			setFocusDay(days[3]);
			setMode("day");
		} else {
			setWeekStart(getWeekStart(focusDay));
			setMode("week");
		}
	}

	function prevPeriod() {
		if (mode === "week") {
			setWeekStart((w) => addWeeks(w, -1));
		} else {
			const nd = addDays(focusDay, -1);
			setFocusDay(nd);
			setWeekStart(getWeekStart(nd));
		}
	}

	function nextPeriod() {
		if (mode === "week") {
			setWeekStart((w) => addWeeks(w, 1));
		} else {
			const nd = addDays(focusDay, 1);
			setFocusDay(nd);
			setWeekStart(getWeekStart(nd));
		}
	}

	function prevMonth() {
		if (mode === "week") {
			setWeekStart((w) => getWeekStart(addMonths(w, -1)));
		} else {
			const nd = addMonths(focusDay, -1);
			setFocusDay(nd);
			setWeekStart(getWeekStart(nd));
		}
	}

	function nextMonth() {
		if (mode === "week") {
			setWeekStart((w) => getWeekStart(addMonths(w, 1)));
		} else {
			const nd = addMonths(focusDay, 1);
			setFocusDay(nd);
			setWeekStart(getWeekStart(nd));
		}
	}

	// Свайп с direction lock (горизонтальный только если преобладает над вертикальным)
	const touchStartX = useRef<number | null>(null);
	const touchStartY = useRef<number | null>(null);

	function onTouchStart(e: React.TouchEvent) {
		touchStartX.current = e.touches[0].clientX;
		touchStartY.current = e.touches[0].clientY;
	}

	function onTouchEnd(e: React.TouchEvent) {
		if (touchStartX.current === null || touchStartY.current === null) return;
		const dx = e.changedTouches[0].clientX - touchStartX.current;
		const dy = e.changedTouches[0].clientY - touchStartY.current;
		if (Math.abs(dx) < 80) return;
		if (Math.abs(dy) > Math.abs(dx) * 0.6) return; // ignore diagonal / vertical-dominant swipes
		if (dx < 0) nextPeriod();
		else prevPeriod();
		touchStartX.current = null;
		touchStartY.current = null;
	}

	const title =
		mode === "week" ? formatWeekRange(weekStart) : formatDayHeader(focusDay);

	return {
		mode,
		weekStart,
		focusDay,
		title,
		goToToday,
		toggleMode,
		prevPeriod,
		nextPeriod,
		prevMonth,
		nextMonth,
		onTouchStart,
		onTouchEnd,
	};
}
