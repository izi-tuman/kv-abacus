// Shared state and CRUD handlers for mobile and desktop calendar variants.
"use client";
import { useState } from "react";
import { useBookingData } from "@/hooks/useBookingData";
import { bookingsApi, clientsApi, housesApi } from "@/lib/api";
import type { Booking, Client, House } from "@/types";

export function useBookingCalendarController(rangeStart: Date, rangeEnd: Date) {
	const data = useBookingData(rangeStart, rangeEnd);

	const [modalBooking, setModalBooking] = useState<Booking | null | undefined>(
		undefined,
	);
	const [clientModal, setClientModal] = useState<Client | null | undefined>(
		undefined,
	);
	const [houseModal, setHouseModal] = useState<House | null | undefined>(
		undefined,
	);
	const [modalDefaultDate, setModalDefaultDate] = useState("");
	const [modalDefaultEndDate, setModalDefaultEndDate] = useState("");
	const [preselectedClient, setPreselectedClient] = useState<Client | null>(
		null,
	);
	const [preselectedHouseId, setPreselectedHouseId] = useState("");

	async function handleSave(d: Omit<Booking, "id"> | Booking) {
		if ("id" in d) {
			const updated = await bookingsApi.updateBooking(d.id, d);
			setModalBooking((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			await bookingsApi.createBooking(d);
		}
		await data.loadBookings();
	}

	async function handleDelete(id: string) {
		await bookingsApi.deleteBooking(id);
		await data.loadBookings();
	}

	async function handleClientSave(
		d: Omit<Client, "id" | "totalBookings" | "createdAt"> | Client,
	) {
		if ("id" in d) {
			const updated = await clientsApi.updateClient(d.id, d);
			data.setClients((prev) =>
				prev.map((c) => (c.id === updated.id ? updated : c)),
			);
			setClientModal((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			const created = await clientsApi.createClient(d);
			data.setClients((prev) => [created, ...prev]);
			setPreselectedClient(created);
		}
	}

	async function handleHouseSave(d: Omit<House, "id"> | House) {
		if ("id" in d) {
			const updated = await housesApi.updateHouse(d.id, d);
			data.setHouses((prev) =>
				prev.map((h) => (h.id === updated.id ? updated : h)),
			);
			setHouseModal((prev) =>
				prev && prev.id === updated.id ? updated : prev,
			);
		} else {
			const created = await housesApi.createHouse(d);
			data.setHouses((prev) => [...prev, created]);
			setPreselectedHouseId(created.id);
		}
	}

	async function handleHouseDelete(id: string) {
		await housesApi.deleteHouse(id);
		data.setHouses((prev) => prev.filter((h) => h.id !== id));
	}

	return {
		...data,
		modalBooking,
		setModalBooking,
		clientModal,
		setClientModal,
		houseModal,
		setHouseModal,
		modalDefaultDate,
		setModalDefaultDate,
		modalDefaultEndDate,
		setModalDefaultEndDate,
		preselectedClient,
		setPreselectedClient,
		preselectedHouseId,
		setPreselectedHouseId,
		handleSave,
		handleDelete,
		handleClientSave,
		handleHouseSave,
		handleHouseDelete,
	};
}
