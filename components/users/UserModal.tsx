// Модалка пользователя: переключается между просмотром и редактированием.
// Используется в разделе управления пользователями.
"use client";
import { useEffect, useState } from "react";
import { ModalSheet } from "@/components/ui/modal-sheet";
import type { Role, User } from "@/types";
import UserEditForm, { type UserFormData } from "./UserEditForm";
import UserView from "./UserView";

export type { UserFormData };

interface Props {
	user: User | null;
	roles: Role[];
	onClose: () => void;
	onSave: (user: UserFormData & { id?: string }) => Promise<void>;
}

export default function UserModal({ user, roles, onClose, onSave }: Props) {
	const [mode, setMode] = useState<"view" | "edit">(
		user === null ? "edit" : "view",
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: сброс режима только при смене пользователя (по id)
	useEffect(() => {
		setMode(user === null ? "edit" : "view");
	}, [user?.id]);

	return (
		<ModalSheet
			open
			onClose={onClose}
			title={user ? "Пользователь" : "Новый пользователь"}
		>
			{mode === "view" && user ? (
				<UserView user={user} onEdit={() => setMode("edit")} />
			) : (
				<UserEditForm
					user={user}
					roles={roles}
					onSave={onSave}
					onCancel={user ? () => setMode("view") : onClose}
				/>
			)}
		</ModalSheet>
	);
}
