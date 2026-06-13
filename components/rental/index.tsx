"use client";
import { FunnelIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DateFilterPicker from "@/components/ui/DateFilterPicker";
import { DataStateContainer } from "@/components/ui/data-state-container";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import { PageHeader } from "@/components/ui/page-header";
import { useMountedRef } from "@/hooks/useMountedRef";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import {
	clientsApi,
	equipmentApi,
	equipmentRentalsApi,
	usersApi,
} from "@/lib/api";
import { getDefaultDates } from "@/lib/dates";
import type { Client, Equipment, EquipmentRental, User } from "@/types";
import ClientModal from "../clients/ClientModal";
import Pagination from "../clients/Pagination";
import RentalCard from "./RentalCard";
import RentalModal from "./RentalModal";
import RentalTable from "./RentalTable";

const PAGE_SIZE = 20;

export default function RentalPage() {
	const [rentals, setRentals] = useState<EquipmentRental[]>([]);
	const [equipment, setEquipment] = useState<Equipment[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(false);

	const defaults = getDefaultDates();
	const [filterStart, setFilterStart] = useState(defaults.from);
	const [filterEnd, setFilterEnd] = useState(defaults.to);
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);

	const [modalRental, setModalRental] = useState<
		EquipmentRental | null | undefined
	>(undefined);
	const [clientModal, setClientModal] = useState<Client | null | undefined>(
		undefined,
	);
	const [preselectedClient, setPreselectedClient] = useState<Client | null>(
		null,
	);

	const fetchedRef = useRef(false);
	const isFirstMount = useRef(true);
	const containerRef = useRef<HTMLDivElement>(null);
	const mountedRef = useMountedRef();

	const handleRefresh = useCallback(async () => {
		setModalRental(undefined);
		setClientModal(undefined);
		await Promise.all([
			equipmentRentalsApi.getRentals(filterStart, filterEnd).then(setRentals),
			equipmentApi.getEquipment().then(setEquipment),
			clientsApi.getClients().then(setClients),
			usersApi.getUsers().then(setUsers),
		]);
	}, [filterStart, filterEnd]);

	const { pullDistance, isRefreshing } = usePullToRefresh(
		handleRefresh,
		containerRef,
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount, guarded by fetchedRef
	useEffect(() => {
		if (fetchedRef.current) return;
		fetchedRef.current = true;

		Promise.all([
			equipmentRentalsApi.getRentals(filterStart, filterEnd),
			equipmentApi.getEquipment(),
			clientsApi.getClients(),
		])
			.then(([r, eq, cl]) => {
				if (!mountedRef.current) return;
				setRentals(r);
				setEquipment(eq);
				setClients(cl);
			})
			.catch(() => {
				if (mountedRef.current) setLoadError(true);
			})
			.finally(() => {
				if (mountedRef.current) setLoading(false);
			});

		usersApi
			.getUsers()
			.then((u) => {
				if (mountedRef.current) setUsers(u);
			})
			.catch((e) => console.error("Failed to load users:", e));
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: mountedRef is stable, not a reactive dependency
	useEffect(() => {
		if (isFirstMount.current) {
			isFirstMount.current = false;
			return;
		}
		setLoading(true);
		equipmentRentalsApi
			.getRentals(filterStart, filterEnd)
			.then((r) => {
				if (mountedRef.current) setRentals(r);
			})
			.catch(() => {
				if (mountedRef.current) setLoadError(true);
			})
			.finally(() => {
				if (mountedRef.current) setLoading(false);
			});
	}, [filterStart, filterEnd]);

	const filtered = useMemo(() => {
		let result = [...rentals];

		if (searchQuery.trim()) {
			const q = searchQuery.trim().toLowerCase();
			result = result.filter((r) => {
				const clientName =
					`${r.clientFirstName} ${r.clientLastName ?? ""}`.toLowerCase();
				const equipmentNames = r.items
					.map((i) => i.equipmentName.toLowerCase())
					.join(" ");
				return (
					clientName.includes(q) ||
					equipmentNames.includes(q) ||
					r.clientPhone.includes(q)
				);
			});
		}

		result.sort((a, b) => b.startDate.localeCompare(a.startDate));

		return result;
	}, [rentals, searchQuery]);

	function handleFilterChange(key: "start" | "end", val: string) {
		if (key === "start") setFilterStart(val);
		else setFilterEnd(val);
		setPage(1);
	}

	function handleSearchChange(val: string) {
		setSearchQuery(val);
		setPage(1);
	}

	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	async function handleSave(
		data: Omit<EquipmentRental, "id"> | EquipmentRental,
	) {
		if ("id" in data) {
			const updated = await equipmentRentalsApi.updateRental(data.id, data);
			setRentals((prev) =>
				prev.map((r) => (r.id === updated.id ? updated : r)),
			);
			setModalRental((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			const created = await equipmentRentalsApi.createRental(data);
			setRentals((prev) => [created, ...prev]);
		}
	}

	async function handleDelete(id: string) {
		await equipmentRentalsApi.deleteRental(id);
		setRentals((prev) => prev.filter((r) => r.id !== id));
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

	return (
		<div
			ref={containerRef}
			data-page="fullwidth"
			className="min-h-dvh bg-[var(--background)] flex flex-col"
		>
			<div className="sticky top-0 z-10 bg-[var(--background)]">
				<PageHeader
					title="Прокат"
					subtitle={`${rentals.length} записей`}
					onAdd={() => setModalRental(null)}
					addAriaLabel="Новый прокат"
					searchQuery={searchQuery}
					onSearchChange={handleSearchChange}
					searchPlaceholder="Клиент, телефон или снаряжение"
				/>

				<div className="px-4 pb-3">
					<div className="rounded-xl bg-white border border-[var(--border)] px-3.5 py-3">
						<div className="flex items-center gap-1.5 text-[var(--muted-foreground)] text-xs font-semibold uppercase tracking-wider mb-2">
							<FunnelIcon size={13} weight="regular" aria-hidden="true" />
							Период
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div className="min-w-0">
								<label
									htmlFor="filter-start"
									className="text-[11px] text-[var(--muted-foreground)] font-medium mb-1 block"
								>
									От
								</label>
								<DateFilterPicker
									id="filter-start"
									value={filterStart}
									onChange={(v) => handleFilterChange("start", v)}
									placeholder="Дата"
								/>
							</div>
							<div className="min-w-0">
								<label
									htmlFor="filter-end"
									className="text-[11px] text-[var(--muted-foreground)] font-medium mb-1 block"
								>
									До
								</label>
								<DateFilterPicker
									id="filter-end"
									value={filterEnd}
									onChange={(v) => handleFilterChange("end", v)}
									placeholder="Дата"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<PullToRefreshIndicator
				pullDistance={pullDistance}
				isRefreshing={isRefreshing}
			/>

			<div className="flex-1 overflow-y-auto">
				<div className="px-4">
					<DataStateContainer
						loading={loading}
						error={loadError ? "Не удалось загрузить данные" : null}
						empty={paginated.length === 0}
						emptyMessage={
							searchQuery || filterStart || filterEnd
								? "Ничего не найдено"
								: "Нет записей о прокате"
						}
					>
						<div className="lg:hidden">
							{paginated.map((rental) => (
								<RentalCard
									key={rental.id}
									rental={rental}
									onClick={(r) => setModalRental(r)}
								/>
							))}
						</div>
						<div className="hidden lg:block">
							<RentalTable
								rentals={paginated}
								onRowClick={(r) => setModalRental(r)}
							/>
						</div>
					</DataStateContainer>

					<Pagination
						page={page}
						totalPages={totalPages}
						totalItems={filtered.length}
						pageSize={PAGE_SIZE}
						onPageChange={setPage}
					/>
				</div>
			</div>

			{modalRental !== undefined && (
				<RentalModal
					rental={modalRental}
					equipment={equipment}
					clients={clients}
					users={users}
					preselectedClient={preselectedClient}
					onClose={() => {
						setModalRental(undefined);
						setPreselectedClient(null);
					}}
					onSave={handleSave}
					onDelete={handleDelete}
					onOpenClient={(client) => setClientModal(client)}
					onCreateClient={() => setClientModal(null)}
				/>
			)}

			{clientModal !== undefined && (
				<ClientModal
					client={clientModal}
					onClose={() => setClientModal(undefined)}
					onSave={handleClientSave}
				/>
			)}
		</div>
	);
}
