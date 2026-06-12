import api from "./api";
import { Field } from "../interfaces/Field";
import { PaginatedResponse } from "../interfaces/PaginatedResponse";

export const getFields = async (page = 1, limit = 12): Promise<PaginatedResponse<Field>> => {
  const response = await api.get(`/fields?page=${page}&limit=${limit}`);
  return response.data;
};

export const getFieldById = async (id: number): Promise<Field> => {
  const response = await api.get(`/fields/${id}`);
  return response.data;
};

export const searchFields = async (q: string, page = 1, limit = 12): Promise<PaginatedResponse<Field>> => {
  const response = await api.get(`/fields/search?q=${q}&page=${page}&limit=${limit}`);
  return response.data;
};
