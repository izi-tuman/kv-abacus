// Просмотр профиля клиента с табами: профиль, брони, прокат.
// Адаптивен: на десктопе контент табов раскладывается в две колонки.
"use client";
import {
	ChatCircleIcon,
	EnvelopeIcon,
	HouseIcon,
	PencilSimpleIcon,
	PhoneIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "@/components/ui/data-state-container";
import { useMountedRef } from "@/hooks/useMountedRef";
import { clientsApi } from "@/lib/api";
import { RU_MONTHS_SHORT } from "@/lib/dates";
import { useSettings } from "@/lib/settings-context";
import { formatPhone } from "@/lib/utils";
import type { Booking, Client, EquipmentRental } from "@/types";

interface ClientViewProps {
	client: Client;
	onEdit: () => void;
}

type ViewTab = "profile" | "bookings" | "rentals";

function getInitials(firstName: string, lastName?: string): string {
	const a = firstName[0]?.toUpperCase() ?? "";
	const b = lastName?.[0]?.toUpperCase() ?? "";
	return a + b;
}

function fmtSum(total: number): string {
	if (total >= 1000) return `${Math.round(total / 1000)}k ₽`;
	return `${total} ₽`;
}

function fmtLastDate(bookings: Booking[]): string {
	if (bookings.length === 0) return "—";
	const iso = bookings
		.map((b) => b.checkOut)
		.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[
		bookings.length - 1
	];
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return `${d.getDate()} ${RU_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtDateTime(iso: string) {
	const d = new Date(iso);
	return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function nightsBetween(checkIn: string, checkOut: string): number {
	const a = new Date(checkIn).getTime();
	const b = new Date(checkOut).getTime();
	const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
	return diff > 0 ? diff : 0;
}

function fmtShortDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return `${d.getDate()} ${RU_MONTHS_SHORT[d.getMonth()]}`;
}

export default function ClientView({ client, onEdit }: ClientViewProps) {
	const { settings } = useSettings();
	const [activeTab, setActiveTab] = useState<ViewTab>("profile");
	const [bookings, setBookings] = useState<Booking[] | null>(null);
	const [rentals, setRentals] = useState<EquipmentRental[] | null>(null);
	const [bookingsLoading, setBookingsLoading] = useState(true);
	const [bookingsError, setBookingsError] = useState<string | null>(null);
	const [rentalsLoading, setRentalsLoading] = useState(false);
	const [rentalsError, setRentalsError] = useState<string | null>(null);
	const bookingsRequestRef = useRef(0);
	const rentalsLoadedRef = useRef(false);
	const rentalsRequestRef = useRef(0);
	const mountedRef = useMountedRef();

	useEffect(() => {
		const requestId = bookingsRequestRef.current + 1;
		bookingsRequestRef.current = requestId;
		setBookings(null);
		setBookingsLoading(true);
		setBookingsError(null);
		clientsApi
			.getClientBookings(client.id)
			.then((data) => {
				if (mountedRef.current && bookingsRequestRef.current === requestId) {
					setBookings(data);
				}
			})
			.catch((err) => {
				if (mountedRef.current && bookingsRequestRef.current === requestId) {
					setBookingsError(
						err instanceof Error ? err.message : "Ошибка загрузки",
					);
					setBookings([]);
				}
			})
			.finally(() => {
				if (mountedRef.current && bookingsRequestRef.current === requestId) {
					setBookingsLoading(false);
				}
			});
	}, [client.id, mountedRef]);

	useEffect(() => {
		void client.id;
		rentalsLoadedRef.current = false;
		rentalsRequestRef.current += 1;
		setRentals(null);
		setRentalsLoading(false);
		setRentalsError(null);
	}, [client.id]);

	const handleTabChange = useCallback(
		async (tab: ViewTab) => {
			setActiveTab(tab);
			if (tab !== "rentals" || rentalsLoadedRef.current) return;
			rentalsLoadedRef.current = true;
			const requestId = rentalsRequestRef.current + 1;
			rentalsRequestRef.current = requestId;
			setRentalsLoading(true);
			setRentalsError(null);
			try {
				const data = await clientsApi.getClientRentals(client.id);
				if (mountedRef.current && rentalsRequestRef.current === requestId) {
					setRentals(data);
				}
			} catch (err) {
				if (mountedRef.current && rentalsRequestRef.current === requestId) {
					setRentalsError(
						err instanceof Error ? err.message : "Ошибка загрузки",
					);
					rentalsLoadedRef.current = false;
				}
			} finally {
				if (mountedRef.current && rentalsRequestRef.current === requestId) {
					setRentalsLoading(false);
				}
			}
		},
		[client.id, mountedRef],
	);

	const totalSum = bookings
		? bookings.reduce((s, b) => s + (b.totalPrice ?? 0), 0)
		: null;

	const tabLabels = useMemo<{ key: ViewTab; label: string }[]>(
		() => [
			{ key: "profile", label: "Профиль" },
			{
				key: "bookings",
				label: bookings !== null ? `Брони (${bookings.length})` : "Брони",
			},
			{ key: "rentals", label: "Прокат" },
		],
		[bookings],
	);

	return (
		<div className="flex flex-col">
			{/* Hero */}
			<div className="flex flex-col items-center px-4 lg:px-6 pt-2 pb-[18px]">
				<div className="w-[84px] h-[84px] rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0 shadow-md">
					<span className="text-white text-[28px] font-extrabold tracking-wide">
						{getInitials(client.firstName, client.lastName)}
					</span>
				</div>

				<p className="mt-3 text-2xl font-extrabold text-[var(--foreground)] tracking-tight text-center">
					{client.firstName} {client.lastName ?? ""}
				</p>

				{client.isBlacklisted && (
					<span className="mt-1.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--danger-light)] text-[var(--danger)] text-[11.5px] font-extrabold tracking-wider uppercase">
						Чёрный список
					</span>
				)}

				<div className="flex gap-2.5 mt-3.5">
					{client.phone && (
						<a
							href={`tel:${client.phone}`}
							aria-label="Позвонить клиенту"
							className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[var(--accent)] text-white text-[13px] font-semibold shadow-[0_2px_6px_oklch(0.42_0.09_148/0.25)] hover:shadow-[0_4px_12px_oklch(0.42_0.09_148/0.35)] active:scale-95 transition-all"
						>
							<PhoneIcon size={16} weight="fill" />
							Позвонить
						</a>
					)}
					<button
						type="button"
						onClick={onEdit}
						aria-label="Редактировать клиента"
						className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[var(--muted)] text-[var(--foreground)] text-[13px] font-semibold hover:bg-[var(--muted)]/80 active:scale-95 transition-all"
					>
						<PencilSimpleIcon size={16} />
						Редактировать
					</button>
				</div>
			</div>

			{/* Stats */}
			<div className="px-4 lg:px-6 pb-4 flex gap-2">
				<StatCard
					label="Бронирований"
					value={String(client.totalBookings ?? 0)}
				/>
				<StatCard
					label="Сумма"
					value={
						bookingsLoading ? null : totalSum !== null ? fmtSum(totalSum) : "—"
					}
				/>
				<StatCard
					label="Послед."
					value={
						bookingsLoading ? null : bookings ? fmtLastDate(bookings) : "—"
					}
					small
				/>
			</div>

			{/* Tabs */}
			<div className="px-4 lg:px-6 pb-3">
				<div className="flex gap-4 border-b border-[var(--border)]">
					{tabLabels.map(({ key, label }) => (
						<button
							key={key}
							type="button"
							onClick={() => handleTabChange(key)}
							className={`py-2.5 -mb-px transition-colors text-sm ${
								activeTab === key
									? "border-b-[2.5px] border-[var(--accent)] text-[var(--foreground)] font-bold"
									: "border-b-[2.5px] border-transparent text-[var(--muted-foreground)] font-medium"
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* Профиль */}
			{activeTab === "profile" && (
				<div className="px-4 lg:px-6 pb-6">
					<div className="rounded-xl border border-[var(--border)] bg-white py-1">
						<InfoRow
							icon={<PhoneIcon size={16} />}
							label="Телефон"
							value={client.phone ? formatPhone(client.phone) : "—"}
						/>
						<InfoRow
							icon={<EnvelopeIcon size={16} />}
							label="Email"
							value={client.email || "—"}
						/>
						<InfoRow
							icon={<ChatCircleIcon size={16} />}
							label="Заметки"
							value={client.notes || "Нет заметок"}
							multi
							last
						/>
					</div>
				</div>
			)}

			{/* Брони */}
			{activeTab === "bookings" && (
				<div
					className="px-4 lg:px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-2"
					aria-live="polite"
					aria-atomic="true"
				>
					{bookingsLoading && (
						<div className="flex justify-center py-8 text-[var(--accent)] lg:col-span-2">
							<Spinner />
						</div>
					)}
					{!bookingsLoading && bookingsError && (
						<p className="text-sm text-[var(--danger)] text-center py-4 lg:col-span-2">
							{bookingsError}
						</p>
					)}
					{!bookingsLoading && !bookingsError && bookings?.length === 0 && (
						<p className="text-sm text-[var(--muted-foreground)] text-center py-10 lg:col-span-2">
							Бронирований нет
						</p>
					)}
					{!bookingsLoading &&
						!bookingsError &&
						bookings?.map((b) => {
							const nights = nightsBetween(b.checkIn, b.checkOut);
							return (
								<div
									key={b.id}
									className="rounded-xl border border-[var(--border)] bg-white p-3 flex items-center gap-3"
								>
									<div className="w-9 h-9 rounded-lg bg-[var(--muted)] flex items-center justify-center shrink-0 text-[var(--accent)]">
										<HouseIcon size={18} weight="fill" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-bold text-[var(--foreground)] truncate">
											{b.houseName ?? b.houseId}
										</div>
										<div className="text-[11.5px] font-medium text-[var(--muted-foreground)] mt-0.5 truncate">
											{fmtShortDate(b.checkIn)} · {nights} н
											{settings.showBookingCardPrice && b.totalPrice != null
												? ` · ${b.totalPrice.toLocaleString("ru-RU")} ₽`
												: ""}
										</div>
									</div>
									<span
										className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${
											b.status === "active"
												? "bg-[var(--accent-light)] text-[var(--accent)]"
												: "bg-[var(--muted)] text-[var(--muted-foreground)]"
										}`}
									>
										{b.status === "active" ? "Активна" : "Завершена"}
									</span>
								</div>
							);
						})}
				</div>
			)}

			{/* Прокат */}
			{activeTab === "rentals" && (
				<div
					className="px-4 lg:px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-2"
					aria-live="polite"
					aria-atomic="true"
				>
					{rentalsLoading && (
						<div className="flex justify-center py-8 text-[var(--accent)] lg:col-span-2">
							<Spinner />
						</div>
					)}
					{!rentalsLoading && rentalsError && (
						<div className="flex flex-col items-center gap-1 py-4 lg:col-span-2">
							<p className="text-sm text-[var(--danger)] text-center">
								{rentalsError}
							</p>
							<button
								type="button"
								onClick={() => handleTabChange("rentals")}
								className="text-xs text-[var(--accent)] font-medium underline"
							>
								Повторить
							</button>
						</div>
					)}
					{!rentalsLoading && !rentalsError && rentals?.length === 0 && (
						<p className="text-sm text-[var(--muted-foreground)] text-center py-10 lg:col-span-2">
							Прокатов нет
						</p>
					)}
					{!rentalsLoading &&
						!rentalsError &&
						rentals?.map((r) => (
							<div
								key={r.id}
								className="rounded-xl border border-[var(--border)] bg-white p-3"
							>
								<div className="flex items-center justify-between gap-2 mb-1.5">
									<span className="text-sm font-bold text-[var(--foreground)]">
										{fmtDateTime(r.startDate)} – {fmtDateTime(r.endDate)}
									</span>
									<span
										className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full ${
											r.status === "completed"
												? "bg-[var(--muted)] text-[var(--muted-foreground)]"
												: "bg-[var(--accent-light)] text-[var(--accent)]"
										}`}
									>
										{r.status === "completed" ? "Завершён" : "Активен"}
									</span>
								</div>
								{r.items.length > 0 && (
									<div className="flex flex-wrap gap-1 mb-1.5">
										{r.items.map((item) => (
											<span
												key={item.id || item.equipmentId}
												className="text-xs border border-[var(--border)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full"
											>
												{item.equipmentName} × {item.quantity}
											</span>
										))}
									</div>
								)}
								<div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
									<span>{r.totalPrice.toLocaleString("ru-RU")} ₽</span>
									{r.managerName && <span>{r.managerName}</span>}
								</div>
							</div>
						))}
				</div>
			)}
		</div>
	);
}

function StatCard({
	label,
	value,
	small,
}: {
	label: string;
	value: string | null;
	small?: boolean;
}) {
	return (
		<div className="flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5">
			<div className="text-[10.5px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
				{label}
			</div>
			{value === null ? (
				<Spinner className="size-4 text-[var(--accent)] mt-1" />
			) : (
				<div
					className={`mt-0.5 font-extrabold text-[var(--foreground)] tracking-tight leading-tight ${small ? "text-[13px]" : "text-[17px]"}`}
				>
					{value}
				</div>
			)}
		</div>
	);
}

function InfoRow({
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
			className={`flex ${multi ? "items-start" : "items-center"} justify-between gap-3 px-3 py-2.5 ${last ? "" : "border-b border-[var(--border)]"}`}
		>
			<div className="flex items-center gap-2.5 text-[var(--muted-foreground)] shrink-0">
				{icon}
				<span className="text-sm">{label}</span>
			</div>
			<span
				className={`text-sm font-semibold text-[var(--foreground)] text-right ${multi ? "whitespace-pre-wrap" : "truncate"} break-words`}
			>
				{value}
			</span>
		</div>
	);
}
