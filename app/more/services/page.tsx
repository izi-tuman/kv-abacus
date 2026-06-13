"use client";
import { Star } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceModal from "@/components/services/ServiceModal";
import { CrudPageLayout } from "@/components/ui/crud-page-layout";
import { DataStateContainer } from "@/components/ui/data-state-container";
import { PageHeader } from "@/components/ui/page-header";
import { useCrudPage } from "@/hooks/useCrudPage";
import { servicesApi } from "@/lib/api";
import type { Service } from "@/types";

export default function ServicesPage() {
	const crud = useCrudPage<Service>({
		fetchItems: () => servicesApi.getServices(),
		createItem: (data) => servicesApi.createService(data),
		updateItem: (id, data) => servicesApi.updateService(id, data),
		deleteItem: (id) => servicesApi.deleteService(id),
	});

	const [searchQuery, setSearchQuery] = useState("");

	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return crud.items;
		return crud.items.filter(
			(s) =>
				s.name.toLowerCase().includes(q) ||
				(s.description ?? "").toLowerCase().includes(q),
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
					title="Доп. услуги"
					subtitle={`${crud.items.length} услуг`}
					icon={<Star size={20} weight="regular" />}
					onAdd={() => crud.setModalItem(null)}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Название услуги"
				/>
			}
		>
			<DataStateContainer
				loading={crud.loading}
				error={crud.loadError ? "Не удалось загрузить услуги" : null}
				empty={filtered.length === 0}
				emptyMessage={searchQuery ? "Ничего не найдено" : "Нет услуг"}
			>
				{filtered.map((service) => (
					<ServiceCard
						key={service.id}
						service={service}
						onClick={(s) => crud.setModalItem(s)}
					/>
				))}
			</DataStateContainer>

			{crud.modalItem !== undefined && (
				<ServiceModal
					service={crud.modalItem}
					onClose={() => crud.setModalItem(undefined)}
					onSave={crud.handleSave}
					onDelete={crud.handleDelete}
				/>
			)}
		</CrudPageLayout>
	);
}
