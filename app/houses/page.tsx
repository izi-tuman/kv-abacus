"use client";
import { useEffect, useMemo, useState } from "react";
import HouseCard from "@/components/houses/HouseCard";
import HouseModal from "@/components/houses/HouseModal";
import { CrudPageLayout } from "@/components/ui/crud-page-layout";
import { DataStateContainer } from "@/components/ui/data-state-container";
import { PageHeader } from "@/components/ui/page-header";
import { useCrudPage } from "@/hooks/useCrudPage";
import { housesApi, reportsApi } from "@/lib/api";
import { toDateString } from "@/lib/dates";

export default function HousesPage() {
	const crud = useCrudPage({
		fetchItems: () => housesApi.getHouses(),
		createItem: (data) => housesApi.createHouse(data),
		updateItem: (id, data) => housesApi.updateHouse(id, data),
		deleteItem: (id) => housesApi.deleteHouse(id),
	});

	const [occupancy, setOccupancy] = useState<Map<string, number> | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return crud.items;
		return crud.items.filter(
			(h) =>
				h.name.toLowerCase().includes(q) ||
				(h.description ?? "").toLowerCase().includes(q),
		);
	}, [crud.items, searchQuery]);

	useEffect(() => {
		const now = new Date();
		const from = toDateString(new Date(now.getFullYear(), now.getMonth(), 1));
		const to = toDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));
		reportsApi
			.getHousesReport(from, to)
			.then((rows) => {
				setOccupancy(new Map(rows.map((r) => [r.houseId, r.occupancyRate])));
			})
			.catch(() => {
				setOccupancy(new Map());
			});
	}, []);

	return (
		<CrudPageLayout
			containerRef={crud.containerRef}
			pullDistance={crud.pullDistance}
			isRefreshing={crud.isRefreshing}
			layout="cards"
			header={
				<PageHeader
					title="Дома"
					subtitle={`${crud.items.length} объектов`}
					onAdd={() => crud.setModalItem(null)}
					addAriaLabel="Добавить дом"
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Название дома"
				/>
			}
		>
			<DataStateContainer
				loading={crud.loading}
				error={crud.loadError ? "Не удалось загрузить дома" : null}
				empty={filtered.length === 0}
				emptyMessage={searchQuery ? "Ничего не найдено" : "Нет домов"}
			>
				{filtered.map((house) => (
					<HouseCard
						key={house.id}
						house={house}
						occupancy={occupancy ? (occupancy.get(house.id) ?? 0) : null}
						onClick={(h) => crud.setModalItem(h)}
					/>
				))}
			</DataStateContainer>

			{crud.modalItem !== undefined && (
				<HouseModal
					house={crud.modalItem}
					onClose={() => crud.setModalItem(undefined)}
					onSave={crud.handleSave}
					onDelete={crud.handleDelete}
				/>
			)}
		</CrudPageLayout>
	);
}
