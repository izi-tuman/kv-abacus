// Single source of truth for primary navigation items (used by BottomNav and DesktopSidebar).
import {
	BackpackIcon,
	BuildingsIcon,
	DotsThreeOutlineIcon,
	HouseIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { RolePermission } from "@/types";

export type NavItem = {
	href: string;
	label: string;
	permission: RolePermission | null;
	icon: ComponentType<{ size: number; weight: "regular" | "fill" }>;
};

export const NAV_ITEMS: NavItem[] = [
	{ href: "/", label: "Главная", permission: null, icon: HouseIcon },
	{
		href: "/rental",
		label: "Прокат",
		permission: "canManageRentals",
		icon: BackpackIcon,
	},
	{
		href: "/clients",
		label: "Клиенты",
		permission: "canManageClients",
		icon: UsersIcon,
	},
	{
		href: "/houses",
		label: "Дома",
		permission: "canManageHouses",
		icon: BuildingsIcon,
	},
	{ href: "/more", label: "Ещё", permission: null, icon: DotsThreeOutlineIcon },
];
