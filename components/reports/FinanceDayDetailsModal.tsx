"use client";
import {
	HouseIcon,
	PhoneIcon,
	SparkleIcon,
	UserIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { DataStateContainer } from "@/components/ui/data-state-container";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { useMountedRef } from "@/hooks/useMountedRef";
import { bookingsApi } from "@/lib/api";
import { RU_DAYS, RU_MONTHS } from "@/lib/dates";
import { formatPhone } from "@/lib/utils";
import type { Booking, FinanceReport } from "@/types";

interface Props {
	row: FinanceReport;
	onClose: () => void;
}

function formatPrettyDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return `${RU_DAYS[d.getDay()]}, ${d.getDate()} ${RU_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatShortDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function FinanceDayDetailsModal({ row, onClose }: Props) {
	const { date } = row;
	const [bookings, setBookings] = useState<Booking[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const mountedRef = useMountedRef();

	useEffect(() => {
		setLoading(true);
		setError(null);
		setBookings(null);
		bookingsApi
			.getBookings(date, date)
			.then((data) => {
				if (!mountedRef.current) return;
				// Бэкенд (МОК_Reports.ПолучитьФинансовыйОтчет) группирует выручку по дню
				// заезда: НАЧАЛОПЕРИОДА(ДатаС, ДЕНЬ). Поэтому в детализации показываем
				// только брони с checkIn === date — иначе цифры разойдутся с агрегатом.
				const filtered = data.filter((b) => b.checkIn.startsWith(date));
				setBookings(filtered);
			})
			.catch((err) => {
				if (mountedRef.current) {
					setError(err instanceof Error ? err.message : "Ошибка загрузки");
					setBookings([]);
				}
			})
			.finally(() => {
				if (mountedRef.current) setLoading(false);
			});
	}, [date, mountedRef]);

	return (
		<ModalSheet open onClose={onClose} title="Детализация дня">
			<div className="px-4 pt-1 pb-4 flex flex-col gap-3">
				<div className="text-center">
					<div className="text-lg font-extrabold text-[var(--foreground)] tracking-tight">
						{formatPrettyDate(date)}
					</div>
				</div>

				{/* Summary — берём цифры из агрегата (источник истины — бэкенд). */}
				<div className="grid grid-cols-3 gap-2">
					<SummaryCell
						label="Выручка"
						value={`${row.revenue.toLocaleString("ru-RU")} ₽`}
						accent
					/>
					<SummaryCell label="Броней" value={String(row.bookingsCount)} />
					<SummaryCell
						label="Ср. чек"
						value={`${row.averageCheck.toLocaleString("ru-RU")} ₽`}
						small
					/>
				</div>

				<DataStateContainer
					loading={loading}
					error={error}
					empty={!loading && !error && (bookings?.length ?? 0) === 0}
					emptyMessage="За этот день нет бронирований"
				>
					<div className="flex flex-col gap-2">
						{bookings?.map((b) => (
							<BookingRow key={b.id} booking={b} />
						))}
					</div>
				</DataStateContainer>
			</div>
		</ModalSheet>
	);
}

function BookingRow({ booking }: { booking: Booking }) {
	const isActive = booking.status === "active";
	return (
		<div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)] text-white">
				<div className="flex items-center gap-1.5 min-w-0">
					<HouseIcon size={14} weight="fill" />
					<span className="text-sm font-bold truncate">
						{booking.houseName ?? booking.houseId}
					</span>
				</div>
				<span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full shrink-0 ml-2">
					{isActive ? "Активна" : "Завершена"}
				</span>
			</div>

			{/* Body */}
			<div className="px-3 py-2.5 flex flex-col gap-2">
				{/* Клиент */}
				<div className="flex items-center justify-between gap-2">
					<div className="min-w-0">
						<div className="text-sm font-bold text-[var(--foreground)] truncate">
							{booking.clientFirstName} {booking.clientLastName}
						</div>
						{booking.clientPhone && (
							<div className="text-xs text-[var(--muted-foreground)] mt-0.5">
								{formatPhone(booking.clientPhone)}
							</div>
						)}
					</div>
					{booking.clientPhone && (
						<a
							href={`tel:${booking.clientPhone}`}
							aria-label="Позвонить клиенту"
							className="flex items-center justify-center size-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)]/15 active:scale-95 transition-all shrink-0"
						>
							<PhoneIcon size={14} weight="fill" />
						</a>
					)}
				</div>

				{/* Meta */}
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
					<span>
						{formatShortDate(booking.checkIn)} –{" "}
						{formatShortDate(booking.checkOut)}
					</span>
					{booking.guestsCount > 0 && (
						<span className="flex items-center gap-1">
							<UsersIcon size={11} />
							{booking.guestsCount} чел.
						</span>
					)}
					{booking.managerName && (
						<span className="flex items-center gap-1">
							<UserIcon size={11} />
							{booking.managerName}
						</span>
					)}
				</div>

				{/* Services */}
				{booking.services.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{booking.services.map((s) => (
							<span
								key={s.id}
								className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10.5px] font-medium rounded-full bg-[var(--amber-light)] text-[var(--amber-hover)] border border-[var(--amber)]/15"
							>
								<SparkleIcon size={9} weight="fill" />
								{s.name}
							</span>
						))}
					</div>
				)}

				{/* Price — always shown in finance report regardless of settings.showBookingCardPrice */}
				<div className="flex items-center justify-between pt-1.5 border-t border-[var(--border)]">
					<span className="text-xs text-[var(--muted-foreground)]">
						{booking.prepayment != null && booking.prepayment > 0
							? `Предоплата: ${booking.prepayment.toLocaleString("ru-RU")} ₽`
							: "Сумма"}
					</span>
					<span className="text-base font-extrabold text-[var(--accent)]">
						{(booking.totalPrice ?? 0).toLocaleString("ru-RU")} ₽
					</span>
				</div>
			</div>
		</div>
	);
}

function SummaryCell({
	label,
	value,
	accent,
	small,
}: {
	label: string;
	value: string;
	accent?: boolean;
	small?: boolean;
}) {
	return (
		<div
			className={`rounded-xl border px-3 py-2.5 ${
				accent
					? "bg-[var(--accent-light)] border-[var(--accent)]/20"
					: "bg-white border-[var(--border)]"
			}`}
		>
			<div className="text-[10.5px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
				{label}
			</div>
			<div
				className={`mt-0.5 font-extrabold tracking-tight leading-tight ${
					small ? "text-[13px]" : "text-[15px]"
				} ${accent ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}
			>
				{value}
			</div>
		</div>
	);
}
