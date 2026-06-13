"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { CrudModal } from "@/components/ui/crud-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role } from "@/types";

interface Props {
	role: Role | null;
	onClose: () => void;
	onSave: (role: Omit<Role, "id"> | Role) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
}

const EMPTY: Omit<Role, "id"> = {
	name: "",
	canAccessReports: false,
	canManageUsers: false,
	canManageHouses: false,
	canManageClients: false,
	canManageEquipment: false,
	canManageRentals: false,
	canManageServices: false,
	canManageSettings: false,
};

const PERMISSION_LABELS: {
	key: keyof Omit<Role, "id" | "name">;
	label: string;
}[] = [
	{ key: "canAccessReports", label: "Отчёты" },
	{ key: "canManageUsers", label: "Пользователи" },
	{ key: "canManageHouses", label: "Дома" },
	{ key: "canManageClients", label: "Клиенты" },
	{ key: "canManageEquipment", label: "Оборудование" },
	{ key: "canManageRentals", label: "Прокат" },
	{ key: "canManageServices", label: "Услуги" },
	{ key: "canManageSettings", label: "Настройки" },
];

export default function RoleModal({ role, onClose, onSave, onDelete }: Props) {
	return (
		<CrudModal
			item={role}
			emptyForm={EMPTY}
			title={(isEdit) =>
				isEdit ? "Редактировать должность" : "Новая должность"
			}
			onClose={onClose}
			onSave={onSave}
			onDelete={onDelete}
			deleteMessage="Удалить должность?"
			showCancel
		>
			{({ form, setForm }) => (
				<>
					<div>
						<Label className="mb-1 block">Название должности *</Label>
						<Input
							value={form.name}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, name: e.target.value }))
							}
							required
							placeholder="Например: Администратор"
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label>Права доступа</Label>
						{PERMISSION_LABELS.map(({ key, label }) => (
							<label
								key={key}
								className="flex items-center gap-2 cursor-pointer"
							>
								<Checkbox
									checked={form[key] as boolean}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											[key]: e.target.checked,
										}))
									}
								/>
								<span className="text-sm text-[var(--foreground)]">
									{label}
								</span>
							</label>
						))}
					</div>
				</>
			)}
		</CrudModal>
	);
}
