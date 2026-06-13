"use client";
import { Label } from "@/components/ui/label";
import SearchablePicker from "@/components/ui/SearchablePicker";
import type { House } from "@/types";

interface Props {
	value: string;
	houses: House[];
	onChange: (houseId: string, houseName: string) => void;
	onOpenHouse: (house: House) => void;
	onCreateHouse: () => void;
}

export default function HousePicker({
	value,
	houses,
	onChange,
	onOpenHouse,
	onCreateHouse,
}: Props) {
	const selected = value ? (houses.find((h) => h.id === value) ?? null) : null;

	return (
		<SearchablePicker
			items={houses}
			selected={selected}
			onSelect={(house) => onChange(house.id, house.name)}
			onClear={() => onChange("", "")}
			onCreate={onCreateHouse}
			onOpenItem={onOpenHouse}
			filterFn={(house, query) =>
				house.isActive && house.name.toLowerCase().includes(query.toLowerCase())
			}
			renderItem={(house) => (
				<>
					<div className="text-sm text-[var(--foreground)] font-medium">
						{house.name}
					</div>
					<div className="text-xs text-[var(--muted-foreground)]">
						{house.capacity} мест · {house.basePrice} ₽/сутки
					</div>
				</>
			)}
			renderSelected={(house) => (
				<>
					<span className="text-sm text-[var(--foreground)] font-medium">
						{house.name}
					</span>
					<span className="text-xs text-[var(--muted-foreground)] ml-2">
						{house.capacity} мест · {house.basePrice} ₽/сутки
					</span>
				</>
			)}
			label={
				<Label>
					Дом <span className="text-[var(--danger)]">*</span>
				</Label>
			}
			placeholder="Поиск по названию дома..."
		/>
	);
}
