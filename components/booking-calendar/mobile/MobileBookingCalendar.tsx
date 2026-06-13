// Mobile booking calendar — week/day view with swipe gestures and pull-to-refresh.
"use client";
import { useCallback, useRef } from "react";
import { Spinner } from "@/components/ui/data-state-container";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { toDateString } from "@/lib/dates";
import type { Booking } from "@/types";
import ClientModal from "../../clients/ClientModal";
import HouseModal from "../../houses/HouseModal";
import BookingModal from "../shared/BookingModal";
import { useBookingCalendarController } from "../shared/useBookingCalendarController";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import WeekView from "./WeekView";

export default function MobileBookingCalendar() {
	const nav = useCalendarNavigation();
	const rangeEnd = new Date(nav.weekStart);
	rangeEnd.setDate(rangeEnd.getDate() + 6);

	const controller = useBookingCalendarController(nav.weekStart, rangeEnd);

	const containerRef = useRef<HTMLDivElement>(null);

	const handleRefresh = useCallback(async () => {
		controller.setModalBooking(undefined);
		controller.setClientModal(undefined);
		controller.setHouseModal(undefined);
		await controller.refreshAll();
	}, [
		controller.setModalBooking,
		controller.setClientModal,
		controller.setHouseModal,
		controller.refreshAll,
	]);

	const { pullDistance, isRefreshing } = usePullToRefresh(
		handleRefresh,
		containerRef,
	);

	function handleAddBooking(date: Date) {
		controller.setModalDefaultDate(toDateString(date));
		controller.setModalDefaultEndDate("");
		controller.setModalBooking(null);
	}

	return (
		<div className="min-h-dvh bg-[var(--background)] flex flex-col">
			<CalendarHeader
				title={nav.title}
				mode={nav.mode}
				onPrevMonth={nav.prevMonth}
				onNextMonth={nav.nextMonth}
				onPrevPeriod={nav.prevPeriod}
				onNextPeriod={nav.nextPeriod}
				onToday={nav.goToToday}
				onToggleMode={nav.toggleMode}
				onCreateBooking={() => {
					controller.setModalDefaultDate("");
					controller.setModalDefaultEndDate("");
					controller.setModalBooking(null);
				}}
			/>

			<div
				ref={containerRef}
				className="flex-1 overflow-y-auto scroll-smooth"
				onTouchStart={nav.onTouchStart}
				onTouchEnd={nav.onTouchEnd}
			>
				<PullToRefreshIndicator
					pullDistance={pullDistance}
					isRefreshing={isRefreshing}
				/>
				{controller.loading && !isRefreshing ? (
					<div className="flex items-center justify-center py-16">
						<Spinner />
					</div>
				) : nav.mode === "week" ? (
					<WeekView
						weekStart={nav.weekStart}
						bookings={controller.bookings}
						onBookingClick={(b: Booking) => controller.setModalBooking(b)}
						onAddBooking={handleAddBooking}
					/>
				) : (
					<DayView
						day={nav.focusDay}
						bookings={controller.bookings}
						onBookingClick={(b: Booking) => controller.setModalBooking(b)}
						onAddBooking={handleAddBooking}
					/>
				)}
			</div>

			{controller.modalBooking !== undefined && (
				<BookingModal
					booking={controller.modalBooking}
					houses={controller.houses}
					clients={controller.clients}
					users={controller.users}
					services={controller.services}
					defaultDate={controller.modalDefaultDate}
					defaultEndDate={controller.modalDefaultEndDate}
					preselectedClient={controller.preselectedClient}
					preselectedHouseId={controller.preselectedHouseId}
					onClose={() => {
						controller.setModalBooking(undefined);
						controller.setModalDefaultDate("");
						controller.setModalDefaultEndDate("");
						controller.setPreselectedClient(null);
						controller.setPreselectedHouseId("");
					}}
					onSave={controller.handleSave}
					onDelete={controller.handleDelete}
					onOpenClient={(client) => controller.setClientModal(client)}
					onCreateClient={() => controller.setClientModal(null)}
					onOpenHouse={(house) => controller.setHouseModal(house)}
					onCreateHouse={() => controller.setHouseModal(null)}
				/>
			)}

			{controller.clientModal !== undefined && (
				<ClientModal
					client={controller.clientModal}
					onClose={() => controller.setClientModal(undefined)}
					onSave={controller.handleClientSave}
				/>
			)}

			{controller.houseModal !== undefined && (
				<HouseModal
					house={controller.houseModal}
					onClose={() => controller.setHouseModal(undefined)}
					onSave={controller.handleHouseSave}
					onDelete={controller.handleHouseDelete}
				/>
			)}
		</div>
	);
}
