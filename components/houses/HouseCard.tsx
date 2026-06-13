"use client";
import { CaretRightIcon, HouseIcon } from "@phosphor-icons/react";
import { BaseCard } from "@/components/ui/base-card";
import type { House } from "@/types";

interface Props {
	house: House;
	occupancy?: number | null;
	onClick: (house: House) => void;
}

export default function HouseCard({ house, occupancy, onClick }: Props) {
	return (
		<BaseCard onClick={() => onClick(house)} className="!py-3">
			<div className="flex items-center gap-3">
				<div className="w-11 h-11 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">
					<HouseIcon size={20} weight="fill" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-[15px] font-bold text-[var(--foreground)] truncate">
							{house.name}
						</span>
						{!house.isActive && (
							<span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)] font-extrabold tracking-wider shrink-0">
								OFF
							</span>
						)}
					</div>
					<div className="text-[12.5px] text-[var(--muted-foreground)] font-medium mt-0.5 truncate">
						до {house.capacity} гостей ·{" "}
						{house.basePrice.toLocaleString("ru-RU")} ₽/н
					</div>
					{occupancy !== undefined && (
						<div className="flex items-center gap-1.5 mt-1.5">
							<span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)] shrink-0">
								Загрузка
							</span>
							<div className="flex-1 h-1 rounded bg-[var(--surface-muted)] overflow-hidden">
								{occupancy === null ? (
									<div className="h-full w-1/2 rounded animate-pulse bg-[var(--muted)]" />
								) : (
									<div
										className="h-full rounded"
										style={{
											width: `${occupancy}%`,
											background:
												"linear-gradient(90deg, var(--accent), oklch(0.58 0.07 151))",
										}}
									/>
								)}
							</div>
							<span className="text-[10px] font-bold text-[var(--accent)] shrink-0 w-7 text-right">
								{occupancy === null ? "…" : `${occupancy}%`}
							</span>
						</div>
					)}
					{house.description && (
						<p className="text-[11.5px] text-[var(--muted-foreground)]/90 font-medium mt-1 line-clamp-1">
							{house.description}
						</p>
					)}
				</div>
				<CaretRightIcon
					size={16}
					className="text-[var(--muted-foreground)] shrink-0"
				/>
			</div>
		</BaseCard>
	);
}
