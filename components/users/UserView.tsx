// Просмотр профиля пользователя: аватар, ФИО, статус, контакты.
// Адаптивен: на десктопе hero раскладывается горизонтально.
"use client";
import {
	BriefcaseIcon,
	PencilSimpleIcon,
	PhoneIcon,
} from "@phosphor-icons/react";
import { formatPhone } from "@/lib/utils";
import type { User } from "@/types";

interface UserViewProps {
	user: User;
	onEdit: () => void;
}

function getInitials(firstName: string, lastName?: string): string {
	const a = firstName[0]?.toUpperCase() ?? "";
	const b = lastName?.[0]?.toUpperCase() ?? "";
	return a + b;
}

export default function UserView({ user, onEdit }: UserViewProps) {
	return (
		<div className="flex flex-col">
			{/* Hero */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:gap-6 px-4 lg:px-6 pt-2 pb-[18px]">
				<div className="w-[84px] h-[84px] rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0 shadow-md mx-auto lg:mx-0">
					<span className="text-white text-[28px] font-extrabold tracking-wide">
						{getInitials(user.firstName, user.lastName)}
					</span>
				</div>

				<div className="flex-1 text-center lg:text-left mt-3 lg:mt-0">
					<p className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
						{user.firstName} {user.lastName}
					</p>

					<span
						className={`mt-1.5 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11.5px] font-extrabold tracking-wider uppercase ${
							user.isActive
								? "bg-[var(--accent-light)] text-[var(--accent)]"
								: "bg-[var(--muted)] text-[var(--muted-foreground)]"
						}`}
					>
						{user.isActive ? "Активен" : "Неактивен"}
					</span>

					<div className="flex gap-2.5 mt-3.5 justify-center lg:justify-start">
						{user.phone && (
							<a
								href={`tel:${user.phone}`}
								aria-label="Позвонить пользователю"
								className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[var(--accent)] text-white text-[13px] font-semibold shadow-[0_2px_6px_oklch(0.42_0.09_148/0.25)] hover:shadow-[0_4px_12px_oklch(0.42_0.09_148/0.35)] active:scale-95 transition-all"
							>
								<PhoneIcon size={16} weight="fill" />
								Позвонить
							</a>
						)}
						<button
							type="button"
							onClick={onEdit}
							aria-label="Редактировать пользователя"
							className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[var(--muted)] text-[var(--foreground)] text-[13px] font-semibold hover:bg-[var(--muted)]/80 active:scale-95 transition-all"
						>
							<PencilSimpleIcon size={16} />
							Редактировать
						</button>
					</div>
				</div>
			</div>

			{/* Info */}
			<div className="px-4 lg:px-6 pb-6">
				<div className="rounded-xl border border-[var(--border)] bg-white py-1">
					<InfoRow
						icon={<PhoneIcon size={16} />}
						label="Телефон"
						value={user.phone ? formatPhone(user.phone) : "—"}
					/>
					<InfoRow
						icon={<BriefcaseIcon size={16} />}
						label="Должность"
						value={user.roleName || "—"}
						last
					/>
				</div>
			</div>
		</div>
	);
}

function InfoRow({
	icon,
	label,
	value,
	last,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	last?: boolean;
}) {
	return (
		<div
			className={`flex items-center justify-between gap-3 px-3 py-2.5 ${last ? "" : "border-b border-[var(--border)]"}`}
		>
			<div className="flex items-center gap-2.5 text-[var(--muted-foreground)] shrink-0">
				{icon}
				<span className="text-sm">{label}</span>
			</div>
			<span className="text-sm font-semibold text-[var(--foreground)] text-right truncate break-words">
				{value}
			</span>
		</div>
	);
}
