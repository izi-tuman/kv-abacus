"use client";
import { FileTextIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { AdaptiveContainer } from "@/components/layout/adaptive-container";
import FinanceDayDetailsModal from "@/components/reports/FinanceDayDetailsModal";
import FinanceTable from "@/components/reports/FinanceTable";
import HousesTable from "@/components/reports/HousesTable";
import ManagersTable from "@/components/reports/ManagersTable";
import DateFilterPicker from "@/components/ui/DateFilterPicker";
import {
	DataStateContainer,
	Spinner,
} from "@/components/ui/data-state-container";
import { PageHeader } from "@/components/ui/page-header";
import { reportsApi } from "@/lib/api";
import { getDefaultDates } from "@/lib/dates";
import type { FinanceReport, HouseReport, ManagerReport } from "@/types";

type ReportType = "finance" | "managers" | "houses";
type ReportData = FinanceReport[] | ManagerReport[] | HouseReport[] | null;

export default function ReportsPage() {
	const defaults = getDefaultDates();
	const [reportType, setReportType] = useState<ReportType>("finance");
	const [dateFrom, setDateFrom] = useState(defaults.from);
	const [dateTo, setDateTo] = useState(defaults.to);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<ReportData>(null);
	const [generatedType, setGeneratedType] = useState<ReportType | null>(null);
	const [selectedRow, setSelectedRow] = useState<FinanceReport | null>(null);

	async function generate() {
		setLoading(true);
		setError(null);
		try {
			if (reportType === "finance") {
				const result = await reportsApi.getFinanceReport(dateFrom, dateTo);
				setData(result);
			} else if (reportType === "managers") {
				const result = await reportsApi.getManagersReport(dateFrom, dateTo);
				setData(result);
			} else {
				const result = await reportsApi.getHousesReport(dateFrom, dateTo);
				setData(result);
			}
			setGeneratedType(reportType);
		} catch {
			setError("Не удалось загрузить отчёт");
			setData(null);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-dvh bg-[var(--background)] flex flex-col">
			<div className="sticky top-0 z-10 bg-[var(--background)]">
				<PageHeader title="Отчёты" subtitle="Аналитика и статистика" />
				<AdaptiveContainer fullWidth className="px-4 pb-3">
					<div className="bg-[var(--surface-elevated)] rounded-lg px-4 py-4 flex flex-col gap-3 border border-[var(--border)]">
						{/* Тип отчёта */}
						<div>
							<label
								htmlFor="report-type"
								className="text-xs text-[var(--muted-foreground)] mb-1 block"
							>
								Тип отчёта
							</label>
							<select
								id="report-type"
								value={reportType}
								onChange={(e) => setReportType(e.target.value as ReportType)}
								className="w-full border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] bg-[var(--surface-elevated)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 transition-all duration-200"
							>
								<option value="finance">Финансовый</option>
								<option value="managers">По менеджерам</option>
								<option value="houses">По домам</option>
							</select>
						</div>

						{/* Даты */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<div className="min-w-0">
								<label
									htmlFor="report-date-from"
									className="text-xs text-[var(--muted-foreground)] mb-1 block"
								>
									Дата от
								</label>
								<DateFilterPicker
									id="report-date-from"
									value={dateFrom}
									onChange={setDateFrom}
									placeholder="Выберите дату"
								/>
							</div>
							<div className="min-w-0">
								<label
									htmlFor="report-date-to"
									className="text-xs text-[var(--muted-foreground)] mb-1 block"
								>
									Дата до
								</label>
								<DateFilterPicker
									id="report-date-to"
									value={dateTo}
									onChange={setDateTo}
									placeholder="Выберите дату"
								/>
							</div>
						</div>

						{/* Кнопка */}
						<button
							type="button"
							onClick={generate}
							disabled={loading}
							className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-60 transition-colors"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<Spinner className="size-4 text-current" />
									Загрузка...
								</span>
							) : (
								"Сгенерировать отчёт"
							)}
						</button>
					</div>
				</AdaptiveContainer>
			</div>

			{/* Результат */}
			<AdaptiveContainer fullWidth className="flex-1 px-3 pt-2 pb-4">
				<DataStateContainer
					loading={loading && data === null}
					error={error}
					empty={!loading && data === null && !error}
					emptyMessage={
						<div className="flex flex-col items-center justify-center py-16">
							<FileTextIcon
								size={48}
								weight="thin"
								className="text-[var(--border)] mb-3"
							/>
							<p className="text-[var(--muted-foreground)] font-medium mb-1">
								Нет данных
							</p>
							<p className="text-[var(--muted-foreground)] text-sm">
								Сгенерируйте{" "}
								<button
									type="button"
									onClick={generate}
									className="text-[var(--accent)] underline"
								>
									отчёт
								</button>
							</p>
						</div>
					}
				>
					{data !== null && generatedType === "finance" && (
						<FinanceTable
							data={data as FinanceReport[]}
							onDayClick={setSelectedRow}
						/>
					)}
					{data !== null && generatedType === "managers" && (
						<ManagersTable data={data as ManagerReport[]} />
					)}
					{data !== null && generatedType === "houses" && (
						<HousesTable data={data as HouseReport[]} />
					)}
				</DataStateContainer>
			</AdaptiveContainer>

			{selectedRow && (
				<FinanceDayDetailsModal
					row={selectedRow}
					onClose={() => setSelectedRow(null)}
				/>
			)}
		</div>
	);
}
