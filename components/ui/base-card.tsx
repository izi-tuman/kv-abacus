import { cn } from "@/lib/utils";

interface BaseCardProps {
	onClick?: () => void;
	children: React.ReactNode;
	className?: string;
}

export function BaseCard({ onClick, children, className }: BaseCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"w-full text-left bg-[var(--surface-elevated)] rounded-xl px-3 py-2.5 mb-2",
				"border border-[var(--border)] shadow-[var(--shadow-card)] backdrop-blur-sm",
				"transition-all duration-200 ease-out",
				"hover:border-[var(--accent)]/30 hover:bg-[var(--card)] hover:shadow-[0_14px_34px_-22px_oklch(0.2_0.018_64/0.36)]",
				"focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 focus-visible:ring-offset-2",
				"active:scale-[0.99]",
				className,
			)}
		>
			{children}
		</button>
	);
}
