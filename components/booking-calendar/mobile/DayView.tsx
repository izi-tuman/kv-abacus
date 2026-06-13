"use client";
import { useMemo } from "react";
import { bookingOnDay, formatDayHeader, isToday } from "@/lib/dates";
import type { Booking } from "@/types";
import BookingCard from "./BookingCard";
import { DayHeader, EmptyDaySlot } from "./DaySlotHelpers";

interface Props {
	day: Date;
	bookings: Booking[];
	onBookingClick: (booking: Booking) => void;
	onAddBooking: (date: Date) => void;
}

export default function DayView({
	day,
	bookings,
	onBookingClick,
	onAddBooking,
}: Props) {
	const dayBookings = useMemo(
		() => bookings.filter((b) => bookingOnDay(b.checkIn, b.checkOut, day)),
		[bookings, day],
	);
	const [dayOfWeek, ...rest] = formatDayHeader(day).split(" ");
	const today = isToday(day);

	return (
		<div className="px-4 pt-3 pb-8">
			<div className="relative">
				<div
					className={`absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-b to-transparent ${today ? "w-1 from-[var(--accent)]" : "w-0.5 from-[var(--accent)]/30"}`}
				/>
				<div className="pl-4">
					<DayHeader dayOfWeek={dayOfWeek} rest={rest} today={today} />
					{dayBookings.length === 0 ? (
						<EmptyDaySlot onAdd={() => onAddBooking(day)} />
					) : (
						dayBookings.map((b) => (
							<BookingCard key={b.id} booking={b} onClick={onBookingClick} />
						))
					)}
				</div>
			</div>
		</div>
	);
}
