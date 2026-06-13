"use client";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { settingsApi } from "@/lib/api";
import type { AppSettings } from "@/types";

const DEFAULT_SETTINGS: AppSettings = {
	companyName: "Korotkovo Village",
	showBookingCardPrice: true,
};

interface SettingsContextValue {
	settings: AppSettings;
	setSettings: (s: AppSettings) => void;
	updateSettings: (data: AppSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
	settings: DEFAULT_SETTINGS,
	setSettings: () => {},
	updateSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
	const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

	const updateSettings = useCallback(async (data: AppSettings) => {
		const updated = await settingsApi.update(data);
		setSettings(updated);
	}, []);

	const value = useMemo(
		() => ({ settings, setSettings, updateSettings }),
		[settings, updateSettings],
	);

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	return useContext(SettingsContext);
}
