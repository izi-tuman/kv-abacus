import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"w-full h-11 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-[15px] text-[var(--foreground)] shadow-[var(--shadow-soft)] outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)]/70 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
