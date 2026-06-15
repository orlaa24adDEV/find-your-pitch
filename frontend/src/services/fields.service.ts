import api from "./api";
import { Field } from "../interfaces/Field";
import { PaginatedResponse } from "../interfaces/PaginatedResponse";

export interface FieldFilters {
  sport?: string;
  minPrice?: number;
  maxPrice?: number;
}

const buildFilterParams = (filters?: FieldFilters): string => {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.sport) params.set("sport", filters.sport);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  const str = params.toString();
  return str ? `&${str}` : "";
};

export const getFields = async (page = 1, limit = 12, filters?: FieldFilters): Promise<PaginatedResponse<Field>> => {
  const response = await api.get(`/fields?page=${page}&limit=${limit}${buildFilterParams(filters)}`);
  return response.data;
};

export const getFieldById = async (id: number): Promise<Field> => {
  const response = await api.get(`/fields/${id}`);
  return response.data;
};

export const searchFields = async (q: string, page = 1, limit = 12, filters?: FieldFilters): Promise<PaginatedResponse<Field>> => {
  const response = await api.get(`/fields/search?q=${q}&page=${page}&limit=${limit}${buildFilterParams(filters)}`);
  return response.data;
};

export const getSports = async (): Promise<string[]> => {
  const response = await api.get("/fields/sports");
  return response.data;
};
