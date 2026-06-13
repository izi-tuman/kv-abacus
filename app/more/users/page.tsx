"use client";
import { UserCircleIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CrudPageLayout } from "@/components/ui/crud-page-layout";
import { DataStateContainer } from "@/components/ui/data-state-container";
import { PageHeader } from "@/components/ui/page-header";
import UserCard from "@/components/users/UserCard";
import UserModal, { type UserFormData } from "@/components/users/UserModal";
import { useCrudPage } from "@/hooks/useCrudPage";
import { rolesApi, usersApi } from "@/lib/api";
import type { Role, User } from "@/types";

export default function UsersPage() {
	const crud = useCrudPage<User>({
		fetchItems: () => usersApi.getUsers(),
		createItem: (data) => usersApi.createUser(data),
		updateItem: (id, data) => usersApi.updateUser(id, data),
		prependNew: true,
	});

	const [roles, setRoles] = useState<Role[]>([]);
	const rolesFetchedRef = useRef(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return crud.items;
		return crud.items.filter(
			(u) =>
				`${u.firstName} ${u.lastName ?? ""}`.toLowerCase().includes(q) ||
				u.phone.includes(q) ||
				(u.roleName ?? "").toLowerCase().includes(q),
		);
	}, [crud.items, searchQuery]);

	useEffect(() => {
		if (rolesFetchedRef.current) return;
		rolesFetchedRef.current = true;
		rolesApi
			.getRoles()
			.then(setRoles)
			.catch(() => {});
	}, []);

	async function handleSave(data: UserFormData & { id?: string }) {
		if (data.id) {
			const updated = await usersApi.updateUser(data.id, data);
			crud.setItems((prev) =>
				prev.map((u) => (u.id === updated.id ? updated : u)),
			);
		} else {
			const created = await usersApi.createUser(data);
			crud.setItems((prev) => [created, ...prev]);
		}
	}

	return (
		<CrudPageLayout
			containerRef={crud.containerRef}
			pullDistance={crud.pullDistance}
			isRefreshing={crud.isRefreshing}
			layout="cards"
			header={
				<PageHeader
					title="Пользователи"
					subtitle={`${crud.items.length} сотрудников`}
					icon={<UserCircleIcon size={20} weight="regular" />}
					onAdd={() => crud.setModalItem(null)}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Имя, телефон или должность"
				/>
			}
		>
			<DataStateContainer
				loading={crud.loading}
				error={crud.loadError ? "Не удалось загрузить пользователей" : null}
				empty={filtered.length === 0}
				emptyMessage={searchQuery ? "Ничего не найдено" : "Нет пользователей"}
			>
				{filtered.map((user) => (
					<UserCard
						key={user.id}
						user={user}
						onClick={(u) => crud.setModalItem(u)}
					/>
				))}
			</DataStateContainer>

			{crud.modalItem !== undefined && (
				<UserModal
					user={crud.modalItem}
					roles={roles}
					onClose={() => crud.setModalItem(undefined)}
					onSave={handleSave}
				/>
			)}
		</CrudPageLayout>
	);
}
