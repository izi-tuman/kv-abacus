import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium transition-all duration-200 ease-out cursor-default",
	{
		variants: {
			variant: {
				default:
					"bg-[var(--accent)]/10 text-[var(--accent)] px-2.5 py-0.5 rounded-full",
				active:
					"bg-[var(--accent-light)] text-[var(--accent)] px-2.5 py-0.5 rounded-full border border-[var(--accent)]/15 shadow-sm",
				completed:
					"bg-[var(--danger-light)] text-[var(--danger)] px-2.5 py-0.5 rounded-full border border-[var(--danger)]/15",
				inactive:
					"bg-[var(--muted)] text-[var(--muted-foreground)] px-2.5 py-0.5 rounded-full",
				service:
					"bg-[var(--amber-light)] text-[var(--amber-hover)] border border-[var(--amber)]/20 px-2.5 py-0.5 rounded-full shadow-sm",
				permission:
					"bg-[var(--secondary)] text-[var(--secondary-foreground)] px-2.5 py-0.5 rounded-full",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return (
		<span className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
