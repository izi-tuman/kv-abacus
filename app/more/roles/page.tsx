"use client";
import { ShieldCheck } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import RoleCard from "@/components/roles/RoleCard";
import RoleModal from "@/components/roles/RoleModal";
import { CrudPageLayout } from "@/components/ui/crud-page-layout";
import { DataStateContainer } from "@/components/ui/data-state-container";
import { PageHeader } from "@/components/ui/page-header";
import { useCrudPage } from "@/hooks/useCrudPage";
import { rolesApi } from "@/lib/api";
import type { Role } from "@/types";

export default function RolesPage() {
	const crud = useCrudPage<Role>({
		fetchItems: () => rolesApi.getRoles(),
		createItem: (data) => rolesApi.createRole(data),
		updateItem: (id, data) => rolesApi.updateRole(id, data),
		deleteItem: (id) => rolesApi.deleteRole(id),
		prependNew: true,
	});

	const [searchQuery, setSearchQuery] = useState("");

	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return crud.items;
		return crud.items.filter((r) => r.name.toLowerCase().includes(q));
	}, [crud.items, searchQuery]);

	return (
		<CrudPageLayout
			containerRef={crud.containerRef}
			pullDistance={crud.pullDistance}
			isRefreshing={crud.isRefreshing}
			layout="cards"
			header={
				<PageHeader
					title="Должности"
					subtitle={`${crud.items.length} должностей`}
					icon={<ShieldCheck size={20} weight="regular" />}
					onAdd={() => crud.setModalItem(null)}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Название должности"
				/>
			}
		>
			<DataStateContainer
				loading={crud.loading}
				error={crud.loadError ? "Не удалось загрузить должности" : null}
				empty={filtered.length === 0}
				emptyMessage={searchQuery ? "Ничего не найдено" : "Нет должностей"}
			>
				{filtered.map((role) => (
					<RoleCard
						key={role.id}
						role={role}
						onClick={(r) => crud.setModalItem(r)}
					/>
				))}
			</DataStateContainer>

			{crud.modalItem !== undefined && (
				<RoleModal
					role={crud.modalItem}
					onClose={() => crud.setModalItem(undefined)}
					onSave={crud.handleSave}
					onDelete={crud.handleDelete}
				/>
			)}
		</CrudPageLayout>
	);
}
