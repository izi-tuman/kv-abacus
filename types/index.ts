export interface Booking {
	id: string;
	houseId: string;
	houseName?: string;
	checkIn: string;
	checkOut: string;
	clientId: string;
	clientFirstName: string;
	clientLastName: string;
	clientPhone: string;
	guestsCount: number;
	managerId: string;
	managerName?: string;
	services: { id: string; name: string }[];
	comment?: string;
	status: "active" | "completed";
	totalPrice?: number;
	prepayment?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface House {
	id: string;
	name: string;
	description?: string;
	capacity: number;
	basePrice: number;
	isActive: boolean;
}

export interface Client {
	id: string;
	firstName: string;
	lastName?: string;
	phone: string;
	email?: string;
	notes?: string;
	createdAt?: string;
	totalBookings?: number;
	isBlacklisted?: boolean;
}

export interface Equipment {
	id: string;
	name: string;
	description?: string;
	photoUrl?: string;
	isActive: boolean;
}

export interface EquipmentRentalItem {
	id: string;
	equipmentId: string;
	equipmentName: string;
	quantity: number;
}

export interface EquipmentRental {
	id: string;
	clientId: string;
	clientFirstName: string;
	clientLastName: string;
	clientPhone: string;
	startDate: string;
	endDate: string;
	items: EquipmentRentalItem[];
	totalPrice: number;
	status: "active" | "completed";
	managerId: string;
	managerName?: string;
	notes?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface Role {
	id: string;
	name: string;
	canAccessReports: boolean; //Доступ к отчетам
	canManageUsers: boolean; //Управление пользователями
	canManageHouses: boolean; //Управление домами
	canManageClients: boolean; //Управление клиентами
	canManageEquipment: boolean; //Управление снаряжением
	canManageRentals: boolean; //Управлением прокатом
	canManageServices: boolean; //Управление доп услугами
	canManageSettings: boolean; //Управление настройками
}

export type RolePermission = keyof Omit<Role, "id" | "name">;

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	phone: string;
	chatId?: string;
	roleId: string;
	roleName?: string;
	isActive: boolean;
}

export interface Service {
	id: string;
	name: string;
	description?: string;
	isActive: boolean;
}

export interface FinanceReport {
	date: string;
	revenue: number;
	bookingsCount: number;
	averageCheck: number;
}

export interface ManagerReport {
	managerId: string;
	managerName: string;
	bookingsCount: number;
	totalRevenue: number;
}

export interface HouseReport {
	houseId: string;
	houseName: string;
	bookingsCount: number;
	occupancyRate: number;
	revenue: number;
}

export interface AppSettings {
	companyName: string;
	showBookingCardPrice: boolean;
}
