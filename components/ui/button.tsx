"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-[var(--shadow-accent)] hover:bg-[var(--accent-hover)] rounded-lg",
				secondary:
					"border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-[var(--shadow-soft)] hover:bg-[var(--surface-muted)] rounded-lg",
				destructive:
					"border border-[var(--danger)]/25 bg-[var(--surface-elevated)] text-[var(--danger)] hover:bg-[var(--danger-light)] rounded-lg",
				ghost:
					"text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] rounded-lg",
				link: "text-primary underline-offset-4 hover:underline",
				icon: "flex items-center justify-center border border-[var(--border)] bg-[var(--surface-elevated)] rounded-lg text-[var(--muted-foreground)] shadow-[var(--shadow-soft)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
				"icon-sm":
					"flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
				pill: "bg-primary text-primary-foreground hover:bg-[var(--accent-hover)] rounded-full shadow-[var(--shadow-accent)]",
			},
			size: {
				default: "h-11 px-4 py-2.5",
				sm: "h-9 px-3 text-xs",
				lg: "h-12 px-6",
				icon: "h-11 w-11",
				"icon-sm": "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
