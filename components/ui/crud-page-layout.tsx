import { AdaptiveContainer } from "@/components/layout/adaptive-container";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";

interface CrudPageLayoutProps {
	containerRef: React.RefObject<HTMLDivElement | null>;
	pullDistance: number;
	isRefreshing: boolean;
	header: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	fullWidth?: boolean;
	layout?: "cards" | "table";
}

export function CrudPageLayout({
	containerRef,
	pullDistance,
	isRefreshing,
	header,
	children,
	className,
	fullWidth,
	layout,
}: CrudPageLayoutProps) {
	const isCards = layout === "cards";
	return (
		<div
			ref={containerRef}
			className={`min-h-dvh flex flex-col bg-[var(--background)] ${className ?? ""}`}
		>
			<div className="sticky top-0 z-10">
				<AdaptiveContainer fullWidth={fullWidth}>{header}</AdaptiveContainer>
			</div>
			<AdaptiveContainer fullWidth={fullWidth}>
				<PullToRefreshIndicator
					pullDistance={pullDistance}
					isRefreshing={isRefreshing}
				/>
			</AdaptiveContainer>
			<div className="flex-1">
				<AdaptiveContainer
					fullWidth={fullWidth}
					className="px-3 pt-2 lg:px-4 pb-4"
				>
					{isCards ? (
						<div className="responsive-grid">{children}</div>
					) : (
						children
					)}
				</AdaptiveContainer>
			</div>
		</div>
	);
}
