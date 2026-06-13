// Persisted state for the desktop sidebar collapsed/expanded toggle.
"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "sidebarCollapsed";

export function useSidebarCollapsed() {
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		try {
			const raw = window.localStorage.getItem(KEY);
			if (raw === "true") setCollapsed(true);
		} catch {
			/* ignore */
		}
	}, []);

	const toggle = useCallback(() => {
		setCollapsed((prev) => {
			const next = !prev;
			try {
				window.localStorage.setItem(KEY, String(next));
			} catch {
				/* ignore */
			}
			return next;
		});
	}, []);

	return { collapsed, toggle };
}
