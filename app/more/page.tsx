"use client";
import {
	CaretRightIcon,
	ChartBarIcon,
	ClockIcon,
	GearIcon,
	ShieldCheckIcon,
	SignOutIcon,
	StarIcon,
	TentIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import type { ComponentType } from "react";
import { useState } from "react";
import { AdaptiveContainer } from "@/components/layout/adaptive-container";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import type { RolePermission } from "@/types";

const ALL_ITEMS: {
	href: string;
	label: string;
	subtitle: string;
	permission: RolePermission | null;
	icon: ComponentType<{ size: number; weight?: "regular" | "fill" | "bold" }>;
}[] = [
	{
		href: "/more/reports",
		label: "Отчёты",
		subtitle: "Финансы, дома, менеджеры",
		permission: "canAccessReports",
		icon: ChartBarIcon,
	},
	{
		href: "/more/history",
		label: "История броней",
		subtitle: "Архив с фильтрами",
		permission: null,
		icon: ClockIcon,
	},
	{
		href: "/more/services",
		label: "Доп. услуги",
		subtitle: "Завтраки, сауна, барбекю",
		permission: "canManageServices",
		icon: StarIcon,
	},
	{
		href: "/more/equipment",
		label: "Снаряжение",
		subtitle: "Каталог инвентаря",
		permission: "canManageEquipment",
		icon: TentIcon,
	},
	{
		href: "/more/users",
		label: "Пользователи",
		subtitle: "Сотрудники компании",
		permission: "canManageUsers",
		icon: UsersIcon,
	},
	{
		href: "/more/roles",
		label: "Должности",
		subtitle: "Роли и доступы",
		permission: "canManageUsers",
		icon: ShieldCheckIcon,
	},
	{
		href: "/more/settings",
		label: "Настройки",
		subtitle: "Компания, отображение",
		permission: "canManageSettings",
		icon: GearIcon,
	},
];

function getInitials(firstName?: string, lastName?: string): string {
	const a = firstName?.[0]?.toUpperCase() ?? "";
	const b = lastName?.[0]?.toUpperCase() ?? "";
	return a + b || "—";
}

export default function MorePage() {
	const { currentUser, currentRole, logout } = useAuth();
	const { settings } = useSettings();
	const [confirmLogout, setConfirmLogout] = useState(false);

	const items = ALL_ITEMS.filter((item) => {
		if (item.permission === null) return true;
		if (currentRole === null) return false;
		return Boolean(currentRole[item.permission]);
	});

	const fullName = currentUser
		? `${currentUser.firstName} ${currentUser.lastName ?? ""}`.trim()
		: "Гость";
	const subtitle = [currentRole?.name, settings.companyName]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="min-h-dvh bg-transparent">
			<AdaptiveContainer className="px-4">
				{/* PageHead */}
				<div className="pt-3 pb-3">
					<motion.h1
						className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight"
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						Ещё
					</motion.h1>
					<motion.p
						className="text-xs text-[var(--muted-foreground)] mt-0.5 font-medium"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.05 }}
					>
						Все разделы и настройки
					</motion.p>
				</div>

				{/* User card */}
				<motion.div
					className="pt-1 pb-4"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, delay: 0.08 }}
				>
					<div
						className="rounded-xl p-4 flex items-center gap-3 text-white shadow-[var(--shadow-accent)]"
						style={{
							background:
								"linear-gradient(135deg, var(--accent), var(--accent-hover))",
						}}
					>
						<div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg font-bold tracking-wide shrink-0">
							{getInitials(currentUser?.firstName, currentUser?.lastName)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-base font-bold truncate">{fullName}</div>
							{subtitle && (
								<div className="text-xs opacity-85 mt-0.5 font-medium truncate">
									{subtitle}
								</div>
							)}
						</div>
						<button
							type="button"
							onClick={() => setConfirmLogout(true)}
							className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-xs font-semibold"
						>
							<SignOutIcon size={14} weight="bold" />
							Выйти
						</button>
					</div>
				</motion.div>

				{/* Menu: list on mobile (rows with dividers), 2-col card grid on desktop */}
				<motion.div
					className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[var(--shadow-card)] backdrop-blur-sm overflow-hidden lg:rounded-none lg:bg-transparent lg:border-0 lg:shadow-none lg:backdrop-blur-none lg:grid lg:grid-cols-2 lg:gap-3 lg:overflow-visible"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, delay: 0.14 }}
				>
					{items.map((item, i) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`group flex items-center gap-3 px-3.5 py-3.5 transition-colors hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)] ${
									i < items.length - 1 ? "border-b border-[var(--border)]" : ""
								} lg:rounded-xl lg:border-b-0 lg:border lg:border-[var(--border)] lg:bg-[var(--surface-elevated)] lg:shadow-[var(--shadow-soft)] lg:px-4 lg:py-4 lg:hover:border-[var(--accent)]/40 lg:hover:shadow-[var(--shadow-card)] lg:transition-all`}
							>
								<div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0 lg:w-11 lg:h-11 lg:group-hover:scale-105 lg:transition-transform">
									<Icon size={20} weight="regular" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-[14.5px] font-semibold text-[var(--foreground)] leading-tight lg:text-base">
										{item.label}
									</div>
									<div className="text-xs text-[var(--muted-foreground)] mt-0.5 font-medium truncate">
										{item.subtitle}
									</div>
								</div>
								<CaretRightIcon
									size={16}
									className="text-[var(--muted-foreground)] shrink-0 lg:group-hover:translate-x-0.5 lg:transition-transform"
								/>
							</Link>
						);
					})}
				</motion.div>

				{/* Footer */}
				<div className="pt-[18px] pb-2 text-center">
					<div className="text-[11px] text-[var(--muted-foreground)] font-medium">
						KV-Web · версия 2.4.1
					</div>
				</div>
			</AdaptiveContainer>

			{/* Диалог подтверждения выхода */}
			<ConfirmDeleteDialog
				open={confirmLogout}
				message="Вы уверены, что хотите выйти из системы?"
				onConfirm={() => {
					setConfirmLogout(false);
					logout();
				}}
				onCancel={() => setConfirmLogout(false)}
			/>
		</div>
	);
}
