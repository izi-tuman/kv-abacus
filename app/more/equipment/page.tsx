"use client";
import { Tent } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import EquipmentModal from "@/components/equipment/EquipmentModal";
import { CrudPageLayout } from "@/components/ui/crud-page-layout";
import { DataStateContainer } from "@/components/ui/data-state-container";
import { PageHeader } from "@/components/ui/page-header";
import { useCrudPage } from "@/hooks/useCrudPage";
import { equipmentApi } from "@/lib/api";
import type { Equipment } from "@/types";

export default function EquipmentPage() {
	const crud = useCrudPage<Equipment>({
		fetchItems: () => equipmentApi.getEquipment(),
		createItem: (data) => equipmentApi.createEquipment(data),
		updateItem: (id, data) => equipmentApi.updateEquipment(id, data),
		deleteItem: (id) => equipmentApi.deleteEquipment(id),
	});

	const [searchQuery, setSearchQuery] = useState("");

	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return crud.items;
		return crud.items.filter(
			(e) =>
				e.name.toLowerCase().includes(q) ||
				(e.description ?? "").toLowerCase().includes(q),
		);
	}, [crud.items, searchQuery]);

	return (
		<CrudPageLayout
			containerRef={crud.containerRef}
			pullDistance={crud.pullDistance}
			isRefreshing={crud.isRefreshing}
			layout="cards"
			header={
				<PageHeader
					title="Снаряжение"
					subtitle={`${crud.items.length} позиций`}
					icon={<Tent size={20} weight="regular" />}
					onAdd={() => crud.setModalItem(null)}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Название снаряжения"
				/>
			}
		>
			<DataStateContainer
				loading={crud.loading}
				error={crud.loadError ? "Не удалось загрузить снаряжение" : null}
				empty={filtered.length === 0}
				emptyMessage={searchQuery ? "Ничего не найдено" : "Нет снаряжения"}
			>
				{filtered.map((equipment) => (
					<EquipmentCard
						key={equipment.id}
						equipment={equipment}
						onClick={(e) => crud.setModalItem(e)}
					/>
				))}
			</DataStateContainer>

			{crud.modalItem !== undefined && (
				<EquipmentModal
					equipment={crud.modalItem}
					onClose={() => crud.setModalItem(undefined)}
					onSave={crud.handleSave}
					onDelete={crud.handleDelete}
				/>
			)}
		</CrudPageLayout>
	);
}
