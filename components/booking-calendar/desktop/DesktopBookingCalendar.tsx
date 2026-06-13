// Desktop chessboard calendar — rows = houses, columns = days, sticky top + sticky left.
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "@/components/ui/data-state-container";
import { addDays, toDateString } from "@/lib/dates";
import type { Booking } from "@/types";
import ClientModal from "../../clients/ClientModal";
import HouseModal from "../../houses/HouseModal";
import BookingModal from "../shared/BookingModal";
import { useBookingCalendarController } from "../shared/useBookingCalendarController";
import BookingPreviewPopover from "./BookingPreviewPopover";
import ChessboardGrid from "./ChessboardGrid";
import ChessboardHeader from "./ChessboardHeader";
import ChessboardRow from "./ChessboardRow";
import { CELL_WIDTH } from "./constants";
import { useChessboardDates } from "./useChessboardDates";
import { useRangeSelection } from "./useRangeSelection";

export default function DesktopBookingCalendar() {
	const { rangeStart, rangeEnd, days, months, todayIndex, dayIndexMap } =
		useChessboardDates();

	const c = useBookingCalendarController(rangeStart, rangeEnd);

	const scrollRef = useRef<HTMLDivElement>(null);
	const didInitialScroll = useRef(false);

	const scrollToIndex = useCallback((idx: number, offsetFromLeft = 120) => {
		const el = scrollRef.current;
		if (!el || idx < 0) return;
		el.scrollTo({
			left: idx * CELL_WIDTH - offsetFromLeft,
			behavior: "smooth",
		});
	}, []);

	const activeHouses = useMemo(
		() => c.houses.filter((h) => h.isActive),
		[c.houses],
	);

	// The grid (and thus scrollRef) mounts only once data has loaded. gridReady is in the
	// deps so this effect re-runs when the grid appears, otherwise scrollRef is still null
	// on first run and today never gets scrolled into view.
	const gridReady = !c.loading && activeHouses.length > 0;
	useEffect(() => {
		if (didInitialScroll.current || !gridReady) return;
		if (todayIndex >= 0 && scrollRef.current) {
			scrollRef.current.scrollLeft = todayIndex * CELL_WIDTH - 120;
			didInitialScroll.current = true;
		}
	}, [todayIndex, gridReady]);

	const handlePrevMonth = () => {
		const el = scrollRef.current;
		if (!el) return;
		const approx = 30 * CELL_WIDTH;
		el.scrollTo({
			left: Math.max(0, el.scrollLeft - approx),
			behavior: "smooth",
		});
	};
	const handleNextMonth = () => {
		const el = scrollRef.current;
		if (!el) return;
		const approx = 30 * CELL_WIDTH;
		el.scrollTo({ left: el.scrollLeft + approx, behavior: "smooth" });
	};
	const handleToday = () => scrollToIndex(todayIndex);

	const [preview, setPreview] = useState<{
		booking: Booking;
		anchor: HTMLElement;
	} | null>(null);

	const handleConfirmRange = useCallback(
		(houseId: string, fromIdx: number, toIdx: number) => {
			// The last selected cell IS the checkout day (заезд в первый, выезд в последний).
			// Single-cell selection (fromIdx == toIdx) → one-night booking: checkOut = next day.
			const dateFrom = toDateString(days[fromIdx]);
			const dateTo =
				toIdx > fromIdx
					? toDateString(days[toIdx])
					: toDateString(addDays(days[fromIdx], 1));
			c.setModalDefaultDate(dateFrom);
			c.setModalDefaultEndDate(dateTo);
			c.setPreselectedHouseId(houseId);
			c.setModalBooking(null);
		},
		[c, days],
	);

	const { selection, onCellHover, onCellClick, reset } = useRangeSelection(
		c.bookings,
		days,
		handleConfirmRange,
		dayIndexMap,
	);

	useEffect(() => {
		const onScroll = () => reset();
		const el = scrollRef.current;
		el?.addEventListener("scroll", onScroll);
		return () => el?.removeEventListener("scroll", onScroll);
	}, [reset]);

	const handleBookingClick = useCallback(
		(booking: Booking, anchor: HTMLElement) => setPreview({ booking, anchor }),
		[],
	);

	// Pre-compute the overlay rect for the row currently being selected. Every other row
	// gets `null` — a stable prop — so memo(ChessboardRow) skips them on each mousemove.
	const selectedOverlay = useMemo(() => {
		if (selection.phase !== "picking-end") return null;
		const from = Math.min(selection.anchorIndex, selection.hoverIndex);
		const to = Math.max(selection.anchorIndex, selection.hoverIndex);
		return {
			houseId: selection.houseId,
			left: from * CELL_WIDTH,
			width: (to - from + 1) * CELL_WIDTH,
			conflict: selection.conflict,
		};
	}, [selection]);

	return (
		<div className="flex flex-col h-dvh bg-[var(--background)]">
			<ChessboardHeader
				onPrevMonth={handlePrevMonth}
				onNextMonth={handleNextMonth}
				onToday={handleToday}
				onCreate={() => {
					c.setModalDefaultDate("");
					c.setModalDefaultEndDate("");
					c.setPreselectedHouseId("");
					c.setModalBooking(null);
				}}
			/>
			<div className="flex-1 min-h-0 p-3">
				{c.loading && c.bookings.length === 0 ? (
					<div className="flex items-center justify-center py-16">
						<Spinner />
					</div>
				) : activeHouses.length === 0 ? (
					<div className="flex items-center justify-center py-16 text-[var(--muted-foreground)]">
						Нет домов. Создайте дом в разделе «Дома».
					</div>
				) : (
					<ChessboardGrid ref={scrollRef} days={days} months={months}>
						{activeHouses.map((house) => (
							<ChessboardRow
								key={house.id}
								house={house}
								days={days}
								bookings={c.bookings}
								dayIndexMap={dayIndexMap}
								rowSelection={
									selectedOverlay?.houseId === house.id
										? {
												left: selectedOverlay.left,
												width: selectedOverlay.width,
												conflict: selectedOverlay.conflict,
											}
										: null
								}
								onCellHover={onCellHover}
								onCellClick={onCellClick}
								onBookingClick={handleBookingClick}
							/>
						))}
					</ChessboardGrid>
				)}
			</div>

			<BookingPreviewPopover
				booking={preview?.booking ?? null}
				anchor={preview?.anchor ?? null}
				onClose={() => setPreview(null)}
				onEdit={(b) => {
					setPreview(null);
					c.setModalBooking(b);
				}}
				onDelete={c.handleDelete}
			/>

			{c.modalBooking !== undefined && (
				<BookingModal
					booking={c.modalBooking}
					houses={c.houses}
					clients={c.clients}
					users={c.users}
					services={c.services}
					defaultDate={c.modalDefaultDate}
					defaultEndDate={c.modalDefaultEndDate}
					preselectedClient={c.preselectedClient}
					preselectedHouseId={c.preselectedHouseId}
					onClose={() => {
						c.setModalBooking(undefined);
						c.setModalDefaultDate("");
						c.setModalDefaultEndDate("");
						c.setPreselectedClient(null);
						c.setPreselectedHouseId("");
					}}
					onSave={c.handleSave}
					onDelete={c.handleDelete}
					onOpenClient={(client) => c.setClientModal(client)}
					onCreateClient={() => c.setClientModal(null)}
					onOpenHouse={(house) => c.setHouseModal(house)}
					onCreateHouse={() => c.setHouseModal(null)}
				/>
			)}

			{c.clientModal !== undefined && (
				<ClientModal
					client={c.clientModal}
					onClose={() => c.setClientModal(undefined)}
					onSave={c.handleClientSave}
				/>
			)}

			{c.houseModal !== undefined && (
				<HouseModal
					house={c.houseModal}
					onClose={() => c.setHouseModal(undefined)}
					onSave={c.handleHouseSave}
					onDelete={c.handleHouseDelete}
				/>
			)}
		</div>
	);
}
