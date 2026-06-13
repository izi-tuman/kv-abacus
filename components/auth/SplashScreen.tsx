"use client";
import { HouseIcon } from "@phosphor-icons/react";
import { useSettings } from "@/lib/settings-context";

export default function SplashScreen() {
	const { settings } = useSettings();
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(circle_at_top,_var(--accent-light),_transparent_32rem),linear-gradient(180deg,var(--background),oklch(0.955_0.014_82))]">
			<div className="w-20 h-20 rounded-[24px] bg-[var(--accent)] flex items-center justify-center shadow-[0_12px_32px_-8px_oklch(0.44_0.095_151/0.6)] mb-5">
				<HouseIcon size={40} weight="fill" color="white" />
			</div>
			<div className="text-[22px] font-black text-[var(--foreground)] tracking-tight mb-1.5">
				{settings.companyName}
			</div>
			<div className="text-[13px] font-medium text-[var(--muted-foreground)]">
				Система управления объектами
			</div>
			<div className="flex gap-1.5 mt-8">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"
						style={{ animationDelay: `${i * 0.2}s` }}
					/>
				))}
			</div>
		</div>
	);
}
