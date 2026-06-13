import { describe, expect, it } from "vitest";
import { parseISODateLocal } from "@/lib/dates";
import type { Booking } from "@/types";
import {
	bookingBarPosition,
	dateIndex,
	formatGuests,
	formatNights,
	nightsBetween,
	rangeHasBookingConflict,
} from "./bookingHelpers";

// 7 дней: 2026-03-09 .. 2026-03-15
const DAYS = Array.from({ length: 7 }, (_, i) => {
	const d = parseISODateLocal("2026-03-09") as Date;
	d.setDate(d.getDate() + i);
	return d;
});

function makeBooking(over: Partial<Booking>): Booking {
	return {
		id: "b1",
		houseId: "h1",
		checkIn: "2026-03-10",
		checkOut: "2026-03-12",
		clientId: "c1",
		clientFirstName: "Иван",
		clientLastName: "Петров",
		clientPhone: "+70000000000",
		guestsCount: 2,
		managerId: "m1",
		services: [],
		status: "active",
		...over,
	};
}

describe("dateIndex", () => {
	it("находит индекс дня по строке", () => {
		expect(dateIndex(DAYS, "2026-03-09")).toBe(0);
		expect(dateIndex(DAYS, "2026-03-15")).toBe(6);
	});

	it("возвращает -1 для отсутствующего дня", () => {
		expect(dateIndex(DAYS, "2026-04-01")).toBe(-1);
	});
});

describe("bookingBarPosition", () => {
	it("позиционирует бронь внутри окна (checkOut эксклюзивный)", () => {
		const pos = bookingBarPosition(makeBooking({}), DAYS);
		expect(pos).not.toBeNull();
		// checkIn 10-е → idx 1; checkOut 12-е → endIdx 3 (эксклюзив)
		expect(pos).toMatchObject({
			startIdx: 1,
			endIdx: 3,
			clippedLeft: false,
			clippedRight: false,
		});
	});

	it("возвращает null, если бронь полностью до окна", () => {
		const pos = bookingBarPosition(
			makeBooking({ checkIn: "2026-03-01", checkOut: "2026-03-09" }),
			DAYS,
		);
		expect(pos).toBeNull();
	});

	it("обрезает слева при заезде до начала окна", () => {
		const pos = bookingBarPosition(
			makeBooking({ checkIn: "2026-03-05", checkOut: "2026-03-11" }),
			DAYS,
		);
		expect(pos).toMatchObject({ startIdx: 0, clippedLeft: true });
	});

	it("обрезает справа при выезде за конец окна", () => {
		const pos = bookingBarPosition(
			makeBooking({ checkIn: "2026-03-13", checkOut: "2026-03-20" }),
			DAYS,
		);
		expect(pos).toMatchObject({ endIdx: DAYS.length, clippedRight: true });
	});
});

describe("rangeHasBookingConflict", () => {
	const bookings = [makeBooking({})]; // занят 10-11 (idx 1..2)

	it("обнаруживает пересечение в том же доме", () => {
		expect(rangeHasBookingConflict(bookings, "h1", DAYS, 1, 2)).toBe(true);
	});

	it("нет конфликта в смежном свободном диапазоне", () => {
		// бронь занимает [1,3); диапазон [3,4) свободен
		expect(rangeHasBookingConflict(bookings, "h1", DAYS, 3, 4)).toBe(false);
	});

	it("игнорирует брони другого дома", () => {
		expect(rangeHasBookingConflict(bookings, "h2", DAYS, 1, 2)).toBe(false);
	});
});

describe("nightsBetween", () => {
	it("считает количество ночей", () => {
		expect(nightsBetween("2026-03-10", "2026-03-12")).toBe(2);
	});

	it("не уходит в минус при инверсии дат", () => {
		expect(nightsBetween("2026-03-12", "2026-03-10")).toBe(0);
	});
});

describe("formatGuests (русская плюрализация)", () => {
	it.each([
		[1, "1 гость"],
		[2, "2 гостя"],
		[5, "5 гостей"],
		[11, "11 гостей"],
		[21, "21 гость"],
		[22, "22 гостя"],
	])("%i → %s", (n, expected) => {
		expect(formatGuests(n)).toBe(expected);
	});
});

describe("formatNights (русская плюрализация)", () => {
	it.each([
		[1, "1 ночь"],
		[2, "2 ночи"],
		[5, "5 ночей"],
		[11, "11 ночей"],
		[21, "21 ночь"],
	])("%i → %s", (n, expected) => {
		expect(formatNights(n)).toBe(expected);
	});
});
