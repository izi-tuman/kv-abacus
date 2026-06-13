"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
	return (
		<svg
			className={cn("animate-spin size-6 text-[var(--accent)]", className)}
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
		>
			<circle
				className="opacity-20"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="3"
			/>
			<path
				className="opacity-80"
				d="M4 12a8 8 0 018-8"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
			/>
		</svg>
	);
}

interface DataStateContainerProps {
	loading: boolean;
	error?: string | null;
	empty: boolean;
	emptyMessage?: React.ReactNode;
	errorMessage?: string;
	children: React.ReactNode;
}

export function DataStateContainer({
	loading,
	error,
	empty,
	emptyMessage = "Ничего не найдено",
	errorMessage,
	children,
}: DataStateContainerProps) {
	if (loading) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="flex flex-col items-center gap-3">
					<Spinner className="size-8" />
					<p className="text-sm text-[var(--muted-foreground)]">Загрузка...</p>
				</div>
			</div>
		);
	}
	if (error) {
		return (
			<div className="flex items-center justify-center py-16 px-4">
				<div className="flex flex-col items-center gap-3 text-center">
					<div className="w-12 h-12 rounded-full bg-[var(--danger-light)] flex items-center justify-center">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--danger)"
							strokeWidth="2"
							strokeLinecap="round"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="m15 9-6 6M9 9l6 6" />
						</svg>
					</div>
					<p className="text-sm text-[var(--danger)]">
						{errorMessage ?? error}
					</p>
				</div>
			</div>
		);
	}
	if (empty) {
		// A plain-string message gets the default icon + <p> treatment. A custom ReactNode
		// (e.g. its own illustration/buttons) is rendered as-is — wrapping it in <p> would
		// nest <div>/<p>/<button> inside <p> and break HTML validity (hydration error).
		if (typeof emptyMessage !== "string") {
			return <>{emptyMessage}</>;
		}
		return (
			<div className="flex items-center justify-center py-16 px-4">
				<div className="flex flex-col items-center gap-3 text-center">
					<div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--accent)"
							strokeWidth="2"
							strokeLinecap="round"
						>
							<path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
						</svg>
					</div>
					<p className="text-sm text-[var(--muted-foreground)]">
						{emptyMessage}
					</p>
				</div>
			</div>
		);
	}
	return <>{children}</>;
}
