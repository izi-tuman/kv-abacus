// Модалка клиента: переключается между просмотром профиля и редактированием.
// Используется в мобильном и десктопном календаре, а также в списке клиентов.
"use client";
import { useEffect, useState } from "react";
import { ModalSheet } from "@/components/ui/modal-sheet";
import type { Client } from "@/types";
import ClientEditForm from "./ClientEditForm";
import ClientView from "./ClientView";

interface Props {
	client: Client | null;
	onClose: () => void;
	onSave: (
		client: Omit<Client, "id" | "totalBookings" | "createdAt"> | Client,
	) => Promise<void>;
}

export default function ClientModal({ client, onClose, onSave }: Props) {
	const [mode, setMode] = useState<"view" | "edit">(
		client === null ? "edit" : "view",
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: сброс режима только при смене клиента (по id)
	useEffect(() => {
		setMode(client === null ? "edit" : "view");
	}, [client?.id]);

	return (
		<ModalSheet
			open
			onClose={onClose}
			title={client ? "Клиент" : "Новый клиент"}
		>
			{mode === "view" && client ? (
				<ClientView client={client} onEdit={() => setMode("edit")} />
			) : (
				<ClientEditForm
					client={client}
					onSave={onSave}
					onCancel={client ? () => setMode("view") : onClose}
				/>
			)}
		</ModalSheet>
	);
}
