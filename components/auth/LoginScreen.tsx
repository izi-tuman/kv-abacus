"use client";
import { HouseIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { authApi } from "@/lib/api";
import { useSettings } from "@/lib/settings-context";
import type { User } from "@/types";

interface Props {
	onSuccess: (user: User) => void;
}

export default function LoginScreen({ onSuccess }: Props) {
	const { settings } = useSettings();
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const result = await authApi.login(phone, password);
			if (result.success && result.user) {
				onSuccess(result.user);
			} else {
				setError(result.error ?? "Неверный телефон или пароль");
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Ошибка соединения с сервером",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_top,_var(--accent-light),_transparent_32rem),linear-gradient(180deg,var(--background),oklch(0.955_0.014_82))] px-6">
			<form onSubmit={handleSubmit} className="w-full max-w-[340px]">
				{/* Logo */}
				<div className="text-center mb-10">
					<div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[22px] bg-[var(--accent)] text-white shadow-[0_12px_32px_-8px_oklch(0.44_0.095_151/0.55)] mb-4">
						<HouseIcon size={32} weight="fill" />
					</div>
					<h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
						{settings.companyName}
					</h1>
					<p className="text-[13px] text-[var(--muted-foreground)] font-medium mt-1">
						Система управления объектами глэмпинга
					</p>
				</div>

				{error && (
					<div className="bg-[var(--danger-light)] border border-[var(--danger)]/15 text-[var(--danger)] rounded-xl px-4 py-3 text-[15px] font-semibold mb-5">
						⚠ {error}
					</div>
				)}

				<div className="space-y-3.5">
					<div>
						<label className="text-sm font-semibold text-[var(--foreground)] mb-1.5 block tracking-wide">
							Телефон
						</label>
						<PhoneInput value={phone} onChange={setPhone} required />
					</div>

					<div>
						<label className="text-sm font-semibold text-[var(--foreground)] mb-1.5 block tracking-wide">
							Пароль
						</label>
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							placeholder="••••••••"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full h-[50px] text-sm font-extrabold text-white bg-[var(--accent)] rounded-[14px] shadow-[0_6px_20px_-6px_oklch(0.44_0.095_151/0.6)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 active:scale-[0.98] mt-1"
					>
						{loading ? "Вхожу..." : "Войти в систему"}
					</button>
				</div>
			</form>
		</div>
	);
}
