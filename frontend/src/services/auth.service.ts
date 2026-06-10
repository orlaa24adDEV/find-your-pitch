import api from "./api";

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string, age?: number) => {
  const response = await api.post("/auth/register", { name, email, password, age });
  return response.data;
};

export const refreshSession = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};

export const logoutSession = async () => {
  await api.post("/auth/logout");
};
