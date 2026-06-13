"use client";
import { UserIcon } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import SearchablePicker from "@/components/ui/SearchablePicker";
import { formatPhone } from "@/lib/utils";
import type { Client } from "@/types";

interface ClientPickerValue {
	clientId: string;
	clientFirstName: string;
	clientLastName: string;
	clientPhone: string;
}

interface Props {
	value: ClientPickerValue;
	clients: Client[];
	onChange: (value: ClientPickerValue) => void;
	onOpenClient: (client: Client) => void;
	onCreateClient: () => void;
}

export default function ClientPicker({
	value,
	clients,
	onChange,
	onOpenClient,
	onCreateClient,
}: Props) {
	const selected = value.clientId
		? (clients.find((c) => c.id === value.clientId) ?? null)
		: null;

	return (
		<SearchablePicker
			items={clients}
			selected={selected}
			onSelect={(client) =>
				onChange({
					clientId: client.id,
					clientFirstName: client.firstName,
					clientLastName: client.lastName ?? "",
					clientPhone: client.phone,
				})
			}
			onClear={() =>
				onChange({
					clientId: "",
					clientFirstName: "",
					clientLastName: "",
					clientPhone: "",
				})
			}
			onCreate={onCreateClient}
			onOpenItem={onOpenClient}
			filterFn={(client, query) =>
				`${client.firstName} ${client.lastName ?? ""}`
					.toLowerCase()
					.includes(query.toLowerCase()) || client.phone.includes(query)
			}
			renderItem={(client) => (
				<>
					<div className="text-sm text-[var(--foreground)] font-medium">
						{client.firstName}
						{client.lastName ? ` ${client.lastName}` : ""}
					</div>
					<div className="text-xs text-[var(--muted-foreground)]">
						{formatPhone(client.phone)}
					</div>
				</>
			)}
			renderSelected={(client) => (
				<span className="text-sm text-[var(--foreground)] truncate">
					{client.firstName}
					{client.lastName ? ` ${client.lastName}` : ""}
				</span>
			)}
			label={
				<Label className="flex items-center gap-1">
					<UserIcon size={13} weight="regular" aria-hidden="true" />
					Клиент <span className="text-[var(--danger)]">*</span>
				</Label>
			}
			placeholder="Поиск по имени или телефону..."
		/>
	);
}
