"use client";
import { FunnelIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BookingModal from "@/components/booking-calendar/shared/BookingModal";
import ClientModal from "@/components/clients/ClientModal";
import HistoryCard from "@/components/history/HistoryCard";
import HistoryFilters, {
	type Filters,
} from "@/components/history/HistoryFilters";
import HouseModal from "@/components/houses/HouseModal";
import { Spinner } from "@/components/ui/data-state-container";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { PageHeader } from "@/components/ui/page-header";
import { useMountedRef } from "@/hooks/useMountedRef";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import {
	bookingsApi,
	clientsApi,
	housesApi,
	servicesApi,
	usersApi,
} from "@/lib/api";
import { getDefaultDates } from "@/lib/dates";
import type { Booking, Client, House, Service, User } from "@/types";

const DEFAULT_FILTERS: Filters = {
	search: "",
	houseId: "",
	managerId: "",
	status: "",
};

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

export default function HistoryPage() {
	const defaults = getDefaultDates();
	const [dateFrom, setDateFrom] = useState(defaults.from);
	const [dateTo, setDateTo] = useState(defaults.to);

	const [bookings, setBookings] = useState<Booking[]>([]);
	const [houses, setHouses] = useState<House[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [services, setServices] = useState<Service[]>([]);

	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);

	const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

	const [modalBooking, setModalBooking] = useState<Booking | null | undefined>(
		undefined,
	);
	const [clientModal, setClientModal] = useState<Client | null | undefined>(
		undefined,
	);
	const [houseModal, setHouseModal] = useState<House | null | undefined>(
		undefined,
	);
	const [preselectedClient, setPreselectedClient] = useState<Client | null>(
		null,
	);
	const [preselectedHouseId, setPreselectedHouseId] = useState<string>("");

	const fetchedRef = useRef(false);
	const isFirstMount = useRef(true);
	const containerRef = useRef<HTMLDivElement>(null);
	const mountedRef = useMountedRef();

	const loadBookings = useCallback(async () => {
		setLoading(true);
		setLoadError(false);
		try {
			const data = await bookingsApi.getBookings(dateFrom, dateTo);
			setBookings(data);
		} catch {
			setLoadError(true);
		} finally {
			setLoading(false);
		}
	}, [dateFrom, dateTo]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only once on mount, guarded by fetchedRef
	useEffect(() => {
		if (fetchedRef.current) return;
		fetchedRef.current = true;
		loadBookings();
		Promise.all([
			housesApi.getHouses(),
			clientsApi.getClients(),
			usersApi.getUsers(),
			servicesApi.getServices(),
		])
			.then(([h, c, u, s]) => {
				if (!mountedRef.current) return;
				setHouses(h);
				setClients(c);
				setUsers(u);
				setServices(s);
			})
			.catch(() => {});
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: loadBookings already depends on dateFrom/dateTo, skips first mount
	useEffect(() => {
		if (isFirstMount.current) {
			isFirstMount.current = false;
			return;
		}
		loadBookings();
	}, [dateFrom, dateTo]);

	const handleRefresh = useCallback(async () => {
		const data = await bookingsApi.getBookings(dateFrom, dateTo);
		setBookings(data);
	}, [dateFrom, dateTo]);

	const { pullDistance, isRefreshing } = usePullToRefresh(
		handleRefresh,
		containerRef,
	);

	const filtered = useMemo(() => {
		let result = [...bookings];
		const { search, houseId, managerId, status } = filters;
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			result = result.filter(
				(b) =>
					`${b.clientFirstName} ${b.clientLastName ?? ""}`
						.toLowerCase()
						.includes(q) || b.clientPhone.includes(q),
			);
		}
		if (houseId) result = result.filter((b) => b.houseId === houseId);
		if (managerId) result = result.filter((b) => b.managerId === managerId);
		if (status) result = result.filter((b) => b.status === status);
		result.sort((a, b) => b.checkIn.localeCompare(a.checkIn));
		return result;
	}, [bookings, filters]);

	const managerOptions = useMemo(() => {
		const seen = new Map<string, string>();
		for (const b of bookings) {
			if (b.managerId && b.managerId !== EMPTY_GUID && !seen.has(b.managerId)) {
				seen.set(b.managerId, b.managerName ?? b.managerId);
			}
		}
		return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
	}, [bookings]);

	async function handleBookingSave(data: Omit<Booking, "id"> | Booking) {
		if ("id" in data) {
			const updated = await bookingsApi.updateBooking(data.id, data);
			setModalBooking((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			await bookingsApi.createBooking(data);
		}
		await loadBookings();
	}

	async function handleBookingDelete(id: string) {
		await bookingsApi.deleteBooking(id);
		await loadBookings();
	}

	async function handleClientSave(
		data: Omit<Client, "id" | "totalBookings" | "createdAt"> | Client,
	) {
		if ("id" in data) {
			const updated = await clientsApi.updateClient(data.id, data);
			setClients((prev) =>
				prev.map((c) => (c.id === updated.id ? updated : c)),
			);
			setClientModal((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			const created = await clientsApi.createClient(data);
			setClients((prev) => [created, ...prev]);
			setPreselectedClient(created);
		}
	}

	async function handleHouseSave(data: Omit<House, "id"> | House) {
		if ("id" in data) {
			const updated = await housesApi.updateHouse(data.id, data);
			setHouses((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
			setHouseModal((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			const created = await housesApi.createHouse(data);
			setHouses((prev) => [...prev, created]);
			setPreselectedHouseId(created.id);
		}
	}

	async function handleHouseDelete(id: string) {
		await housesApi.deleteHouse(id);
		setHouses((prev) => prev.filter((h) => h.id !== id));
	}

	return (
		<div
			ref={containerRef}
			className="min-h-dvh bg-[var(--background)] flex flex-col"
		>
			<div className="sticky top-0 z-10 bg-[var(--background)]">
				<PageHeader
					title="История"
					subtitle={`${bookings.length} записей · архив`}
				/>
				<div className="px-4 -mt-1 pb-3">
					<button
						type="button"
						onClick={() => setFiltersOpen((v) => !v)}
						className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted-foreground)] bg-white border border-[var(--border)] rounded-xl px-3 py-2 hover:bg-[var(--accent-light)] hover:text-[var(--accent)] hover:border-[var(--accent)]/25 transition-all duration-200"
					>
						<FunnelIcon size={15} weight="regular" aria-hidden="true" />
						Фильтры {filtersOpen ? "▲" : "▼"}
					</button>

					{filtersOpen && (
						<div className="mt-2">
							<HistoryFilters
								dateFrom={dateFrom}
								dateTo={dateTo}
								onDateFromChange={setDateFrom}
								onDateToChange={setDateTo}
								filters={filters}
								onFiltersChange={setFilters}
								onReset={() => setFilters(DEFAULT_FILTERS)}
								houses={houses}
								managerOptions={managerOptions}
							/>
						</div>
					)}
				</div>
			</div>

			<PullToRefreshIndicator
				pullDistance={pullDistance}
				isRefreshing={isRefreshing}
			/>

			{/* Список */}
			<div className="flex-1 px-3 pt-1 pb-4">
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Spinner />
					</div>
				) : loadError ? (
					<div className="flex items-center justify-center py-16 text-red-400 text-sm">
						Не удалось загрузить данные
					</div>
				) : filtered.length === 0 ? (
					<div className="flex items-center justify-center py-16 text-[var(--muted-foreground)] text-sm">
						Нет бронирований
					</div>
				) : (
					filtered.map((b) => (
						<HistoryCard
							key={b.id}
							booking={b}
							onClick={(b) => setModalBooking(b)}
						/>
					))
				)}
			</div>

			{/* Модалки */}
			{modalBooking !== undefined && (
				<BookingModal
					booking={modalBooking}
					houses={houses}
					clients={clients}
					users={users}
					services={services}
					onClose={() => {
						setModalBooking(undefined);
						setPreselectedClient(null);
						setPreselectedHouseId("");
					}}
					onSave={handleBookingSave}
					onDelete={handleBookingDelete}
					onOpenClient={(c) => setClientModal(c)}
					onCreateClient={() => setClientModal(null)}
					onOpenHouse={(h) => setHouseModal(h)}
					onCreateHouse={() => setHouseModal(null)}
					preselectedClient={preselectedClient}
					preselectedHouseId={preselectedHouseId}
				/>
			)}

			{clientModal !== undefined && (
				<ClientModal
					client={clientModal}
					onClose={() => setClientModal(undefined)}
					onSave={handleClientSave}
				/>
			)}

			{houseModal !== undefined && (
				<HouseModal
					house={houseModal}
					onClose={() => setHouseModal(undefined)}
					onSave={handleHouseSave}
					onDelete={handleHouseDelete}
				/>
			)}
		</div>
	);
}
