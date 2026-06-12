import api from "./api";
import { Field } from "../interfaces/Field";
import { Booking } from "../interfaces/Booking";
import { PaginatedResponse } from "../interfaces/PaginatedResponse";

export const getAllBookings = async (page = 1, limit = 20): Promise<PaginatedResponse<Booking>> => {
  const response = await api.get(`/bookings/all?page=${page}&limit=${limit}`);
  return response.data;
};

export const createField = async (data: {
  name: string;
  description: string;
  location: string;
  sport: string;
  priceHour: number;
  imageUrl?: string;
  lat?: number;
  lng?: number;
}): Promise<Field> => {
  const response = await api.post("/fields", data);
  return response.data;
};

export const updateField = async (
  id: number,
  data: Partial<{
    name: string;
    description: string;
    location: string;
    sport: string;
    priceHour: number;
    imageUrl: string;
    lat: number;
    lng: number;
  }>
): Promise<Field> => {
  const response = await api.put(`/fields/${id}`, data);
  return response.data;
};

export const deleteField = async (id: number): Promise<void> => {
  await api.delete(`/fields/${id}`);
};

export const uploadFieldImage = async (id: number, file: File): Promise<Field> => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post(`/fields/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
