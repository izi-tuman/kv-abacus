export const RU_DAYS = ["ВСК", "ПНД", "ВТР", "СРД", "ЧТВ", "ПТН", "СБТ"];
export const RU_MONTHS = [
	"января",
	"февраля",
	"марта",
	"апреля",
	"мая",
	"июня",
	"июля",
	"августа",
	"сентября",
	"октября",
	"ноября",
	"декабря",
];
export const RU_MONTHS_SHORT = [
	"янв",
	"фев",
	"мар",
	"апр",
	"май",
	"июн",
	"июл",
	"авг",
	"сен",
	"окт",
	"ноя",
	"дек",
];

export const RU_MONTHS_NOM = [
	"Январь",
	"Февраль",
	"Март",
	"Апрель",
	"Май",
	"Июнь",
	"Июль",
	"Август",
	"Сентябрь",
	"Октябрь",
	"Ноябрь",
	"Декабрь",
];

/** Парсит YYYY-MM-DD как локальную дату (без сдвига UTC). */
export function parseISODateLocal(iso: string): Date | null {
	if (!iso) return null;
	const d = new Date(`${iso}T00:00:00`);
	return Number.isNaN(d.getTime()) ? null : d;
}

/** Возвращает понедельник недели, содержащей date */
export function getWeekStart(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay(); // 0=вск
	const diff = day === 0 ? -6 : 1 - day;
	d.setDate(d.getDate() + diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

/** Возвращает массив из 7 дней начиная с weekStart */
export function getWeekDays(weekStart: Date): Date[] {
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(weekStart);
		d.setDate(d.getDate() + i);
		return d;
	});
}

/** Форматирует дату в YYYY-MM-DD */
export function toDateString(date: Date): string {
	// Используем локальное время, не UTC, чтобы не было сдвига дня
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/** Форматирует диапазон недели: "9 – 15 мар." */
export function formatWeekRange(weekStart: Date): string {
	const days = getWeekDays(weekStart);
	const first = days[0];
	const last = days[6];
	if (first.getMonth() === last.getMonth()) {
		return `${first.getDate()} – ${last.getDate()} ${RU_MONTHS_SHORT[first.getMonth()]}.`;
	}
	return `${first.getDate()} ${RU_MONTHS_SHORT[first.getMonth()]}. – ${last.getDate()} ${RU_MONTHS_SHORT[last.getMonth()]}.`;
}

/** Форматирует один день: "ПНД 9 марта" */
export function formatDayHeader(date: Date): string {
	return `${RU_DAYS[date.getDay()]} ${date.getDate()} ${RU_MONTHS[date.getMonth()]}`;
}

/** Добавляет N недель к дате */
export function addWeeks(date: Date, n: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + n * 7);
	return d;
}

/** Добавляет N месяцев к дате */
export function addMonths(date: Date, n: number): Date {
	const d = new Date(date);
	d.setMonth(d.getMonth() + n);
	return d;
}

/** Добавляет N дней к дате */
export function addDays(date: Date, n: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

/** Дефолтный диапазон дат: от -1 мес до +2 мес */
export function getDefaultDates(): { from: string; to: string } {
	const now = new Date();
	const from = new Date(now);
	from.setMonth(from.getMonth() - 1);
	const to = new Date(now);
	to.setMonth(to.getMonth() + 2);
	return { from: toDateString(from), to: toDateString(to) };
}

/** Проверяет, является ли дата сегодняшней */
export function isToday(date: Date): boolean {
	const today = new Date();
	return (
		date.getFullYear() === today.getFullYear() &&
		date.getMonth() === today.getMonth() &&
		date.getDate() === today.getDate()
	);
}

/** Проверяет, попадает ли бронирование в указанный день */
export function bookingOnDay(
	checkIn: string,
	checkOut: string,
	day: Date,
): boolean {
	const dayStr = toDateString(day);
	return checkIn <= dayStr && dayStr < checkOut;
}
