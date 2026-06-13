// Режим просмотра бронирования в модалке: даты, клиент, детали, оплата.
// Адаптивен: на десктопе информация раскладывается в две колонки.
"use client";
import {
	ArrowSquareOutIcon,
	ChatCircleIcon,
	HouseIcon,
	PencilSimpleIcon,
	PhoneIcon,
	SparkleIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { parseISODateLocal, RU_DAYS, RU_MONTHS_SHORT } from "@/lib/dates";
import { formatPhone } from "@/lib/utils";
import type { Booking, Client, House } from "@/types";
import { formatNights, nightsBetween } from "../shared/bookingHelpers";

interface BookingViewProps {
	booking: Booking;
	house: House | undefined;
	client: Client | undefined;
	onEdit: () => void;
	onDelete: () => void;
	onOpenClient: (client: Client) => void;
	deleting?: boolean;
}

function fmtDay(iso: string): { d: string; m: string; dow: string } {
	const date = parseISODateLocal(iso);
	if (!date) return { d: "—", m: "", dow: "" };
	return {
		d: String(date.getDate()),
		m: RU_MONTHS_SHORT[date.getMonth()] ?? "",
		dow: RU_DAYS[date.getDay()] ?? "",
	};
}

function fmtMoney(value: number): string {
	return `${value.toLocaleString("ru-RU")} ₽`;
}

export default function BookingView({
	booking,
	house,
	client,
	onEdit,
	onDelete,
	onOpenClient,
	deleting,
}: BookingViewProps) {
	const nights = nightsBetween(booking.checkIn, booking.checkOut);
	const start = fmtDay(booking.checkIn);
	const end = fmtDay(booking.checkOut);
	const totalPrice = booking.totalPrice ?? 0;
	const prepayment = booking.prepayment ?? 0;
	const remaining = totalPrice - prepayment;
	const progress =
		totalPrice > 0 ? Math.min(100, (prepayment / totalPrice) * 100) : 0;

	const fullClientName =
		`${booking.clientFirstName} ${booking.clientLastName ?? ""}`.trim() ||
		"Клиент";
	const clientInitials =
		(booking.clientFirstName[0]?.toUpperCase() ?? "") +
		(booking.clientLastName?.[0]?.toUpperCase() ?? "");

	function handleClientOpen() {
		if (client) onOpenClient(client);
	}

	return (
		<div className="flex flex-col">
			{/* Hero */}
			<div className="px-4 lg:px-6 pt-2 pb-4">
				<div className="flex items-center gap-2 mt-2">
					<div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0">
						<HouseIcon size={16} weight="fill" />
					</div>
					<div className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
						{house?.name ?? booking.houseName ?? "—"}
					</div>
				</div>
			</div>

			{/* Date strip */}
			<div className="px-4 lg:px-6 pb-4">
				<div className="rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] px-4 py-3.5 flex items-center gap-2">
					<div className="flex-1 min-w-0">
						<div className="text-[10.5px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
							Заезд
						</div>
						<div className="text-lg font-bold text-[var(--foreground)] tracking-tight mt-0.5">
							{start.d} {start.m}
						</div>
						<div className="text-[11.5px] text-[var(--muted-foreground)] font-medium mt-0.5">
							{start.dow}
						</div>
					</div>
					<div className="px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-bold shrink-0">
						{formatNights(nights)}
					</div>
					<div className="flex-1 min-w-0 text-right">
						<div className="text-[10.5px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
							Выезд
						</div>
						<div className="text-lg font-bold text-[var(--foreground)] tracking-tight mt-0.5">
							{end.d} {end.m}
						</div>
						<div className="text-[11.5px] text-[var(--muted-foreground)] font-medium mt-0.5">
							{end.dow}
						</div>
					</div>
				</div>
			</div>

			{/* Desktop two-column grid for client + details/payment */}
			<div className="px-4 lg:px-6 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Client */}
				<div>
					<SectionLabel>Клиент</SectionLabel>
					<div className="rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] px-3.5 py-3 flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0">
							<span className="text-white text-sm font-bold tracking-wide">
								{clientInitials || <UserIcon size={18} weight="fill" />}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-bold text-[var(--foreground)] truncate">
								{fullClientName}
							</div>
							{booking.clientPhone && (
								<div className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5 truncate">
									{formatPhone(booking.clientPhone)}
								</div>
							)}
						</div>
						{booking.clientPhone && (
							<a
								href={`tel:${booking.clientPhone}`}
								aria-label="Позвонить клиенту"
								className="w-9 h-9 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0 hover:bg-[var(--accent)]/15 active:scale-95 transition-all"
								onClick={(e) => e.stopPropagation()}
							>
								<PhoneIcon size={16} weight="fill" />
							</a>
						)}
						<button
							type="button"
							onClick={handleClientOpen}
							disabled={!client}
							aria-label="Открыть клиента"
							className="w-9 h-9 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center shrink-0 hover:bg-[var(--muted)]/70 hover:text-[var(--foreground)] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
						>
							<ArrowSquareOutIcon size={16} />
						</button>
					</div>
				</div>

				{/* Details */}
				<div>
					<SectionLabel>Детали</SectionLabel>
					<div className="rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] py-1">
						<Row
							icon={<UserIcon size={16} />}
							label="Гостей"
							value={String(booking.guestsCount)}
						/>
						<Row
							icon={<SparkleIcon size={16} />}
							label="Услуги"
							value={
								booking.services.length > 0
									? booking.services.map((s) => s.name).join(", ")
									: "Не выбрано"
							}
							multi
						/>
						<Row
							icon={<UserIcon size={16} />}
							label="Менеджер"
							value={booking.managerName ?? "—"}
						/>
						{booking.comment ? (
							<Row
								icon={<ChatCircleIcon size={16} />}
								label="Комментарий"
								value={booking.comment}
								multi
								last
							/>
						) : (
							<Row
								icon={<ChatCircleIcon size={16} />}
								label="Комментарий"
								value="—"
								last
							/>
						)}
					</div>
				</div>
			</div>

			{/* Payment */}
			<div className="px-4 lg:px-6 pb-4">
				<SectionLabel>Оплата</SectionLabel>
				<div className="rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)] px-4 py-3.5">
					<div className="flex items-center justify-between mb-2">
						<span className="text-[13px] text-[var(--muted-foreground)] font-medium">
							Стоимость · {nights} н
						</span>
						<span className="text-sm font-semibold text-[var(--foreground)]">
							{fmtMoney(totalPrice)}
						</span>
					</div>
					<div className="flex items-center justify-between mb-2">
						<span className="text-[13px] text-[var(--muted-foreground)] font-medium">
							Внесено
						</span>
						<span className="text-sm font-bold text-[var(--accent)]">
							{fmtMoney(prepayment)}
						</span>
					</div>
					<div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden my-2.5">
						<div
							className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)]"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<div className="flex items-center justify-between pt-2 border-t border-dashed border-[var(--border)]">
						<span className="text-sm font-bold text-[var(--foreground)]">
							К доплате
						</span>
						<span
							className={`text-lg font-extrabold tracking-tight ${
								remaining > 0 ? "text-[var(--danger)]" : "text-[var(--accent)]"
							}`}
						>
							{fmtMoney(Math.max(0, remaining))}
						</span>
					</div>
				</div>
			</div>

			{/* Footer actions */}
			<div className="px-4 lg:px-6 pt-1 pb-3 flex gap-2 lg:justify-end">
				<Button
					type="button"
					variant="destructive"
					className="flex-1 lg:flex-none lg:px-6"
					onClick={onDelete}
					disabled={deleting}
				>
					Удалить
				</Button>
				<Button
					type="button"
					className="flex-1 lg:flex-none lg:px-6"
					onClick={onEdit}
				>
					<PencilSimpleIcon size={16} weight="bold" className="mr-1" />
					Редактировать
				</Button>
			</div>
		</div>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="text-[10.5px] font-bold tracking-wider uppercase text-[var(--muted-foreground)] px-1 pb-2">
			{children}
		</div>
	);
}

function Row({
	icon,
	label,
	value,
	multi,
	last,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	multi?: boolean;
	last?: boolean;
}) {
	return (
		<div
			className={`flex ${multi ? "items-start" : "items-center"} gap-3 px-3.5 py-2.5 ${last ? "" : "border-b border-[var(--border)]"}`}
		>
			<div className="text-[var(--muted-foreground)] shrink-0 flex">{icon}</div>
			<div className="text-[13px] text-[var(--muted-foreground)] font-medium min-w-[80px] shrink-0">
				{label}
			</div>
			<div
				className={`flex-1 text-[13px] text-[var(--foreground)] font-semibold text-right break-words ${multi ? "whitespace-pre-wrap leading-snug" : "truncate"}`}
			>
				{value}
			</div>
		</div>
	);
}
