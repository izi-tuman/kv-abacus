"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface CrudPageOptions<T extends { id: string }> {
	fetchItems: () => Promise<T[]>;
	createItem?: (data: Omit<T, "id">) => Promise<T>;
	updateItem?: (id: string, data: Partial<T>) => Promise<T>;
	deleteItem?: (id: string) => Promise<void>;
	/** If true, new items prepend to list (default: append) */
	prependNew?: boolean;
}

export function useCrudPage<T extends { id: string }>(
	options: CrudPageOptions<T>,
) {
	const { fetchItems, createItem, updateItem, deleteItem, prependNew } =
		options;

	const [items, setItems] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [modalItem, setModalItem] = useState<T | null | undefined>(undefined);

	const fetchedRef = useRef(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const handleRefresh = useCallback(async () => {
		setModalItem(undefined);
		try {
			const data = await fetchItems();
			setItems(data);
		} catch {
			setLoadError(true);
		}
	}, [fetchItems]);

	const { pullDistance, isRefreshing } = usePullToRefresh(
		handleRefresh,
		containerRef,
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only once on mount
	useEffect(() => {
		if (fetchedRef.current) return;
		fetchedRef.current = true;
		fetchItems()
			.then(setItems)
			.catch(() => setLoadError(true))
			.finally(() => setLoading(false));
	}, []);

	const handleSave = useCallback(
		async (data: Omit<T, "id"> | T) => {
			if ("id" in data && (data as T).id) {
				if (!updateItem) return;
				const updated = await updateItem((data as T).id, data as Partial<T>);
				setItems((prev) =>
					prev.map((item) => (item.id === updated.id ? updated : item)),
				);
				setModalItem((prev) =>
					prev && prev.id === updated.id ? updated : prev,
				);
			} else {
				if (!createItem) return;
				const created = await createItem(data as Omit<T, "id">);
				setItems((prev) =>
					prependNew ? [created, ...prev] : [...prev, created],
				);
			}
		},
		[createItem, updateItem, prependNew],
	);

	const handleDelete = useCallback(
		async (id: string) => {
			if (!deleteItem) return;
			await deleteItem(id);
			setItems((prev) => prev.filter((item) => item.id !== id));
		},
		[deleteItem],
	);

	return {
		items,
		setItems,
		loading,
		loadError,
		modalItem,
		setModalItem,
		handleSave,
		handleDelete,
		handleRefresh,
		containerRef,
		pullDistance,
		isRefreshing,
	};
}
