// Адаптивный модальный диалог: bottom sheet на мобильном, центрированный модал на десктопе.
// Содержимое рендерится через children, заголовок через title prop.
"use client";

import {
	AnimatePresence,
	motion,
	type PanInfo,
	useMotionValue,
} from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const CLOSE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 600;

interface ModalSheetProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

const springTransition = {
	type: "spring" as const,
	damping: 28,
	stiffness: 300,
	mass: 0.8,
};

const tweenTransition = {
	type: "tween" as const,
	duration: 0.2,
	ease: "easeIn" as const,
};

export function ModalSheet({
	open,
	onClose,
	title,
	children,
}: ModalSheetProps) {
	useBodyScrollLock(open);

	const dragY = useMotionValue(0);
	const sheetRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const touchStartY = useRef(0);
	const touchStartTime = useRef(0);
	const isDraggingContent = useRef(false);

	const handleSwipeClose = useCallback(() => {
		dragY.set(0);
		onClose();
	}, [onClose, dragY]);

	const handleBackdropClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === e.currentTarget) onClose();
		},
		[onClose],
	);

	const handleDragEnd = useCallback(
		(_: unknown, info: PanInfo) => {
			if (
				info.offset.y > CLOSE_THRESHOLD ||
				info.velocity.y > SWIPE_VELOCITY_THRESHOLD
			) {
				handleSwipeClose();
			}
			dragY.set(0);
		},
		[handleSwipeClose, dragY],
	);

	useEffect(() => {
		const scrollEl = scrollRef.current;
		if (!scrollEl || !open) return;

		const onTouchStart = (e: TouchEvent) => {
			touchStartY.current = e.touches[0].clientY;
			touchStartTime.current = Date.now();
			isDraggingContent.current = false;
		};

		const onTouchMove = (e: TouchEvent) => {
			const deltaY = e.touches[0].clientY - touchStartY.current;
			const isAtTop = scrollEl.scrollTop <= 0;

			const target = e.target as HTMLElement | null;
			if (target && target !== scrollEl) {
				const nested = target.closest(
					".overscroll-contain",
				) as HTMLElement | null;
				if (nested && nested.scrollHeight > nested.clientHeight) {
					return;
				}
			}

			if (isAtTop && deltaY > 0) {
				isDraggingContent.current = true;
				e.preventDefault();
				const dampedDelta = deltaY * 0.5;
				dragY.set(dampedDelta);
			} else if (isDraggingContent.current && deltaY <= 0) {
				isDraggingContent.current = false;
				dragY.set(0);
			}
		};

		const onTouchEnd = (e: TouchEvent) => {
			if (!isDraggingContent.current) return;
			isDraggingContent.current = false;

			const deltaY = e.changedTouches[0].clientY - touchStartY.current;
			const elapsed = Date.now() - touchStartTime.current;
			const velocity = (deltaY / Math.max(elapsed, 1)) * 1000;

			if (deltaY > CLOSE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
				handleSwipeClose();
			}

			dragY.set(0);
		};

		scrollEl.addEventListener("touchstart", onTouchStart, {
			passive: true,
		});
		scrollEl.addEventListener("touchmove", onTouchMove, { passive: false });
		scrollEl.addEventListener("touchend", onTouchEnd, { passive: true });

		return () => {
			scrollEl.removeEventListener("touchstart", onTouchStart);
			scrollEl.removeEventListener("touchmove", onTouchMove);
			scrollEl.removeEventListener("touchend", onTouchEnd);
		};
	}, [open, handleSwipeClose, dragY]);

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-50 flex items-end lg:items-center justify-center modal-backdrop bg-black/35 backdrop-blur-[3px]"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					onClick={handleBackdropClick}
				>
					<motion.div
						ref={sheetRef}
						className="relative w-full max-w-md lg:max-w-xl bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--background)] lg:bg-[var(--surface-elevated)] rounded-t-2xl lg:rounded-2xl shadow-[0_-18px_48px_-18px_oklch(0.2_0.018_64/0.38)] lg:shadow-[0_12px_48px_-12px_oklch(0.2_0.018_64/0.28)] max-h-[92dvh] lg:max-h-[85dvh] flex flex-col"
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%", transition: tweenTransition }}
						transition={springTransition}
						style={{ y: dragY }}
					>
						{/* Drag handle — только на мобильном */}
						<motion.div
							className="lg:hidden flex flex-col items-center cursor-grab active:cursor-grabbing pt-3 pb-2"
							drag="y"
							dragConstraints={{ top: 0, bottom: 0 }}
							dragElastic={0}
							onDrag={(_, info: PanInfo) => {
								if (info.offset.y > 0) dragY.set(info.offset.y);
							}}
							onDragEnd={handleDragEnd}
						>
							<div className="w-11 h-1.5 rounded-full bg-[var(--border)]" />
						</motion.div>
						<div className="px-4 lg:px-6 pb-2 border-b border-[var(--border)]/60">
							<h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
								{title}
							</h2>
						</div>
						<div
							ref={scrollRef}
							className="flex-1 overflow-y-auto modal-content modal-scroll scrollbar-hidden py-1"
						>
							{children}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
