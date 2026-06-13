import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			className={cn(
				"flex min-h-[80px] w-full rounded-lg border border-[var(--border)] bg-white/90 backdrop-blur-sm px-4 py-3 text-sm text-[var(--foreground)]",
				"shadow-[0_1px_3px_0_oklch(0.2_0.015_50/0.04)]",
				"placeholder:text-[var(--muted-foreground)]/60",
				"focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/15 focus-visible:shadow-[0_0_0_4px_oklch(0.42_0.09_148/0.06)]",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"transition-all duration-200",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
