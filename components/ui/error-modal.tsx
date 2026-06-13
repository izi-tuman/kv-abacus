"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorModalProps {
	error: string | null;
	onClose: () => void;
}

export function ErrorModal({ error, onClose }: ErrorModalProps) {
	useEffect(() => {
		if (!error) return;
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [error, onClose]);

	return (
		<AnimatePresence>
			{error && (
				<motion.div
					className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/30 backdrop-blur-[2px]"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
				>
					<motion.div
						className="w-full max-w-sm bg-[var(--surface-elevated)] rounded-2xl shadow-[0_12px_40px_-8px_oklch(0.2_0.015_50/0.25)] p-6 text-center"
						initial={{ scale: 0.9, y: 20 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.9, y: 20 }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mx-auto w-14 h-14 rounded-full bg-[var(--danger-light)] flex items-center justify-center mb-4 border border-[var(--danger)]/15">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="var(--danger)"
								strokeWidth="2"
								strokeLinecap="round"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M12 8v4M12 16h.01" />
							</svg>
						</div>
						<p className="text-sm text-[var(--foreground)] leading-relaxed mb-5">
							{error}
						</p>
						<Button onClick={onClose} variant="secondary" className="w-full">
							Закрыть
						</Button>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
