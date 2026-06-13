"use client";

import { TrashIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/data-state-container";

interface ConfirmDeleteDialogProps {
	open: boolean;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	loading?: boolean;
}

export function ConfirmDeleteDialog({
	open,
	message,
	onConfirm,
	onCancel,
	loading = false,
}: ConfirmDeleteDialogProps) {
	useEffect(() => {
		if (!open) return;
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape" && !loading) onCancel();
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onCancel, loading]);

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/30 backdrop-blur-[2px]"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={() => !loading && onCancel()}
				>
					<motion.div
						className="w-full max-w-sm bg-[var(--surface-elevated)] rounded-2xl shadow-[0_12px_40px_-8px_oklch(0.2_0.015_50/0.25)] p-6 text-center"
						initial={{ scale: 0.9, y: 20 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.9, y: 20 }}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mx-auto w-14 h-14 rounded-full bg-[var(--danger-light)] flex items-center justify-center mb-4 border border-[var(--danger)]/15">
							<TrashIcon size={24} className="text-[var(--danger)]" />
						</div>
						<p className="text-sm text-[var(--foreground)] leading-relaxed mb-5">
							{message}
						</p>
						<div className="flex gap-2">
							<Button
								variant="secondary"
								onClick={onCancel}
								className="flex-1"
								disabled={loading}
							>
								Отмена
							</Button>
							<Button
								variant="destructive"
								onClick={onConfirm}
								disabled={loading}
								className="flex-1"
							>
								{loading ? (
									<span className="flex items-center gap-2">
										<Spinner className="size-4 text-current" />
										Удаляю...
									</span>
								) : (
									"Удалить"
								)}
							</Button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
