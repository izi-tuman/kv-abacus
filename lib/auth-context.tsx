"use client";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { Role, User } from "@/types";

interface AuthContextValue {
	currentUser: User | null;
	currentRole: Role | null;
	setCurrentUser: (user: User | null) => void;
	setCurrentRole: (role: Role | null) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
	currentUser: null,
	currentRole: null,
	setCurrentUser: () => {},
	setCurrentRole: () => {},
	logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [currentUser, setCurrentUserState] = useState<User | null>(null);
	const [currentRole, setCurrentRole] = useState<Role | null>(null);

	const setCurrentUser = useCallback((user: User | null) => {
		setCurrentUserState(user);
		if (user) {
			localStorage.setItem("userId", user.id);
		} else {
			localStorage.removeItem("userId");
		}
	}, []);

	const logout = useCallback(() => {
		setCurrentUser(null);
		setCurrentRole(null);
	}, [setCurrentUser]);

	const value = useMemo(
		() => ({
			currentUser,
			currentRole,
			setCurrentUser,
			setCurrentRole,
			logout,
		}),
		[currentUser, currentRole, setCurrentUser, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}
