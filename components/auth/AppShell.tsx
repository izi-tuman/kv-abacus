"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { authApi, rolesApi, settingsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import type { User } from "@/types";
import LoginScreen from "./LoginScreen";
import SplashScreen from "./SplashScreen";

// Анимация дома длится ~3.3s (brand text: 2.5s delay + 0.8s duration)
const SPLASH_MIN_MS = 2000;

interface Props {
	children: React.ReactNode;
}

export default function AppShell({ children }: Props) {
	const { currentUser, setCurrentUser, setCurrentRole } = useAuth();
	const { setSettings } = useSettings();
	const [screen, setScreen] = useState<"splash" | "login" | "app">("splash");
	const initDone = useRef(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Стабильные ссылки для cleanup — не являются реактивными зависимостями
	const setCurrentUserRef = useRef(setCurrentUser);
	const setCurrentRoleRef = useRef(setCurrentRole);
	const setSettingsRef = useRef(setSettings);

	useEffect(() => {
		setCurrentUserRef.current = setCurrentUser;
		setCurrentRoleRef.current = setCurrentRole;
		setSettingsRef.current = setSettings;
	}, [setCurrentUser, setCurrentRole, setSettings]);

	useEffect(() => {
		if (initDone.current) return;
		initDone.current = true;

		const splashStart = Date.now();
		let cancelled = false;

		const schedule = (toScreen: "login" | "app") => {
			const elapsed = Date.now() - splashStart;
			const delay = Math.max(0, SPLASH_MIN_MS - elapsed);
			// Очищаем предыдущий таймер перед установкой нового
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
			}
			timerRef.current = setTimeout(() => {
				if (!cancelled) setScreen(toScreen);
			}, delay);
		};

		// Загрузка настроек (fire-and-forget)
		settingsApi
			.get()
			.then((s) => {
				if (!cancelled) setSettingsRef.current(s);
			})
			.catch(() => {
				/* use defaults */
			});

		const userId =
			typeof window !== "undefined" ? localStorage.getItem("userId") : null;

		if (!userId) {
			schedule("login");
		} else {
			authApi
				.getCurrentUser()
				.then((result) => {
					if (cancelled) return;
					const user = result.user;
					if (!user) throw new Error("User not found");
					setCurrentUserRef.current(user);
					return rolesApi
						.getRoles()
						.then((roles) => {
							if (!cancelled) {
								const role = roles.find((r) => r.id === user.roleId) ?? null;
								setCurrentRoleRef.current(role);
							}
						})
						.catch(() => {
							/* role stays null, proceed anyway */
						});
				})
				.then(() => {
					if (!cancelled) schedule("app");
				})
				.catch((err) => {
					if (!cancelled) {
						console.warn("Auth init failed:", err);
						schedule("login");
					}
				});
		}

		return () => {
			cancelled = true;
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (screen === "app" && currentUser === null) {
			setScreen("login");
		}
	}, [currentUser, screen]);

	const handleLoginSuccess = useCallback((user: User) => {
		setCurrentUserRef.current(user);
		rolesApi
			.getRoles()
			.then((roles) => {
				const role = roles.find((r) => r.id === user.roleId) ?? null;
				setCurrentRoleRef.current(role);
			})
			.catch(() => {})
			.finally(() => setScreen("app"));
	}, []);

	if (screen === "splash") return <SplashScreen />;
	if (screen === "login") return <LoginScreen onSuccess={handleLoginSuccess} />;
	return <>{children}</>;
}
