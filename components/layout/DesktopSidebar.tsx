// Desktop-only left navigation rail. Collapsible between 220px and 64px; persists state in localStorage.
"use client";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import { NAV_ITEMS } from "./nav-items";

export default function DesktopSidebar() {
	const pathname = usePathname();
	const { currentRole } = useAuth();
	const { settings } = useSettings();
	const { collapsed, toggle } = useSidebarCollapsed();

	const visibleItems = NAV_ITEMS.filter((item) => {
		if (item.permission === null) return true;
		if (currentRole === null) return false;
		return currentRole[item.permission];
	});

	return (
		<aside
			className={`hidden lg:flex sticky top-0 h-dvh flex-col shrink-0 border-r border-[var(--border)]/70 bg-[var(--surface-elevated)]/95 backdrop-blur-xl transition-[width] duration-200 ${
				collapsed ? "w-[64px]" : "w-[220px]"
			}`}
		>
			<div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-[var(--border)]/40">
				{!collapsed && (
					<span className="truncate font-bold text-sm text-[var(--foreground)]">
						{settings.companyName ?? "Меню"}
					</span>
				)}
				<button
					type="button"
					onClick={toggle}
					aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
					className={`flex items-center justify-center w-8 h-8 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] transition-colors ${
						collapsed ? "mx-auto" : ""
					}`}
				>
					{collapsed ? (
						<CaretRightIcon size={18} weight="bold" />
					) : (
						<CaretLeftIcon size={18} weight="bold" />
					)}
				</button>
			</div>

			<nav className="flex-1 overflow-y-auto py-2">
				<ul className="flex flex-col gap-1 px-2">
					{visibleItems.map((item) => {
						const isActive =
							item.href === "/"
								? pathname === "/"
								: pathname === item.href ||
									pathname.startsWith(`${item.href}/`);
						const Icon = item.icon;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									aria-current={isActive ? "page" : undefined}
									title={collapsed ? item.label : undefined}
									className={`relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
										isActive
											? "bg-[var(--accent-light)]/65 text-[var(--accent)]"
											: "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
									}`}
								>
									{isActive && (
										<span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-md bg-[var(--accent)]" />
									)}
									<Icon size={22} weight={isActive ? "fill" : "regular"} />
									{!collapsed && (
										<span
											className={`truncate text-sm ${
												isActive ? "font-bold" : "font-semibold"
											}`}
										>
											{item.label}
										</span>
									)}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>
		</aside>
	);
}
