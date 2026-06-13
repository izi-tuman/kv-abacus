"use client";
import { CaretRightIcon } from "@phosphor-icons/react";
import { BaseCard } from "@/components/ui/base-card";
import { formatPhone } from "@/lib/utils";
import type { Client } from "@/types";

interface Props {
	client: Client;
	onClick: (client: Client) => void;
}

function getInitials(firstName: string, lastName?: string): string {
	const a = firstName[0]?.toUpperCase() ?? "";
	const b = lastName?.[0]?.toUpperCase() ?? "";
	return a + b || "?";
}

export default function ClientCard({ client, onClick }: Props) {
	const totalBookings = client.totalBookings ?? 0;

	return (
		<BaseCard
			onClick={() => onClick(client)}
			className="flex items-center gap-3 !px-3.5 !py-3"
		>
			<div className="w-11 h-11 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0">
				<span className="text-white text-sm font-bold tracking-wide">
					{getInitials(client.firstName, client.lastName)}
				</span>
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-1.5">
					<span className="text-[15px] font-bold text-[var(--foreground)] truncate">
						{client.firstName}
						{client.lastName ? ` ${client.lastName}` : ""}
					</span>
					{client.isBlacklisted && (
						<span className="text-[10.5px] px-2 py-0.5 rounded bg-[var(--danger-light)] text-[var(--danger)] font-extrabold tracking-wider">
							чёрный список
						</span>
					)}
				</div>
				<div className="text-[12.5px] text-[var(--muted-foreground)] font-medium mt-0.5 truncate">
					{formatPhone(client.phone)}
				</div>
				<div className="text-[11.5px] text-[var(--muted-foreground)]/90 font-medium mt-1">
					{totalBookings} брон
				</div>
			</div>
			<CaretRightIcon
				size={16}
				className="text-[var(--muted-foreground)] shrink-0"
			/>
		</BaseCard>
	);
}
