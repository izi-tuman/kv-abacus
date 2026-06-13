"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { CrudModal } from "@/components/ui/crud-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Equipment } from "@/types";

interface Props {
	equipment: Equipment | null;
	onClose: () => void;
	onSave: (equipment: Omit<Equipment, "id"> | Equipment) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
}

const EMPTY: Omit<Equipment, "id"> = {
	name: "",
	description: "",
	isActive: true,
};

export default function EquipmentModal({
	equipment,
	onClose,
	onSave,
	onDelete,
}: Props) {
	return (
		<CrudModal
			item={equipment}
			emptyForm={EMPTY}
			title={(isEdit) =>
				isEdit ? "Редактировать снаряжение" : "Новое снаряжение"
			}
			onClose={onClose}
			onSave={onSave}
			onDelete={onDelete}
			deleteMessage="Удалить снаряжение?"
		>
			{({ form, setForm }) => (
				<>
					<div>
						<Label className="mb-1 block">
							Название <span className="text-[var(--danger)]">*</span>
						</Label>
						<Input
							value={form.name}
							onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
							required
							placeholder="Например: Байдарка"
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
						<span className="text-sm text-[var(--foreground)]">Активно</span>
					</label>
				</>
			)}
		</CrudModal>
	);
}
