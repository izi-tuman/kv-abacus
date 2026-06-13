import type React from "react";
import { cn } from "@/lib/utils";

interface AdaptiveContainerProps {
	children: React.ReactNode;
	fullWidth?: boolean;
	className?: string;
}

export function AdaptiveContainer({
	children,
	fullWidth,
	className,
}: AdaptiveContainerProps) {
	return (
		<div
			className={cn(
				"mx-auto w-full",
				fullWidth ? "lg:max-w-none" : "max-w-md lg:max-w-5xl",
				className,
			)}
		>
			{children}
		</div>
	);
}
