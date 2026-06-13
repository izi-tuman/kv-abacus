"use client";
import { CaretRightIcon } from "@phosphor-icons/react";
import { BaseCard } from "@/components/ui/base-card";
import { formatPhone } from "@/lib/utils";
import type { User } from "@/types";

interface Props {
	user: User;
	onClick: (user: User) => void;
}

function getInitials(firstName: string, lastName?: string): string {
	const a = firstName[0]?.toUpperCase() ?? "";
	const b = lastName?.[0]?.toUpperCase() ?? "";
	return a + b || "?";
}

export default function UserCard({ user, onClick }: Props) {
	return (
		<BaseCard onClick={() => onClick(user)}>
			<div className="flex items-center gap-3">
				<div className="w-11 h-11 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0">
					<span className="text-white text-sm font-bold tracking-wide">
						{getInitials(user.firstName, user.lastName)}
					</span>
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-[15px] font-bold text-[var(--foreground)] truncate">
							{user.firstName} {user.lastName}
						</span>
						{!user.isActive && (
							<span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[var(--danger-light)] text-[var(--danger)] font-extrabold tracking-wider shrink-0">
								OFF
							</span>
						)}
					</div>
					<div className="text-[12.5px] text-[var(--muted-foreground)] font-medium mt-0.5 truncate">
						{formatPhone(user.phone)}
					</div>
					{user.roleName && (
						<div className="text-[11.5px] text-[var(--muted-foreground)]/90 font-medium mt-1">
							{user.roleName}
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
