import { describe, expect, it } from "vitest";
import { initialForm } from "./BookingEditForm";

describe("initialForm (выбор checkOut для новой брони)", () => {
	it("без defaultDate возвращает пустую форму", () => {
		const f = initialForm();
		expect(f.checkIn).toBe("");
		expect(f.checkOut).toBe("");
	});

	it("использует defaultEndDate из выбранного диапазона", () => {
		// Главный баг: выбор 10–14 марта должен дать checkOut=14, а не 11.
		const f = initialForm("2026-03-10", "2026-03-14");
		expect(f.checkIn).toBe("2026-03-10");
		expect(f.checkOut).toBe("2026-03-14");
	});

	it("без defaultEndDate ставит checkOut = checkIn + 1 ночь", () => {
		const f = initialForm("2026-03-10");
		expect(f.checkIn).toBe("2026-03-10");
		expect(f.checkOut).toBe("2026-03-11");
	});

	it("игнорирует defaultEndDate, если он не позже checkIn (защита от мусора)", () => {
		const f = initialForm("2026-03-10", "2026-03-10");
		expect(f.checkOut).toBe("2026-03-11");
		const f2 = initialForm("2026-03-10", "2026-03-05");
		expect(f2.checkOut).toBe("2026-03-11");
	});
});
