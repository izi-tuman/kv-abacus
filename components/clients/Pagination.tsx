"use client";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface Props {
	page: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}

export default function Pagination({
	page,
	totalPages,
	totalItems,
	pageSize,
	onPageChange,
}: Props) {
	if (totalPages <= 1) return null;

	const from = (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, totalItems);

	function getPages(): (number | string)[] {
		if (totalPages <= 5) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}
		const pages: (number | string)[] = [1];
		if (page > 3) pages.push("...left");
		for (
			let p = Math.max(2, page - 1);
			p <= Math.min(totalPages - 1, page + 1);
			p++
		) {
			pages.push(p);
		}
		if (page < totalPages - 2) pages.push("...right");
		pages.push(totalPages);
		return pages;
	}

	return (
		<div className="flex flex-col items-center gap-3 py-4">
			<span className="text-[var(--muted-foreground)] text-sm">
				{from}–{to} из {totalItems}
			</span>
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => onPageChange(page - 1)}
					disabled={page === 1}
					aria-label="Предыдущая страница"
					className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] disabled:opacity-30"
				>
					<CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
				</button>

				{getPages().map((p) =>
					typeof p === "string" ? (
						<span
							key={p}
							className="w-8 h-8 flex items-center justify-center text-[var(--muted-foreground)] text-sm"
						>
							...
						</span>
					) : (
						<button
							key={p}
							type="button"
							onClick={() => onPageChange(p)}
							aria-label={`Перейти на страницу ${p}`}
							aria-current={p === page ? "page" : undefined}
							className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
								p === page
									? "bg-[var(--accent)] text-white"
									: "text-[var(--muted-foreground)] hover:bg-[var(--border)]"
							}`}
						>
							{p}
						</button>
					),
				)}

				<button
					type="button"
					onClick={() => onPageChange(page + 1)}
					disabled={page === totalPages}
					aria-label="Следующая страница"
					className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] disabled:opacity-30"
				>
					<CaretRightIcon size={16} weight="bold" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}
