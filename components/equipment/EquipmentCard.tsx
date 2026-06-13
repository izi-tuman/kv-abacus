"use client";
import { CaretRightIcon, TentIcon } from "@phosphor-icons/react";
import { BaseCard } from "@/components/ui/base-card";
import type { Equipment } from "@/types";

interface Props {
	equipment: Equipment;
	onClick: (equipment: Equipment) => void;
}

export default function EquipmentCard({ equipment, onClick }: Props) {
	return (
		<BaseCard onClick={() => onClick(equipment)}>
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">
					<TentIcon size={18} weight="fill" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-[15px] font-bold text-[var(--foreground)] truncate">
							{equipment.name}
						</span>
						{!equipment.isActive && (
							<span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)] font-extrabold tracking-wider shrink-0">
								OFF
							</span>
						)}
					</div>
					{equipment.description && (
						<div className="text-[12.5px] text-[var(--muted-foreground)] font-medium mt-0.5 line-clamp-1">
							{equipment.description}
						</div>
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
