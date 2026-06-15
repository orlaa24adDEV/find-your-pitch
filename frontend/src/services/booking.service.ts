import api from "./api";

export const getMyBookings = async (page = 1, limit = 10) => {
  const response = await api.get(`/bookings/my?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUnpaidBookings = async () => {
  const response = await api.get("/bookings/unpaid");
  return response.data;
};

export const getBookingById = async (id: number) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const createBooking = async (data: {
  fieldId: number;
  date: string;
  startTime: string;
  endTime: string;
}) => {
  const response = await api.post("/bookings", data);
  return response.data;
};

export const cancelBooking = async (id: number) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

export const payBooking = async (id: number) => {
  const response = await api.post(`/bookings/${id}/pay`);
  return response.data;
};

export interface BookedSlot {
  startTime: string;
  endTime: string;
}

export interface FieldAvailability {
  date: string;
  bookedSlots: BookedSlot[];
}

export const getFieldAvailability = async (fieldId: number, date: string): Promise<FieldAvailability> => {
  const response = await api.get(`/fields/${fieldId}/availability?date=${date}`);
  return response.data;
};
