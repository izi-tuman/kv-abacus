"use client";
import { CaretRightIcon, StarIcon } from "@phosphor-icons/react";
import { BaseCard } from "@/components/ui/base-card";
import type { Service } from "@/types";

interface Props {
	service: Service;
	onClick: (service: Service) => void;
}

export default function ServiceCard({ service, onClick }: Props) {
	return (
		<BaseCard onClick={() => onClick(service)}>
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">
					<StarIcon size={18} weight="fill" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-[15px] font-bold text-[var(--foreground)] truncate">
							{service.name}
						</span>
						{!service.isActive && (
							<span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)] font-extrabold tracking-wider shrink-0">
								OFF
							</span>
						)}
					</div>
					{service.description && (
						<div className="text-[12.5px] text-[var(--muted-foreground)] font-medium mt-0.5 line-clamp-1">
							{service.description}
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
