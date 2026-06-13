"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps
	extends Omit<React.ComponentProps<"input">, "type" | "size"> {}

function Checkbox({
	className,
	checked,
	onChange,
	disabled,
	...props
}: CheckboxProps) {
	return (
		<label
			className={cn(
				"relative inline-flex items-center justify-center cursor-pointer",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
		>
			<input
				type="checkbox"
				data-slot="checkbox"
				checked={checked}
				onChange={onChange}
				disabled={disabled}
				className="sr-only peer"
				{...props}
			/>
			{/* Touch target wrapper — 24x24, прямой сиблинг peer для peer-* классов */}
			<div className="w-6 h-6 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 rounded-md">
				{/* Visual box */}
				<div
					className={cn(
						"w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all duration-150",
						checked
							? "bg-primary border-primary"
							: "bg-white border-[var(--border)]",
					)}
				>
					{checked && (
						<svg
							width="10"
							height="8"
							viewBox="0 0 10 8"
							fill="none"
							stroke="white"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<polyline points="1 4 3.5 6.5 9 1" />
						</svg>
					)}
				</div>
			</div>
		</label>
	);
}

export { Checkbox };
