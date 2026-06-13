"use client";
import {
	ArrowSquareOutIcon,
	MagnifyingGlass,
	Plus,
	X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

interface SearchablePickerProps<T extends { id: string }> {
	items: T[];
	selected: T | null;
	onSelect: (item: T) => void;
	onClear: () => void;
	onCreate: () => void;
	onOpenItem?: (item: T) => void;
	filterFn: (item: T, query: string) => boolean;
	renderItem: (item: T) => React.ReactNode;
	renderSelected: (item: T) => React.ReactNode;
	label: React.ReactNode;
	placeholder: string;
	limit?: number;
}

export default function SearchablePicker<T extends { id: string }>({
	items,
	selected,
	onSelect,
	onClear,
	onCreate,
	onOpenItem,
	filterFn,
	renderItem,
	renderSelected,
	label,
	placeholder,
	limit = 20,
}: SearchablePickerProps<T>) {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
				setQuery("");
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filtered = query.trim()
		? items.filter((item) => filterFn(item, query)).slice(0, limit)
		: [];

	function handleSelect(item: T) {
		onSelect(item);
		setQuery("");
		setOpen(false);
	}

	function handleClear() {
		onClear();
		setQuery("");
		setOpen(false);
	}

	return (
		<div ref={containerRef}>
			<div className="mb-1">{label}</div>

			<div className="flex gap-2">
				<div className="flex-1 relative">
					{selected ? (
						<div className="flex items-center justify-between border border-[var(--border)] rounded-xl px-3 py-2.5 bg-white">
							<div className="min-w-0">{renderSelected(selected)}</div>
							<div className="flex items-center gap-4 ml-2 shrink-0">
								{onOpenItem && (
									<button
										type="button"
										onClick={() => onOpenItem(selected)}
										className="text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
										aria-label="Открыть"
									>
										<ArrowSquareOutIcon
											size={15}
											weight="regular"
											aria-hidden="true"
										/>
									</button>
								)}
								<button
									type="button"
									onClick={handleClear}
									className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
								>
									<X size={14} weight="bold" aria-hidden="true" />
								</button>
							</div>
						</div>
					) : (
						<>
							<div className="relative">
								<MagnifyingGlass
									size={13}
									weight="regular"
									className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
									aria-hidden="true"
								/>
								<input
									type="text"
									value={query}
									onChange={(e) => {
										setQuery(e.target.value);
										setOpen(true);
									}}
									onFocus={() => setOpen(true)}
									placeholder={placeholder}
									className="w-full border border-[var(--border)] rounded-xl pl-8 pr-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-colors"
								/>
							</div>

							{open && filtered.length > 0 && (
								<div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
									{filtered.map((item) => (
										<button
											key={item.id}
											type="button"
											onMouseDown={() => handleSelect(item)}
											className="w-full text-left px-3 py-2 hover:bg-[var(--background)] border-b border-[var(--border)] last:border-0"
										>
											{renderItem(item)}
										</button>
									))}
								</div>
							)}
						</>
					)}
				</div>

				<button
					type="button"
					onClick={onCreate}
					className="shrink-0 w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--background)]"
				>
					<Plus size={16} weight="bold" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}
