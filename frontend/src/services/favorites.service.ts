import api from "./api";
import { Field } from "../interfaces/Field";
import { PaginatedResponse } from "../interfaces/PaginatedResponse";

export const toggleFavorite = async (fieldId: number): Promise<{ favorited: boolean }> => {
  const response = await api.post(`/favorites/${fieldId}`);
  return response.data;
};

export const getFavorites = async (page = 1, limit = 12): Promise<PaginatedResponse<Field>> => {
  const response = await api.get(`/favorites?page=${page}&limit=${limit}`);
  return response.data;
};
