"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CrudPageLayout } from "@/components/ui/crud-page-layout";
import { DataStateContainer } from "@/components/ui/data-state-container";
import { PageHeader } from "@/components/ui/page-header";
import { useCrudPage } from "@/hooks/useCrudPage";
import { clientsApi } from "@/lib/api";
import type { Client } from "@/types";
import ClientCard from "./ClientCard";
import ClientModal from "./ClientModal";
import Pagination from "./Pagination";

const PAGE_SIZE = 20;

export default function ClientsPage() {
	const crud = useCrudPage<Client>({
		fetchItems: () => clientsApi.getClients(),
		createItem: (data) => clientsApi.createClient(data),
		updateItem: (id, data) => clientsApi.updateClient(id, data),
		prependNew: true,
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);

	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return crud.items;
		return crud.items.filter(
			(c) =>
				`${c.firstName} ${c.lastName ?? ""}`.toLowerCase().includes(q) ||
				c.phone.includes(q),
		);
	}, [crud.items, searchQuery]);

	function handleSearchChange(q: string) {
		setSearchQuery(q);
		setPage(1);
	}

	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	useEffect(() => {
		if (totalPages === 0) {
			if (page !== 1) setPage(1);
			return;
		}
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, totalPages]);

	const showSearchEmptyState =
		!crud.loading &&
		!crud.loadError &&
		filtered.length === 0 &&
		searchQuery.trim().length > 0;

	return (
		<CrudPageLayout
			containerRef={crud.containerRef}
			pullDistance={crud.pullDistance}
			isRefreshing={crud.isRefreshing}
			layout="cards"
			header={
				<PageHeader
					title="Клиенты"
					subtitle={`${crud.items.length} в базе`}
					onAdd={() => crud.setModalItem(null)}
					addAriaLabel="Добавить клиента"
					searchQuery={searchQuery}
					onSearchChange={handleSearchChange}
					searchPlaceholder="Имя или телефон"
				/>
			}
		>
			{showSearchEmptyState ? (
				<div className="flex items-center justify-center py-16 px-4">
					<div className="flex flex-col items-center gap-3 text-center">
						<div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="var(--accent)"
								strokeWidth="2"
								strokeLinecap="round"
							>
								<circle cx="11" cy="11" r="7" />
								<path d="m20 20-3.5-3.5" />
							</svg>
						</div>
						<p className="text-sm text-[var(--muted-foreground)]">
							Ничего не найдено по запросу
						</p>
						<Button
							type="button"
							variant="secondary"
							onClick={() => handleSearchChange("")}
							aria-label="Сбросить поиск клиентов"
						>
							Сбросить поиск
						</Button>
					</div>
				</div>
			) : (
				<DataStateContainer
					loading={crud.loading}
					error={crud.loadError ? "Не удалось загрузить клиентов" : null}
					empty={paginated.length === 0}
					emptyMessage={searchQuery ? "Никого не нашли" : "Нет клиентов"}
				>
					{paginated.map((client) => (
						<ClientCard
							key={client.id}
							client={client}
							onClick={(c) => crud.setModalItem(c)}
						/>
					))}
				</DataStateContainer>
			)}

			<Pagination
				page={page}
				totalPages={totalPages}
				totalItems={filtered.length}
				pageSize={PAGE_SIZE}
				onPageChange={setPage}
			/>

			{crud.modalItem !== undefined && (
				<ClientModal
					client={crud.modalItem}
					onClose={() => crud.setModalItem(undefined)}
					onSave={crud.handleSave}
				/>
			)}
		</CrudPageLayout>
	);
}
