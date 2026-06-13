// Модалка дома: создание/редактирование через CrudModal.
// Поля: название, описание, вместимость, цена за сутки, активность.
"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { CrudModal } from "@/components/ui/crud-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseNumber } from "@/lib/utils";
import type { House } from "@/types";

interface Props {
	house: House | null;
	onClose: () => void;
	onSave: (house: Omit<House, "id"> | House) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
}

const EMPTY: Omit<House, "id"> = {
	name: "",
	description: "",
	capacity: 2,
	basePrice: 0,
	isActive: true,
};

export default function HouseModal({
	house,
	onClose,
	onSave,
	onDelete,
}: Props) {
	return (
		<CrudModal
			item={house}
			emptyForm={EMPTY}
			title={(isEdit) => (isEdit ? "Редактировать дом" : "Новый дом")}
			onClose={onClose}
			onSave={onSave}
			onDelete={onDelete}
			deleteMessage="Удалить дом?"
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
							placeholder="Например: А1"
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

					<div className="grid grid-cols-2 gap-2">
						<div className="min-w-0">
							<Label className="mb-1 block">Мест</Label>
							<Input
								type="number"
								min={1}
								value={form.capacity}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										capacity: parseNumber(e.target.value, 1),
									}))
								}
							/>
						</div>
						<div className="min-w-0">
							<Label className="mb-1 block">Цена ₽/сутки</Label>
							<Input
								type="number"
								min={0}
								value={form.basePrice || ""}
								placeholder="0"
								onChange={(e) =>
									setForm((p) => ({
										...p,
										basePrice: parseNumber(e.target.value),
									}))
								}
							/>
						</div>
					</div>

					<label className="flex items-center gap-2 cursor-pointer">
						<Checkbox
							checked={form.isActive}
							onChange={(e) =>
								setForm((p) => ({ ...p, isActive: e.target.checked }))
							}
						/>
						<span className="text-sm text-[var(--foreground)]">Активен</span>
					</label>
				</>
			)}
		</CrudModal>
	);
}
