import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parseNumber(value: string, fallback = 0): number {
	const n = Number(value);
	return Number.isNaN(n) || value === "" ? fallback : n;
}

/** Russian phone display mask: "+7 (XXX) XXX-XX-XX". Accepts any input with digits. */
export function formatPhone(raw: string): string {
	if (!raw) return "";
	let digits = raw.replace(/\D/g, "");
	if (digits.startsWith("7") || digits.startsWith("8")) {
		digits = digits.slice(1);
	}
	digits = digits.slice(0, 10);
	if (digits.length === 0) return "+7 ";

	let result = "+7 (";
	for (let i = 0; i < digits.length; i++) {
		if (i === 3) result += ") ";
		if (i === 6) result += "-";
		if (i === 8) result += "-";
		result += digits[i];
	}
	return result;
}
