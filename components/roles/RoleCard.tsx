"use client";
import { CaretRightIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { BaseCard } from "@/components/ui/base-card";
import type { Role } from "@/types";

const PERMISSION_LABELS: { key: keyof Role; label: string }[] = [
	{ key: "canAccessReports", label: "Отчёты" },
	{ key: "canManageUsers", label: "Пользователи" },
	{ key: "canManageHouses", label: "Дома" },
	{ key: "canManageClients", label: "Клиенты" },
	{ key: "canManageEquipment", label: "Оборудование" },
	{ key: "canManageRentals", label: "Прокат" },
	{ key: "canManageServices", label: "Услуги" },
	{ key: "canManageSettings", label: "Настройки" },
];

interface Props {
	role: Role;
	onClick: (role: Role) => void;
}

export default function RoleCard({ role, onClick }: Props) {
	const activePerms = PERMISSION_LABELS.filter((p) => role[p.key] === true);

	return (
		<BaseCard onClick={() => onClick(role)}>
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">
					<ShieldCheckIcon size={18} weight="fill" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2">
						<span className="text-[15px] font-bold text-[var(--foreground)] truncate">
							{role.name}
						</span>
						<CaretRightIcon
							size={16}
							className="text-[var(--muted-foreground)] shrink-0"
						/>
					</div>
					<div className="flex flex-wrap gap-1 mt-1.5">
						{activePerms.length === 0 ? (
							<span className="text-[11px] bg-[var(--danger-light)] text-[var(--danger)] px-2 py-0.5 rounded-full font-medium">
								Нет прав
							</span>
						) : (
							activePerms.map((p) => (
								<span
									key={p.key as string}
									className="text-[11px] border border-[var(--border)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full font-medium"
								>
									{p.label}
								</span>
							))
						)}
					</div>
				</div>
			</div>
		</BaseCard>
	);
}
