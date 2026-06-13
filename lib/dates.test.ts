import { describe, expect, it } from "vitest";
import {
	addDays,
	addMonths,
	addWeeks,
	bookingOnDay,
	formatWeekRange,
	getWeekDays,
	getWeekStart,
	parseISODateLocal,
	toDateString,
} from "./dates";

describe("parseISODateLocal", () => {
	it("парсит YYYY-MM-DD как локальную дату без сдвига UTC", () => {
		const d = parseISODateLocal("2026-03-09");
		expect(d).not.toBeNull();
		expect(d?.getFullYear()).toBe(2026);
		expect(d?.getMonth()).toBe(2); // март
		expect(d?.getDate()).toBe(9);
	});

	it("возвращает null для пустой или некорректной строки", () => {
		expect(parseISODateLocal("")).toBeNull();
		expect(parseISODateLocal("не-дата")).toBeNull();
	});
});

describe("getWeekStart", () => {
	it("возвращает понедельник для даты в середине недели", () => {
		// 2026-03-11 — среда
		const monday = getWeekStart(new Date(2026, 2, 11));
		expect(monday.getDay()).toBe(1);
		expect(toDateString(monday)).toBe("2026-03-09");
	});

	it("для воскресенья возвращает понедельник той же недели (не следующей)", () => {
		// 2026-03-15 — воскресенье
		const monday = getWeekStart(new Date(2026, 2, 15));
		expect(toDateString(monday)).toBe("2026-03-09");
	});
});

describe("getWeekDays", () => {
	it("возвращает 7 последовательных дней", () => {
		const days = getWeekDays(new Date(2026, 2, 9));
		expect(days).toHaveLength(7);
		expect(toDateString(days[0])).toBe("2026-03-09");
		expect(toDateString(days[6])).toBe("2026-03-15");
	});
});

describe("toDateString", () => {
	it("форматирует с ведущими нулями", () => {
		expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
	});
});

describe("formatWeekRange", () => {
	it("в пределах одного месяца показывает месяц один раз", () => {
		expect(formatWeekRange(new Date(2026, 2, 9))).toBe("9 – 15 мар.");
	});

	it("на стыке месяцев показывает оба месяца", () => {
		// неделя с 30 марта по 5 апреля
		expect(formatWeekRange(new Date(2026, 2, 30))).toBe("30 мар. – 5 апр.");
	});
});

describe("addWeeks / addMonths / addDays", () => {
	it("addDays не мутирует исходную дату", () => {
		const base = new Date(2026, 2, 9);
		const next = addDays(base, 3);
		expect(toDateString(next)).toBe("2026-03-12");
		expect(toDateString(base)).toBe("2026-03-09");
	});

	it("addWeeks сдвигает на N*7 дней", () => {
		expect(toDateString(addWeeks(new Date(2026, 2, 9), 2))).toBe("2026-03-23");
	});

	it("addMonths сдвигает на месяцы", () => {
		expect(toDateString(addMonths(new Date(2026, 2, 9), 1))).toBe("2026-04-09");
	});
});

describe("bookingOnDay", () => {
	const day = (s: string) => parseISODateLocal(s) as Date;

	it("включает день заезда", () => {
		expect(bookingOnDay("2026-03-09", "2026-03-12", day("2026-03-09"))).toBe(
			true,
		);
	});

	it("исключает день выезда (checkOut свободен)", () => {
		expect(bookingOnDay("2026-03-09", "2026-03-12", day("2026-03-12"))).toBe(
			false,
		);
	});

	it("исключает дни вне диапазона", () => {
		expect(bookingOnDay("2026-03-09", "2026-03-12", day("2026-03-08"))).toBe(
			false,
		);
	});
});
