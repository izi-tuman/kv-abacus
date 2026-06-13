"use client";

import { useEffect } from "react";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 text-center">
			<div className="mx-auto w-14 h-14 rounded-full bg-[var(--danger-light)] flex items-center justify-center mb-4 border border-[var(--danger)]/15">
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--danger)"
					strokeWidth="2"
					strokeLinecap="round"
					role="img"
					aria-label="Ошибка"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 8v4M12 16h.01" />
				</svg>
			</div>
			<h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
				Что-то пошло не так
			</h2>
			<p className="text-sm text-[var(--muted)] mb-6 max-w-xs">
				Произошла непредвиденная ошибка. Попробуйте обновить страницу.
			</p>
			<button
				type="button"
				onClick={reset}
				className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
			>
				Попробовать снова
			</button>
		</div>
	);
}
