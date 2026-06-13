import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

const THRESHOLD = 90;
const DEAD_ZONE = 15;

export function usePullToRefresh(
	onRefresh: () => Promise<void>,
	containerRef: RefObject<HTMLElement | null>,
) {
	const [pullDistance, setPullDistance] = useState(0);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const pullDistanceRef = useRef(0);
	const isRefreshingRef = useRef(false);

	pullDistanceRef.current = pullDistance;
	isRefreshingRef.current = isRefreshing;

	const onRefreshRef = useRef(onRefresh);
	onRefreshRef.current = onRefresh;

	const startY = useRef<number | null>(null);
	const startX = useRef<number | null>(null);
	const direction = useRef<"vertical" | "horizontal" | null>(null);
	const active = useRef(false);
	const startScrollTop = useRef(0);

	const onTouchStart = useCallback(
		(e: TouchEvent) => {
			const el = containerRef.current;
			if (!el) return;
			// Don't activate when a modal is open
			if (document.body.classList.contains("modal-open")) return;
			// Store scroll position at start — only activate if truly at top
			startScrollTop.current = el.scrollTop;
			if (el.scrollTop > 5) return;
			startY.current = e.touches[0].clientY;
			startX.current = e.touches[0].clientX;
			direction.current = null;
			active.current = false;
		},
		[containerRef],
	);

	const onTouchMove = useCallback((e: TouchEvent) => {
		if (startY.current === null || startX.current === null) return;

		const dy = e.touches[0].clientY - startY.current;
		const dx = e.touches[0].clientX - startX.current;

		// Ignore micro-movements in dead zone
		if (Math.abs(dy) < DEAD_ZONE && Math.abs(dx) < DEAD_ZONE) return;

		// Lock gesture direction on first significant movement
		if (direction.current === null) {
			direction.current =
				Math.abs(dy) > Math.abs(dx) ? "vertical" : "horizontal";
		}

		if (direction.current !== "vertical") return;
		if (dy <= 0) return;

		// Double-check scroll position hasn't changed
		if (startScrollTop.current > 5) return;

		active.current = true;
		const adjustedDy = Math.max(0, dy - DEAD_ZONE);
		const dist = Math.min(adjustedDy * 0.4, THRESHOLD * 1.5);
		setPullDistance(dist);
		pullDistanceRef.current = dist;
	}, []);

	const onTouchEnd = useCallback(() => {
		if (!active.current) {
			startY.current = null;
			startX.current = null;
			return;
		}

		if (pullDistanceRef.current >= THRESHOLD && !isRefreshingRef.current) {
			isRefreshingRef.current = true;
			setIsRefreshing(true);
			setPullDistance(THRESHOLD);
			pullDistanceRef.current = THRESHOLD;
			onRefreshRef.current().finally(() => {
				isRefreshingRef.current = false;
				setIsRefreshing(false);
				setPullDistance(0);
				pullDistanceRef.current = 0;
			});
		} else {
			setPullDistance(0);
			pullDistanceRef.current = 0;
		}

		startY.current = null;
		startX.current = null;
		active.current = false;
		direction.current = null;
	}, []);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchmove", onTouchMove, { passive: true });
		el.addEventListener("touchend", onTouchEnd);
		return () => {
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchmove", onTouchMove);
			el.removeEventListener("touchend", onTouchEnd);
		};
	}, [containerRef, onTouchStart, onTouchMove, onTouchEnd]);

	return { pullDistance, isRefreshing };
}
