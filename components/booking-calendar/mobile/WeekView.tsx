"use client";
import { useMemo } from "react";
import {
	bookingOnDay,
	formatDayHeader,
	getWeekDays,
	isToday,
} from "@/lib/dates";
import type { Booking } from "@/types";
import BookingCard from "./BookingCard";
import { DayHeader, EmptyDaySlot } from "./DaySlotHelpers";

interface Props {
	weekStart: Date;
	bookings: Booking[];
	onBookingClick: (booking: Booking) => void;
	onAddBooking: (date: Date) => void;
}

export default function WeekView({
	weekStart,
	bookings,
	onBookingClick,
	onAddBooking,
}: Props) {
	// Stable reference so dayBookingsMap below isn't invalidated on every render.
	const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

	const dayBookingsMap = useMemo(() => {
		const map = new Map<string, Booking[]>();
		for (const day of days) {
			const key = day.toDateString();
			map.set(
				key,
				bookings.filter((b) => bookingOnDay(b.checkIn, b.checkOut, day)),
			);
		}
		return map;
	}, [bookings, days]);

	return (
		<div className="px-3 pt-3 pb-8 space-y-5">
			{days.map((day) => {
				const dayBookings = dayBookingsMap.get(day.toDateString()) ?? [];
				const [dayOfWeek, ...rest] = formatDayHeader(day).split(" ");
				const today = isToday(day);
				return (
					<div key={day.toDateString()} className="relative">
						{/* Decorative left accent line */}
						<div
							className={`absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-b to-transparent ${
								today
									? "w-1 from-[var(--accent)]"
									: "w-0.5 from-[var(--accent)]/30"
							}`}
						/>
						<div className="pl-4">
							<DayHeader dayOfWeek={dayOfWeek} rest={rest} today={today} />
							{dayBookings.length === 0 ? (
								<EmptyDaySlot onAdd={() => onAddBooking(day)} />
							) : (
								dayBookings.map((b) => (
									<BookingCard
										key={b.id}
										booking={b}
										onClick={onBookingClick}
									/>
								))
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
