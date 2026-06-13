"use client";

import { useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/utils";

const DIGITS_ONLY = /\d/;

function extractDigits(formatted: string): string {
	const digits = formatted.replace(/\D/g, "");
	// Убираем ведущую 7
	if (digits.startsWith("7")) return digits.slice(1);
	return digits;
}

interface PhoneInputProps {
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	className?: string;
	placeholder?: string;
}

export function PhoneInput({
	value,
	onChange,
	required,
	className,
}: PhoneInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const displayValue = value ? formatPhone(value) : "+7 ";

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const raw = e.target.value;
			const digits = extractDigits(raw);

			// Форматируем и передаём наружу полный номер с +7
			if (digits.length === 0) {
				onChange("");
			} else {
				onChange(`+7${digits}`);
			}
		},
		[onChange],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			const input = inputRef.current;
			if (!input) return;

			// Разрешаем навигацию, выделение, удаление
			if (
				["ArrowLeft", "ArrowRight", "Home", "End", "Tab", "Escape"].includes(
					e.key,
				)
			) {
				return;
			}

			// Backspace: удаляем последнюю цифру
			if (e.key === "Backspace") {
				e.preventDefault();
				const digits = extractDigits(displayValue);
				if (digits.length > 0) {
					const newDigits = digits.slice(0, -1);
					onChange(newDigits.length > 0 ? `+7${newDigits}` : "");
				}
				return;
			}

			// Delete: аналогично backspace для простоты
			if (e.key === "Delete") {
				e.preventDefault();
				return;
			}

			// Ввод цифры
			if (DIGITS_ONLY.test(e.key) && e.key.length === 1) {
				e.preventDefault();
				const digits = extractDigits(displayValue);
				if (digits.length >= 10) return; // Уже полный номер
				const newDigits = digits + e.key;
				onChange(`+7${newDigits}`);
				return;
			}

			// Блокируем остальное (кроме Ctrl+A/C/V/X)
			if (!e.ctrlKey && !e.metaKey) {
				e.preventDefault();
			}
		},
		[displayValue, onChange],
	);

	const handleFocus = useCallback(() => {
		// При фокусе если пусто — показать +7
		if (!value) {
			onChange("");
		}
		// Ставим курсор в конец
		requestAnimationFrame(() => {
			const input = inputRef.current;
			if (input) {
				const len = input.value.length;
				input.setSelectionRange(len, len);
			}
		});
	}, [value, onChange]);

	const handleClick = useCallback(() => {
		// Всегда ставим курсор в конец
		requestAnimationFrame(() => {
			const input = inputRef.current;
			if (input) {
				const len = input.value.length;
				input.setSelectionRange(len, len);
			}
		});
	}, []);

	return (
		<Input
			ref={inputRef}
			type="tel"
			inputMode="numeric"
			value={displayValue}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
			onClick={handleClick}
			required={required}
			className={className}
			placeholder="+7 (___) ___-__-__"
		/>
	);
}
