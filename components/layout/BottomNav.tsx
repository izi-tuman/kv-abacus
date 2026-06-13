"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { NAV_ITEMS } from "./nav-items";

export default function BottomNav() {
	const pathname = usePathname();
	const { currentRole } = useAuth();

	const visibleItems = NAV_ITEMS.filter((item) => {
		if (item.permission === null) return true;
		if (currentRole === null) return false;
		return currentRole[item.permission];
	});

	return (
		<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-elevated)]/95 backdrop-blur-xl border-t border-[var(--border)]/70 shadow-[0_-12px_34px_-18px_oklch(0.2_0.018_64/0.28)] pb-[env(safe-area-inset-bottom)]">
			<div className="flex items-center justify-around max-w-md mx-auto h-16 px-1">
				{visibleItems.map((item) => {
					const isActive =
						item.href === "/"
							? pathname === "/"
							: pathname === item.href || pathname.startsWith(`${item.href}/`);
					const Icon = item.icon;
					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={isActive ? "page" : undefined}
							className={`relative flex min-w-[64px] flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
								isActive
									? "text-[var(--accent)] bg-[var(--accent-light)]/65"
									: "text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
							}`}
						>
							{isActive && (
								<div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-7 h-0.5 rounded-full bg-[var(--accent)]" />
							)}
							<Icon size={22} weight={isActive ? "fill" : "regular"} />
							<span
								className={`text-[10px] tracking-wide transition-colors duration-200 ${
									isActive
										? "font-bold text-[var(--accent)]"
										: "font-semibold text-[var(--muted-foreground)]"
								}`}
							>
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
