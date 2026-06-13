// Универсальная обёртка для CRUD-модалок: форма создания/редактирования + удаление.
// Использует ModalSheet как базовый диалог. На десктопе отображается центрированным модалом.
"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Spinner } from "@/components/ui/data-state-container";
import { ErrorModal } from "@/components/ui/error-modal";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { useMountedRef } from "@/hooks/useMountedRef";

interface CrudModalProps<T extends { id: string }> {
	/** null = create, T = edit */
	item: T | null;
	/** Initial form values for "create" mode */
	emptyForm: Omit<T, "id">;
	/** Modal title */
	title: string | ((isEdit: boolean) => string);
	onClose: () => void;
	onSave: (data: Omit<T, "id"> | T) => Promise<void>;
	onDelete?: (id: string) => Promise<void>;
	/** Confirm delete message */
	deleteMessage?: string;
	/** Render function for form fields */
	children: (ctx: {
		form: Omit<T, "id">;
		setForm: React.Dispatch<React.SetStateAction<Omit<T, "id">>>;
		saving: boolean;
	}) => React.ReactNode;
	/** Optional cancel button */
	showCancel?: boolean;
}

export function CrudModal<T extends { id: string }>({
	item,
	emptyForm,
	title,
	onClose,
	onSave,
	onDelete,
	deleteMessage = "Удалить запись?",
	children,
	showCancel,
}: CrudModalProps<T>) {
	const isEdit = item !== null;
	const initial = item ?? emptyForm;

	const [form, setForm] = useState<Omit<T, "id">>(initial);
	const [saving, setSaving] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const mountedRef = useMountedRef();

	// biome-ignore lint/correctness/useExhaustiveDependencies: emptyForm is a static constant, only item triggers reset
	useEffect(() => {
		const next = item ?? emptyForm;
		setForm(next);
		setError(null);
		setConfirmDelete(false);
	}, [item]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		try {
			await onSave(item ? ({ ...form, id: item.id } as T) : form);
			onClose();
		} catch (err) {
			if (mountedRef.current) {
				setError(err instanceof Error ? err.message : "Ошибка при сохранении");
				setSaving(false);
			}
		}
	}

	async function handleDelete() {
		if (!item || !onDelete) return;
		setSaving(true);
		try {
			await onDelete(item.id);
			onClose();
		} catch (err) {
			if (mountedRef.current) {
				setError(err instanceof Error ? err.message : "Ошибка при удалении");
				setSaving(false);
				setConfirmDelete(false);
			}
		}
	}

	const resolvedTitle = typeof title === "function" ? title(isEdit) : title;

	return (
		<ModalSheet open onClose={onClose} title={resolvedTitle}>
			<ErrorModal error={error} onClose={() => setError(null)} />

			<ConfirmDeleteDialog
				open={confirmDelete}
				message={deleteMessage}
				onConfirm={handleDelete}
				onCancel={() => setConfirmDelete(false)}
				loading={saving}
			/>

			<form
				onSubmit={handleSubmit}
				className="px-4 lg:px-6 py-3 flex flex-col gap-3"
			>
				{children({ form, setForm, saving })}

				<div className="flex gap-2 pt-1 pb-2 lg:justify-end">
					{showCancel && (
						<Button
							type="button"
							variant="secondary"
							className="flex-1 lg:flex-none lg:px-6"
							onClick={onClose}
						>
							Отмена
						</Button>
					)}
					{isEdit && onDelete && (
						<Button
							type="button"
							variant="destructive"
							className="flex-1 lg:flex-none lg:px-6"
							onClick={() => setConfirmDelete(true)}
							disabled={saving}
						>
							Удалить
						</Button>
					)}
					<Button
						type="submit"
						disabled={saving}
						className="flex-1 lg:flex-none lg:px-8"
					>
						{saving ? (
							<span className="flex items-center gap-2">
								<Spinner className="size-4 text-current" />
								Сохраняю...
							</span>
						) : (
							"Сохранить"
						)}
					</Button>
				</div>
			</form>
		</ModalSheet>
	);
}
