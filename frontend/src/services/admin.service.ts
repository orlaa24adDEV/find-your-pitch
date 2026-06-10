import api from "./api";
import { Field } from "../interfaces/Field";
import { Booking } from "../interfaces/Booking";

export const getAllBookings = async (): Promise<Booking[]> => {
  const response = await api.get("/bookings/all");
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
