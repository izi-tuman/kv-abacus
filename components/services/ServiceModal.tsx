"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { CrudModal } from "@/components/ui/crud-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/types";

interface Props {
	service: Service | null;
	onClose: () => void;
	onSave: (service: Omit<Service, "id"> | Service) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
}

const EMPTY: Omit<Service, "id"> = {
	name: "",
	description: "",
	isActive: true,
};

export default function ServiceModal({
	service,
	onClose,
	onSave,
	onDelete,
}: Props) {
	return (
		<CrudModal
			item={service}
			emptyForm={EMPTY}
			title={(isEdit) => (isEdit ? "Редактировать услугу" : "Новая услуга")}
			onClose={onClose}
			onSave={onSave}
			onDelete={onDelete}
			deleteMessage="Удалить услугу?"
		>
			{({ form, setForm }) => (
				<>
					<div>
						<Label className="mb-1 block">Название *</Label>
						<Input
							value={form.name}
							onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
							required
							placeholder="Например: Банный комплекс"
						/>
					</div>

					<div>
						<Label className="mb-1 block">Описание</Label>
						<Textarea
							value={form.description ?? ""}
							onChange={(e) =>
								setForm((p) => ({ ...p, description: e.target.value }))
							}
							rows={2}
						/>
					</div>

					<label className="flex items-center gap-2 cursor-pointer">
						<Checkbox
							checked={form.isActive}
							onChange={(e) =>
								setForm((p) => ({ ...p, isActive: e.target.checked }))
							}
						/>
						<span className="text-sm text-[var(--foreground)]">Активна</span>
					</label>
				</>
			)}
		</CrudModal>
	);
}
