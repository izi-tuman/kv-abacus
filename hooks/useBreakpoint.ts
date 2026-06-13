// Subscribes to the lg (>=1024px) media query and returns 'mobile' | 'desktop' | null (pre-mount).
"use client";
import { useEffect, useState } from "react";

const QUERY = "(min-width: 1024px)";

export type Breakpoint = "mobile" | "desktop";

/** Returns 'desktop' on lg+, 'mobile' below, null until hydrated. */
export function useBreakpoint(): Breakpoint | null {
	const [bp, setBp] = useState<Breakpoint | null>(null);

	useEffect(() => {
		const mql = window.matchMedia(QUERY);
		const update = () => setBp(mql.matches ? "desktop" : "mobile");
		update();
		mql.addEventListener("change", update);
		return () => mql.removeEventListener("change", update);
	}, []);

	return bp;
}
