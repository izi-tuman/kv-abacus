"use client";

const THRESHOLD = 90;

interface Props {
	pullDistance: number;
	isRefreshing: boolean;
}

export default function PullToRefreshIndicator({
	pullDistance,
	isRefreshing,
}: Props) {
	const progress = Math.min(pullDistance / THRESHOLD, 1);
	const visible = isRefreshing || pullDistance > 0;
	const height = isRefreshing ? 44 : progress * 44;
	const opacity = isRefreshing ? 1 : progress;
	const rotation = progress * 180;

	if (!visible) return null;

	return (
		<div
			className="sticky top-0 z-20 w-full flex justify-center items-end pointer-events-none"
			style={{ height }}
		>
			<div
				className="mb-1.5 w-7 h-7 rounded-full border-2 border-[var(--accent)] flex items-center justify-center bg-white shadow-sm"
				style={{ opacity }}
			>
				{isRefreshing ? (
					<div className="w-7 h-7 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
				) : (
					<svg
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="var(--accent)"
						strokeWidth="2.5"
						strokeLinecap="round"
						style={{
							transform: `rotate(${rotation}deg)`,
							transition: "transform 0.1s",
						}}
					>
						<path d="M12 5v14M5 12l7-7 7 7" />
					</svg>
				)}
			</div>
		</div>
	);
}
