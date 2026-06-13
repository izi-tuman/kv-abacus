import axios from "axios";
import type {
	AppSettings,
	Booking,
	Client,
	Equipment,
	EquipmentRental,
	FinanceReport,
	House,
	HouseReport,
	ManagerReport,
	Role,
	Service,
	User,
} from "@/types";

const api = axios.create({
	baseURL:
		process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/a-KV/hs/bots/api",
	headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const userId = localStorage.getItem("userId");
		if (userId) config.headers.set("X-User-Id", userId);
	}
	return config;
});

api.interceptors.response.use(
	(res) => {
		if (res.status === 204) return res;
		const data = res.data;
		if (data?.success === false) {
			throw new Error(data.error ?? "Ошибка сервера");
		}
		return res;
	},
	(error) => {
		if (axios.isAxiosError(error) && error.response?.data?.error) {
			throw new Error(error.response.data.error);
		}
		throw error;
	},
);

function encId(id: string): string {
	return encodeURIComponent(id);
}

export const bookingsApi = {
	getBookings: (startDate: string, endDate: string, signal?: AbortSignal) =>
		api
			.get<Booking[]>("/bookings", { params: { startDate, endDate }, signal })
			.then((r) => r.data),

	createBooking: (booking: Omit<Booking, "id">) =>
		api.post<Booking>("/bookings", booking).then((r) => r.data),

	updateBooking: (id: string, booking: Partial<Booking>) =>
		api.put<Booking>(`/bookings/${encId(id)}`, booking).then((r) => r.data),

	deleteBooking: (id: string) =>
		api.delete(`/bookings/${encId(id)}`).then(() => undefined),
};

export const housesApi = {
	getHouses: () => api.get<House[]>("/houses").then((r) => r.data),

	createHouse: (house: Omit<House, "id">) =>
		api.post<House>("/houses", house).then((r) => r.data),

	updateHouse: (id: string, house: Partial<House>) =>
		api.put<House>(`/houses/${encId(id)}`, house).then((r) => r.data),

	deleteHouse: (id: string) =>
		api.delete(`/houses/${encId(id)}`).then(() => undefined),
};

export const clientsApi = {
	getClients: () => api.get<Client[]>("/clients").then((r) => r.data),

	createClient: (client: Omit<Client, "id" | "totalBookings" | "createdAt">) =>
		api.post<Client>("/clients", client).then((r) => r.data),

	updateClient: (
		id: string,
		client: Partial<Omit<Client, "id" | "totalBookings" | "createdAt">>,
	) => api.put<Client>(`/clients/${encId(id)}`, client).then((r) => r.data),

	getClientBookings: (id: string) =>
		api.get<Booking[]>(`/clients-history/${encId(id)}`).then((r) => r.data),

	getClientRentals: (id: string) =>
		api
			.get<EquipmentRental[]>(`/clients-rentals/${encId(id)}`)
			.then((r) => r.data),
};

export const equipmentApi = {
	getEquipment: () => api.get<Equipment[]>("/equipment").then((r) => r.data),

	createEquipment: (equipment: Omit<Equipment, "id">) =>
		api.post<Equipment>("/equipment", equipment).then((r) => r.data),

	updateEquipment: (id: string, equipment: Partial<Equipment>) =>
		api
			.put<Equipment>(`/equipment/${encId(id)}`, equipment)
			.then((r) => r.data),

	deleteEquipment: (id: string) =>
		api.delete(`/equipment/${encId(id)}`).then(() => undefined),
};

export const servicesApi = {
	getServices: () => api.get<Service[]>("/services").then((r) => r.data),

	createService: (service: Omit<Service, "id">) =>
		api.post<Service>("/services", service).then((r) => r.data),

	updateService: (id: string, service: Partial<Service>) =>
		api.put<Service>(`/services/${encId(id)}`, service).then((r) => r.data),

	deleteService: (id: string) =>
		api.delete(`/services/${encId(id)}`).then(() => undefined),
};

export const equipmentRentalsApi = {
	getRentals: (startDate: string, endDate: string) =>
		api
			.get<EquipmentRental[]>("/equipment-rentals", {
				params: { startDate, endDate },
			})
			.then((r) => r.data),

	createRental: (rental: Omit<EquipmentRental, "id">) =>
		api.post<EquipmentRental>("/equipment-rentals", rental).then((r) => r.data),

	updateRental: (id: string, rental: Partial<EquipmentRental>) =>
		api
			.put<EquipmentRental>(`/equipment-rentals/${encId(id)}`, rental)
			.then((r) => r.data),

	deleteRental: (id: string) =>
		api.delete(`/equipment-rentals/${encId(id)}`).then(() => undefined),
};

export const usersApi = {
	getUsers: () => api.get<User[]>("/users").then((r) => r.data),

	createUser: (user: Omit<User, "id">) =>
		api.post<User>("/users", user).then((r) => r.data),

	updateUser: (id: string, user: Partial<User>) =>
		api.put<User>(`/users/${encId(id)}`, user).then((r) => r.data),
};

export const rolesApi = {
	getRoles: () => api.get<Role[]>("/roles").then((r) => r.data),

	createRole: (role: Omit<Role, "id">) =>
		api.post<Role>("/roles", role).then((r) => r.data),

	updateRole: (id: string, role: Partial<Role>) =>
		api.put<Role>(`/roles/${encId(id)}`, role).then((r) => r.data),

	deleteRole: (id: string) =>
		api.delete(`/roles/${encId(id)}`).then(() => undefined),
};

export const authApi = {
	login: (phone: string, password: string) =>
		api
			.post<{ success: boolean; user?: User; error?: string }>("/auth-login", {
				phone,
				password,
			})
			.then((r) => r.data),

	getCurrentUser: () => api.get<{ user: User }>("/auth-me").then((r) => r.data),
};

export const reportsApi = {
	getFinanceReport: (from: string, to: string) =>
		api
			.get<FinanceReport[]>("/reports/finance", { params: { from, to } })
			.then((r) => r.data),

	getManagersReport: (from: string, to: string) =>
		api
			.get<ManagerReport[]>("/reports/managers", { params: { from, to } })
			.then((r) => r.data),

	getHousesReport: (from: string, to: string) =>
		api
			.get<HouseReport[]>("/reports/houses", { params: { from, to } })
			.then((r) => r.data),
};

export const settingsApi = {
	get: () => api.get<AppSettings>("/settings").then((r) => r.data),

	update: (data: AppSettings) =>
		api.put<AppSettings>("/settings", data).then((r) => r.data),
};
