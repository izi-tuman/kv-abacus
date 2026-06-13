"use client";
import { GearIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { AdaptiveContainer } from "@/components/layout/adaptive-container";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorModal } from "@/components/ui/error-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { useSettings } from "@/lib/settings-context";

export default function SettingsPage() {
	const { settings, updateSettings } = useSettings();
	const [companyName, setCompanyName] = useState(settings.companyName);
	const [showBookingCardPrice, setShowBookingCardPrice] = useState(
		settings.showBookingCardPrice,
	);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	const hasChanges =
		companyName !== settings.companyName ||
		showBookingCardPrice !== settings.showBookingCardPrice;

	async function handleSave() {
		setSaving(true);
		setError(null);
		setSaved(false);
		try {
			await updateSettings({ companyName, showBookingCardPrice });
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch {
			setError("Ошибка при сохранении настроек");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="min-h-dvh bg-[var(--background)]">
			<PageHeader
				title="Настройки"
				subtitle="Параметры приложения"
				icon={<GearIcon size={20} weight="regular" />}
			/>
			<ErrorModal error={error} onClose={() => setError(null)} />

			<AdaptiveContainer className="px-4 pt-4">
				<div className="flex flex-col gap-5 lg:max-w-2xl">
					<div>
						<Label className="mb-1 block">Название компании</Label>
						<Input
							value={companyName}
							onChange={(e) => setCompanyName(e.target.value)}
							placeholder="Название компании"
						/>
					</div>

					<label className="flex items-center gap-3 cursor-pointer">
						<Checkbox
							checked={showBookingCardPrice}
							onChange={(e) =>
								setShowBookingCardPrice((e.target as HTMLInputElement).checked)
							}
						/>
						<div>
							<span className="text-sm text-[var(--foreground)]">
								Показывать сумму в карточке бронирования
							</span>
							<p className="text-xs text-[var(--muted-foreground)] mt-0.5">
								Отображение цены на главной странице
							</p>
						</div>
					</label>

					<Button
						onClick={handleSave}
						disabled={saving || !hasChanges}
						className="w-full"
					>
						{saving ? "Сохраняю..." : saved ? "Сохранено" : "Сохранить"}
					</Button>
				</div>
			</AdaptiveContainer>
		</div>
	);
}
