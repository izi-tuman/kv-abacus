"use client";

import { MagnifyingGlassIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import type React from "react";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	/** @deprecated icon больше не используется в шапке — оставлено для обратной совместимости */
	icon?: React.ReactNode;
	onAdd?: () => void;
	/** @deprecated FAB-кнопка не отображает текст */
	addLabel?: string;
	addAriaLabel?: string;
	searchQuery?: string;
	onSearchChange?: (q: string) => void;
	searchPlaceholder?: string;
}

export function PageHeader({
	title,
	subtitle,
	onAdd,
	addAriaLabel = "Добавить",
	searchQuery,
	onSearchChange,
	searchPlaceholder = "Поиск...",
}: PageHeaderProps) {
	const hasSearch = onSearchChange !== undefined;

	const searchField = hasSearch ? (
		<div className="flex items-center gap-2 px-3.5 h-11 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[var(--shadow-soft)] backdrop-blur-sm transition-colors focus-within:border-[var(--accent)]/50 focus-within:shadow-[var(--shadow-card)]">
			<MagnifyingGlassIcon
				size={18}
				className="text-[var(--muted-foreground)] shrink-0"
			/>
			<input
				value={searchQuery}
				onChange={(e) => onSearchChange(e.target.value)}
				placeholder={searchPlaceholder}
				aria-label="Поиск"
				className="flex-1 bg-transparent border-0 outline-none text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] min-w-0"
			/>
			{searchQuery?.trim() ? (
				<button
					type="button"
					onClick={() => onSearchChange("")}
					aria-label="Очистить поиск"
					className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--border)] active:scale-95 transition-all shrink-0"
				>
					<XIcon size={14} weight="bold" />
				</button>
			) : null}
		</div>
	) : null;

	return (
		<div className="bg-[var(--background)]/88 backdrop-blur-xl px-4 pt-3 pb-3 border-b border-[var(--border)]/60">
			{/* Title row: title/subtitle + add button. Search drops to its own full-width row on
			    mobile; on desktop it sits inline in the middle and stretches. */}
			<div className="flex items-center gap-3 lg:gap-4">
				<div className="min-w-0 lg:shrink-0">
					<h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight truncate">
						{title}
					</h1>
					{subtitle && (
						<p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5 truncate">
							{subtitle}
						</p>
					)}
				</div>

				{/* Inline search on desktop only */}
				{searchField && (
					<div className="hidden lg:block flex-1 min-w-0 max-w-md">
						{searchField}
					</div>
				)}

				{onAdd && (
					<button
						type="button"
						onClick={onAdd}
						className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shadow-[var(--shadow-accent)] active:scale-95 transition-all shrink-0 ml-auto"
						aria-label={addAriaLabel}
					>
						<PlusIcon size={18} weight="bold" />
					</button>
				)}
			</div>

			{/* Full-width search row on mobile */}
			{searchField && <div className="lg:hidden mt-3">{searchField}</div>}
		</div>
	);
}
