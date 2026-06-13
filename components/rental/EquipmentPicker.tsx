"use client";
import { MagnifyingGlass, Minus, Plus, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Equipment, EquipmentRentalItem } from "@/types";

interface Props {
	items: EquipmentRentalItem[];
	equipment: Equipment[];
	onChange: (items: EquipmentRentalItem[]) => void;
}

export default function EquipmentPicker({ items, equipment, onChange }: Props) {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

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

	// Останавливаем всплытие touch-событий из дропдауна, чтобы скролл модалки не перехватывал
	const handleDropdownTouchMove = useCallback((e: React.TouchEvent) => {
		const el = dropdownRef.current;
		if (!el) return;
		if (el.scrollHeight > el.clientHeight) {
			e.stopPropagation();
		}
	}, []);

	const filtered = equipment.filter(
		(eq) =>
			eq.isActive &&
			(!query.trim() || eq.name.toLowerCase().includes(query.toLowerCase())),
	);

	function getQuantity(equipmentId: string): number {
		return items.find((i) => i.equipmentId === equipmentId)?.quantity ?? 0;
	}

	function setQuantity(eq: Equipment, qty: number) {
		if (qty <= 0) {
			onChange(items.filter((i) => i.equipmentId !== eq.id));
		} else {
			const existing = items.find((i) => i.equipmentId === eq.id);
			if (existing) {
				onChange(
					items.map((i) =>
						i.equipmentId === eq.id ? { ...i, quantity: qty } : i,
					),
				);
			} else {
				onChange([
					...items,
					{ id: "", equipmentId: eq.id, equipmentName: eq.name, quantity: qty },
				]);
			}
		}
	}

	function removeItem(equipmentId: string) {
		onChange(items.filter((i) => i.equipmentId !== equipmentId));
	}

	return (
		<div>
			<Label className="mb-1 block">
				Снаряжение <span className="text-[var(--danger)]">*</span>
			</Label>

			{/* Добавленные позиции */}
			{items.length > 0 && (
				<div className="flex flex-wrap gap-1 mb-2">
					{items.map((item) => (
						<span
							key={item.equipmentId}
							className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)]"
						>
							{item.equipmentName} × {item.quantity}
							<button
								type="button"
								onClick={() => removeItem(item.equipmentId)}
								className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] ml-0.5"
							>
								<X size={10} weight="bold" aria-label="Удалить" />
							</button>
						</span>
					))}
				</div>
			)}

			{/* Поиск */}
			<div ref={containerRef} className="relative">
				<div className="relative">
					<MagnifyingGlass
						size={13}
						weight="regular"
						className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] z-[1]"
						aria-hidden="true"
					/>
					<Input
						id="equipment-search"
						type="text"
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setOpen(true);
						}}
						onFocus={() => setOpen(true)}
						placeholder="Поиск снаряжения..."
						className="pl-8"
					/>
				</div>

				{/* Дропдаун */}
				{open && filtered.length > 0 && (
					<div
						ref={dropdownRef}
						className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-[var(--border)] rounded-xl shadow-lg overflow-y-auto max-h-48 overscroll-contain"
						onTouchMove={handleDropdownTouchMove}
					>
						{filtered.map((eq) => {
							const qty = getQuantity(eq.id);
							return (
								<div
									key={eq.id}
									className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent-light)] transition-colors duration-150"
								>
									<span className="text-sm text-[var(--foreground)]">
										{eq.name}
									</span>
									<div className="flex items-center gap-2 shrink-0">
										<button
											type="button"
											onMouseDown={(e) => {
												e.preventDefault();
												setQuantity(eq, qty - 1);
											}}
											className="w-7 h-7 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] disabled:opacity-30 hover:border-[var(--accent)]/40 transition-colors"
											disabled={qty === 0}
										>
											<Minus size={12} weight="bold" aria-hidden="true" />
										</button>
										<span className="text-sm font-semibold text-[var(--foreground)] w-5 text-center">
											{qty}
										</span>
										<button
											type="button"
											onMouseDown={(e) => {
												e.preventDefault();
												setQuantity(eq, qty + 1);
											}}
											className="w-7 h-7 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)]/40 transition-colors"
										>
											<Plus size={12} weight="bold" aria-hidden="true" />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
