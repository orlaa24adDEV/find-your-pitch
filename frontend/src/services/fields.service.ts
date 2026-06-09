import api from "./api";
import { Field } from "../interfaces/Field";

export const getFields = async (): Promise<Field[]> => {
  const response = await api.get("/fields");
  return response.data;
};

export const getFieldById = async (id: number): Promise<Field> => {
  const response = await api.get(`/fields/${id}`);
  return response.data;
};

export const searchFields = async (q: string): Promise<Field[]> => {
  const response = await api.get(`/fields/search?q=${q}`);
  return response.data;
};
