import api from "./api";
import { User } from "../interfaces/User";
import { Booking } from "../interfaces/Booking";
import { PaginatedResponse } from "../interfaces/PaginatedResponse";

export const getAllUsers = async (
  page = 1,
  limit = 20,
  search?: string
): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  const response = await api.get(`/users?${params}`);
  return response.data;
};

export const getUserById = async (id: number): Promise<User & { bookings: Booking[] }> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getUserBookings = async (
  id: number,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Booking>> => {
  const response = await api.get(`/users/${id}/bookings?page=${page}&limit=${limit}`);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const updateUserRole = async (id: number, role: string): Promise<User> => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data;
};
