"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMountedRef } from "@/hooks/useMountedRef";
import {
	bookingsApi,
	clientsApi,
	housesApi,
	servicesApi,
	usersApi,
} from "@/lib/api";
import { toDateString } from "@/lib/dates";
import type { Booking, Client, House, Service, User } from "@/types";

/**
 * Bookings + reference data for an arbitrary date range.
 * Pass the first and last (inclusive) calendar days to display.
 */
export function useBookingData(rangeStart: Date, rangeEnd: Date) {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [houses, setHouses] = useState<House[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(false);
	const mountedRef = useMountedRef();

	// biome-ignore lint/correctness/useExhaustiveDependencies: load once on mount
	useEffect(() => {
		housesApi
			.getHouses()
			.then((h) => {
				if (mountedRef.current) setHouses(h);
			})
			.catch((e) => console.error("Failed to load houses:", e));
		clientsApi
			.getClients()
			.then((c) => {
				if (mountedRef.current) setClients(c);
			})
			.catch((e) => console.error("Failed to load clients:", e));
		usersApi
			.getUsers()
			.then((u) => {
				if (mountedRef.current) setUsers(u);
			})
			.catch((e) => console.error("Failed to load users:", e));
		servicesApi
			.getServices()
			.then((s) => {
				if (mountedRef.current) setServices(s);
			})
			.catch((e) => console.error("Failed to load services:", e));
	}, []);

	const abortRef = useRef<AbortController | null>(null);

	const startStr = toDateString(rangeStart);
	// API "endDate" param is exclusive in the existing semantics — pass day-after-last to include rangeEnd.
	const endStr = toDateString(
		new Date(
			rangeEnd.getFullYear(),
			rangeEnd.getMonth(),
			rangeEnd.getDate() + 1,
		),
	);

	const loadBookings = useCallback(async () => {
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setLoading(true);
		try {
			const data = await bookingsApi.getBookings(
				startStr,
				endStr,
				controller.signal,
			);
			setBookings(data);
		} catch (e) {
			if (
				(e as Error).name !== "AbortError" &&
				(e as Error).name !== "CanceledError"
			)
				console.error(e);
		} finally {
			if (!controller.signal.aborted) setLoading(false);
		}
	}, [startStr, endStr]);

	useEffect(() => {
		loadBookings();
	}, [loadBookings]);

	const refreshAll = useCallback(async () => {
		await Promise.all([
			housesApi.getHouses().then(setHouses),
			clientsApi.getClients().then(setClients),
			usersApi.getUsers().then(setUsers),
			servicesApi.getServices().then(setServices),
			loadBookings(),
		]);
	}, [loadBookings]);

	return {
		bookings,
		houses,
		setHouses,
		clients,
		setClients,
		users,
		services,
		loading,
		loadBookings,
		refreshAll,
	};
}
